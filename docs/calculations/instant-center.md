# Instant Center Calculation

## Definition

The **instant center** (IC), also called the instantaneous center of rotation, is the point in space about which a suspension link or wheel assembly instantaneously rotates at a given position. For a double-wishbone (SLA) suspension, the front-view instant center is found by extending the upper and lower control arm axes until they intersect in the Y-Z plane.

## Physical Interpretation

The instant center governs how the wheel moves relative to the chassis at any given suspension position. Its location determines:

- **Camber gain rate**: How quickly the wheel gains or loses camber with vertical travel
- **Roll center height**: The IC is the first step in calculating the kinematic roll center
- **Scrub behavior**: The IC height relative to ground affects lateral tire scrub during bump

A higher IC (closer to the wheel) produces less camber change per unit of vertical travel. A lower IC (farther from the wheel) produces more camber gain. An IC at infinity (parallel control arms) results in zero camber gain -- the wheel translates vertically with no rotation.

## Coordinate System

All geometry uses the **SAE J670 coordinate system**:
- **X**: Positive forward (direction of travel)
- **Y**: Positive to the left (driver's perspective)
- **Z**: Positive upward

The front-view instant center is computed in the **Y-Z plane** (X = 0 projection).

## Geometric Setup

```
        Chassis
    ──────────────────────
    UBJ_i ─────────── UBJ_o        Upper wishbone
           \
            \
             * IC (intersection point)
            /
           /
    LBJ_i ─────────── LBJ_o        Lower wishbone
    ──────────────────────
        │              │
       Ground         Wheel
                    Contact
```

Where:
- `UBJ_i` = Upper ball joint, inner (chassis) pivot
- `UBJ_o` = Upper ball joint, outer (upright) pivot
- `LBJ_i` = Lower ball joint, inner (chassis) pivot
- `LBJ_o` = Lower ball joint, outer (upright) pivot

## Mathematical Derivation

### Step 1: Project Pivot Points into Y-Z Plane

For each control arm, extract the Y and Z coordinates of the inner and outer pivot points:

**Upper wishbone line** passes through:
$$P_1 = (y_{UBJ_i},\; z_{UBJ_i}), \quad P_2 = (y_{UBJ_o},\; z_{UBJ_o})$$

**Lower wishbone line** passes through:
$$P_3 = (y_{LBJ_i},\; z_{LBJ_i}), \quad P_4 = (y_{LBJ_o},\; z_{LBJ_o})$$

### Step 2: Parameterize Each Line

Express each line in parametric form. For the upper arm:

$$y = y_{UBJ_i} + t \cdot (y_{UBJ_o} - y_{UBJ_i})$$
$$z = z_{UBJ_i} + t \cdot (z_{UBJ_o} - z_{UBJ_i})$$

Or equivalently in slope-intercept form. Define direction vectors:

$$\vec{d}_U = P_2 - P_1 = (\Delta y_U,\; \Delta z_U)$$
$$\vec{d}_L = P_4 - P_3 = (\Delta y_L,\; \Delta z_L)$$

### Step 3: Find Intersection Using Cramer's Rule

The intersection of the two lines satisfies:

$$P_1 + t \cdot \vec{d}_U = P_3 + s \cdot \vec{d}_L$$

This yields the 2x2 linear system:

$$\begin{bmatrix} \Delta y_U & -\Delta y_L \\ \Delta z_U & -\Delta z_L \end{bmatrix} \begin{bmatrix} t \\ s \end{bmatrix} = \begin{bmatrix} y_{LBJ_i} - y_{UBJ_i} \\ z_{LBJ_i} - z_{UBJ_i} \end{bmatrix}$$

The determinant is:

$$D = \Delta y_U \cdot (-\Delta z_L) - (-\Delta y_L) \cdot \Delta z_U = \Delta y_L \cdot \Delta z_U - \Delta y_U \cdot \Delta z_L$$

If $|D| < \epsilon$ (where $\epsilon$ is a small tolerance, e.g., $10^{-9}$), the arms are parallel and the IC is at infinity. This represents a translational joint with zero camber gain.

Otherwise, solve for $t$:

$$t = \frac{(y_{LBJ_i} - y_{UBJ_i}) \cdot (-\Delta z_L) - (-\Delta y_L) \cdot (z_{LBJ_i} - z_{UBJ_i})}{D}$$

$$t = \frac{\Delta y_L \cdot (z_{LBJ_i} - z_{UBJ_i}) - \Delta z_L \cdot (y_{LBJ_i} - y_{UBJ_i})}{D}$$

### Step 4: Compute IC Coordinates

$$y_{IC} = y_{UBJ_i} + t \cdot \Delta y_U$$
$$z_{IC} = z_{UBJ_i} + t \cdot \Delta z_U$$

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Upper inner pivot Y | $y_{UBJ_i}$ | mm | Lateral position of upper arm chassis pivot | 200 - 400 |
| Upper inner pivot Z | $z_{UBJ_i}$ | mm | Vertical position of upper arm chassis pivot | 250 - 400 |
| Upper outer pivot Y | $y_{UBJ_o}$ | mm | Lateral position of upper arm upright pivot | 550 - 700 |
| Upper outer pivot Z | $z_{UBJ_o}$ | mm | Vertical position of upper arm upright pivot | 250 - 380 |
| Lower inner pivot Y | $y_{LBJ_i}$ | mm | Lateral position of lower arm chassis pivot | 150 - 350 |
| Lower inner pivot Z | $z_{LBJ_i}$ | mm | Vertical position of lower arm chassis pivot | 100 - 200 |
| Lower outer pivot Y | $y_{LBJ_o}$ | mm | Lateral position of lower arm upright pivot | 600 - 750 |
| Lower outer pivot Z | $z_{LBJ_o}$ | mm | Vertical position of lower arm upright pivot | 80 - 180 |

## Output Parameters

| Parameter | Symbol | Units | Description |
|-----------|--------|-------|-------------|
| IC lateral position | $y_{IC}$ | mm | Y-coordinate of front-view instant center |
| IC vertical position | $z_{IC}$ | mm | Z-coordinate of front-view instant center |
| Convergence flag | -- | bool | Whether the arms converge (true) or are parallel (false) |

## Validation Test Case

**Input geometry** (left-front corner, typical passenger car):

| Parameter | Value (mm) |
|-----------|-----------|
| $y_{UBJ_i}$ | 300 |
| $z_{UBJ_i}$ | 350 |
| $y_{UBJ_o}$ | 625 |
| $z_{UBJ_o}$ | 330 |
| $y_{LBJ_i}$ | 200 |
| $z_{LBJ_i}$ | 150 |
| $y_{LBJ_o}$ | 700 |
| $z_{LBJ_o}$ | 130 |

**Calculation**:

Upper arm direction: $\vec{d}_U = (625-300,\; 330-350) = (325,\; -20)$

Lower arm direction: $\vec{d}_L = (700-200,\; 130-150) = (500,\; -20)$

Determinant:
$$D = 500 \cdot (-20) - 325 \cdot (-20) = -10000 + 6500 = -3500$$

Parameter $t$:
$$t = \frac{500 \cdot (150 - 350) - (-20) \cdot (200 - 300)}{-3500}$$
$$t = \frac{500 \cdot (-200) - (-20) \cdot (-100)}{-3500}$$
$$t = \frac{-100000 - 2000}{-3500} = \frac{-102000}{-3500} = 29.143$$

**Result**:
$$y_{IC} = 300 + 29.143 \cdot 325 = 300 + 9471.4 = 9771.4 \text{ mm}$$
$$z_{IC} = 350 + 29.143 \cdot (-20) = 350 - 582.9 = -232.9 \text{ mm}$$

The IC is far to the left and below ground, which is consistent with nearly-parallel arms of similar slope. The long IC arm produces a gentle camber gain rate. This is typical for a passenger car with long, nearly-parallel A-arms.

## Edge Cases

1. **Parallel arms** ($D \approx 0$): IC at infinity. Return a sentinel value or flag. The suspension acts as a translational joint at that instant.
2. **Crossed arms** (IC falls between the pivots): Unusual but valid. Typically indicates poor geometry; results should still be computed correctly.
3. **Coincident pivots** (any inner equals its outer): Degenerate -- not a valid wishbone. Return an error.

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 17: "Suspension Geometry."
2. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009. Chapter 5: "The Double-Wishbone Suspension."
3. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 9.
4. SAE J670 -- Vehicle Dynamics Terminology.
