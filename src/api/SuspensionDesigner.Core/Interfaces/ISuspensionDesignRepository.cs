using SuspensionDesigner.Core.Entities;

namespace SuspensionDesigner.Core.Interfaces;

public interface ISuspensionDesignRepository
{
    Task<SuspensionDesign?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<SuspensionDesign>> GetAllByUserAsync(string userId, CancellationToken ct = default);
    Task AddAsync(SuspensionDesign design, CancellationToken ct = default);
    void Update(SuspensionDesign design);
    void Delete(SuspensionDesign design);
}
