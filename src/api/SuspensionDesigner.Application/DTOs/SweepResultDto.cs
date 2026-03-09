namespace SuspensionDesigner.Application.DTOs;

public record SweepResultDto(
    GeometryResultDto Geometry,
    IReadOnlyList<CamberCurvePointDto> CamberCurve,
    IReadOnlyList<RollCenterMigrationPointDto> RollCenterMigration,
    DynamicsResultDto Dynamics,
    AntiGeometryResultDto AntiGeometry,
    SteeringResultDto Steering,
    IReadOnlyList<BumpSteerPointDto> BumpSteer);
