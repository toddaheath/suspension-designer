using SuspensionDesigner.Core.Enums;
using SuspensionDesigner.Core.ValueObjects;

namespace SuspensionDesigner.Core.Entities;

/// <summary>
/// Aggregate root representing a complete suspension design.
/// Contains 12 hardpoints (3D) defining double-wishbone geometry
/// plus vehicle parameters needed for dynamics calculations.
///
/// SAE coordinate system: X forward, Y left, Z up.
/// All linear dimensions in millimeters, masses in kg, rates in N/mm, damping in N*s/mm.
/// </summary>
public class SuspensionDesign
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public SuspensionType SuspensionType { get; set; } = SuspensionType.DoubleWishbone;
    public AxlePosition AxlePosition { get; set; } = AxlePosition.Front;

    // --- 12 Hardpoints (all in mm, SAE coords) ---
    // Upper wishbone
    public Point3D UpperWishboneFrontPivot { get; set; }
    public Point3D UpperWishboneRearPivot { get; set; }
    public Point3D UpperBallJoint { get; set; }

    // Lower wishbone
    public Point3D LowerWishboneFrontPivot { get; set; }
    public Point3D LowerWishboneRearPivot { get; set; }
    public Point3D LowerBallJoint { get; set; }

    // Tie rod (steering)
    public Point3D TieRodInner { get; set; }
    public Point3D TieRodOuter { get; set; }

    // Spring/damper
    public Point3D SpringDamperUpper { get; set; }
    public Point3D SpringDamperLower { get; set; }

    // Pushrod/pullrod (if applicable)
    public Point3D PushrodWheelEnd { get; set; }
    public Point3D PushrodRockerEnd { get; set; }

    // --- Vehicle Parameters ---
    public double TrackWidth { get; set; }       // mm
    public double Wheelbase { get; set; }        // mm
    public double SprungMass { get; set; }       // kg (total)
    public double UnsprungMass { get; set; }     // kg (per corner)
    public double SpringRate { get; set; }       // N/mm
    public double DampingCoefficient { get; set; } // N*s/mm
    public double RideHeight { get; set; }       // mm (static ride height at CG)
    public double TireRadius { get; set; }       // mm

    // Optional params for anti-geometry
    public double CgHeight { get; set; }         // mm
    public double FrontBrakeProportion { get; set; } = 0.6; // fraction (0-1)

    // Audit
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
