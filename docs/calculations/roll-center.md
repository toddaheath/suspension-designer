# Roll Center Height Calculation

## Overview

The **roll center** is the point in the transverse (Y-Z) plane about which the sprung mass of a vehicle initially tends to roll when subjected to a lateral force. It is a fundamental parameter in suspension design because it determines the split between geometric and elastic lateral load transfer, directly affecting the car's transient and steady-state handling balance.

For a double-wishbone suspension, the kinematic roll center is found by drawing a line from the front-view instant center (IC) of each side to the respective tire contact patch center, and finding where the two lines intersect at the vehicle centerline ($Y = 0$).

## Physical Interpretation

- **Roll center height above ground**: Determines the fraction of lateral load transfer that acts through the suspension links (geometric component) versus through the springs and dampers (elastic component). A higher roll center increases geometric load transfer and reduces body roll.
- **Roll center below ground**: A negative roll center height (below ground plane) is unusual but valid. It means the geometric load transfer component acts in a direction that initially increases roll rather than resisting it.
- **Roll center at ground level**: All lateral load transfer passes through the springs -- the "zero geometric load transfer" case.
- **Migration**: The roll center moves as the suspension travels. Large roll center migration during cornering can cause unpredictable transient behavior.

### Design Targets

| Application | Front RC Height (mm) | Rear RC Height (mm) |
|-------------|---------------------|---------------------|
| FSAE | 25 -- 75 | 50 -- 100 |
| Road car | 0 -- 100 | 80 -- 200 |
| GT/Touring | 30 -- 80 | 60 -- 120 |

The rear roll center is typically higher than the front to promote understeer and prevent the rear from rolling excessively relative to the front.

## Mathematical Derivation

### Prerequisites

This calculation requires the front-view instant center ($IC$) for the suspension side being analyzed, computed as described in [Instant Center](instant-center.md).

### Step 1: Define the Known Points

For a given side of the car (e.g., left), we have:

- **Instant center**: $(y_{IC}, z_{IC})$ -- the front-view instant center from the wishbone geometry
- **Contact patch center**: $(y_{CP}, z_{CP})$ -- where the tire meets the ground

For a typical left-side corner, $y_{CP} > 0$ (outboard, left in SAE coordinates) and $z_{CP} = 0$ (ground level) or $z_{CP} = R_{loaded}$ if measured from the wheel center datum.

In most formulations, $z_{CP} = 0$ (ground plane).

### Step 2: Construct the Roll Center Line

The roll center lies on the line from the instant center to the contact patch center, evaluated at the vehicle centerline $y = 0$.

The line passing through $(y_{IC}, z_{IC})$ and $(y_{CP}, z_{CP})$ can be parameterized:

$$y = y_{IC} + t \cdot (y_{CP} - y_{IC})$$
$$z = z_{IC} + t \cdot (z_{CP} - z_{IC})$$

### Step 3: Solve for $t$ at $y = 0$

Setting $y = 0$:

$$0 = y_{IC} + t \cdot (y_{CP} - y_{IC})$$

$$t = \frac{-y_{IC}}{y_{CP} - y_{IC}} = \frac{y_{IC}}{y_{IC} - y_{CP}}$$

### Step 4: Compute Roll Center Height

Substituting $t$ into the $z$ equation:

$$z_{RC} = z_{IC} + \frac{y_{IC}}{y_{IC} - y_{CP}} \cdot (z_{CP} - z_{IC})$$

Simplifying:

$$z_{RC} = z_{IC} - y_{IC} \cdot \frac{z_{IC} - z_{CP}}{y_{IC} - y_{CP}}$$

When the contact patch is at ground level ($z_{CP} = 0$):

$$\boxed{z_{RC} = z_{IC} - \frac{y_{IC} \cdot z_{IC}}{y_{IC} - y_{CP}} = \frac{z_{IC} \cdot (-y_{CP})}{y_{IC} - y_{CP}}}$$

Or equivalently:

$$z_{RC} = \frac{-y_{CP} \cdot z_{IC}}{y_{IC} - y_{CP}}$$

### Symmetric Vehicle (Both Sides)

For a symmetric vehicle, the left and right instant centers are mirror images. The roll center from each side will yield the same height. For an asymmetric case (e.g., during roll), the roll center is conventionally taken as the intersection of the two IC-to-contact-patch lines, which may not lie exactly on the centerline.

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| IC lateral position | $y_{IC}$ | mm | Y-coordinate of front-view instant center | -10000 to +500 |
| IC vertical position | $z_{IC}$ | mm | Z-coordinate of front-view instant center | -500 to +500 |
| Contact patch Y | $y_{CP}$ | mm | Lateral position of tire contact patch center | 550 -- 800 |
| Contact patch Z | $z_{CP}$ | mm | Vertical position of contact patch (usually 0) | 0 |

## Output Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Roll center height | $z_{RC}$ | mm | Height of roll center above ground at vehicle centerline | -50 to 200 |

## Algorithm

```
function computeRollCenterHeight(IC_y, IC_z, CP_y, CP_z):
    // Check for degenerate case: IC at same lateral position as contact patch
    if |IC_y - CP_y| < epsilon:
        return error("IC and contact patch at same Y; roll center undefined")

    // Interpolate/extrapolate the IC-to-CP line to Y = 0
    t = IC_y / (IC_y - CP_y)
    RC_z = IC_z + t * (CP_z - IC_z)

    return RC_z
```

For a symmetric vehicle, compute from either side. For an asymmetric case, compute both sides and find the intersection of the two lines in the Y-Z plane.

## Validation Test Case

### Input

Using the instant center from the [instant center validation example](instant-center.md):

| Parameter | Value |
|-----------|-------|
| $y_{IC}$ | 9771.4 mm |
| $z_{IC}$ | -232.9 mm |
| $y_{CP}$ | 650.0 mm |
| $z_{CP}$ | 0.0 mm |

### Calculation

$$t = \frac{9771.4}{9771.4 - 650.0} = \frac{9771.4}{9121.4} = 1.07126$$

$$z_{RC} = -232.9 + 1.07126 \times (0 - (-232.9))$$
$$z_{RC} = -232.9 + 1.07126 \times 232.9$$
$$z_{RC} = -232.9 + 249.5 = 16.6 \text{ mm}$$

### Result

$$z_{RC} = 16.6 \text{ mm}$$

This is a low roll center height, consistent with a passenger car with long, nearly-parallel control arms. The geometry produces minimal geometric lateral load transfer.

### Cross-check with direct formula

$$z_{RC} = \frac{-y_{CP} \cdot z_{IC}}{y_{IC} - y_{CP}} = \frac{-650.0 \times (-232.9)}{9771.4 - 650.0} = \frac{151385.0}{9121.4} = 16.6 \text{ mm} \checkmark$$

## Geometric vs Force-Based Roll Center

The calculation above yields the **kinematic (geometric) roll center**. This assumes rigid links and is valid for small perturbations from the static position.

The **force-based roll center** accounts for compliant bushings, link elasticity, and is derived from the equilibrium of forces in the suspension links under lateral loading. The force-based RC can differ significantly from the kinematic RC, especially for suspensions with compliant mounts.

For initial design and kinematic analysis, the geometric roll center is the standard approach and is what this tool computes.

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 17: "Suspension Geometry."
2. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009. Chapter 5: "The Roll Center."
3. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 9.
4. SAE J670 -- Vehicle Dynamics Terminology.
