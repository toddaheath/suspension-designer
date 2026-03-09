namespace SuspensionDesigner.Core.ValueObjects;

/// <summary>
/// Immutable 3D point/vector using SAE coordinate system: X forward, Y left, Z up.
/// All units in millimeters unless otherwise specified.
/// </summary>
public readonly record struct Point3D(double X, double Y, double Z)
{
    public static Point3D Zero => new(0, 0, 0);

    public double Magnitude => Math.Sqrt(X * X + Y * Y + Z * Z);

    public double MagnitudeSquared => X * X + Y * Y + Z * Z;

    public Point3D Normalize()
    {
        var mag = Magnitude;
        if (mag < 1e-12)
            return Zero;
        return new Point3D(X / mag, Y / mag, Z / mag);
    }

    public static Point3D operator +(Point3D a, Point3D b)
        => new(a.X + b.X, a.Y + b.Y, a.Z + b.Z);

    public static Point3D operator -(Point3D a, Point3D b)
        => new(a.X - b.X, a.Y - b.Y, a.Z - b.Z);

    public static Point3D operator *(Point3D a, double s)
        => new(a.X * s, a.Y * s, a.Z * s);

    public static Point3D operator *(double s, Point3D a)
        => new(a.X * s, a.Y * s, a.Z * s);

    public static Point3D operator /(Point3D a, double s)
        => new(a.X / s, a.Y / s, a.Z / s);

    public static Point3D operator -(Point3D a)
        => new(-a.X, -a.Y, -a.Z);

    public static double Dot(Point3D a, Point3D b)
        => a.X * b.X + a.Y * b.Y + a.Z * b.Z;

    public static Point3D Cross(Point3D a, Point3D b)
        => new(
            a.Y * b.Z - a.Z * b.Y,
            a.Z * b.X - a.X * b.Z,
            a.X * b.Y - a.Y * b.X);

    public double DistanceTo(Point3D other) => (this - other).Magnitude;

    public override string ToString() => $"({X:F2}, {Y:F2}, {Z:F2})";
}
