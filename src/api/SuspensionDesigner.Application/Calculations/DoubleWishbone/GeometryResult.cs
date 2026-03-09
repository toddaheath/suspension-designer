using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

public record GeometryResult(
    Point3D InstantCenter,
    double RollCenterHeight,
    Angle KingpinInclination,
    Angle CasterAngle,
    double ScrubRadius,
    double MechanicalTrail);
