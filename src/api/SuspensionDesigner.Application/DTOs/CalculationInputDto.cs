using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.DTOs;

public record HardpointsDto(
    Point3D UpperWishboneFrontPivot,
    Point3D UpperWishboneRearPivot,
    Point3D UpperBallJoint,
    Point3D LowerWishboneFrontPivot,
    Point3D LowerWishboneRearPivot,
    Point3D LowerBallJoint,
    Point3D TieRodInner,
    Point3D TieRodOuter,
    Point3D SpringDamperUpper,
    Point3D SpringDamperLower);

public record VehicleParamsDto(
    double TrackWidth,
    double Wheelbase,
    double SprungMass,
    double UnsprungMass,
    double SpringRate,
    double DampingCoefficient,
    double RideHeight,
    double TireRadius,
    double CgHeight = 300.0,
    double FrontBrakeProportion = 0.6);

public record CalculationInputDto(
    HardpointsDto Hardpoints,
    VehicleParamsDto VehicleParams);
