using FluentAssertions;
using FluentValidation.TestHelper;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;
using SuspensionDesigner.Application.Validators;

namespace SuspensionDesigner.Tests.Validators;

public class UpdateDesignCommandValidatorTests
{
    private readonly UpdateDesignCommandValidator _validator = new();

    private static UpdateDesignCommand CreateValidCommand() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Updated Front Suspension",
        UpperBallJoint = new Point3DDto(0, 600, 280),
        LowerBallJoint = new Point3DDto(0, 620, 130),
        TrackWidth = 1200,
        Wheelbase = 1550,
        SprungMass = 200,
        UnsprungMass = 25,
        SpringRate = 25,
        DampingCoefficient = 1.5,
        TireRadius = 228,
        FrontBrakeProportion = 0.6,
    };

    [Fact]
    public void ValidCommand_ShouldPassValidation()
    {
        var command = CreateValidCommand();
        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    // --- ID rules ---

    [Fact]
    public void EmptyId_ShouldFail()
    {
        var command = CreateValidCommand() with { Id = Guid.Empty };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Id)
            .WithErrorMessage("Design ID is required");
    }

    // --- Name rules ---

    [Fact]
    public void EmptyName_ShouldFail()
    {
        var command = CreateValidCommand() with { Name = string.Empty };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Design name is required");
    }

    [Fact]
    public void NameExceeding200Characters_ShouldFail()
    {
        var command = CreateValidCommand() with { Name = new string('A', 201) };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Design name must not exceed 200 characters");
    }

    [Fact]
    public void NameExactly200Characters_ShouldPass()
    {
        var command = CreateValidCommand() with { Name = new string('A', 200) };
        var result = _validator.TestValidate(command);

        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    // --- Positive numeric fields ---

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void TrackWidth_ZeroOrNegative_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { TrackWidth = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.TrackWidth)
            .WithErrorMessage("Track width must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-500)]
    public void Wheelbase_ZeroOrNegative_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { Wheelbase = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Wheelbase)
            .WithErrorMessage("Wheelbase must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void SprungMass_ZeroOrNegative_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { SprungMass = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.SprungMass)
            .WithErrorMessage("Sprung mass must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void UnsprungMass_ZeroOrNegative_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { UnsprungMass = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.UnsprungMass)
            .WithErrorMessage("Unsprung mass must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-25)]
    public void SpringRate_ZeroOrNegative_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { SpringRate = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.SpringRate)
            .WithErrorMessage("Spring rate must be positive");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-228)]
    public void TireRadius_ZeroOrNegative_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { TireRadius = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.TireRadius)
            .WithErrorMessage("Tire radius must be positive");
    }

    // --- Damping coefficient (non-negative) ---

    [Fact]
    public void DampingCoefficient_Zero_ShouldPass()
    {
        var command = CreateValidCommand() with { DampingCoefficient = 0 };
        var result = _validator.TestValidate(command);

        result.ShouldNotHaveValidationErrorFor(x => x.DampingCoefficient);
    }

    [Fact]
    public void DampingCoefficient_Negative_ShouldFail()
    {
        var command = CreateValidCommand() with { DampingCoefficient = -0.5 };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.DampingCoefficient)
            .WithErrorMessage("Damping coefficient must be non-negative");
    }

    // --- Front brake proportion (0 to 1 inclusive) ---

    [Theory]
    [InlineData(0.0)]
    [InlineData(0.5)]
    [InlineData(1.0)]
    public void FrontBrakeProportion_InRange_ShouldPass(double value)
    {
        var command = CreateValidCommand() with { FrontBrakeProportion = value };
        var result = _validator.TestValidate(command);

        result.ShouldNotHaveValidationErrorFor(x => x.FrontBrakeProportion);
    }

    [Theory]
    [InlineData(-0.1)]
    [InlineData(1.1)]
    [InlineData(2.0)]
    public void FrontBrakeProportion_OutOfRange_ShouldFail(double value)
    {
        var command = CreateValidCommand() with { FrontBrakeProportion = value };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.FrontBrakeProportion)
            .WithErrorMessage("Front brake proportion must be between 0 and 1");
    }

    // --- Multiple errors at once ---

    [Fact]
    public void MultipleInvalidFields_ShouldReportAllErrors()
    {
        var command = CreateValidCommand() with
        {
            Id = Guid.Empty,
            Name = string.Empty,
            TrackWidth = -1,
            SpringRate = 0,
        };
        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Id);
        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.TrackWidth);
        result.ShouldHaveValidationErrorFor(x => x.SpringRate);
        result.Errors.Count.Should().BeGreaterThanOrEqualTo(4);
    }
}
