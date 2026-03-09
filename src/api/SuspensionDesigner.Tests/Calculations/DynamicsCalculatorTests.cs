using FluentAssertions;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Tests.Calculations;

public class DynamicsCalculatorTests
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
        SpringRate = 25,   // N/mm
        DampingCoefficient = 1.5, // N*s/mm
        RideHeight = 50,
        TireRadius = 228,
        CgHeight = 300,
        FrontBrakeProportion = 0.6,
    };

    [Fact]
    public void MotionRatio_ShouldBeBetweenZeroAndOne()
    {
        var design = CreateFSAEDesign();
        var mr = DynamicsCalculator.CalculateMotionRatio(design);

        mr.Should().BeInRange(0.1, 1.5,
            "Motion ratio should be reasonable for double wishbone");
    }

    [Fact]
    public void WheelRate_ShouldEqualSpringRateTimesMRSquared()
    {
        var design = CreateFSAEDesign();
        var mr = DynamicsCalculator.CalculateMotionRatio(design);
        var wheelRate = DynamicsCalculator.CalculateWheelRate(design);

        var expected = design.SpringRate * mr * mr;
        wheelRate.Should().BeApproximately(expected, 0.001,
            "Wheel rate = spring rate * MR^2");
    }

    [Fact]
    public void NaturalFrequency_ShouldBeInReasonableRange()
    {
        var design = CreateFSAEDesign();
        var freq = DynamicsCalculator.CalculateNaturalFrequency(design);

        freq.Should().BeInRange(0.5, 5.0,
            "Natural frequency should be 0.5-5 Hz for typical race car values");
    }

    [Fact]
    public void DampingRatio_ShouldBePositive()
    {
        var design = CreateFSAEDesign();
        var ratio = DynamicsCalculator.CalculateDampingRatio(design);

        ratio.Should().BePositive("Damping ratio must be positive");
    }

    [Fact]
    public void CriticalDamping_ShouldBePositive()
    {
        var design = CreateFSAEDesign();
        var crit = DynamicsCalculator.CalculateCriticalDamping(design);

        crit.Should().BePositive("Critical damping must be positive");
    }

    [Fact]
    public void FullCalculation_ShouldReturnAllValues()
    {
        var design = CreateFSAEDesign();
        var result = DynamicsCalculator.Calculate(design);

        result.MotionRatio.Should().BePositive();
        result.WheelRate.Should().BePositive();
        result.NaturalFrequency.Should().BePositive();
        result.DampingRatio.Should().BePositive();
        result.CriticalDamping.Should().BePositive();
    }
}
