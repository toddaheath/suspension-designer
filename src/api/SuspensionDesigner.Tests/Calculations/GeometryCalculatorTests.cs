using FluentAssertions;
using SuspensionDesigner.Application.Calculations.DoubleWishbone;
using SuspensionDesigner.Core.Entities;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Tests.Calculations;

public class GeometryCalculatorTests
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
    public void Calculate_WithFSAEGeometry_ReturnsValidGeometryResult()
    {
        var design = CreateFSAEDesign();
        var result = GeometryCalculator.Calculate(design);

        result.Should().NotBeNull();
        result.InstantCenter.Y.Should().NotBe(0, "IC should not be at centerline for asymmetric geometry");
    }

    [Fact]
    public void RollCenterHeight_ShouldBeInReasonableRange()
    {
        var design = CreateFSAEDesign();
        var rcHeight = GeometryCalculator.CalculateRollCenterHeight(design);

        rcHeight.Should().BeInRange(-50, 250, "FSAE roll center height should be near ground level");
    }

    [Fact]
    public void KPI_ShouldBePositiveAndInRange()
    {
        var design = CreateFSAEDesign();
        var kpi = GeometryCalculator.CalculateKPI(design);

        kpi.Degrees.Should().BeInRange(0, 25, "KPI should be 0-25 degrees for typical geometry");
    }

    [Fact]
    public void CasterAngle_ShouldBeInRange()
    {
        var design = CreateFSAEDesign();
        var caster = GeometryCalculator.CalculateCasterAngle(design);

        caster.Degrees.Should().BeInRange(-10, 20, "Caster angle should be reasonable");
    }

    [Fact]
    public void ScrubRadius_ShouldBeFinite()
    {
        var design = CreateFSAEDesign();
        var scrub = GeometryCalculator.CalculateScrubRadius(design);

        double.IsFinite(scrub).Should().BeTrue("Scrub radius must be a finite number");
    }

    [Fact]
    public void MechanicalTrail_ShouldBeFinite()
    {
        var design = CreateFSAEDesign();
        var trail = GeometryCalculator.CalculateMechanicalTrail(design);

        double.IsFinite(trail).Should().BeTrue("Mechanical trail must be a finite number");
    }
}
