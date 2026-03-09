using MediatR;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.Application.Handlers;

public record GetDesignRequest(Guid Id) : IRequest<SuspensionDesignDto?>;

public class GetDesignHandler : IRequestHandler<GetDesignRequest, SuspensionDesignDto?>
{
    private readonly ISuspensionDesignRepository _repository;

    public GetDesignHandler(ISuspensionDesignRepository repository)
    {
        _repository = repository;
    }

    public async Task<SuspensionDesignDto?> Handle(GetDesignRequest request, CancellationToken cancellationToken)
    {
        var design = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (design is null) return null;
        return CreateDesignHandler.MapToDto(design);
    }
}
