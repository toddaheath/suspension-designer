namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

public record DynamicsResult(
    double MotionRatio,
    double WheelRate,         // N/mm
    double NaturalFrequency,  // Hz
    double DampingRatio,      // dimensionless
    double CriticalDamping);  // N*s/mm
