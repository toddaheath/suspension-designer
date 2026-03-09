using MediatR;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.Application.Handlers;

public record ListDesignsRequest(string UserId) : IRequest<IReadOnlyList<SuspensionDesignDto>>;

public class ListDesignsHandler : IRequestHandler<ListDesignsRequest, IReadOnlyList<SuspensionDesignDto>>
{
    private readonly ISuspensionDesignRepository _repository;

    public ListDesignsHandler(ISuspensionDesignRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<SuspensionDesignDto>> Handle(ListDesignsRequest request, CancellationToken cancellationToken)
    {
        var designs = await _repository.GetAllByUserAsync(request.UserId, cancellationToken);
        return designs.Select(CreateDesignHandler.MapToDto).ToList();
    }
}
