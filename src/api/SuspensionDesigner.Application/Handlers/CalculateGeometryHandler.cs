using MediatR;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Handlers;

public record CalculateGeometryRequest(SuspensionDesignDto Design) : IRequest<GeometryResultDto>;

public class CalculateGeometryHandler : IRequestHandler<CalculateGeometryRequest, GeometryResultDto>
{
    public Task<GeometryResultDto> Handle(CalculateGeometryRequest request, CancellationToken cancellationToken)
    {
        var design = MapToEntity(request.Design);
        var result = GeometryCalculator.Calculate(design);

        var dto = new GeometryResultDto(
            InstantCenter: new Point3DDto(result.InstantCenter.X, result.InstantCenter.Y, result.InstantCenter.Z),
            RollCenterHeight: result.RollCenterHeight,
            KingpinInclinationDegrees: result.KingpinInclination.Degrees,
            CasterAngleDegrees: result.CasterAngle.Degrees,
            ScrubRadius: result.ScrubRadius,
            MechanicalTrail: result.MechanicalTrail);

        return Task.FromResult(dto);
    }

    internal static SuspensionDesign MapToEntity(SuspensionDesignDto dto)
    {
        return new SuspensionDesign
        {
            Id = dto.Id,
            Name = dto.Name,
            Description = dto.Description,
            SuspensionType = dto.SuspensionType,
            AxlePosition = dto.AxlePosition,
            UpperWishboneFrontPivot = new Point3D(dto.UpperWishboneFrontPivot.X, dto.UpperWishboneFrontPivot.Y, dto.UpperWishboneFrontPivot.Z),
            UpperWishboneRearPivot = new Point3D(dto.UpperWishboneRearPivot.X, dto.UpperWishboneRearPivot.Y, dto.UpperWishboneRearPivot.Z),
            UpperBallJoint = new Point3D(dto.UpperBallJoint.X, dto.UpperBallJoint.Y, dto.UpperBallJoint.Z),
            LowerWishboneFrontPivot = new Point3D(dto.LowerWishboneFrontPivot.X, dto.LowerWishboneFrontPivot.Y, dto.LowerWishboneFrontPivot.Z),
            LowerWishboneRearPivot = new Point3D(dto.LowerWishboneRearPivot.X, dto.LowerWishboneRearPivot.Y, dto.LowerWishboneRearPivot.Z),
            LowerBallJoint = new Point3D(dto.LowerBallJoint.X, dto.LowerBallJoint.Y, dto.LowerBallJoint.Z),
            TieRodInner = new Point3D(dto.TieRodInner.X, dto.TieRodInner.Y, dto.TieRodInner.Z),
            TieRodOuter = new Point3D(dto.TieRodOuter.X, dto.TieRodOuter.Y, dto.TieRodOuter.Z),
            SpringDamperUpper = new Point3D(dto.SpringDamperUpper.X, dto.SpringDamperUpper.Y, dto.SpringDamperUpper.Z),
            SpringDamperLower = new Point3D(dto.SpringDamperLower.X, dto.SpringDamperLower.Y, dto.SpringDamperLower.Z),
            PushrodWheelEnd = new Point3D(dto.PushrodWheelEnd.X, dto.PushrodWheelEnd.Y, dto.PushrodWheelEnd.Z),
            PushrodRockerEnd = new Point3D(dto.PushrodRockerEnd.X, dto.PushrodRockerEnd.Y, dto.PushrodRockerEnd.Z),
            TrackWidth = dto.TrackWidth,
            Wheelbase = dto.Wheelbase,
            SprungMass = dto.SprungMass,
            UnsprungMass = dto.UnsprungMass,
            SpringRate = dto.SpringRate,
            DampingCoefficient = dto.DampingCoefficient,
            RideHeight = dto.RideHeight,
            TireRadius = dto.TireRadius,
            CgHeight = dto.CgHeight,
            FrontBrakeProportion = dto.FrontBrakeProportion,
        };
    }
}
