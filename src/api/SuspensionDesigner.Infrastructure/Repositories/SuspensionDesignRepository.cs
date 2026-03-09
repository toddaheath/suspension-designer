using Microsoft.EntityFrameworkCore;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.Interfaces;
using SuspensionDesigner.Infrastructure.Data;

namespace SuspensionDesigner.Infrastructure.Repositories;

public class SuspensionDesignRepository : ISuspensionDesignRepository
{
    private readonly ApplicationDbContext _context;

    public SuspensionDesignRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SuspensionDesign?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.SuspensionDesigns.FirstOrDefaultAsync(d => d.Id == id, ct);
    }

    public async Task<IReadOnlyList<SuspensionDesign>> GetAllByUserAsync(string userId, CancellationToken ct = default)
    {
        return await _context.SuspensionDesigns
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(SuspensionDesign design, CancellationToken ct = default)
    {
        await _context.SuspensionDesigns.AddAsync(design, ct);
    }

    public void Update(SuspensionDesign design)
    {
        _context.SuspensionDesigns.Update(design);
    }

    public void Delete(SuspensionDesign design)
    {
        _context.SuspensionDesigns.Remove(design);
    }
}
