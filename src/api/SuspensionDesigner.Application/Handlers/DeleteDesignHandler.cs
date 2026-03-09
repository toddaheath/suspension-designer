using MediatR;
using SuspensionDesigner.Core.Interfaces;

namespace SuspensionDesigner.Application.Handlers;

public record DeleteDesignRequest(Guid Id) : IRequest<bool>;

public class DeleteDesignHandler : IRequestHandler<DeleteDesignRequest, bool>
{
    private readonly ISuspensionDesignRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteDesignHandler(ISuspensionDesignRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteDesignRequest request, CancellationToken cancellationToken)
    {
        var design = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (design is null) return false;

        _repository.Delete(design);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
