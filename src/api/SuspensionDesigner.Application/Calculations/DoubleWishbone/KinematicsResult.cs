using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

public record CamberCurvePoint(double WheelTravel, Angle CamberAngle);

public record BumpSteerPoint(double WheelTravel, Angle ToeAngle);

public record RollCenterMigrationPoint(double RollAngleDegrees, double RollCenterHeight);

public record KinematicsResult(
    IReadOnlyList<CamberCurvePoint> CamberCurve,
    IReadOnlyList<BumpSteerPoint> BumpSteerCurve,
    IReadOnlyList<RollCenterMigrationPoint> RollCenterMigration);
