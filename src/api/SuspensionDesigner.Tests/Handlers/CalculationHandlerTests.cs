using FluentAssertions;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;

namespace SuspensionDesigner.Tests.Handlers;

public class CalculationHandlerTests
{
    private static SuspensionDesignDto CreateFSAEDto() => new()
    {
        UpperWishboneFrontPivot = new Point3DDto(100, 250, 300),
        UpperWishboneRearPivot = new Point3DDto(-100, 250, 300),
        UpperBallJoint = new Point3DDto(0, 600, 280),
        LowerWishboneFrontPivot = new Point3DDto(120, 200, 150),
        LowerWishboneRearPivot = new Point3DDto(-120, 200, 150),
        LowerBallJoint = new Point3DDto(0, 620, 130),
        TieRodInner = new Point3DDto(-80, 220, 160),
        TieRodOuter = new Point3DDto(-80, 610, 155),
        SpringDamperUpper = new Point3DDto(0, 350, 400),
        SpringDamperLower = new Point3DDto(0, 400, 150),
        PushrodWheelEnd = new Point3DDto(0, 500, 160),
        PushrodRockerEnd = new Point3DDto(0, 300, 380),
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
    public async Task GeometryHandler_ReturnsValidResult()
    {
        var handler = new CalculateGeometryHandler();
        var result = await handler.Handle(new CalculateGeometryRequest(CreateFSAEDto()), CancellationToken.None);

        result.Should().NotBeNull();
        result.RollCenterHeight.Should().BeInRange(-50, 250);
        result.KingpinInclinationDegrees.Should().BeInRange(0, 20);
    }

    [Fact]
    public async Task GeometryHandler_MapsInstantCenter()
    {
        var handler = new CalculateGeometryHandler();
        var result = await handler.Handle(new CalculateGeometryRequest(CreateFSAEDto()), CancellationToken.None);

        result.InstantCenter.Should().NotBe(new Point3DDto(0, 0, 0));
    }

    [Fact]
    public async Task DynamicsHandler_ReturnsValidResult()
    {
        var handler = new CalculateDynamicsHandler();
        var result = await handler.Handle(new CalculateDynamicsRequest(CreateFSAEDto()), CancellationToken.None);

        result.Should().NotBeNull();
        result.MotionRatio.Should().BeGreaterThan(0);
        result.WheelRate.Should().BeGreaterThan(0);
        result.NaturalFrequency.Should().BeGreaterThan(0);
        result.DampingRatio.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task BumpSteerHandler_ReturnsCurvePoints()
    {
        var handler = new CalculateBumpSteerHandler();
        var result = await handler.Handle(new CalculateBumpSteerRequest(CreateFSAEDto()), CancellationToken.None);

        result.Should().NotBeEmpty();
        result.Should().AllSatisfy(p =>
        {
            p.WheelTravel.Should().BeInRange(-50, 50);
            p.ToeAngleDegrees.Should().BeInRange(-5, 5);
        });
    }

    [Fact]
    public async Task RollCenterHandler_ReturnsMigrationPoints()
    {
        var handler = new CalculateRollCenterHandler();
        var result = await handler.Handle(new CalculateRollCenterRequest(CreateFSAEDto()), CancellationToken.None);

        result.Should().NotBeEmpty();
        result.Should().AllSatisfy(p =>
        {
            p.RollAngleDegrees.Should().BeInRange(-10, 10);
        });
    }

    [Fact]
    public async Task CamberCurveHandler_ReturnsCurvePoints()
    {
        var handler = new CalculateCamberCurveHandler();
        var result = await handler.Handle(new CalculateCamberCurveRequest(CreateFSAEDto()), CancellationToken.None);

        result.Should().NotBeEmpty();
        result.Should().AllSatisfy(p =>
        {
            p.WheelTravel.Should().BeInRange(-50, 50);
            p.CamberAngleDegrees.Should().BeInRange(-20, 20);
        });
    }

    [Fact]
    public async Task SteeringHandler_ReturnsAckermannCurve()
    {
        var handler = new CalculateSteeringHandler();
        var result = await handler.Handle(new CalculateSteeringRequest(CreateFSAEDto()), CancellationToken.None);

        result.Should().NotBeNull();
        result.AckermannCurve.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GeometryHandler_WithDifferentTrackWidth_ProducesResult()
    {
        var dto = CreateFSAEDto() with { TrackWidth = 1400 };
        var handler = new CalculateGeometryHandler();
        var result = await handler.Handle(new CalculateGeometryRequest(dto), CancellationToken.None);

        result.Should().NotBeNull();
        result.RollCenterHeight.Should().NotBe(0);
    }
}
