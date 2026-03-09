using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

/// <summary>
/// Static/pure geometry calculations for double-wishbone suspension.
/// Reference: Milliken & Milliken "Race Car Vehicle Dynamics", Chapters 17-18.
/// SAE coordinate system: X forward, Y left, Z up.
/// </summary>
public static class GeometryCalculator
{
    /// <summary>
    /// Calculate front-view instant center by projecting upper and lower wishbone
    /// pivot axes into the Y-Z plane, then finding the 2D line intersection
    /// of lines drawn from each ball joint through the projected pivot axis points.
    ///
    /// Each wishbone has two chassis pivot points defining a pivot axis. The outboard
    /// ball joint swings around this axis. In the front (Y-Z) view, we project the
    /// pivot axis and ball joint, then draw a line from the projected pivot axis
    /// direction through the ball joint. The intersection of upper and lower lines
    /// gives the instant center.
    /// </summary>
    public static Point3D CalculateInstantCenter(SuspensionDesign design)
    {
        // Project upper wishbone into Y-Z plane
        var ubj = new Point2D(design.UpperBallJoint.Y, design.UpperBallJoint.Z);
        var upperAxis = design.UpperWishboneRearPivot - design.UpperWishboneFrontPivot;
        var upperAxisYZ = new Point2D(upperAxis.Y, upperAxis.Z);

        // The upper wishbone effective pivot in front view: project the pivot axis
        // to find where the ball joint's arc appears as a line in Y-Z.
        // In front view, the instantaneous line is from the ball joint toward the
        // point where the pivot axis (extended) intersects the Y-Z plane at the ball joint's X.
        var upperInnerYZ = GetFrontViewPivotPoint(
            design.UpperWishboneFrontPivot,
            design.UpperWishboneRearPivot,
            design.UpperBallJoint);

        // Project lower wishbone into Y-Z plane
        var lbj = new Point2D(design.LowerBallJoint.Y, design.LowerBallJoint.Z);
        var lowerInnerYZ = GetFrontViewPivotPoint(
            design.LowerWishboneFrontPivot,
            design.LowerWishboneRearPivot,
            design.LowerBallJoint);

        // Find intersection of lines: upper (upperInnerYZ -> ubj) and lower (lowerInnerYZ -> lbj)
        var ic2D = LineIntersection2D(upperInnerYZ, ubj, lowerInnerYZ, lbj);

        return new Point3D(0, ic2D.Y, ic2D.Z);
    }

    /// <summary>
    /// Roll center height: draw a line from the instant center to the tire contact
    /// patch center (at ground, Y = trackWidth/2), find the height where this line
    /// crosses the vehicle centerline (Y = 0).
    /// </summary>
    public static double CalculateRollCenterHeight(SuspensionDesign design)
    {
        var ic = CalculateInstantCenter(design);
        double contactPatchY = design.TrackWidth / 2.0;
        double contactPatchZ = 0.0; // ground level

        // Line from contact patch to IC, find Z at Y = 0
        if (Math.Abs(contactPatchY - ic.Y) < 1e-12)
            return ic.Z; // degenerate case

        double slope = (ic.Z - contactPatchZ) / (ic.Y - contactPatchY);
        double rcHeight = contactPatchZ + slope * (0.0 - contactPatchY);

        return rcHeight;
    }

    /// <summary>
    /// Kingpin Inclination (KPI): angle of the steering axis (line from lower ball joint
    /// to upper ball joint) projected into the front (Y-Z) plane, measured from vertical (Z axis).
    /// Positive when the top of the axis tilts inward (toward vehicle center).
    /// </summary>
    public static Angle CalculateKPI(SuspensionDesign design)
    {
        var steeringAxis = design.UpperBallJoint - design.LowerBallJoint;
        // Project into Y-Z plane
        double dy = steeringAxis.Y;
        double dz = steeringAxis.Z;
        // Angle from vertical (Z axis)
        double angleRad = Math.Atan2(Math.Abs(dy), Math.Abs(dz));
        return Angle.FromRadians(angleRad);
    }

    /// <summary>
    /// Caster angle: angle of the steering axis projected into the side (X-Z) plane,
    /// measured from vertical. Positive when the top of the axis tilts rearward.
    /// </summary>
    public static Angle CalculateCasterAngle(SuspensionDesign design)
    {
        var steeringAxis = design.UpperBallJoint - design.LowerBallJoint;
        double dx = steeringAxis.X;
        double dz = steeringAxis.Z;
        // Positive caster = upper ball joint is rearward of lower (dx < 0 in SAE)
        double angleRad = Math.Atan2(-dx, Math.Abs(dz));
        return Angle.FromRadians(angleRad);
    }

