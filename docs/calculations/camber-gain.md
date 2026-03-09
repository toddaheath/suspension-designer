# Camber Gain Calculation

## Overview

**Camber gain** (or camber change) describes how the wheel's camber angle changes as the suspension moves through its vertical travel (bump and rebound). For a double-wishbone suspension, camber gain is governed by the front-view swing arm (FVSA) -- the effective lever arm from the front-view instant center (IC) to the tire contact patch. The FVSA length directly determines the rate of camber change per unit of vertical wheel displacement.

Proper camber gain is critical for maintaining optimal tire contact patch loading during cornering, where the chassis rolls and the outside wheel moves into bump.

## Physical Interpretation

- **Negative camber gain in bump**: The top of the tire tilts inward as the wheel moves upward. This is desirable because during cornering, the loaded outer wheel moves into bump due to body roll, and negative camber gain compensates for the body roll angle, keeping the tire more upright relative to the road.
- **Short FVSA**: Produces aggressive camber gain. The wheel's camber changes rapidly with travel.
- **Long FVSA**: Produces gentle camber gain. Nearly-parallel arms create a very long FVSA, meaning the wheel translates almost vertically with little camber change.
- **Infinite FVSA**: Parallel control arms. Zero camber gain -- pure translational motion.

### Design Targets

| Application | Camber Gain Rate | Notes |
|-------------|-----------------|-------|
| FSAE | -1.0 to -2.0 deg/inch (-0.039 to -0.079 deg/mm) | Aggressive, high lateral g |
| Road car | -0.3 to -0.8 deg/inch (-0.012 to -0.031 deg/mm) | Comfort and tire wear |
| GT race car | -0.5 to -1.5 deg/inch (-0.020 to -0.059 deg/mm) | Balance of grip and wear |

## Mathematical Derivation

### Front-View Swing Arm (FVSA)

The FVSA is the line from the front-view instant center to the tire contact patch center. Its length determines the camber gain rate.

Given:
- Instant center: $(y_{IC}, z_{IC})$
- Contact patch center: $(y_{CP}, z_{CP})$

The FVSA length is:

$$L_{FVSA} = \sqrt{(y_{IC} - y_{CP})^2 + (z_{IC} - z_{CP})^2}$$

### Camber Gain Rate (Small Displacements)

For small vertical wheel displacements $\Delta z_w$, the wheel effectively swings about the instant center. The angular change (camber change) for a small arc is:

$$\Delta \gamma \approx \frac{\Delta z_w}{L_{FVSA}}$$

where $\Delta \gamma$ is in radians. Converting to degrees:

$$\Delta \gamma_{deg} \approx \frac{\Delta z_w}{L_{FVSA}} \times \frac{180}{\pi}$$

The **camber gain rate** is therefore:

$$\boxed{\frac{d\gamma}{dz_w} \approx \frac{1}{L_{FVSA}} \text{ (rad/mm)}}$$

Or equivalently:

$$\frac{d\gamma}{dz_w} \approx \frac{180}{\pi \cdot L_{FVSA}} \text{ (deg/mm)}$$

### Sign Convention

The sign of the camber gain depends on the IC location relative to the wheel:

- **IC above and inboard of contact patch** (typical): Bump produces negative camber gain (desirable). The FVSA angle is:

$$\alpha_{FVSA} = \arctan\!\left(\frac{z_{IC} - z_{CP}}{y_{IC} - y_{CP}}\right)$$

- If the IC is above the ground plane ($z_{IC} > 0$) and inboard of the wheel, bump travel produces negative camber (top of tire tilts inboard).

### Exact Camber for Finite Displacements

For larger displacements, the linear approximation loses accuracy. The exact camber change for a wheel displacement $\Delta z_w$ about the IC is:

$$\Delta \gamma = \arctan\!\left(\frac{\Delta z_w}{L_{FVSA}}\right)$$

For the full kinematic analysis at large displacements, the IC migrates as the suspension geometry changes, so the camber must be recomputed at each position by finding the new IC at the displaced state. This is the approach used in full kinematic solvers.

### Instantaneous Camber Gain from Geometry

An equivalent formulation directly from the IC coordinates:

$$\frac{d\gamma}{dz_w} = \frac{1}{y_{CP} - y_{IC}} \text{ (rad/mm, if IC and CP are at different heights)}$$

More precisely, considering only the horizontal (lateral) component of the FVSA as the effective lever arm for camber rotation:

