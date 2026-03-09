namespace SuspensionDesigner.Application.DTOs;

public record AckermannPointDto(double SteeringAngleDegrees, double AckermannPercent);

public record SteeringResultDto(IReadOnlyList<AckermannPointDto> AckermannCurve);
