using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateAntiGeometryRequest(SuspensionDesignDto Design) : IRequest<AntiGeometryResultDto>;

public class CalculateAntiGeometryHandler : IRequestHandler<CalculateAntiGeometryRequest, AntiGeometryResultDto>
{
    public Task<AntiGeometryResultDto> Handle(CalculateAntiGeometryRequest request, CancellationToken cancellationToken)
    {
        var design = CalculateGeometryHandler.MapToEntity(request.Design);
        var result = AntiGeometryCalculator.Calculate(design);

        var dto = new AntiGeometryResultDto(
            result.AntiDivePercent,
            result.AntiSquatPercent);

        return Task.FromResult(dto);
    }
}
