using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SuspensionDesigner.Application.Commands;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.API.Controllers;

[ApiController]
[Route("api/v1/designs")]
[Authorize]
[EnableRateLimiting("designs")]
public class DesignsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ISuspensionDesignRepository _repository;

    public DesignsController(IMediator mediator, ISuspensionDesignRepository repository)
    {
        _mediator = mediator;
        _repository = repository;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SuspensionDesignDto>>> List(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListDesignsRequest(GetUserId()), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SuspensionDesignDto>> Get(Guid id, CancellationToken ct)
    {
        var design = await _repository.GetByIdAsync(id, ct);
        if (design is null) return NotFound();
        if (design.UserId != GetUserId()) return Forbid();

        var result = await _mediator.Send(new GetDesignRequest(id), ct);
        return Ok(result!);
    }

    [HttpPost]
    public async Task<ActionResult<SuspensionDesignDto>> Create(
        [FromBody] CreateDesignCommand command, CancellationToken ct)
    {
        var cmd = command with { UserId = GetUserId() };
        var result = await _mediator.Send(cmd, ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SuspensionDesignDto>> Update(
        Guid id, [FromBody] UpdateDesignCommand command, CancellationToken ct)
    {
        var design = await _repository.GetByIdAsync(id, ct);
        if (design is null) return NotFound();
        if (design.UserId != GetUserId()) return Forbid();

        var cmd = command with { Id = id };
        var result = await _mediator.Send(cmd, ct);
        return Ok(result!);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var design = await _repository.GetByIdAsync(id, ct);
        if (design is null) return NotFound();
        if (design.UserId != GetUserId()) return Forbid();

        await _mediator.Send(new DeleteDesignRequest(id), ct);
        return NoContent();
    }
}
