using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateDynamicsRequest(SuspensionDesignDto Design) : IRequest<DynamicsResultDto>;

public class CalculateDynamicsHandler : IRequestHandler<CalculateDynamicsRequest, DynamicsResultDto>
{
    public Task<DynamicsResultDto> Handle(CalculateDynamicsRequest request, CancellationToken cancellationToken)
    {
        var design = CalculateGeometryHandler.MapToEntity(request.Design);
        var result = DynamicsCalculator.Calculate(design);

        var dto = new DynamicsResultDto(
            result.MotionRatio,
            result.WheelRate,
            result.NaturalFrequency,
            result.DampingRatio,
            result.CriticalDamping);

        return Task.FromResult(dto);
    }
}
