using MediatR;
using SuspensionDesigner.Application.DTOs;

namespace SuspensionDesigner.Application.Commands;

public record CreateDesignCommand : IRequest<SuspensionDesignDto>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int SuspensionType { get; init; }
    public int AxlePosition { get; init; }

    public Point3DDto UpperWishboneFrontPivot { get; init; } = new(0, 0, 0);
    public Point3DDto UpperWishboneRearPivot { get; init; } = new(0, 0, 0);
    public Point3DDto UpperBallJoint { get; init; } = new(0, 0, 0);
    public Point3DDto LowerWishboneFrontPivot { get; init; } = new(0, 0, 0);
    public Point3DDto LowerWishboneRearPivot { get; init; } = new(0, 0, 0);
    public Point3DDto LowerBallJoint { get; init; } = new(0, 0, 0);
    public Point3DDto TieRodInner { get; init; } = new(0, 0, 0);
    public Point3DDto TieRodOuter { get; init; } = new(0, 0, 0);
    public Point3DDto SpringDamperUpper { get; init; } = new(0, 0, 0);
    public Point3DDto SpringDamperLower { get; init; } = new(0, 0, 0);
    public Point3DDto PushrodWheelEnd { get; init; } = new(0, 0, 0);
    public Point3DDto PushrodRockerEnd { get; init; } = new(0, 0, 0);

    public double TrackWidth { get; init; }
    public double Wheelbase { get; init; }
    public double SprungMass { get; init; }
    public double UnsprungMass { get; init; }
    public double SpringRate { get; init; }
    public double DampingCoefficient { get; init; }
    public double RideHeight { get; init; }
    public double TireRadius { get; init; }
    public double CgHeight { get; init; }
    public double FrontBrakeProportion { get; init; } = 0.6;

    // Set by the pipeline, not by the user
    public string? UserId { get; init; }
}
