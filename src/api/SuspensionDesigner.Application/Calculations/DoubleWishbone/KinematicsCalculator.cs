using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

/// <summary>
/// Kinematic calculations for double-wishbone suspension.
/// Computes camber curves, bump steer, and roll center migration
/// by displacing wheel through travel range and solving geometry at each step.
///
/// Reference: Milliken & Milliken "Race Car Vehicle Dynamics", Chapter 17.
/// </summary>
public static class KinematicsCalculator
{
    /// <summary>
    /// Calculate camber angle change vs vertical wheel travel.
    /// Range: -50mm to +50mm in 5mm steps (negative = bump, positive = droop).
    ///
    /// At each travel step, the outboard ball joints trace circular arcs around
    /// their respective wishbone pivot axes. We approximate the new ball joint
    /// positions by rotating each around the pivot axis by the angle that
    /// produces the requested vertical displacement.
    /// </summary>
    public static IReadOnlyList<CamberCurvePoint> CalculateCamberCurve(SuspensionDesign design)
    {
        var results = new List<CamberCurvePoint>();
        double staticCamber = CalculateCamberAngle(design.UpperBallJoint, design.LowerBallJoint);

        for (double travel = -50; travel <= 50; travel += 5)
        {
            var (newUbj, newLbj) = DisplaceWheelVertically(design, travel);
            double camber = CalculateCamberAngle(newUbj, newLbj);
            double camberChange = camber - staticCamber;
            results.Add(new CamberCurvePoint(travel, Angle.FromDegrees(camberChange)));
        }

        return results;
    }

    /// <summary>
    /// Calculate bump steer (toe angle change) vs vertical wheel travel.
    /// This occurs when the tie rod and wishbone arcs don't match,
    /// causing the upright to rotate about the steering axis during travel.
    /// </summary>
    public static IReadOnlyList<BumpSteerPoint> CalculateBumpSteerCurve(SuspensionDesign design)
    {
        var results = new List<BumpSteerPoint>();
        double staticToe = CalculateToeAngle(design);

        for (double travel = -50; travel <= 50; travel += 5)
        {
            double toe = CalculateToeAtTravel(design, travel);
            double toeChange = toe - staticToe;
            results.Add(new BumpSteerPoint(travel, Angle.FromDegrees(toeChange)));
        }

        return results;
    }

    /// <summary>
    /// Roll center height vs roll angle (0 to 5 degrees in 0.5 degree steps).
    /// As the body rolls, the instant center and contact patch move, changing RC height.
    /// </summary>
    public static IReadOnlyList<RollCenterMigrationPoint> CalculateRollCenterMigration(SuspensionDesign design)
    {
        var results = new List<RollCenterMigrationPoint>();

        for (double rollDeg = 0; rollDeg <= 5.0; rollDeg += 0.5)
        {
            double rollRad = rollDeg * Math.PI / 180.0;
            double rcHeight = CalculateRollCenterAtRollAngle(design, rollRad);
            results.Add(new RollCenterMigrationPoint(rollDeg, rcHeight));
        }

        return results;
    }

    /// <summary>
    /// Full kinematics calculation.
    /// </summary>
    public static KinematicsResult Calculate(SuspensionDesign design)
    {
        return new KinematicsResult(
            CalculateCamberCurve(design),
            CalculateBumpSteerCurve(design),
            CalculateRollCenterMigration(design));
    }

    // --- Private helpers ---

    /// <summary>
    /// Camber angle from ball joint positions: angle of the upright (UBJ to LBJ)
    /// from vertical, projected into the front (Y-Z) plane.
    /// </summary>
    private static double CalculateCamberAngle(Point3D ubj, Point3D lbj)
    {
        double dy = ubj.Y - lbj.Y;
        double dz = ubj.Z - lbj.Z;
        // Camber angle from vertical. Negative = top tilted inward (typical)
        return Math.Atan2(dy, dz) * 180.0 / Math.PI;
    }

