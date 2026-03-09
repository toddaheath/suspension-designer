using MediatR;
using SuspensionDesigner.Application.Commands;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.Enums;
using SuspensionDesigner.Core.Interfaces;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Handlers;

public class CreateDesignHandler : IRequestHandler<CreateDesignCommand, SuspensionDesignDto>
{
    private readonly ISuspensionDesignRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDesignHandler(ISuspensionDesignRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SuspensionDesignDto> Handle(CreateDesignCommand request, CancellationToken cancellationToken)
    {
        var design = new SuspensionDesign
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            SuspensionType = (SuspensionType)request.SuspensionType,
            AxlePosition = (AxlePosition)request.AxlePosition,
            UpperWishboneFrontPivot = new Point3D(request.UpperWishboneFrontPivot.X, request.UpperWishboneFrontPivot.Y, request.UpperWishboneFrontPivot.Z),
            UpperWishboneRearPivot = new Point3D(request.UpperWishboneRearPivot.X, request.UpperWishboneRearPivot.Y, request.UpperWishboneRearPivot.Z),
            UpperBallJoint = new Point3D(request.UpperBallJoint.X, request.UpperBallJoint.Y, request.UpperBallJoint.Z),
            LowerWishboneFrontPivot = new Point3D(request.LowerWishboneFrontPivot.X, request.LowerWishboneFrontPivot.Y, request.LowerWishboneFrontPivot.Z),
            LowerWishboneRearPivot = new Point3D(request.LowerWishboneRearPivot.X, request.LowerWishboneRearPivot.Y, request.LowerWishboneRearPivot.Z),
            LowerBallJoint = new Point3D(request.LowerBallJoint.X, request.LowerBallJoint.Y, request.LowerBallJoint.Z),
            TieRodInner = new Point3D(request.TieRodInner.X, request.TieRodInner.Y, request.TieRodInner.Z),
            TieRodOuter = new Point3D(request.TieRodOuter.X, request.TieRodOuter.Y, request.TieRodOuter.Z),
            SpringDamperUpper = new Point3D(request.SpringDamperUpper.X, request.SpringDamperUpper.Y, request.SpringDamperUpper.Z),
            SpringDamperLower = new Point3D(request.SpringDamperLower.X, request.SpringDamperLower.Y, request.SpringDamperLower.Z),
            PushrodWheelEnd = new Point3D(request.PushrodWheelEnd.X, request.PushrodWheelEnd.Y, request.PushrodWheelEnd.Z),
            PushrodRockerEnd = new Point3D(request.PushrodRockerEnd.X, request.PushrodRockerEnd.Y, request.PushrodRockerEnd.Z),
            TrackWidth = request.TrackWidth,
            Wheelbase = request.Wheelbase,
            SprungMass = request.SprungMass,
            UnsprungMass = request.UnsprungMass,
            SpringRate = request.SpringRate,
            DampingCoefficient = request.DampingCoefficient,
            RideHeight = request.RideHeight,
            TireRadius = request.TireRadius,
            CgHeight = request.CgHeight,
            FrontBrakeProportion = request.FrontBrakeProportion,
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _repository.AddAsync(design, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(design);
    }

    internal static SuspensionDesignDto MapToDto(SuspensionDesign d)
    {
        return new SuspensionDesignDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            SuspensionType = d.SuspensionType,
            AxlePosition = d.AxlePosition,
            UpperWishboneFrontPivot = new Point3DDto(d.UpperWishboneFrontPivot.X, d.UpperWishboneFrontPivot.Y, d.UpperWishboneFrontPivot.Z),
            UpperWishboneRearPivot = new Point3DDto(d.UpperWishboneRearPivot.X, d.UpperWishboneRearPivot.Y, d.UpperWishboneRearPivot.Z),
            UpperBallJoint = new Point3DDto(d.UpperBallJoint.X, d.UpperBallJoint.Y, d.UpperBallJoint.Z),
            LowerWishboneFrontPivot = new Point3DDto(d.LowerWishboneFrontPivot.X, d.LowerWishboneFrontPivot.Y, d.LowerWishboneFrontPivot.Z),
            LowerWishboneRearPivot = new Point3DDto(d.LowerWishboneRearPivot.X, d.LowerWishboneRearPivot.Y, d.LowerWishboneRearPivot.Z),
            LowerBallJoint = new Point3DDto(d.LowerBallJoint.X, d.LowerBallJoint.Y, d.LowerBallJoint.Z),
            TieRodInner = new Point3DDto(d.TieRodInner.X, d.TieRodInner.Y, d.TieRodInner.Z),
            TieRodOuter = new Point3DDto(d.TieRodOuter.X, d.TieRodOuter.Y, d.TieRodOuter.Z),
            SpringDamperUpper = new Point3DDto(d.SpringDamperUpper.X, d.SpringDamperUpper.Y, d.SpringDamperUpper.Z),
            SpringDamperLower = new Point3DDto(d.SpringDamperLower.X, d.SpringDamperLower.Y, d.SpringDamperLower.Z),
            PushrodWheelEnd = new Point3DDto(d.PushrodWheelEnd.X, d.PushrodWheelEnd.Y, d.PushrodWheelEnd.Z),
            PushrodRockerEnd = new Point3DDto(d.PushrodRockerEnd.X, d.PushrodRockerEnd.Y, d.PushrodRockerEnd.Z),
            TrackWidth = d.TrackWidth,
            Wheelbase = d.Wheelbase,
            SprungMass = d.SprungMass,
            UnsprungMass = d.UnsprungMass,
            SpringRate = d.SpringRate,
            DampingCoefficient = d.DampingCoefficient,
            RideHeight = d.RideHeight,
            TireRadius = d.TireRadius,
            CgHeight = d.CgHeight,
            FrontBrakeProportion = d.FrontBrakeProportion,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt,
        };
    }
}
