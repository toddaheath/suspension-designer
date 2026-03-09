# Anti-Dive and Anti-Squat Calculation

## Definition

**Anti-dive** and **anti-squat** are suspension geometry characteristics that resist pitch motion during longitudinal acceleration events:

- **Anti-dive**: The percentage of front suspension dive (nose-down pitch) under braking that is resisted by the front suspension geometry. Computed from the front suspension side-view instant center.
- **Anti-lift (front)**: The percentage of front lift under acceleration resisted by the geometry (relevant for FWD).
- **Anti-squat**: The percentage of rear suspension squat (rear-down pitch) under acceleration that is resisted by the rear suspension geometry. Computed from the rear suspension side-view instant center.
- **Anti-lift (rear)**: The percentage of rear lift under braking resisted by the rear geometry.

## Physical Interpretation

During braking, longitudinal weight transfer compresses the front springs and extends the rear springs, causing the vehicle to pitch nose-down. Similarly, during acceleration, the rear compresses and the front extends.

Anti-dive and anti-squat geometry creates a link force component that opposes this pitch motion **without requiring spring force**. The effect is achieved through the inclination of the side-view suspension links.

- **100% anti-dive**: The front suspension does not compress at all under braking (all dive resistance is geometric). This can feel harsh because brake forces are transmitted directly to the chassis.
- **0% anti-dive**: All dive resistance comes from the springs. The front compresses fully under braking.
- **Typical targets**: 15 - 50% anti-dive for passenger cars; 20 - 40% anti-squat.

### Trade-offs

Higher anti-dive/squat percentages:
- Reduce pitch motion (better ride composure)
- Can cause harshness (geometric coupling of braking/acceleration to vertical motion)
- May cause brake hop if anti-dive is too high (the suspension cannot absorb road inputs independently of braking)

## Coordinate System

SAE J670: X forward, Y left, Z up. The side-view analysis is performed in the **X-Z plane**.

## Geometric Basis

```
    Side View (X-Z plane)

              CG
              |
              | h_CG
              |
    ─ ─ ─ ─ ─+─ ─ ─ ─ ─ ─ ─ ─ ─  Ground
              |
         Front axle          Rear axle
         x = 0               x = L

    SV-IC_front              SV-IC_rear
         *                        *
        / \                      / \
       /   \                    /   \
    ──/─────\──            ──/─────\──
     CP_f  WC_f           WC_r    CP_r
```

The **side-view instant center** (SV-IC) is the point in the X-Z plane about which the wheel assembly rotates relative to the chassis. It is found by the same line-intersection method as the front-view IC, but using the side-view (X-Z) projections of the upper and lower control arm pivot axes.

## Mathematical Derivation

### Step 1: Side-View Instant Center

For each suspension (front or rear), project the control arm pivot axes into the X-Z plane and find their intersection. See [instant-center.md](./instant-center.md) for the general method, substituting X for Y.

This gives:
- Front SV-IC: $(x_{SV_f}, z_{SV_f})$
- Rear SV-IC: $(x_{SV_r}, z_{SV_r})$

### Step 2: Anti-Dive Percentage (Front, Under Braking)

Draw a line from the front tire contact patch to the front side-view instant center. The slope of this line, compared to a reference line from the contact patch to the CG height at the opposite axle, determines the anti-dive percentage.

The **anti-dive angle** ($\phi_f$) is the angle of the line from the front contact patch $(x_{CP_f}, 0)$ to the front SV-IC:

$$\tan(\phi_f) = \frac{z_{SV_f}}{x_{SV_f} - x_{CP_f}}$$

The **reference angle** for 100% anti-dive under braking is:

$$\tan(\phi_{ref}) = \frac{h_{CG} \cdot \%_{front\_brake}}{L}$$

where:
- $h_{CG}$ = CG height above ground
- $\%_{front\_brake}$ = front brake force proportion (typically 0.6 - 0.7)
- $L$ = wheelbase

**Anti-dive percentage**:

$$\boxed{\%_{anti\text{-}dive} = \frac{\tan(\phi_f)}{\tan(\phi_{ref})} \times 100}$$

$$\%_{anti\text{-}dive} = \frac{z_{SV_f} \cdot L}{(x_{SV_f} - x_{CP_f}) \cdot h_{CG} \cdot \%_{front\_brake}} \times 100$$

### Step 3: Anti-Squat Percentage (Rear, Under Acceleration)

For an independent rear suspension under acceleration:

The **anti-squat angle** ($\phi_r$) is the angle of the line from the rear contact patch to the rear SV-IC:

$$\tan(\phi_r) = \frac{z_{SV_r}}{x_{CP_r} - x_{SV_r}}$$

Note the sign difference: for the rear, the SV-IC is typically ahead of the contact patch.

The **reference angle** for 100% anti-squat:

