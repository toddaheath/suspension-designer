# Scrub Radius Calculation

## Overview

The **scrub radius** (also called kingpin offset at ground) is the lateral distance between the point where the steering axis intersects the ground plane and the center of the tire contact patch, measured in the front view (Y-Z plane). It determines the moment arm through which longitudinal tire forces create a torque about the steering axis, profoundly affecting steering feel, torque steer behavior, and braking stability.

## Physical Interpretation

- **Positive scrub radius**: The steering axis ground intercept is inboard (closer to the vehicle centerline) of the contact patch center. Braking forces try to toe the wheels outward. This gives a heavier steering feel and, with front-wheel-drive, can cause torque steer.
- **Negative scrub radius**: The intercept is outboard of the contact patch. Unequal braking forces (e.g., one brake failing) create a self-correcting toe-in effect, improving straight-line stability under split-mu braking.
- **Zero scrub radius**: The steering axis passes through the contact patch center. Minimal steering disturbance from braking or driving forces, but also no self-correcting tendency.

### Design Targets

| Application | Scrub Radius (mm) | Notes |
|-------------|-------------------|-------|
| Road car (FWD) | -10 to +10 | Minimize torque steer |
| Road car (RWD) | 0 to +20 | Moderate steering feel |
| FSAE | 0 to +30 | Positive preferred for feedback |
| Vintage / heavy steering | +20 to +60 | Heavy feedback, manual steering |

## Mathematical Derivation

### Coordinate System

Using the SAE J670 convention:
- **Y**: Positive to the left
- **Z**: Positive upward
- The steering axis is defined by the line through the upper ball joint (UBJ) and lower ball joint (LBJ) on the upright

### Step 1: Define the Steering Axis

The steering axis passes through:
- Upper ball joint: $(y_{UBJ}, z_{UBJ})$ -- projected into the Y-Z (front-view) plane
- Lower ball joint: $(y_{LBJ}, z_{LBJ})$

Direction vector of the steering axis in the Y-Z plane:

$$\vec{d} = (y_{UBJ} - y_{LBJ},\; z_{UBJ} - z_{LBJ}) = (\Delta y,\; \Delta z)$$

### Step 2: Parameterize the Steering Axis Line

$$y = y_{LBJ} + t \cdot \Delta y$$
$$z = z_{LBJ} + t \cdot \Delta z$$

### Step 3: Find Ground Intercept ($z = 0$)

Setting $z = 0$:

$$0 = z_{LBJ} + t \cdot \Delta z$$

$$t = \frac{-z_{LBJ}}{\Delta z}$$

This requires $\Delta z \neq 0$ (i.e., the upper and lower ball joints are not at the same height, which is always the case for a valid suspension).

### Step 4: Compute Ground Intercept Y-Coordinate

$$y_{ground} = y_{LBJ} + t \cdot \Delta y = y_{LBJ} - \frac{z_{LBJ} \cdot \Delta y}{\Delta z}$$

$$\boxed{y_{ground} = y_{LBJ} - z_{LBJ} \cdot \frac{y_{UBJ} - y_{LBJ}}{z_{UBJ} - z_{LBJ}}}$$

### Step 5: Compute Scrub Radius

$$\boxed{r_{scrub} = y_{CP} - y_{ground}}$$

where $y_{CP}$ is the Y-coordinate of the tire contact patch center.

**Sign convention**:
- $r_{scrub} > 0$: Positive scrub (intercept inboard of contact patch)
- $r_{scrub} < 0$: Negative scrub (intercept outboard of contact patch)

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Upper ball joint Y | $y_{UBJ}$ | mm | Lateral position of UBJ (front view) | 550 -- 700 |
| Upper ball joint Z | $z_{UBJ}$ | mm | Vertical position of UBJ | 250 -- 400 |
| Lower ball joint Y | $y_{LBJ}$ | mm | Lateral position of LBJ (front view) | 600 -- 750 |
| Lower ball joint Z | $z_{LBJ}$ | mm | Vertical position of LBJ | 80 -- 180 |
| Contact patch center Y | $y_{CP}$ | mm | Lateral position of tire contact center | 620 -- 760 |

## Output Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Steering axis ground intercept Y | $y_{ground}$ | mm | Where the steering axis meets $z = 0$ | 600 -- 780 |
| Scrub radius | $r_{scrub}$ | mm | Signed lateral offset | -20 to +40 |

## Algorithm

```
function computeScrubRadius(UBJ_y, UBJ_z, LBJ_y, LBJ_z, CP_y):
    dz = UBJ_z - LBJ_z
    dy = UBJ_y - LBJ_y

    if |dz| < epsilon:
        return error("Upper and lower ball joints at same height")

    // Project steering axis to ground (Z = 0)
    t = -LBJ_z / dz
    y_ground = LBJ_y + t * dy

    // Scrub radius: positive means intercept is inboard of contact patch
    scrubRadius = CP_y - y_ground

    return {
        y_ground,
        scrubRadius
    }
```

## Validation Test Case

### Input

| Parameter | Value (mm) |
|-----------|-----------|
| $y_{UBJ}$ | 600 |
| $z_{UBJ}$ | 320 |
| $y_{LBJ}$ | 680 |
| $z_{LBJ}$ | 130 |
| $y_{CP}$ | 700 |

### Calculation

Direction vector:
$$\Delta y = 600 - 680 = -80$$
$$\Delta z = 320 - 130 = 190$$

Parameter at ground:
$$t = \frac{-130}{190} = -0.6842$$

Ground intercept:
$$y_{ground} = 680 + (-0.6842) \times (-80) = 680 + 54.74 = 734.7 \text{ mm}$$

Scrub radius:
$$r_{scrub} = 700 - 734.7 = -34.7 \text{ mm}$$

### Result

$$r_{scrub} = -34.7 \text{ mm (negative scrub)}$$

The steering axis ground intercept is outboard of the contact patch center. This is a moderate negative scrub radius, providing self-correcting braking stability but unusual for FSAE. An FSAE car would typically aim for 0 to +30 mm by placing the lower ball joint further outboard or angling the steering axis more steeply.

## Edge Cases

1. **UBJ and LBJ at same height** ($\Delta z = 0$): The steering axis is horizontal in the front view. The ground intercept is undefined (axis never crosses $z = 0$). This is not a valid suspension geometry.
2. **UBJ directly above LBJ** ($\Delta y = 0$): KPI is zero. The ground intercept has the same Y as both ball joints. Scrub radius is simply $y_{CP} - y_{BJ}$.
3. **Very large positive scrub**: May indicate geometry error or very wide offset wheels.

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 19: "Steering Geometry."
2. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 6.
3. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009.
4. SAE J670 -- Vehicle Dynamics Terminology.
