using MediatR;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Mapping;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.Application.Queries;

public record GetDesignQuery(Guid Id) : IRequest<SuspensionDesignDto?>;

public class GetDesignQueryHandler : IRequestHandler<GetDesignQuery, SuspensionDesignDto?>
{
    private readonly ISuspensionDesignRepository _repository;

    public GetDesignQueryHandler(ISuspensionDesignRepository repository) => _repository = repository;

    public async Task<SuspensionDesignDto?> Handle(GetDesignQuery request, CancellationToken ct)
    {
        var design = await _repository.GetByIdAsync(request.Id, ct);
        return design is null ? null : DesignDtoMapper.ToDto(design);
    }
}