$$\tan(\phi_{ref,r}) = \frac{h_{CG}}{L}$$

**Anti-squat percentage** (independent rear suspension, RWD):

$$\boxed{\%_{anti\text{-}squat} = \frac{\tan(\phi_r)}{\tan(\phi_{ref,r})} \times 100}$$

$$\%_{anti\text{-}squat} = \frac{z_{SV_r} \cdot L}{(x_{CP_r} - x_{SV_r}) \cdot h_{CG}} \times 100$$

### Step 4: Anti-Lift (Front, Under Acceleration -- FWD)

For a FWD vehicle, the front suspension can have anti-lift under acceleration:

$$\%_{anti\text{-}lift,f} = \frac{z_{SV_f} \cdot L}{(x_{SV_f} - x_{CP_f}) \cdot h_{CG} \cdot (1 - \%_{front\_brake})} \times 100$$

### Step 5: Anti-Lift (Rear, Under Braking)

$$\%_{anti\text{-}lift,r} = \frac{z_{SV_r} \cdot L}{(x_{CP_r} - x_{SV_r}) \cdot h_{CG} \cdot (1 - \%_{front\_brake})} \times 100$$

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Front SV-IC X | $x_{SV_f}$ | mm | Side-view instant center X, front | -2000 to +5000 |
| Front SV-IC Z | $z_{SV_f}$ | mm | Side-view instant center Z, front | 0 to 500 |
| Rear SV-IC X | $x_{SV_r}$ | mm | Side-view instant center X, rear | -5000 to +2000 |
| Rear SV-IC Z | $z_{SV_r}$ | mm | Side-view instant center Z, rear | 0 to 500 |
| CG height | $h_{CG}$ | mm | Center of gravity height | 400 - 600 |
| Wheelbase | $L$ | mm | Distance between front and rear axle centers | 2400 - 3200 |
| Front contact patch X | $x_{CP_f}$ | mm | Typically 0 (front axle = reference) | 0 |
| Rear contact patch X | $x_{CP_r}$ | mm | Typically = $L$ | = $L$ |
| Front brake proportion | $\%_f$ | -- | Fraction of total braking at front | 0.55 - 0.75 |

## Output Parameters

| Parameter | Symbol | Units | Description |
|-----------|--------|-------|-------------|
| Anti-dive | $\%_{AD}$ | % | Percentage of front dive resisted by geometry |
| Anti-squat | $\%_{AS}$ | % | Percentage of rear squat resisted by geometry |
| Anti-lift front | $\%_{AL_f}$ | % | Front anti-lift under acceleration (FWD) |
| Anti-lift rear | $\%_{AL_r}$ | % | Rear anti-lift under braking |

## Validation Test Case

**Input**:

| Parameter | Value |
|-----------|-------|
| Front SV-IC: $(x_{SV_f}, z_{SV_f})$ | (2500, 120) mm |
| Rear SV-IC: $(x_{SV_r}, z_{SV_r})$ | (100, 150) mm |
| $h_{CG}$ | 500 mm |
| $L$ | 2700 mm |
| $x_{CP_f}$ | 0 mm |
| $x_{CP_r}$ | 2700 mm |
| $\%_f$ (front brake proportion) | 0.65 |

**Calculation**:

**Anti-dive (front, braking)**:
$$\tan(\phi_f) = \frac{120}{2500 - 0} = 0.048$$

$$\tan(\phi_{ref}) = \frac{500 \times 0.65}{2700} = \frac{325}{2700} = 0.1204$$

$$\%_{AD} = \frac{0.048}{0.1204} \times 100 = 39.9\%$$

**Anti-squat (rear, acceleration, RWD)**:
$$\tan(\phi_r) = \frac{150}{2700 - 100} = \frac{150}{2600} = 0.05769$$

$$\tan(\phi_{ref,r}) = \frac{500}{2700} = 0.1852$$

$$\%_{AS} = \frac{0.05769}{0.1852} \times 100 = 31.2\%$$

**Result**:
- Anti-dive = **39.9%**
- Anti-squat = **31.2%**

Both values are within typical design ranges (15-50% anti-dive, 20-40% anti-squat for a passenger car).

## Typical Values

| Vehicle Type | Anti-Dive (%) | Anti-Squat (%) | Notes |
|-------------|--------------|----------------|-------|
| Passenger car | 15 - 50 | 10 - 40 | Comfort-biased |
| Sports car | 20 - 45 | 15 - 35 | Balance of comfort and control |
| Race car | 10 - 30 | 20 - 50 | Application-specific |

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 18: "Pitch and Squat Geometry."
2. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 6: "Longitudinal Weight Transfer."
3. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009. Chapter 6: "Anti-Dive and Anti-Squat."
4. SAE J670 -- Vehicle Dynamics Terminology.
