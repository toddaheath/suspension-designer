namespace SuspensionDesigner.Core.ValueObjects;

/// <summary>
/// Immutable angle value object with degrees/radians conversion.
/// </summary>
public readonly record struct Angle
{
    private const double DegToRad = Math.PI / 180.0;
    private const double RadToDeg = 180.0 / Math.PI;

    public double Degrees { get; }
    public double Radians { get; }

    private Angle(double degrees, double radians)
    {
        Degrees = degrees;
        Radians = radians;
    }

    public static Angle FromDegrees(double degrees)
        => new(degrees, degrees * DegToRad);

    public static Angle FromRadians(double radians)
        => new(radians * RadToDeg, radians);

    public static Angle Zero => new(0, 0);

    public static Angle operator +(Angle a, Angle b)
        => FromRadians(a.Radians + b.Radians);

    public static Angle operator -(Angle a, Angle b)
        => FromRadians(a.Radians - b.Radians);

    public static Angle operator -(Angle a)
        => FromRadians(-a.Radians);

    public override string ToString() => $"{Degrees:F2}deg";
}