$$\frac{d\gamma}{dz_w} \approx \frac{\cos(\alpha_{FVSA})}{L_{FVSA}} = \frac{1}{\sqrt{(y_{IC} - y_{CP})^2 + (z_{IC} - z_{CP})^2}} \cdot \frac{|y_{IC} - y_{CP}|}{L_{FVSA}}$$

For the small-angle case where $z_{IC}$ is small relative to the lateral distance, this simplifies back to $1/L_{FVSA}$.

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| IC lateral position | $y_{IC}$ | mm | Y-coordinate of front-view instant center | -10000 to +500 |
| IC vertical position | $z_{IC}$ | mm | Z-coordinate of front-view instant center | -500 to +500 |
| Contact patch Y | $y_{CP}$ | mm | Lateral position of tire contact patch center | 550 -- 800 |
| Contact patch Z | $z_{CP}$ | mm | Vertical position of contact patch | 0 |
| Wheel travel | $\Delta z_w$ | mm | Vertical displacement (positive = bump) | -50 to +50 |

## Output Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| FVSA length | $L_{FVSA}$ | mm | Front-view swing arm length | 500 -- 15000 |
| FVSA angle | $\alpha_{FVSA}$ | deg | Angle of swing arm from horizontal | -30 to +30 |
| Camber gain rate | $d\gamma/dz_w$ | deg/mm | Instantaneous camber change rate | -0.1 to +0.1 |
| Camber change | $\Delta \gamma$ | deg | Total camber change for given travel | -5 to +5 |

## Algorithm

```
function computeCamberGain(IC_y, IC_z, CP_y, CP_z, wheelTravel):
    // Compute FVSA length
    dy = IC_y - CP_y
    dz = IC_z - CP_z
    FVSA_length = sqrt(dy^2 + dz^2)

    if FVSA_length < epsilon:
        return error("IC coincides with contact patch")

    // FVSA angle from horizontal
    FVSA_angle = atan2(dz, dy)  // radians

    // Instantaneous camber gain rate (small displacement)
    camberGainRate_rad = 1.0 / FVSA_length  // rad/mm
    camberGainRate_deg = camberGainRate_rad * (180 / pi)  // deg/mm

    // Sign: if IC is inboard (dy < 0 for left wheel), bump gives negative camber
    // For a left wheel: CP_y > IC_y typically means IC is inboard
    if dy < 0:
        camberGainRate_deg = -camberGainRate_deg

    // Camber change for given travel (small angle approximation)
    camberChange_deg = camberGainRate_deg * wheelTravel

    // Exact camber change for finite displacement
    camberChange_exact = atan(wheelTravel / FVSA_length) * (180 / pi)
    if dy < 0:
        camberChange_exact = -camberChange_exact

    return {
        FVSA_length,
        FVSA_angle_deg: FVSA_angle * (180 / pi),
        camberGainRate_deg,
        camberChange_deg,
        camberChange_exact
    }
```

## Validation Test Case

### Input

Using the instant center from the [instant center validation example](instant-center.md):

| Parameter | Value |
|-----------|-------|
| $y_{IC}$ | 9771.4 mm |
| $z_{IC}$ | -232.9 mm |
| $y_{CP}$ | 650.0 mm |
| $z_{CP}$ | 0.0 mm |
| $\Delta z_w$ | 25.4 mm (1 inch bump) |

### Calculation

**FVSA length**:
$$L_{FVSA} = \sqrt{(9771.4 - 650.0)^2 + (-232.9 - 0)^2}$$
$$= \sqrt{9121.4^2 + 232.9^2}$$
$$= \sqrt{83199927.0 + 54242.4}$$
$$= \sqrt{83254169.4} = 9124.4 \text{ mm}$$

**Camber gain rate**:
$$\frac{d\gamma}{dz_w} = \frac{180}{\pi \times 9124.4} = \frac{180}{28658.5} = 0.00628 \text{ deg/mm}$$

Since $y_{IC} > y_{CP}$ (IC is outboard / far to the left of wheel), the sign means bump produces negative camber.

**Camber change for 25.4 mm bump**:
$$\Delta \gamma = 0.00628 \times 25.4 = 0.160 \text{ deg}$$

### Result

$$\Delta \gamma \approx -0.16 \text{ deg per inch of bump travel}$$

This is a very gentle camber gain rate, consistent with nearly-parallel long control arms on a passenger car. An FSAE car with a FVSA of ~1500 mm would have a gain rate of about $-0.039$ deg/mm or $-1.0$ deg/inch, which is much more aggressive.

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapters 17--18: "Suspension Geometry."
2. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 9.
3. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009.
4. SAE J670 -- Vehicle Dynamics Terminology.
