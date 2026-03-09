using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateRollCenterRequest(SuspensionDesignDto Design) : IRequest<IReadOnlyList<RollCenterMigrationPointDto>>;

public class CalculateRollCenterHandler : IRequestHandler<CalculateRollCenterRequest, IReadOnlyList<RollCenterMigrationPointDto>>
{
    public Task<IReadOnlyList<RollCenterMigrationPointDto>> Handle(CalculateRollCenterRequest request, CancellationToken cancellationToken)
    {
        var design = CalculateGeometryHandler.MapToEntity(request.Design);
        var curve = KinematicsCalculator.CalculateRollCenterMigration(design);

        IReadOnlyList<RollCenterMigrationPointDto> result = curve
            .Select(p => new RollCenterMigrationPointDto(p.RollAngleDegrees, p.RollCenterHeight))
            .ToList();

        return Task.FromResult(result);
    }
}
