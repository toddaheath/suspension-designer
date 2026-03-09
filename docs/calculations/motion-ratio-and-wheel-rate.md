# Motion Ratio and Wheel Rate Calculation

## Definition

### Motion Ratio

The **motion ratio** (MR), also called installation ratio or leverage ratio, is the ratio of spring displacement to wheel displacement. It describes how much the spring compresses for a given amount of wheel travel:

$$MR = \frac{\Delta x_{spring}}{\Delta z_{wheel}}$$

A motion ratio of 0.6 means the spring compresses 0.6 mm for every 1 mm of wheel travel.

### Wheel Rate

The **wheel rate** is the effective spring rate as experienced at the wheel (tire contact patch). It accounts for the mechanical advantage of the spring mounting geometry:

$$K_{wheel} = K_{spring} \cdot MR^2$$

The $MR^2$ relationship arises because the motion ratio affects both the force and the displacement -- it is a work/energy equivalence.

## Physical Interpretation

The motion ratio is fundamentally a lever arm ratio. In a pushrod/pullrod race car suspension, the spring/damper unit is mounted inboard and actuated through a rocker. In a conventional passenger car suspension, the spring mounts directly on the control arm at some point between the chassis pivot and the ball joint.

- **MR < 1**: Spring travel is less than wheel travel (most common). The spring must be stiffer than the desired wheel rate.
- **MR = 1**: Spring travel equals wheel travel (coilover mounted at the wheel, idealized).
- **MR > 1**: Possible with an over-center rocker; unusual in practice.

### Why It Matters

The wheel rate (not the spring rate) determines the vehicle's ride frequency, roll stiffness contribution, and load transfer behavior. Two vehicles with the same spring rate but different motion ratios will ride very differently.

## Coordinate System

SAE J670: X forward, Y left, Z up. Vertical wheel travel is positive upward (bump = positive Z displacement of the wheel center relative to chassis).

## Mathematical Derivation

### Method 1: Direct Geometric Calculation (Lever Arm)

For a spring mounted on a lower control arm between the inner pivot and the ball joint:

```
    Chassis Pivot (A)
    ○─────────────────────────○ Ball Joint (B)
    |         |
    |    Spring attachment (S)
    |         |
    |    ===  Spring
    |    ===
    |
    Chassis

    a = distance from A to S
    b = distance from A to B (total arm length)
```

The motion ratio is the ratio of the spring attachment distance to the ball joint distance from the arm pivot:

$$MR = \frac{a}{b}$$

where:
- $a$ = distance from the control arm inner pivot to the spring attachment point, measured along the arm
- $b$ = distance from the control arm inner pivot to the ball joint (outer pivot)

This is a first-order approximation. The exact value depends on the spring angle relative to the arm.

### Method 2: Including Spring Angle

When the spring is not perpendicular to the control arm, the effective motion ratio includes the sine of the spring angle:

$$MR = \frac{a}{b} \cdot \sin(\alpha)$$

where $\alpha$ is the angle between the spring axis and the control arm, measured at the spring attachment point.

### Method 3: General 3D Calculation

For a general 3D suspension (e.g., pushrod with rocker), the motion ratio is computed as:

$$MR = \frac{\partial x_{spring}}{\partial z_{wheel}}$$

This is evaluated numerically by:
1. Displacing the wheel center by a small $\Delta z$ (e.g., 1 mm)
2. Computing the resulting spring deflection $\Delta x_{spring}$ using the full kinematic model
3. $MR = \Delta x_{spring} / \Delta z$

For a rocker-based system (pushrod/pullrod):

$$MR = MR_{pushrod} \cdot MR_{rocker}$$

$$MR_{pushrod} = \frac{\Delta l_{pushrod}}{\Delta z_{wheel}}, \quad MR_{rocker} = \frac{\Delta x_{spring}}{\Delta l_{pushrod}}$$

### Wheel Rate Derivation

By energy equivalence, the work done at the wheel must equal the work done at the spring:

$$F_{wheel} \cdot \Delta z_{wheel} = F_{spring} \cdot \Delta x_{spring}$$

$$F_{wheel} = F_{spring} \cdot \frac{\Delta x_{spring}}{\Delta z_{wheel}} = F_{spring} \cdot MR$$

