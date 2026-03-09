namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

public record AckermannPoint(double SteeringAngleDegrees, double AckermannPercent);

public record SteeringResult(IReadOnlyList<AckermannPoint> AckermannCurve);
