using FluentAssertions;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Tests.Calculations;

public class KinematicsCalculatorTests
{
    private static SuspensionDesign CreateFSAEDesign() => new()
    {
        UpperWishboneFrontPivot = new Point3D(100, 250, 300),
        UpperWishboneRearPivot = new Point3D(-100, 250, 300),
        UpperBallJoint = new Point3D(0, 600, 280),
        LowerWishboneFrontPivot = new Point3D(120, 200, 150),
        LowerWishboneRearPivot = new Point3D(-120, 200, 150),
        LowerBallJoint = new Point3D(0, 620, 130),
        TieRodInner = new Point3D(-80, 220, 160),
        TieRodOuter = new Point3D(-80, 610, 155),
        SpringDamperUpper = new Point3D(0, 350, 400),
        SpringDamperLower = new Point3D(0, 400, 150),
        TrackWidth = 1200,
        Wheelbase = 1550,
        SprungMass = 200,
        UnsprungMass = 25,
        SpringRate = 25,
        DampingCoefficient = 1.5,
        RideHeight = 50,
        TireRadius = 228,
        CgHeight = 300,
        FrontBrakeProportion = 0.6,
    };

    [Fact]
    public void CamberCurve_ShouldReturn21Points()
    {
        var design = CreateFSAEDesign();
        var curve = KinematicsCalculator.CalculateCamberCurve(design);

        // -50 to +50 in steps of 5 = 21 points
        curve.Should().HaveCount(21);
    }

    [Fact]
    public void CamberCurve_AtZeroTravel_ShouldBeNearZero()
    {
        var design = CreateFSAEDesign();
        var curve = KinematicsCalculator.CalculateCamberCurve(design);

        var zeroPoint = curve.First(p => Math.Abs(p.WheelTravel) < 1e-6);
        zeroPoint.CamberAngle.Degrees.Should().BeApproximately(0, 0.1,
            "Camber change at zero travel should be approximately zero");
    }

    [Fact]
    public void BumpSteerCurve_ShouldReturnPoints()
    {
        var design = CreateFSAEDesign();
        var curve = KinematicsCalculator.CalculateBumpSteerCurve(design);

        curve.Should().NotBeEmpty();
        curve.Count.Should().Be(21);
    }

    [Fact]
    public void RollCenterMigration_ShouldReturnPoints()
    {
        var design = CreateFSAEDesign();
        var curve = KinematicsCalculator.CalculateRollCenterMigration(design);

        curve.Should().NotBeEmpty();
        // 0 to 5 in steps of 0.5 = 11 points
        curve.Count.Should().Be(11);
    }

    [Fact]
    public void RollCenterMigration_AtZeroRoll_ShouldMatchStaticRC()
    {
        var design = CreateFSAEDesign();
        var curve = KinematicsCalculator.CalculateRollCenterMigration(design);
        var staticRC = GeometryCalculator.CalculateRollCenterHeight(design);

        var zeroRollPoint = curve.First(p => Math.Abs(p.RollAngleDegrees) < 1e-6);
        zeroRollPoint.RollCenterHeight.Should().BeApproximately(staticRC, 0.1,
            "RC at zero roll should match static calculation");
    }
}
