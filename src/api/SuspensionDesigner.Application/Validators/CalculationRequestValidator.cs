using FluentValidation;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;

namespace SuspensionDesigner.Application.Validators;

public class CalculateGeometryRequestValidator : AbstractValidator<CalculateGeometryRequest>
{
    public CalculateGeometryRequestValidator()
    {
        RuleFor(x => x.Design).SetValidator(new SuspensionDesignDtoValidator());
    }
}

public class CalculateCamberCurveRequestValidator : AbstractValidator<CalculateCamberCurveRequest>
{
    public CalculateCamberCurveRequestValidator()
    {
        RuleFor(x => x.Design).SetValidator(new SuspensionDesignDtoValidator());
    }
}

public class CalculateDynamicsRequestValidator : AbstractValidator<CalculateDynamicsRequest>
{
    public CalculateDynamicsRequestValidator()
    {
        RuleFor(x => x.Design).SetValidator(new SuspensionDesignDtoValidator());
    }
}

public class SuspensionDesignDtoValidator : AbstractValidator<SuspensionDesignDto>
{
    public SuspensionDesignDtoValidator()
    {
        RuleFor(x => x.TrackWidth)
            .GreaterThan(0).WithMessage("Track width must be positive");

        RuleFor(x => x.SprungMass)
            .GreaterThan(0).WithMessage("Sprung mass must be positive");

        RuleFor(x => x.UnsprungMass)
            .GreaterThan(0).WithMessage("Unsprung mass must be positive");

        RuleFor(x => x.SpringRate)
            .GreaterThan(0).WithMessage("Spring rate must be positive");

        RuleFor(x => x.TireRadius)
            .GreaterThan(0).WithMessage("Tire radius must be positive");

        // Sanity: ball joints must have Z > 0 (above ground)
        RuleFor(x => x.UpperBallJoint.Z)
            .GreaterThan(0).WithMessage("Upper ball joint must be above ground (Z > 0)");

        RuleFor(x => x.LowerBallJoint.Z)
            .GreaterThan(0).WithMessage("Lower ball joint must be above ground (Z > 0)");

        // Upper ball joint must be above lower
        RuleFor(x => x)
            .Must(x => x.UpperBallJoint.Z > x.LowerBallJoint.Z)
            .WithMessage("Upper ball joint must be above lower ball joint");
    }
}
