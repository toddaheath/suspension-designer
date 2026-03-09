using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Mapping;

public static class DesignDtoMapper
{
    public static SuspensionDesign ToEntity(SuspensionDesignDto dto) => new()
    {
        SuspensionType = dto.SuspensionType,
        AxlePosition = dto.AxlePosition,
        UpperWishboneFrontPivot = P(dto.UpperWishboneFrontPivot),
        UpperWishboneRearPivot = P(dto.UpperWishboneRearPivot),
        UpperBallJoint = P(dto.UpperBallJoint),
        LowerWishboneFrontPivot = P(dto.LowerWishboneFrontPivot),
        LowerWishboneRearPivot = P(dto.LowerWishboneRearPivot),
        LowerBallJoint = P(dto.LowerBallJoint),
        TieRodInner = P(dto.TieRodInner),
        TieRodOuter = P(dto.TieRodOuter),
        SpringDamperUpper = P(dto.SpringDamperUpper),
        SpringDamperLower = P(dto.SpringDamperLower),
        PushrodWheelEnd = P(dto.PushrodWheelEnd),
        PushrodRockerEnd = P(dto.PushrodRockerEnd),
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

    public static SuspensionDesignDto ToDto(SuspensionDesign d) => new()
    {
        Id = d.Id,
        Name = d.Name,
        Description = d.Description,
        SuspensionType = d.SuspensionType,
        AxlePosition = d.AxlePosition,
        UpperWishboneFrontPivot = D(d.UpperWishboneFrontPivot),
        UpperWishboneRearPivot = D(d.UpperWishboneRearPivot),
        UpperBallJoint = D(d.UpperBallJoint),
        LowerWishboneFrontPivot = D(d.LowerWishboneFrontPivot),
        LowerWishboneRearPivot = D(d.LowerWishboneRearPivot),
        LowerBallJoint = D(d.LowerBallJoint),
        TieRodInner = D(d.TieRodInner),
        TieRodOuter = D(d.TieRodOuter),
        SpringDamperUpper = D(d.SpringDamperUpper),
        SpringDamperLower = D(d.SpringDamperLower),
        PushrodWheelEnd = D(d.PushrodWheelEnd),
        PushrodRockerEnd = D(d.PushrodRockerEnd),
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

    private static Point3D P(Point3DDto d) => new(d.X, d.Y, d.Z);
    private static Point3DDto D(Point3D p) => new(p.X, p.Y, p.Z);
}
