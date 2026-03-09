using SuspensionDesigner.Core.Entities;

namespace SuspensionDesigner.Application.Calculations.DoubleWishbone;

/// <summary>
/// Ackermann steering geometry analysis.
/// Reference: Gillespie "Fundamentals of Vehicle Dynamics", Chapter 6.
///
/// Ideal Ackermann condition: cot(delta_o) - cot(delta_i) = t / L
/// where:
///   delta_o = outer wheel steering angle
///   delta_i = inner wheel steering angle
///   t = track width
///   L = wheelbase
///
/// Ackermann percentage compares actual toe-out to ideal Ackermann toe-out
/// at various steering angles.
/// </summary>
public static class SteeringCalculator
{
    /// <summary>
    /// Calculate Ackermann percentage at various steering angles (1-30 degrees).
    ///
    /// For a given inner wheel angle delta_i:
    /// - Ideal outer angle: cot(delta_o_ideal) = cot(delta_i) - t/L
    /// - Actual outer angle comes from the steering geometry (tie rod and arm layout)
    /// - Ackermann% = (actual_toe_out / ideal_toe_out) * 100
    ///
    /// where toe_out = delta_i - delta_o (positive when inner turns more than outer)
    ///
    /// 100% = perfect Ackermann, 0% = parallel steer, negative = anti-Ackermann
    /// </summary>
    public static SteeringResult Calculate(SuspensionDesign design)
    {
        double trackWidth = design.TrackWidth;
        double wheelbase = design.Wheelbase;

        if (trackWidth < 1e-6 || wheelbase < 1e-6)
            return new SteeringResult(Array.Empty<AckermannPoint>());

        double tOverL = trackWidth / wheelbase;

        // Calculate the Ackermann arm geometry from tie rod points
        // The steering arm length and angle determine how much Ackermann effect exists
        double steeringArmLength = Math.Sqrt(
            Math.Pow(design.TieRodOuter.X - design.LowerBallJoint.X, 2) +
            Math.Pow(design.TieRodOuter.Y - design.LowerBallJoint.Y, 2));

        // Angle of steering arm relative to lateral axis (Y) in plan view
        double steeringArmAngle = Math.Atan2(
            design.TieRodOuter.X - design.LowerBallJoint.X,
            Math.Abs(design.TieRodOuter.Y - design.LowerBallJoint.Y));

        // Tie rod effective length in plan view
        double tieRodLength = Math.Sqrt(
            Math.Pow(design.TieRodOuter.X - design.TieRodInner.X, 2) +
            Math.Pow(design.TieRodOuter.Y - design.TieRodInner.Y, 2));

        var results = new List<AckermannPoint>();

        for (double innerAngleDeg = 1; innerAngleDeg <= 30; innerAngleDeg += 1)
        {
            double innerAngleRad = innerAngleDeg * Math.PI / 180.0;

            // Ideal outer angle from Ackermann geometry
            double cotInner = 1.0 / Math.Tan(innerAngleRad);
            double cotOuterIdeal = cotInner - tOverL;

            if (cotOuterIdeal <= 0)
            {
                // At very tight turning, ideal outer angle approaches 90 degrees
                results.Add(new AckermannPoint(innerAngleDeg, 100.0));
                continue;
            }

            double outerAngleIdeal = Math.Atan(1.0 / cotOuterIdeal);
            double idealToeOut = innerAngleRad - outerAngleIdeal;

            // Calculate actual outer angle from steering geometry
            // When the inner wheel turns by delta_i, the steering arm rotates,
            // pulling/pushing the tie rod, which rotates the outer wheel.
            double actualOuterAngle = CalculateActualOuterAngle(
                innerAngleRad, steeringArmLength, steeringArmAngle,
                tieRodLength, trackWidth);

            double actualToeOut = innerAngleRad - actualOuterAngle;

            double ackermannPercent = Math.Abs(idealToeOut) > 1e-10
                ? (actualToeOut / idealToeOut) * 100.0
                : 100.0;

            results.Add(new AckermannPoint(innerAngleDeg, ackermannPercent));
        }

        return new SteeringResult(results);
    }

    /// <summary>
    /// Calculate the actual outer wheel angle given inner wheel rotation.
    /// Uses the four-bar linkage model: rack, two steering arms, and the track width.
    /// </summary>
    private static double CalculateActualOuterAngle(
        double innerAngleRad, double armLength, double armAngle,
        double tieRodLength, double trackWidth)
    {
        // Inner side: steering arm rotates by innerAngleRad
        // The tie rod end point moves, changing the rack displacement
        double innerArmTipX = armLength * Math.Sin(armAngle + innerAngleRad);
        double innerArmTipY = armLength * Math.Cos(armAngle + innerAngleRad);

        double staticArmTipX = armLength * Math.Sin(armAngle);
        double staticArmTipY = armLength * Math.Cos(armAngle);

        // Rack displacement (assuming rack is approximately lateral)
        double rackDisplacement = innerArmTipX - staticArmTipX;

        // Outer side: same rack displacement but opposite direction
        // The outer steering arm is mirrored, so the rack pulls it in the opposite sense
        // Solve for outer arm angle that produces the same rack displacement
        // outerArmTipX = armLength * sin(armAngle - outerAngle)
        // rackDisplacement = outerArmTipX - staticArmTipX (but mirrored)
        double targetX = staticArmTipX - rackDisplacement;

        double sinOuter = targetX / armLength;
        sinOuter = Math.Clamp(sinOuter, -1.0, 1.0);
        double outerAngle = Math.Asin(sinOuter) - armAngle;

        return Math.Abs(outerAngle);
    }
}
