using MediatR;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Mapping;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.Application.Queries;

public record ListDesignsQuery(string UserId) : IRequest<IReadOnlyList<SuspensionDesignDto>>;

public class ListDesignsQueryHandler : IRequestHandler<ListDesignsQuery, IReadOnlyList<SuspensionDesignDto>>
{
    private readonly ISuspensionDesignRepository _repository;

    public ListDesignsQueryHandler(ISuspensionDesignRepository repository) => _repository = repository;

    public async Task<IReadOnlyList<SuspensionDesignDto>> Handle(ListDesignsQuery request, CancellationToken ct)
    {
        var designs = await _repository.GetAllByUserAsync(request.UserId, ct);
        return designs.Select(DesignDtoMapper.ToDto).ToList();
    }
}
