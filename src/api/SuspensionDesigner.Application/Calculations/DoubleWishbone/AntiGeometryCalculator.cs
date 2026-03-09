using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.Enums;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

/// <summary>
/// Anti-dive and anti-squat geometry calculations.
/// Reference: Milliken & Milliken "Race Car Vehicle Dynamics", Chapter 18.
///
/// These calculate the percentage of longitudinal load transfer that is
/// reacted through the suspension links rather than through the springs.
/// </summary>
public static class AntiGeometryCalculator
{
    /// <summary>
    /// Anti-dive percentage for front suspension under braking.
    ///
    /// The side-view instant center (SVIC) is found by projecting the upper and lower
    /// wishbone pivot axes into the X-Z (side view) plane.
    ///
    /// Anti-dive% = tan(angle_from_contact_patch_to_SVIC) * (L / (h * bf)) * 100
    /// where:
    ///   L = wheelbase
    ///   h = CG height
    ///   bf = front brake proportion (fraction of total braking on front axle)
    ///
    /// For front suspension: the angle is measured from the contact patch center
    /// to the side-view IC, looking at the front axle from the side.
    /// </summary>
    public static double CalculateAntiDive(SuspensionDesign design)
    {
        var svic = CalculateSideViewInstantCenter(design);

        // Angle from contact patch (at ground, X = 0 for front axle reference) to SVIC
        // Contact patch is at Z = 0, X = 0 (front axle reference)
        double dx = svic.X; // positive = forward of axle
        double dz = svic.Z; // height of SVIC

        if (Math.Abs(design.CgHeight) < 1e-6 || Math.Abs(design.FrontBrakeProportion) < 1e-6)
            return 0;

        double tanAngle = dz / Math.Max(Math.Abs(dx), 1e-6);
        if (dx < 0) tanAngle = -tanAngle; // SVIC behind axle

        double antiDive = tanAngle * (design.Wheelbase / (design.CgHeight * design.FrontBrakeProportion)) * 100.0;

        return antiDive;
    }

    /// <summary>
    /// Anti-squat percentage for rear suspension under acceleration.
    ///
    /// Anti-squat% = tan(angle_from_contact_patch_to_SVIC) * (L / h) * 100
    /// where the SVIC is for the rear suspension.
    ///
    /// For rear independent suspension, this is the side-view equivalent.
    /// </summary>
    public static double CalculateAntiSquat(SuspensionDesign design)
    {
        var svic = CalculateSideViewInstantCenter(design);

        double dx = svic.X; // distance forward
        double dz = svic.Z;

        if (Math.Abs(design.CgHeight) < 1e-6)
            return 0;

        double tanAngle = dz / Math.Max(Math.Abs(dx), 1e-6);
        if (dx > 0) tanAngle = -tanAngle; // For rear, forward SVIC gives anti-squat

        double rearBrakeProportion = 1.0 - design.FrontBrakeProportion;
        if (design.AxlePosition == AxlePosition.Rear && rearBrakeProportion > 1e-6)
        {
            // Under braking for rear axle
            return tanAngle * (design.Wheelbase / (design.CgHeight * rearBrakeProportion)) * 100.0;
        }

        // Under acceleration (rear drive)
        return tanAngle * (design.Wheelbase / design.CgHeight) * 100.0;
    }

    /// <summary>
    /// Complete anti-geometry calculation.
    /// </summary>
    public static AntiGeometryResult Calculate(SuspensionDesign design)
    {
        return new AntiGeometryResult(
            AntiDivePercent: CalculateAntiDive(design),
            AntiSquatPercent: CalculateAntiSquat(design));
    }

    /// <summary>
    /// Calculate the side-view instant center by projecting the upper and lower
    /// wishbone geometries into the X-Z plane.
    ///
    /// Each wishbone defines a plane. The intersection of the upper and lower
    /// wishbone planes with the X-Z plane gives two lines. Their intersection
    /// is the side-view instant center.
    /// </summary>
    private static Point3D CalculateSideViewInstantCenter(SuspensionDesign design)
    {
        // Project upper wishbone into X-Z: use ball joint and pivot axis projected to X-Z
        var upperPivotXZ = GetSideViewPivotPoint(
            design.UpperWishboneFrontPivot,
            design.UpperWishboneRearPivot,
            design.UpperBallJoint);
        var ubjXZ = new Point2D(design.UpperBallJoint.X, design.UpperBallJoint.Z);

        var lowerPivotXZ = GetSideViewPivotPoint(
            design.LowerWishboneFrontPivot,
            design.LowerWishboneRearPivot,
            design.LowerBallJoint);
        var lbjXZ = new Point2D(design.LowerBallJoint.X, design.LowerBallJoint.Z);

        var ic2D = LineIntersection2D(upperPivotXZ, ubjXZ, lowerPivotXZ, lbjXZ);

        return new Point3D(ic2D.X, 0, ic2D.Z);
    }

    /// <summary>
    /// Project a wishbone pivot axis into the side (X-Z) view.
    /// Find where the pivot axis intersects the X-Z plane at the ball joint's Y coordinate.
    /// </summary>
    private static Point2D GetSideViewPivotPoint(
        Point3D pivotFront, Point3D pivotRear, Point3D ballJoint)
    {
        var axis = pivotRear - pivotFront;
        if (Math.Abs(axis.Y) < 1e-12)
        {
            double midX = (pivotFront.X + pivotRear.X) / 2.0;
            double midZ = (pivotFront.Z + pivotRear.Z) / 2.0;
            return new Point2D(midX, midZ);
        }

        double t = (ballJoint.Y - pivotFront.Y) / axis.Y;
        double x = pivotFront.X + t * axis.X;
        double z = pivotFront.Z + t * axis.Z;
        return new Point2D(x, z);
    }

    private static Point2D LineIntersection2D(Point2D p1, Point2D p2, Point2D p3, Point2D p4)
    {
        double d1x = p2.X - p1.X;
        double d1z = p2.Z - p1.Z;
        double d2x = p4.X - p3.X;
        double d2z = p4.Z - p3.Z;

        double denom = d1x * d2z - d1z * d2x;
        if (Math.Abs(denom) < 1e-12)
            return new Point2D((p2.X + p4.X) / 2.0, (p2.Z + p4.Z) / 2.0);

        double t = ((p3.X - p1.X) * d2z - (p3.Z - p1.Z) * d2x) / denom;
        return new Point2D(p1.X + t * d1x, p1.Z + t * d1z);
    }

    private readonly record struct Point2D(double X, double Z);
}