    /// <summary>
    /// Scrub radius: lateral distance from the steering axis ground intercept to the
    /// tire contact patch center, measured in the front (Y-Z) plane.
    /// Positive when the ground intercept is inboard of the contact patch center.
    /// </summary>
    public static double CalculateScrubRadius(SuspensionDesign design)
    {
        var groundIntercept = SteeringAxisGroundIntercept(design);
        double contactPatchY = design.UpperBallJoint.Y; // approximate: use ball joint Y as tire center
        // More precisely, contact patch center is at the wheel center Y
        // For a typical setup, ball joint Y ~ wheel center Y
        return contactPatchY - groundIntercept.Y;
    }

    /// <summary>
    /// Mechanical trail: longitudinal distance from the steering axis ground intercept
    /// to the tire contact patch center, measured in the side (X-Z) plane.
    /// Positive when the contact patch is behind the ground intercept.
    /// </summary>
    public static double CalculateMechanicalTrail(SuspensionDesign design)
    {
        var groundIntercept = SteeringAxisGroundIntercept(design);
        // Contact patch center is directly below wheel center (at X of wheel center)
        double contactPatchX = design.LowerBallJoint.X;
        return groundIntercept.X - contactPatchX;
    }

    /// <summary>
    /// Complete geometry calculation returning all results in one call.
    /// </summary>
    public static GeometryResult Calculate(SuspensionDesign design)
    {
        return new GeometryResult(
            InstantCenter: CalculateInstantCenter(design),
            RollCenterHeight: CalculateRollCenterHeight(design),
            KingpinInclination: CalculateKPI(design),
            CasterAngle: CalculateCasterAngle(design),
            ScrubRadius: CalculateScrubRadius(design),
            MechanicalTrail: CalculateMechanicalTrail(design));
    }

    // --- Private helpers ---

    /// <summary>
    /// Project a wishbone pivot axis into the front (Y-Z) view and find the effective
    /// pivot point. This is found by extending the pivot axis line to the X coordinate
    /// of the ball joint (i.e., finding where the pivot axis intersects the frontal
    /// plane passing through the ball joint).
    /// </summary>
    private static Point2D GetFrontViewPivotPoint(
        Point3D pivotFront, Point3D pivotRear, Point3D ballJoint)
    {
        var axis = pivotRear - pivotFront;
        if (Math.Abs(axis.X) < 1e-12)
        {
            // Pivot axis is perpendicular to X - use midpoint projection
            double midY = (pivotFront.Y + pivotRear.Y) / 2.0;
            double midZ = (pivotFront.Z + pivotRear.Z) / 2.0;
            return new Point2D(midY, midZ);
        }

        // Parametric: P(t) = pivotFront + t * axis, solve for P(t).X = ballJoint.X
        double t = (ballJoint.X - pivotFront.X) / axis.X;
        double y = pivotFront.Y + t * axis.Y;
        double z = pivotFront.Z + t * axis.Z;
        return new Point2D(y, z);
    }

    /// <summary>
    /// Find intersection of two 2D lines, each defined by two points.
    /// Line 1: p1 -> p2, Line 2: p3 -> p4.
    /// Returns intersection point. If lines are parallel, returns midpoint of p2 and p4.
    /// </summary>
    private static Point2D LineIntersection2D(Point2D p1, Point2D p2, Point2D p3, Point2D p4)
    {
        double d1y = p2.Y - p1.Y;
        double d1z = p2.Z - p1.Z;
        double d2y = p4.Y - p3.Y;
        double d2z = p4.Z - p3.Z;

        double denom = d1y * d2z - d1z * d2y;
        if (Math.Abs(denom) < 1e-12)
        {
            // Parallel lines - return midpoint (degenerate case)
            return new Point2D((p2.Y + p4.Y) / 2.0, (p2.Z + p4.Z) / 2.0);
        }

        double t = ((p3.Y - p1.Y) * d2z - (p3.Z - p1.Z) * d2y) / denom;
        return new Point2D(p1.Y + t * d1y, p1.Z + t * d1z);
    }

    /// <summary>
    /// Find where the steering axis (line from LBJ to UBJ) intersects the ground plane (Z=0).
    /// </summary>
    private static Point3D SteeringAxisGroundIntercept(SuspensionDesign design)
    {
        var lbj = design.LowerBallJoint;
        var ubj = design.UpperBallJoint;
        var axis = ubj - lbj;

        if (Math.Abs(axis.Z) < 1e-12)
        {
            // Steering axis is horizontal - no ground intercept, return LBJ projection
            return new Point3D(lbj.X, lbj.Y, 0);
        }

        double t = -lbj.Z / axis.Z;
        return new Point3D(
            lbj.X + t * axis.X,
            lbj.Y + t * axis.Y,
            0);
    }

    /// <summary>Simple 2D point for Y-Z plane projections.</summary>
    private readonly record struct Point2D(double Y, double Z);
}
