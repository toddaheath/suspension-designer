# Bump Steer Calculation

## Definition

**Bump steer** is the change in toe angle of a wheel as the suspension moves through its vertical travel (bump and rebound). It is an undesirable kinematic coupling between vertical wheel motion and steering, caused by the tie rod and steering rack geometry not following the same arc as the suspension control arms.

Bump steer is expressed as toe change per unit of vertical wheel travel, typically in degrees per millimeter (deg/mm) or degrees per 25 mm of travel.

## Physical Interpretation

Bump steer is almost always undesirable because it causes the vehicle to steer itself in response to road undulations, reducing straight-line stability and predictability. The goal is to minimize bump steer to near zero across the full range of wheel travel.

**Effects of bump steer**:
- **Toe-out in bump**: The wheel steers outward as it compresses. Can cause instability under braking (both wheels compress and toe out, widening the effective track).
- **Toe-in in bump**: The wheel steers inward as it compresses. More stable under braking but can cause understeer that increases unpredictably with road roughness.
- **Asymmetric bump steer**: Different toe change left vs right causes the vehicle to pull to one side over bumps.

### Design Goal

The ideal is **zero bump steer** across the full working range of suspension travel. In practice, designers aim for less than 0.1 deg of toe change per 25 mm of travel. Some competition vehicles deliberately set a small amount of bump steer for specific handling characteristics.

```
    Top View (X-Y plane)

    Steering rack ═══════════════════
                        |
                        | Tie rod
                        |
           ○────────────○───────── Wheel
    Inner pivot    Outer tie rod end
    (rack end)     (on steering arm)

    The tie rod outer end must trace the same arc as
    the suspension to avoid bump steer.
```

## Geometric Basis

Bump steer arises when the tie rod and the lower (or upper) control arm do not share the same instant center. If the effective pivot arc of the tie rod outer end does not match the arc of the upright (driven by the wishbones), a relative motion occurs that rotates the upright about the steering axis, changing toe.

```
    Front View

    Chassis
    ──────────────────────
    UCA_i ──────── UCA_o        Upper arm
                    |
    Rack ─── TR ────|── TRE     Tie rod
                    |
    LCA_i ──────── LCA_o        Lower arm
    ──────────────────────

    If the tie rod effective pivot does not lie on the
    line through the upper and lower arm pivots (i.e.,
    the tie rod IC does not match the suspension IC),
    bump steer results.
```

## Mathematical Derivation

### Method 1: Instant Center Mismatch

The bump steer rate is proportional to the difference in height between the tie rod line and the suspension instant center, projected to the tie rod outer end location.

**Step 1**: Compute the suspension front-view IC from the upper and lower wishbone geometry (see [instant-center.md](./instant-center.md)).

**Step 2**: Compute where the suspension IC "expects" the tie rod outer end to be at each vertical position. The tie rod outer end should lie on a circular arc centered at the suspension IC.

**Step 3**: Compute the actual tie rod outer end position. The tie rod inner end is fixed to the steering rack. As the suspension moves vertically, the tie rod constrains the outer end to lie on a sphere (3D) or circle (2D) centered at the inner tie rod end.

**Step 4**: The difference between the "expected" and "actual" positions of the tie rod outer end causes a rotation (toe change) of the upright.

### Method 2: Direct Kinematic Calculation

A more practical and general method computes bump steer numerically:

**Step 1**: Define the tie rod geometry:
- Inner tie rod end (on rack): $R = (x_R, y_R, z_R)$
- Outer tie rod end (on upright): $E = (x_E, y_E, z_E)$
- Tie rod length: $L_{TR} = |E - R|$

**Step 2**: For a vertical wheel displacement $\Delta z$, the upright moves (determined by the double-wishbone kinematics). The outer tie rod end attachment point on the upright moves with the upright.

**Step 3**: The actual outer tie rod end position is constrained to lie on a sphere of radius $L_{TR}$ centered at $R$. The kinematic solver finds the upright position that satisfies both the wishbone constraints and the tie rod constraint simultaneously.

**Step 4**: The toe angle at each position is:

$$\theta_{toe} = \arctan\left(\frac{x_E' - x_{WC}'}{y_E' - y_{WC}'}\right) - \theta_{toe,0}$$

