using FluentValidation;
using SuspensionDesigner.Application.Handlers;

namespace SuspensionDesigner.Application.Validators;

public class UpdateDesignCommandValidator : AbstractValidator<UpdateDesignCommand>
{
    public UpdateDesignCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Design ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Design name is required")
            .MaximumLength(200).WithMessage("Design name must not exceed 200 characters");

        RuleFor(x => x.TrackWidth)
            .GreaterThan(0).WithMessage("Track width must be positive");

        RuleFor(x => x.Wheelbase)
            .GreaterThan(0).WithMessage("Wheelbase must be positive");

        RuleFor(x => x.SprungMass)
            .GreaterThan(0).WithMessage("Sprung mass must be positive");

        RuleFor(x => x.UnsprungMass)
            .GreaterThan(0).WithMessage("Unsprung mass must be positive");

        RuleFor(x => x.SpringRate)
            .GreaterThan(0).WithMessage("Spring rate must be positive");

        RuleFor(x => x.DampingCoefficient)
            .GreaterThanOrEqualTo(0).WithMessage("Damping coefficient must be non-negative");

        RuleFor(x => x.TireRadius)
            .GreaterThan(0).WithMessage("Tire radius must be positive");

        RuleFor(x => x.FrontBrakeProportion)
            .InclusiveBetween(0.0, 1.0).WithMessage("Front brake proportion must be between 0 and 1");
    }
}
