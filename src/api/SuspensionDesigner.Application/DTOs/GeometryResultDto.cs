namespace SuspensionDesigner.Application.DTOs;

public record GeometryResultDto(
    Point3DDto InstantCenter,
    double RollCenterHeight,
    double KingpinInclinationDegrees,
    double CasterAngleDegrees,
    double ScrubRadius,
    double MechanicalTrail);