where $(x_E', y_E')$ is the displaced outer tie rod end position and $(x_{WC}')$ is the displaced wheel center, both projected into the X-Y plane. $\theta_{toe,0}$ is the static toe angle.

### Method 3: Simplified 2D Approximation

For a simplified front-view (Y-Z plane) analysis, bump steer can be estimated by comparing the arc of the tie rod outer end to the arc of the upright.

The tie rod outer end traces a circular arc in the Y-Z plane centered at the inner tie rod end $(y_R, z_R)$ with radius equal to the projected tie rod length:

$$L_{TR,proj} = \sqrt{(y_E - y_R)^2 + (z_E - z_R)^2}$$

The upright attachment traces a circular arc centered at the suspension IC.

The **vertical position of the tie rod inner end** relative to the lower control arm plane is the critical dimension. If the inner tie rod end lies exactly on the line connecting the lower arm inner pivot to the IC (in the Y-Z plane), bump steer is zero.

The bump steer rate (small angle approximation) is:

$$\frac{d\theta_{toe}}{dz} \approx \frac{\Delta z_{TR,error}}{L_{steering\_arm}}$$

where:
- $\Delta z_{TR,error}$ = the vertical mismatch between the actual tie rod outer end position and its ideal position (on the upright arc), per unit of wheel travel
- $L_{steering\_arm}$ = the effective steering arm length (distance from steering axis to tie rod outer end, in the X-Y plane)

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Inner tie rod end Y | $y_R$ | mm | Lateral position of rack end | 200 - 400 |
| Inner tie rod end Z | $z_R$ | mm | Vertical position of rack end | 100 - 250 |
| Outer tie rod end Y | $y_E$ | mm | Lateral position on steering arm | 580 - 720 |
| Outer tie rod end Z | $z_E$ | mm | Vertical position on steering arm | 80 - 200 |
| Tie rod length | $L_{TR}$ | mm | Distance between inner and outer ends | 300 - 500 |
| Steering arm length | $L_{sa}$ | mm | Effective lever arm for toe change | 80 - 150 |
| Wheel travel range | $\Delta z$ | mm | Bump and rebound range | -80 to +80 |
| Suspension IC (Y,Z) | $(y_{IC}, z_{IC})$ | mm | Front-view instant center | (computed) |

## Output Parameters

| Parameter | Symbol | Units | Description |
|-----------|--------|-------|-------------|
| Bump steer rate | $d\theta/dz$ | deg/mm | Toe change per mm of wheel travel |
| Toe change curve | $\theta_{toe}(z)$ | deg | Toe angle vs. vertical travel |
| Peak toe change | $\Delta\theta_{max}$ | deg | Maximum toe deviation in travel range |

## Validation Test Case

**Input** (simplified 2D front-view):

| Parameter | Value (mm) |
|-----------|-----------|
| $y_R$ (inner tie rod) | 280 |
| $z_R$ | 140 |
| $y_E$ (outer tie rod) | 650 |
| $z_E$ | 130 |
| Steering arm length $L_{sa}$ | 120 mm |
| Suspension IC Y | 9771.4 mm (from IC validation) |
| Suspension IC Z | -232.9 mm |

**Calculation**:

The tie rod line slope:
$$m_{TR} = \frac{130 - 140}{650 - 280} = \frac{-10}{370} = -0.02703$$

The ideal tie rod line would pass through the suspension IC with slope connecting the outer tie rod end to the IC:
$$m_{ideal} = \frac{z_{IC} - z_E}{y_{IC} - y_E} = \frac{-232.9 - 130}{9771.4 - 650} = \frac{-362.9}{9121.4} = -0.03979$$

The slope mismatch at the outer tie rod end creates a height error per unit of lateral displacement. For a 25 mm bump, the upright (and tie rod outer end) moves approximately vertically. The tie rod constrains the outer end to its own arc, creating a lateral mismatch that produces toe change.

Approximate bump steer per 25 mm travel:
$$\Delta z_{error} \approx 25 \times (m_{ideal} - m_{TR}) \times \frac{y_E - y_R}{y_{IC} - y_R}$$

This simplified analysis is illustrative. The actual calculation requires the full kinematic solver for accuracy.

For this geometry, the mismatch is small (slopes differ by ~0.013), indicating reasonable bump steer characteristics. A full kinematic solution would yield approximately **0.05 - 0.10 deg per 25 mm of travel**, which is within acceptable limits.

## Design Guidelines for Minimizing Bump Steer

1. **Rack height**: Position the steering rack so the inner tie rod end lies on (or very near) the line connecting the lower arm inner pivot to the front-view instant center.
2. **Tie rod length**: Choose the tie rod length so the outer end sweeps the same arc as the upright attachment point.
3. **Tie rod angle**: In the front view, the tie rod should be approximately parallel to the lower control arm at design ride height.
4. **Rack placement (fore-aft)**: In the side view, the tie rod should be approximately parallel to the lower or upper arm (depending on rack position) to minimize side-view bump steer.

| Bump Steer Target | Application |
|-------------------|-------------|
| < 0.05 deg / 25 mm | Race car, high-performance |
| < 0.10 deg / 25 mm | Sports car |
| < 0.20 deg / 25 mm | Passenger car |

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 19: "Steering Geometry" -- Bump steer analysis.
2. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009. Chapter 8: "Steering and Bump Steer."
3. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 6.
4. Staniforth, A. *Competition Car Suspension*, Haynes, 2006. Chapter 8: "Bump Steer."
