using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateSteeringRequest(SuspensionDesignDto Design) : IRequest<SteeringResultDto>;

public class CalculateSteeringHandler : IRequestHandler<CalculateSteeringRequest, SteeringResultDto>
{
    public Task<SteeringResultDto> Handle(CalculateSteeringRequest request, CancellationToken cancellationToken)
    {
        var design = CalculateGeometryHandler.MapToEntity(request.Design);
        var result = SteeringCalculator.Calculate(design);

        var dto = new SteeringResultDto(
            result.AckermannCurve
                .Select(p => new AckermannPointDto(p.SteeringAngleDegrees, p.AckermannPercent))
                .ToList());

        return Task.FromResult(dto);
    }
}
