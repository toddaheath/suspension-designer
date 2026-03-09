using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateBumpSteerRequest(SuspensionDesignDto Design) : IRequest<IReadOnlyList<BumpSteerPointDto>>;

public class CalculateBumpSteerHandler : IRequestHandler<CalculateBumpSteerRequest, IReadOnlyList<BumpSteerPointDto>>
{
    public Task<IReadOnlyList<BumpSteerPointDto>> Handle(CalculateBumpSteerRequest request, CancellationToken cancellationToken)
    {
        var design = CalculateGeometryHandler.MapToEntity(request.Design);
        var curve = KinematicsCalculator.CalculateBumpSteerCurve(design);

        IReadOnlyList<BumpSteerPointDto> result = curve
            .Select(p => new BumpSteerPointDto(p.WheelTravel, p.ToeAngle.Degrees))
            .ToList();

        return Task.FromResult(result);
    }
}
