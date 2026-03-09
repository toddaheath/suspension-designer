using FluentAssertions;
using FluentValidation.TestHelper;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;
using SuspensionDesigner.Application.Validators;

namespace SuspensionDesigner.Tests.Validators;

public class CalculationRequestValidatorTests
{
    private readonly SuspensionDesignDtoValidator _validator = new();

    private static SuspensionDesignDto CreateValidDesignDto() => new()
    {
        Id = Guid.NewGuid(),
        Name = "FSAE 2024 Front",
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

    // --- Valid input ---

    [Fact]
    public void ValidDesignDto_ShouldPassValidation()
    {
        var dto = CreateValidDesignDto();
        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    // --- Positive numeric fields ---

    [Theory]
    [InlineData(0)]
    [InlineData(-1200)]
    public void TrackWidth_ZeroOrNegative_ShouldFail(double value)
    {
        var dto = CreateValidDesignDto() with { TrackWidth = value };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.TrackWidth)
            .WithErrorMessage("Track width must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-200)]
    public void SprungMass_ZeroOrNegative_ShouldFail(double value)
    {
        var dto = CreateValidDesignDto() with { SprungMass = value };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.SprungMass)
            .WithErrorMessage("Sprung mass must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-25)]
    public void UnsprungMass_ZeroOrNegative_ShouldFail(double value)
    {
        var dto = CreateValidDesignDto() with { UnsprungMass = value };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.UnsprungMass)
            .WithErrorMessage("Unsprung mass must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-25)]
    public void SpringRate_ZeroOrNegative_ShouldFail(double value)
    {
        var dto = CreateValidDesignDto() with { SpringRate = value };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.SpringRate)
            .WithErrorMessage("Spring rate must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-228)]
    public void TireRadius_ZeroOrNegative_ShouldFail(double value)
    {
        var dto = CreateValidDesignDto() with { TireRadius = value };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.TireRadius)
            .WithErrorMessage("Tire radius must be positive");
    }

    // --- Ball joint Z > 0 (above ground) ---

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(-100)]
    public void UpperBallJoint_AtOrBelowGround_ShouldFail(double z)
    {
        var dto = CreateValidDesignDto() with
        {
            UpperBallJoint = new Point3DDto(0, 600, z),
        };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor("UpperBallJoint.Z")
            .WithErrorMessage("Upper ball joint must be above ground (Z > 0)");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-50)]
    public void LowerBallJoint_AtOrBelowGround_ShouldFail(double z)
    {
        var dto = CreateValidDesignDto() with
        {
            LowerBallJoint = new Point3DDto(0, 620, z),
        };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor("LowerBallJoint.Z")
            .WithErrorMessage("Lower ball joint must be above ground (Z > 0)");
    }

    // --- Upper ball joint must be above lower ---

    [Fact]
    public void UpperBallJointBelowLower_ShouldFail()
    {
        var dto = CreateValidDesignDto() with
        {
            UpperBallJoint = new Point3DDto(0, 600, 100),
            LowerBallJoint = new Point3DDto(0, 620, 200),
        };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveAnyValidationError()
            .WithErrorMessage("Upper ball joint must be above lower ball joint");
    }

    [Fact]
    public void UpperBallJointSameHeightAsLower_ShouldFail()
    {
        var dto = CreateValidDesignDto() with
        {
            UpperBallJoint = new Point3DDto(0, 600, 200),
            LowerBallJoint = new Point3DDto(0, 620, 200),
        };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveAnyValidationError()
            .WithErrorMessage("Upper ball joint must be above lower ball joint");
    }

    [Fact]
    public void UpperBallJointAboveLower_ShouldPass()
    {
        var dto = CreateValidDesignDto() with
        {
            UpperBallJoint = new Point3DDto(0, 600, 280),
            LowerBallJoint = new Point3DDto(0, 620, 130),
        };
        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveValidationErrorFor("Upper ball joint must be above lower ball joint");
    }

    // --- Request-level validators delegate to SuspensionDesignDtoValidator ---

    [Fact]
    public void CalculateGeometryRequestValidator_ValidRequest_ShouldPass()
    {
        var validator = new CalculateGeometryRequestValidator();
        var request = new CalculateGeometryRequest(CreateValidDesignDto());
        var result = validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CalculateGeometryRequestValidator_InvalidDesign_ShouldFail()
    {
        var validator = new CalculateGeometryRequestValidator();
        var invalidDto = CreateValidDesignDto() with { TrackWidth = -1 };
        var request = new CalculateGeometryRequest(invalidDto);
        var result = validator.TestValidate(request);

        result.ShouldHaveAnyValidationError();
    }

    [Fact]
    public void CalculateCamberCurveRequestValidator_ValidRequest_ShouldPass()
    {
        var validator = new CalculateCamberCurveRequestValidator();
        var request = new CalculateCamberCurveRequest(CreateValidDesignDto());
        var result = validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CalculateCamberCurveRequestValidator_InvalidDesign_ShouldFail()
    {
        var validator = new CalculateCamberCurveRequestValidator();
        var invalidDto = CreateValidDesignDto() with
        {
            UpperBallJoint = new Point3DDto(0, 600, -10),
        };
        var request = new CalculateCamberCurveRequest(invalidDto);
        var result = validator.TestValidate(request);

        result.ShouldHaveAnyValidationError();
    }

    [Fact]
    public void CalculateDynamicsRequestValidator_ValidRequest_ShouldPass()
    {
        var validator = new CalculateDynamicsRequestValidator();
        var request = new CalculateDynamicsRequest(CreateValidDesignDto());
        var result = validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CalculateDynamicsRequestValidator_InvalidDesign_ShouldFail()
    {
        var validator = new CalculateDynamicsRequestValidator();
        var invalidDto = CreateValidDesignDto() with { SpringRate = 0 };
        var request = new CalculateDynamicsRequest(invalidDto);
        var result = validator.TestValidate(request);

        result.ShouldHaveAnyValidationError();
    }

    // --- Multiple errors at once ---

    [Fact]
    public void MultipleInvalidFields_ShouldReportAllErrors()
    {
        var dto = CreateValidDesignDto() with
        {
            TrackWidth = -1,
            SprungMass = 0,
            TireRadius = -5,
            UpperBallJoint = new Point3DDto(0, 600, -10),
        };
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.TrackWidth);
        result.ShouldHaveValidationErrorFor(x => x.SprungMass);
        result.ShouldHaveValidationErrorFor(x => x.TireRadius);
        result.ShouldHaveValidationErrorFor("UpperBallJoint.Z");
        result.Errors.Count.Should().BeGreaterThanOrEqualTo(4);
    }
}
