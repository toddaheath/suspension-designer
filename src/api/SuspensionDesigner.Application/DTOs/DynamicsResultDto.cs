namespace SuspensionDesigner.Application.DTOs;

public record DynamicsResultDto(
    double MotionRatio,
    double WheelRate,
    double NaturalFrequency,
    double DampingRatio,
    double CriticalDamping);
