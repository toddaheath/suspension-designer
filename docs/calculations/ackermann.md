# Ackermann Steering Geometry Calculation

## Definition

**Ackermann steering geometry** describes the ideal relationship between the inner and outer wheel steer angles during cornering, such that all wheels roll without slip on concentric circular arcs about a common turn center. The classic Ackermann condition is:

$$\cot(\delta_o) - \cot(\delta_i) = \frac{t}{L}$$

where $\delta_o$ is the outer wheel steer angle, $\delta_i$ is the inner wheel steer angle, $t$ is the track width, and $L$ is the wheelbase.

## Physical Interpretation

When a vehicle turns, the inner wheel must steer at a greater angle than the outer wheel because it follows a smaller radius arc. Pure Ackermann geometry ensures both front wheels point toward the same instantaneous turn center, minimizing tire scrub and providing the correct slip angle at each tire for low-speed turning.

```
    Top View

                        Turn Center
                            O
                           /|\
                          / | \
                         /  |  \
                        /   |   \
                       /    |    \
                      /     |     \
           delta_i   /      |      \  delta_o
                    /       |       \
    ───────────── Inner ── Rear ── Outer ─────
                   |        |        |
                   |<- t/2 ->|<- t/2 ->|
                   |        |        |
                   |<────── L ──────>|

    delta_i > delta_o (inner wheel steers more)
```

### Ackermann Percentage

In practice, 100% Ackermann is not always desired. The **Ackermann percentage** quantifies the actual geometry relative to the ideal:

$$\%_{Ackermann} = \frac{\delta_i - \delta_o}{\delta_{i,ideal} - \delta_{o,ideal}} \times 100$$

Or more commonly, using the toe-out on turns:

$$\%_{Ackermann} = \frac{\delta_{i,actual} - \delta_{o,actual}}{\delta_{i,Ackermann} - \delta_{o,Ackermann}} \times 100$$

| % Ackermann | Geometry | Behavior |
|-------------|----------|----------|
| 100% | Full Ackermann | Both wheels aim at the same turn center |
| 0% | Parallel steer | Both wheels steer the same angle |
| < 0% | Anti-Ackermann | Outer wheel steers more than parallel |
| > 100% | Excess Ackermann | Inner wheel steers even more than ideal |

### When to Use Each

- **Full Ackermann (80-100%)**: Low-speed maneuvering, parking, autocross. Minimizes tire scrub.
- **Partial Ackermann (40-80%)**: Balanced for combined low and high-speed use. Most road cars.
- **Parallel steer (0%)**: High-speed cornering. At speed, the inner tire operates at higher slip angle and benefits from less steer angle.
- **Anti-Ackermann (< 0%)**: High-downforce race cars (F1, endurance). At high speeds with significant lateral load transfer, the lightly loaded inner tire needs less slip angle than the heavily loaded outer tire.

## Mathematical Derivation

### Step 1: Ideal Ackermann Condition

From the geometry of concentric arcs about a common turn center:

The turn radius to the rear axle center:

$$R = \frac{L}{\tan(\delta_{avg})}$$

For the inner wheel:
$$\tan(\delta_i) = \frac{L}{R - t/2}$$

For the outer wheel:
$$\tan(\delta_o) = \frac{L}{R + t/2}$$

Taking the cotangent of each:
$$\cot(\delta_i) = \frac{R - t/2}{L}, \quad \cot(\delta_o) = \frac{R + t/2}{L}$$

Subtracting:
$$\boxed{\cot(\delta_o) - \cot(\delta_i) = \frac{t}{L}}$$

This is the **Ackermann condition**, independent of turn radius.

### Step 2: Solving for Outer Angle Given Inner Angle

Given an inner steer angle $\delta_i$, the ideal outer steer angle is:

$$\cot(\delta_o) = \cot(\delta_i) + \frac{t}{L}$$

$$\boxed{\delta_o = \text{arccot}\left(\cot(\delta_i) + \frac{t}{L}\right) = \arctan\left(\frac{1}{\cot(\delta_i) + t/L}\right)}$$

### Step 3: Turn Radius

The turn radius to the vehicle centerline at the rear axle:

$$R = \frac{L}{\tan(\delta_i)} + \frac{t}{2} = \frac{L}{\tan(\delta_o)} - \frac{t}{2}$$

Or using the average steer angle for an approximation:

$$R \approx \frac{L}{\delta_{avg}} \quad \text{(small angle, radians)}$$

### Step 4: Ackermann Percentage from Steering Arm Geometry

The classic mechanism for achieving Ackermann geometry is to angle the steering arms inward so their extensions intersect on the rear axle line.

```
    Top View

    Steering rack ═══════════════════
                   |               |
              Tie rod            Tie rod
                   |               |
         ─────── SA_L ─────── SA_R ──────
                    \             /
                     \           /
                      \         /
                       \       /
                        \     /
                         \   /
                          \ /
                           O   <-- Intersection point
                           |
    ─────────────── Rear Axle Line ──────
```

If the steering arm extensions meet exactly on the rear axle centerline, the geometry is 100% Ackermann. The Ackermann percentage based on the steering arm angle $\beta$ (measured from the lateral axis):