    /// <summary>
    /// Displace the wheel vertically by rotating each ball joint around its
    /// respective wishbone pivot axis. The pivot axis is defined by the two
    /// inboard pivot points. The ball joint traces a circular arc around this axis.
    /// </summary>
    private static (Point3D newUbj, Point3D newLbj) DisplaceWheelVertically(
        SuspensionDesign design, double verticalTravel)
    {
        if (Math.Abs(verticalTravel) < 1e-12)
            return (design.UpperBallJoint, design.LowerBallJoint);

        // For the lower wishbone: rotate LBJ around lower pivot axis
        var lowerAxis = (design.LowerWishboneRearPivot - design.LowerWishboneFrontPivot).Normalize();
        var lowerPivotPoint = design.LowerWishboneFrontPivot;
        double lowerArmLength = ArmLengthFromAxis(
            design.LowerBallJoint, lowerPivotPoint, lowerAxis);

        // Approximate rotation angle for desired vertical displacement
        // dZ = R * sin(theta) for small angles, theta = asin(dZ / R)
        double lowerAngle = Math.Abs(lowerArmLength) > 1e-6
            ? Math.Asin(Math.Clamp(verticalTravel / lowerArmLength, -0.99, 0.99))
            : 0;

        var newLbj = RotatePointAroundAxis(
            design.LowerBallJoint, lowerPivotPoint, lowerAxis, lowerAngle);

        // For the upper wishbone: need to find the angle that places UBJ
        // consistent with the rigid upright constraint.
        // Approximate: use the same vertical displacement scaled by upper arm geometry.
        var upperAxis = (design.UpperWishboneRearPivot - design.UpperWishboneFrontPivot).Normalize();
        var upperPivotPoint = design.UpperWishboneFrontPivot;
        double upperArmLength = ArmLengthFromAxis(
            design.UpperBallJoint, upperPivotPoint, upperAxis);

        // The upright length constrains the UBJ position. For the approximation,
        // compute how much the UBJ must rise given the LBJ rise and upright length.
        double uprightLength = design.UpperBallJoint.DistanceTo(design.LowerBallJoint);
        double lbjDz = newLbj.Z - design.LowerBallJoint.Z;

        // Simple geometric estimate: UBJ vertical travel differs from LBJ
        // based on the ratio of arm lengths and swing geometry
        double ubjVerticalTravel = lbjDz * (upperArmLength / Math.Max(lowerArmLength, 1e-6));

        double upperAngle = Math.Abs(upperArmLength) > 1e-6
            ? Math.Asin(Math.Clamp(ubjVerticalTravel / upperArmLength, -0.99, 0.99))
            : 0;

        var newUbj = RotatePointAroundAxis(
            design.UpperBallJoint, upperPivotPoint, upperAxis, upperAngle);

        return (newUbj, newLbj);
    }

    /// <summary>
    /// Calculate the effective arm length (perpendicular distance from the ball joint
    /// to the pivot axis), which is the radius of the arc the ball joint traces.
    /// </summary>
    private static double ArmLengthFromAxis(Point3D point, Point3D axisOrigin, Point3D axisDir)
    {
        var v = point - axisOrigin;
        double projection = Point3D.Dot(v, axisDir);
        var perpendicular = v - axisDir * projection;
        return perpendicular.Magnitude;
    }

    /// <summary>
    /// Rotate a point around an axis (defined by origin + direction) by the given angle.
    /// Uses Rodrigues' rotation formula.
    /// </summary>
    private static Point3D RotatePointAroundAxis(
        Point3D point, Point3D axisOrigin, Point3D axisDir, double angleRad)
    {
        var v = point - axisOrigin;
        var k = axisDir.Normalize();
        double cosA = Math.Cos(angleRad);
        double sinA = Math.Sin(angleRad);

        // Rodrigues: v_rot = v*cos(a) + (k x v)*sin(a) + k*(k.v)*(1-cos(a))
        var cross = Point3D.Cross(k, v);
        double dot = Point3D.Dot(k, v);

        var rotated = v * cosA + cross * sinA + k * (dot * (1.0 - cosA));
        return axisOrigin + rotated;
    }

    /// <summary>
    /// Calculate toe angle at a given vertical travel by finding the new tie rod
    /// outer point position and computing the steering angle change.
    /// </summary>
    private static double CalculateToeAngle(SuspensionDesign design)
    {
        // Toe angle: angle of the tie rod outer point relative to the upright
        // in the top (X-Y) view
        var steeringArm = design.TieRodOuter - design.LowerBallJoint;
        return Math.Atan2(steeringArm.X, Math.Abs(steeringArm.Y)) * 180.0 / Math.PI;
    }

