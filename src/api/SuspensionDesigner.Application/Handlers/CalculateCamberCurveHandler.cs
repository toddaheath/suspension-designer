using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateCamberCurveRequest(SuspensionDesignDto Design) : IRequest<IReadOnlyList<CamberCurvePointDto>>;

public class CalculateCamberCurveHandler : IRequestHandler<CalculateCamberCurveRequest, IReadOnlyList<CamberCurvePointDto>>
{
    public Task<IReadOnlyList<CamberCurvePointDto>> Handle(CalculateCamberCurveRequest request, CancellationToken cancellationToken)
    {
        var design = CalculateGeometryHandler.MapToEntity(request.Design);
        var curve = KinematicsCalculator.CalculateCamberCurve(design);

        IReadOnlyList<CamberCurvePointDto> result = curve
            .Select(p => new CamberCurvePointDto(p.WheelTravel, p.CamberAngle.Degrees))
            .ToList();

        return Task.FromResult(result);
    }
}
