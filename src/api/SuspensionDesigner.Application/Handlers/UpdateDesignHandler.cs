using MediatR;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Core.Enums;
using SuspensionDesigner.Core.Interfaces;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Handlers;

public record UpdateDesignCommand : IRequest<SuspensionDesignDto?>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int SuspensionType { get; init; }
    public int AxlePosition { get; init; }

    public Point3DDto UpperWishboneFrontPivot { get; init; } = new(0, 0, 0);
    public Point3DDto UpperWishboneRearPivot { get; init; } = new(0, 0, 0);
    public Point3DDto UpperBallJoint { get; init; } = new(0, 0, 0);
    public Point3DDto LowerWishboneFrontPivot { get; init; } = new(0, 0, 0);
    public Point3DDto LowerWishboneRearPivot { get; init; } = new(0, 0, 0);
    public Point3DDto LowerBallJoint { get; init; } = new(0, 0, 0);
    public Point3DDto TieRodInner { get; init; } = new(0, 0, 0);
    public Point3DDto TieRodOuter { get; init; } = new(0, 0, 0);
    public Point3DDto SpringDamperUpper { get; init; } = new(0, 0, 0);
    public Point3DDto SpringDamperLower { get; init; } = new(0, 0, 0);
    public Point3DDto PushrodWheelEnd { get; init; } = new(0, 0, 0);
    public Point3DDto PushrodRockerEnd { get; init; } = new(0, 0, 0);

    public double TrackWidth { get; init; }
    public double Wheelbase { get; init; }
    public double SprungMass { get; init; }
    public double UnsprungMass { get; init; }
    public double SpringRate { get; init; }
    public double DampingCoefficient { get; init; }
    public double RideHeight { get; init; }
    public double TireRadius { get; init; }
    public double CgHeight { get; init; }
    public double FrontBrakeProportion { get; init; } = 0.6;
}

public class UpdateDesignHandler : IRequestHandler<UpdateDesignCommand, SuspensionDesignDto?>
{
    private readonly ISuspensionDesignRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateDesignHandler(ISuspensionDesignRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SuspensionDesignDto?> Handle(UpdateDesignCommand request, CancellationToken cancellationToken)
    {
        var design = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (design is null) return null;

        design.Name = request.Name;
        design.Description = request.Description;
        design.SuspensionType = (SuspensionType)request.SuspensionType;
        design.AxlePosition = (AxlePosition)request.AxlePosition;
        design.UpperWishboneFrontPivot = new Point3D(request.UpperWishboneFrontPivot.X, request.UpperWishboneFrontPivot.Y, request.UpperWishboneFrontPivot.Z);
        design.UpperWishboneRearPivot = new Point3D(request.UpperWishboneRearPivot.X, request.UpperWishboneRearPivot.Y, request.UpperWishboneRearPivot.Z);
        design.UpperBallJoint = new Point3D(request.UpperBallJoint.X, request.UpperBallJoint.Y, request.UpperBallJoint.Z);
        design.LowerWishboneFrontPivot = new Point3D(request.LowerWishboneFrontPivot.X, request.LowerWishboneFrontPivot.Y, request.LowerWishboneFrontPivot.Z);
        design.LowerWishboneRearPivot = new Point3D(request.LowerWishboneRearPivot.X, request.LowerWishboneRearPivot.Y, request.LowerWishboneRearPivot.Z);
        design.LowerBallJoint = new Point3D(request.LowerBallJoint.X, request.LowerBallJoint.Y, request.LowerBallJoint.Z);
        design.TieRodInner = new Point3D(request.TieRodInner.X, request.TieRodInner.Y, request.TieRodInner.Z);
        design.TieRodOuter = new Point3D(request.TieRodOuter.X, request.TieRodOuter.Y, request.TieRodOuter.Z);
        design.SpringDamperUpper = new Point3D(request.SpringDamperUpper.X, request.SpringDamperUpper.Y, request.SpringDamperUpper.Z);
        design.SpringDamperLower = new Point3D(request.SpringDamperLower.X, request.SpringDamperLower.Y, request.SpringDamperLower.Z);
        design.PushrodWheelEnd = new Point3D(request.PushrodWheelEnd.X, request.PushrodWheelEnd.Y, request.PushrodWheelEnd.Z);
        design.PushrodRockerEnd = new Point3D(request.PushrodRockerEnd.X, request.PushrodRockerEnd.Y, request.PushrodRockerEnd.Z);
        design.TrackWidth = request.TrackWidth;
        design.Wheelbase = request.Wheelbase;
        design.SprungMass = request.SprungMass;
        design.UnsprungMass = request.UnsprungMass;
        design.SpringRate = request.SpringRate;
        design.DampingCoefficient = request.DampingCoefficient;
        design.RideHeight = request.RideHeight;
        design.TireRadius = request.TireRadius;
        design.CgHeight = request.CgHeight;
        design.FrontBrakeProportion = request.FrontBrakeProportion;
        design.UpdatedAt = DateTime.UtcNow;

        _repository.Update(design);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CreateDesignHandler.MapToDto(design);
    }
}
