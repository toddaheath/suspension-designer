using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Infrastructure.Data;
using SuspensionDesigner.Infrastructure.Identity;

namespace SuspensionDesigner.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenService _tokenService;

    public AuthController(ApplicationDbContext context, JwtTokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public record RegisterRequest(string Email, string Name, string Password);
    public record LoginRequest(string Email, string Password);
    public record AuthUserResponse(string Id, string Email, string Name);
    public record AuthResponse(string Token, AuthUserResponse User);

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request, CancellationToken ct)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email == request.Email, ct);
        if (exists)
            return Conflict(new { message = "Email already registered" });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Name = request.Name,
            PasswordHash = HashPassword(request.Password),
        };

        await _context.Users.AddAsync(user, ct);
        await _context.SaveChangesAsync(ct);

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, new AuthUserResponse(user.Id.ToString(), user.Email, user.Name)));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (user is null || !VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, new AuthUserResponse(user.Id.ToString(), user.Email, user.Name)));
    }

    [HttpPost("refresh")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<AuthResponse>> Refresh(CancellationToken ct)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
            return Unauthorized();

        var user = await _context.Users.FindAsync(new object[] { Guid.Parse(userId) }, ct);
        if (user is null)
            return Unauthorized();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, new AuthUserResponse(user.Id.ToString(), user.Email, user.Name)));
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var hash = Convert.FromBase64String(parts[1]);
        var computedHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);

        return CryptographicOperations.FixedTimeEquals(hash, computedHash);
    }
}