$$\tan(\beta_{100\%}) = \frac{d_{sa}}{L/2 + x_{offset}}$$

where $d_{sa}$ is the steering arm length (lateral, from kingpin axis to tie rod end) and $x_{offset}$ is the fore/aft offset of the steering arm from the axle line.

The simplified Ackermann percentage:

$$\%_{Ack} \approx \frac{\tan(\beta_{actual})}{\tan(\beta_{100\%})} \times 100$$

### Step 5: Exact Ackermann Percentage at a Given Steer Angle

For a given rack displacement, compute the actual inner and outer steer angles using the full steering linkage kinematics, then:

$$\%_{Ack}(\delta) = \frac{\delta_{i,actual} - \delta_{o,actual}}{\delta_{i,Ackermann} - \delta_{o,Ackermann}} \times 100$$

where $\delta_{i,Ackermann}$ and $\delta_{o,Ackermann}$ satisfy the Ackermann condition for the same average steer angle.

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Wheelbase | $L$ | mm | Distance between front and rear axle centers | 2400 - 3200 |
| Track width | $t$ | mm | Front track width (contact patch to contact patch) | 1400 - 1700 |
| Inner steer angle | $\delta_i$ | deg | Steer angle of the inner wheel | 0 - 40 |
| Steering arm length | $d_{sa}$ | mm | Length of the steering arm (kingpin to tie rod end) | 80 - 150 |
| Steering arm angle | $\beta$ | deg | Angle of steering arm from lateral axis | 10 - 30 |

## Output Parameters

| Parameter | Symbol | Units | Description |
|-----------|--------|-------|-------------|
| Ideal outer steer angle | $\delta_o$ | deg | Ackermann-correct outer angle |
| Ackermann percentage | $\%_{Ack}$ | % | Actual geometry as percentage of ideal |
| Turn radius | $R$ | mm | Instantaneous turn radius |
| Toe-out on turns | $\Delta\delta$ | deg | $\delta_i - \delta_o$ |

## Validation Test Case

**Input**:

| Parameter | Value |
|-----------|-------|
| $L$ | 2700 mm |
| $t$ | 1500 mm |
| $\delta_i$ | 30 deg (inner steer angle) |

**Calculation**:

Ideal outer steer angle:
$$\cot(\delta_o) = \cot(30°) + \frac{1500}{2700}$$
$$\cot(30°) = \frac{1}{\tan(30°)} = \frac{1}{0.5774} = 1.7321$$
$$\cot(\delta_o) = 1.7321 + 0.5556 = 2.2876$$
$$\delta_o = \arctan\left(\frac{1}{2.2876}\right) = \arctan(0.4371) = 23.61°$$

Toe-out on turns:
$$\Delta\delta = 30° - 23.61° = 6.39°$$

Turn radius (to rear axle center):
$$R = \frac{2700}{\tan(30°)} + \frac{1500}{2}{} = 4676.5 + 750 = 5426.5 \text{ mm}$$

Or equivalently:
$$R = \frac{2700}{\tan(23.61°)} + \frac{1500}{2} \quad (\text{should give the same} - \text{verify:})$$
$$= \frac{2700}{0.4371} + 750 ... \text{this uses the outer wheel formula:}$$
$$R = \frac{2700}{\tan(\delta_o)} - \frac{1500}{2} = \frac{2700}{0.4371} - 750 = 6176.5 - 750 = 5426.5 \text{ mm} \quad \checkmark$$

**Result**:
- Ideal outer steer angle = **23.61 degrees**
- Toe-out on turns = **6.39 degrees**
- Turn radius = **5427 mm** (5.43 m)

The 6.39-degree difference between inner and outer steer angles at 30 degrees of inner steer is significant. This demonstrates why Ackermann geometry matters -- parallel steer would produce substantial tire scrub at this steer angle.

## Ackermann vs. Steer Angle

The ideal toe-out on turns increases nonlinearly with steer angle:

| Inner steer angle | Ideal outer angle | Toe-out | Turn radius |
|-------------------|-------------------|---------|-------------|
| 5 deg | 4.88 deg | 0.12 deg | 31.0 m |
| 10 deg | 9.54 deg | 0.46 deg | 15.6 m |
| 20 deg | 17.68 deg | 2.32 deg | 7.9 m |
| 30 deg | 23.61 deg | 6.39 deg | 5.4 m |
| 40 deg | 27.57 deg | 12.43 deg | 3.5 m |

At small steer angles (highway driving), Ackermann vs. parallel steer makes negligible difference. The effect becomes important only at large steer angles (parking, tight turns).

## References

1. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 19: "Steering Geometry" -- Ackermann analysis.
2. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 6: "Low-Speed Turning."
3. Dixon, J.C. *Suspension Geometry and Computation*, Wiley, 2009. Chapter 8: "Steering."
4. Jazar, R.N. *Vehicle Dynamics: Theory and Application*, Springer, 2014. Chapter 7: "Steering Dynamics."
5. SAE J670 -- Vehicle Dynamics Terminology.