And since $F_{spring} = K_{spring} \cdot \Delta x_{spring} = K_{spring} \cdot MR \cdot \Delta z_{wheel}$:

$$F_{wheel} = K_{spring} \cdot MR \cdot \Delta z_{wheel} \cdot MR = K_{spring} \cdot MR^2 \cdot \Delta z_{wheel}$$

Therefore:

$$\boxed{K_{wheel} = K_{spring} \cdot MR^2}$$

### Rising and Falling Rate

The motion ratio is generally not constant -- it varies with suspension position. This produces a **progressive** (rising rate) or **degressive** (falling rate) wheel rate:

- **Rising rate**: MR increases with compression. The wheel rate stiffens in bump. This is generally desirable as it provides a softer ride at design height with increased resistance to bottoming.
- **Falling rate**: MR decreases with compression. Generally undesirable as it can lead to easier bottoming.
- **Linear rate**: MR is approximately constant. The wheel rate is constant.

The instantaneous wheel rate at any position is:

$$K_{wheel}(z) = K_{spring} \cdot MR(z)^2 + F_{spring}(z) \cdot \frac{dMR}{dz}$$

The second term accounts for the rate of change of the motion ratio and can be significant for highly progressive geometries. For most double-wishbone designs with moderate MR variation, the $K_{spring} \cdot MR^2$ approximation is adequate.

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Spring rate | $K_{spring}$ | N/mm | Coil spring rate | 15 - 120 |
| Pivot-to-spring distance | $a$ | mm | Distance along arm to spring mount | 150 - 400 |
| Pivot-to-ball-joint distance | $b$ | mm | Total arm length | 300 - 600 |
| Spring angle | $\alpha$ | deg | Angle of spring axis to control arm | 60 - 90 |

For pushrod/pullrod:
| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Pushrod motion ratio | $MR_{pushrod}$ | -- | Pushrod displacement / wheel displacement | 0.8 - 1.2 |
| Rocker motion ratio | $MR_{rocker}$ | -- | Spring displacement / pushrod displacement | 0.5 - 1.5 |

## Output Parameters

| Parameter | Symbol | Units | Description |
|-----------|--------|-------|-------------|
| Motion ratio | $MR$ | -- | Dimensionless ratio |
| Wheel rate | $K_{wheel}$ | N/mm | Effective rate at the wheel |

## Validation Test Case

**Input** (conventional double-wishbone, spring on lower arm):

| Parameter | Value |
|-----------|-------|
| $K_{spring}$ | 40 N/mm |
| $a$ (pivot to spring) | 250 mm |
| $b$ (pivot to ball joint) | 420 mm |
| $\alpha$ (spring angle) | 80 deg |

**Calculation**:

$$MR = \frac{250}{420} \cdot \sin(80°) = 0.5952 \cdot 0.9848 = 0.5862$$

$$K_{wheel} = 40 \cdot (0.5862)^2 = 40 \cdot 0.3436 = 13.75 \text{ N/mm}$$

**Result**:
- Motion ratio = **0.586**
- Wheel rate = **13.75 N/mm**

This is a typical result. The spring rate (40 N/mm) is nearly three times the wheel rate due to the MR^2 effect. This wheel rate will produce a ride frequency of approximately 1.2 Hz for a 250 kg corner mass, which is typical for a passenger car (see [natural-frequency-and-damping.md](./natural-frequency-and-damping.md)).

## Typical Values

| Application | Motion Ratio | Spring Rate (N/mm) | Wheel Rate (N/mm) |
|-------------|-------------|--------------------|--------------------|
| Passenger car | 0.5 - 0.8 | 20 - 60 | 8 - 30 |
| Sports car | 0.55 - 0.85 | 30 - 100 | 15 - 50 |
| Formula car (pushrod) | 0.4 - 0.7 | 80 - 300 | 20 - 100 |
| NASCAR | 0.7 - 1.0 | 50 - 200 | 30 - 200 |

## References

1. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 6: "Spring Rates."
2. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009. Chapter 6: "Installation Ratios."
3. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 16: "Ride."
4. Smith, C. *Tune to Win*, Aero Publishers, 1978. Chapter 4: "Springs."
