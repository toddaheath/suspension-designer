using FluentAssertions;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Tests.Calculations;

public class SteeringCalculatorTests
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
    public void Calculate_WithFSAEGeometry_ReturnsValidResult()
    {
        var design = CreateFSAEDesign();
        var result = SteeringCalculator.Calculate(design);

        result.Should().NotBeNull();
        result.AckermannCurve.Should().NotBeEmpty();
    }

    [Fact]
    public void AckermannCurve_ShouldReturn30Points()
    {
        var design = CreateFSAEDesign();
        var result = SteeringCalculator.Calculate(design);

        // Inner angle from 1 to 30 in steps of 1 = 30 points
        result.AckermannCurve.Should().HaveCount(30);
    }

    [Fact]
    public void AckermannCurve_SteeringAnglesShouldSpan1To30Degrees()
    {
        var design = CreateFSAEDesign();
        var result = SteeringCalculator.Calculate(design);

        result.AckermannCurve.First().SteeringAngleDegrees.Should().Be(1);
        result.AckermannCurve.Last().SteeringAngleDegrees.Should().Be(30);
    }

    [Fact]
    public void AckermannPercent_ShouldBeFiniteForAllPoints()
    {
        var design = CreateFSAEDesign();
        var result = SteeringCalculator.Calculate(design);

        foreach (var point in result.AckermannCurve)
        {
            double.IsFinite(point.AckermannPercent).Should().BeTrue(
                $"Ackermann% at {point.SteeringAngleDegrees} degrees must be finite");
        }
    }

    [Fact]
    public void Calculate_WithZeroTrackWidth_ShouldReturnEmptyCurve()
    {
        var design = CreateFSAEDesign();
        design.TrackWidth = 0;

        var result = SteeringCalculator.Calculate(design);

        result.AckermannCurve.Should().BeEmpty(
            "Zero track width is degenerate and should produce no results");
    }

    [Fact]
    public void Calculate_WithZeroWheelbase_ShouldReturnEmptyCurve()
    {
        var design = CreateFSAEDesign();
        design.Wheelbase = 0;

        var result = SteeringCalculator.Calculate(design);

        result.AckermannCurve.Should().BeEmpty(
            "Zero wheelbase is degenerate and should produce no results");
    }
}