    private static double CalculateToeAtTravel(SuspensionDesign design, double travel)
    {
        if (Math.Abs(travel) < 1e-12)
            return CalculateToeAngle(design);

        var (newUbj, newLbj) = DisplaceWheelVertically(design, travel);

        // The tie rod inner point is fixed on the chassis.
        // The tie rod outer point moves with the upright.
        // Find where the tie rod outer point ends up given the upright rotation.
        double tieRodLength = design.TieRodOuter.DistanceTo(design.TieRodInner);

        // The tie rod outer point is fixed relative to the upright.
        // Compute the upright rotation from static to displaced.
        var staticUpright = design.UpperBallJoint - design.LowerBallJoint;
        var newUpright = newUbj - newLbj;

        // Apply the same rotation to the tie rod outer point
        var tieRodOffset = design.TieRodOuter - design.LowerBallJoint;
        var rotatedOffset = RotateVector(tieRodOffset, staticUpright, newUpright);
        var newTieRodOuter = newLbj + rotatedOffset;

        // Now check if the tie rod length constraint is satisfied
        // The actual tie rod outer position is constrained to be at tieRodLength from inner
        var toOuter = newTieRodOuter - design.TieRodInner;
        double actualDist = toOuter.Magnitude;
        if (actualDist > 1e-6)
        {
            // Adjust to maintain tie rod length (this is the bump steer effect)
            newTieRodOuter = design.TieRodInner + toOuter * (tieRodLength / actualDist);
        }

        var steeringArm = newTieRodOuter - newLbj;
        return Math.Atan2(steeringArm.X, Math.Abs(steeringArm.Y)) * 180.0 / Math.PI;
    }

    /// <summary>
    /// Rotate a vector from one orientation to another (from fromDir to toDir).
    /// </summary>
    private static Point3D RotateVector(Point3D vec, Point3D fromDir, Point3D toDir)
    {
        var from = fromDir.Normalize();
        var to = toDir.Normalize();

        var cross = Point3D.Cross(from, to);
        double dot = Point3D.Dot(from, to);
        double sinAngle = cross.Magnitude;

        if (sinAngle < 1e-12)
            return vec; // No rotation needed

        var axis = cross.Normalize();
        double angle = Math.Atan2(sinAngle, dot);

        return RotatePointAroundAxis(vec, Point3D.Zero, axis, angle);
    }

    /// <summary>
    /// Calculate roll center height at a given body roll angle.
    /// Roll rotates the chassis pickup points around the roll axis (X axis at ground level).
    /// </summary>
    private static double CalculateRollCenterAtRollAngle(SuspensionDesign design, double rollRad)
    {
        if (Math.Abs(rollRad) < 1e-12)
            return GeometryCalculator.CalculateRollCenterHeight(design);

        // Create a rolled version of the design by rotating chassis points around X axis
        var rolled = CloneDesignWithRoll(design, rollRad);
        return GeometryCalculator.CalculateRollCenterHeight(rolled);
    }

    /// <summary>
    /// Clone design with chassis pivot points rotated about the X axis (roll axis)
    /// at ground level. This simulates body roll.
    /// </summary>
    private static SuspensionDesign CloneDesignWithRoll(SuspensionDesign design, double rollRad)
    {
        var rollAxis = new Point3D(1, 0, 0).Normalize();
        var rollOrigin = new Point3D(0, 0, 0); // Roll about ground-level X axis

        return new SuspensionDesign
        {
            TrackWidth = design.TrackWidth,
            Wheelbase = design.Wheelbase,
            TireRadius = design.TireRadius,
            // Chassis (inboard) points are rotated with body roll
            UpperWishboneFrontPivot = RotatePointAroundAxis(design.UpperWishboneFrontPivot, rollOrigin, rollAxis, rollRad),
            UpperWishboneRearPivot = RotatePointAroundAxis(design.UpperWishboneRearPivot, rollOrigin, rollAxis, rollRad),
            LowerWishboneFrontPivot = RotatePointAroundAxis(design.LowerWishboneFrontPivot, rollOrigin, rollAxis, rollRad),
            LowerWishboneRearPivot = RotatePointAroundAxis(design.LowerWishboneRearPivot, rollOrigin, rollAxis, rollRad),
            // Ball joints move with the wheel - approximate by keeping them static
            // (in reality they'd move based on the new arm geometry, but for RC migration
            // this first-order approximation captures the trend)
            UpperBallJoint = design.UpperBallJoint,
            LowerBallJoint = design.LowerBallJoint,
            TieRodInner = RotatePointAroundAxis(design.TieRodInner, rollOrigin, rollAxis, rollRad),
            TieRodOuter = design.TieRodOuter,
        };
    }
}
