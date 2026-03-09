using FluentAssertions;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.Enums;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Tests.Calculations;

public class AntiGeometryCalculatorTests
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
        var result = AntiGeometryCalculator.Calculate(design);

        result.Should().NotBeNull();
        double.IsFinite(result.AntiDivePercent).Should().BeTrue("Anti-dive must be a finite number");
        double.IsFinite(result.AntiSquatPercent).Should().BeTrue("Anti-squat must be a finite number");
    }

    /// <summary>
    /// Creates a design where the wishbone pivot axes have non-zero Y-span so
    /// the side-view projection produces a meaningful instant center with a clear
    /// X-offset, giving realistic anti-dive and anti-squat percentages.
    /// The front pivots are placed forward (positive X) and the rear pivots rearward
    /// (negative X) at different Y stations on the chassis, with a height difference
    /// to create inclined side-view arms.
    /// </summary>
    private static SuspensionDesign CreateAntiGeometryDesign()
    {
        var design = CreateFSAEDesign();
        // Upper wishbone: front pivot forward+high, rear pivot rearward+low, at different Y
        design.UpperWishboneFrontPivot = new Point3D(150, 200, 310);
        design.UpperWishboneRearPivot = new Point3D(-150, 300, 290);
        // Lower wishbone: same approach
        design.LowerWishboneFrontPivot = new Point3D(170, 150, 160);
        design.LowerWishboneRearPivot = new Point3D(-170, 250, 140);
        return design;
    }

    [Fact]
    public void AntiDive_WithRakedGeometry_ShouldBeInReasonableRange()
    {
        var design = CreateAntiGeometryDesign();
        var antiDive = AntiGeometryCalculator.CalculateAntiDive(design);

        antiDive.Should().BeInRange(-300, 300,
            "Anti-dive percentage should be within a reasonable engineering range for raked geometry");
    }

    [Fact]
    public void AntiSquat_WithRakedGeometry_ShouldBeInReasonableRange()
    {
        var design = CreateAntiGeometryDesign();
        var antiSquat = AntiGeometryCalculator.CalculateAntiSquat(design);

        antiSquat.Should().BeInRange(-300, 300,
            "Anti-squat percentage should be within a reasonable engineering range for raked geometry");
    }

    [Fact]
    public void AntiDive_WithZeroCgHeight_ShouldReturnZero()
    {
        var design = CreateFSAEDesign();
        design.CgHeight = 0;

        var antiDive = AntiGeometryCalculator.CalculateAntiDive(design);

        antiDive.Should().Be(0, "Anti-dive should be zero when CG height is zero");
    }

    [Fact]
    public void AntiDive_WithZeroFrontBrakeProportion_ShouldReturnZero()
    {
        var design = CreateFSAEDesign();
        design.FrontBrakeProportion = 0;

        var antiDive = AntiGeometryCalculator.CalculateAntiDive(design);

        antiDive.Should().Be(0, "Anti-dive should be zero when front brake proportion is zero");
    }

    [Fact]
    public void AntiSquat_ForRearAxle_ShouldReturnFiniteValue()
    {
        var design = CreateFSAEDesign();
        design.AxlePosition = AxlePosition.Rear;

        var antiSquat = AntiGeometryCalculator.CalculateAntiSquat(design);

        double.IsFinite(antiSquat).Should().BeTrue("Anti-squat for rear axle must be a finite number");
    }
}
