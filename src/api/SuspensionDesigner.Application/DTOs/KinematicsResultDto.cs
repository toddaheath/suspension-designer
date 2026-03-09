namespace SuspensionDesigner.Application.DTOs;

public record CamberCurvePointDto(double WheelTravel, double CamberAngleDegrees);

public record BumpSteerPointDto(double WheelTravel, double ToeAngleDegrees);

public record RollCenterMigrationPointDto(double RollAngleDegrees, double RollCenterHeight);

public record KinematicsResultDto(
    IReadOnlyList<CamberCurvePointDto> CamberCurve,
    IReadOnlyList<BumpSteerPointDto> BumpSteerCurve,
    IReadOnlyList<RollCenterMigrationPointDto> RollCenterMigration);
