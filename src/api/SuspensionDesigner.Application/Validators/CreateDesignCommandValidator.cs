using FluentValidation;
using SuspensionDesigner.Application.Commands;

namespace SuspensionDesigner.Application.Validators;

public class CreateDesignCommandValidator : AbstractValidator<CreateDesignCommand>
{
    public CreateDesignCommandValidator()
    {
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

        // Ball joints must not coincide (would make geometry degenerate)
        RuleFor(x => x)
            .Must(x => PointsNotCoincident(x.UpperBallJoint, x.LowerBallJoint))
            .WithMessage("Upper and lower ball joints must not be at the same position");
    }

    private static bool PointsNotCoincident(DTOs.Point3DDto a, DTOs.Point3DDto b)
    {
        double dx = a.X - b.X, dy = a.Y - b.Y, dz = a.Z - b.Z;
        return dx * dx + dy * dy + dz * dz > 1e-6;
    }
}
