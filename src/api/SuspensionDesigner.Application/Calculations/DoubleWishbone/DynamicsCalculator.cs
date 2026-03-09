using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

/// <summary>
/// Dynamic calculations for suspension spring/damper behavior.
/// Reference: Gillespie "Fundamentals of Vehicle Dynamics", Chapter 5.
///
/// Units: mass in kg, spring rate in N/mm, damping in N*s/mm, frequency in Hz.
/// </summary>
public static class DynamicsCalculator
{
    /// <summary>
    /// Motion ratio: ratio of spring displacement to wheel displacement.
    /// Calculated from the geometry of the spring/damper mounting points relative
    /// to the lower wishbone pivot axis.
    ///
    /// MR = (perpendicular distance from spring-lower to pivot axis) /
    ///      (perpendicular distance from LBJ to pivot axis)
    /// </summary>
    public static double CalculateMotionRatio(SuspensionDesign design)
    {
        var pivotAxis = (design.LowerWishboneRearPivot - design.LowerWishboneFrontPivot).Normalize();
        var pivotOrigin = design.LowerWishboneFrontPivot;

        double springArmLength = PerpendicularDistance(design.SpringDamperLower, pivotOrigin, pivotAxis);
        double wheelArmLength = PerpendicularDistance(design.LowerBallJoint, pivotOrigin, pivotAxis);

        if (wheelArmLength < 1e-6)
            return 1.0; // degenerate, assume 1:1

        return springArmLength / wheelArmLength;
    }

    /// <summary>
    /// Wheel rate: effective spring rate at the wheel.
    /// K_wheel = K_spring * MR^2
    /// </summary>
    public static double CalculateWheelRate(SuspensionDesign design)
    {
        double mr = CalculateMotionRatio(design);
        return design.SpringRate * mr * mr;
    }

    /// <summary>
    /// Natural frequency of the sprung mass on the suspension spring.
    /// f_n = (1 / 2*pi) * sqrt(K_wheel / M_sprung_per_corner)
    ///
    /// M_sprung_per_corner = SprungMass / 4 (assuming equal distribution).
    /// K_wheel in N/mm, so convert to N/m: multiply by 1000.
    /// Result in Hz. Typical range: 1.0-2.5 Hz for passenger cars, 2.0-3.5 Hz for race cars.
    /// </summary>
    public static double CalculateNaturalFrequency(SuspensionDesign design)
    {
        double wheelRate = CalculateWheelRate(design);
        double sprungMassPerCorner = design.SprungMass / 4.0;

        if (sprungMassPerCorner < 1e-6 || wheelRate < 1e-6)
            return 0;

        // Convert N/mm to N/m
        double wheelRateNM = wheelRate * 1000.0;

        return (1.0 / (2.0 * Math.PI)) * Math.Sqrt(wheelRateNM / sprungMassPerCorner);
    }

    /// <summary>
    /// Damping ratio: ratio of actual damping to critical damping.
    /// zeta = C_wheel / (2 * sqrt(K_wheel * M_sprung_per_corner))
    /// where C_wheel = C_damper * MR^2
    ///
    /// Typical values: 0.2-0.4 for comfort, 0.5-0.7 for sport, 0.7+ for race.
    /// </summary>
    public static double CalculateDampingRatio(SuspensionDesign design)
    {
        double criticalDamping = CalculateCriticalDamping(design);
        if (criticalDamping < 1e-12)
            return 0;

        double mr = CalculateMotionRatio(design);
        double wheelDamping = design.DampingCoefficient * mr * mr; // N*s/mm

        return wheelDamping / criticalDamping;
    }

    /// <summary>
    /// Critical damping coefficient at the wheel.
    /// C_crit = 2 * sqrt(K_wheel * M_sprung_per_corner)
    ///
    /// Note: K_wheel in N/mm, mass in kg.
    /// C_crit units: 2 * sqrt(N/mm * kg) = 2 * sqrt(N*kg/mm)
    /// Convert K to N/m: C_crit = 2 * sqrt(K_wheel * 1000 * M) in N*s/m,
    /// then convert back to N*s/mm by dividing by 1000.
    /// </summary>
    public static double CalculateCriticalDamping(SuspensionDesign design)
    {
        double wheelRate = CalculateWheelRate(design);
        double sprungMassPerCorner = design.SprungMass / 4.0;

        if (sprungMassPerCorner < 1e-6 || wheelRate < 1e-6)
            return 0;

        // K in N/m, result in N*s/m, then convert to N*s/mm
        double wheelRateNM = wheelRate * 1000.0;
        double critNsM = 2.0 * Math.Sqrt(wheelRateNM * sprungMassPerCorner);
        return critNsM / 1000.0; // N*s/mm
    }

    /// <summary>
    /// Complete dynamics calculation returning all results.
    /// </summary>
    public static DynamicsResult Calculate(SuspensionDesign design)
    {
        return new DynamicsResult(
            MotionRatio: CalculateMotionRatio(design),
            WheelRate: CalculateWheelRate(design),
            NaturalFrequency: CalculateNaturalFrequency(design),
            DampingRatio: CalculateDampingRatio(design),
            CriticalDamping: CalculateCriticalDamping(design));
    }

    private static double PerpendicularDistance(Point3D point, Point3D axisOrigin, Point3D axisDir)
    {
        var v = point - axisOrigin;
        double projection = Point3D.Dot(v, axisDir);
        var perpendicular = v - axisDir * projection;
        return perpendicular.Magnitude;
    }
}
