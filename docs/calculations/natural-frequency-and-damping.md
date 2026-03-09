# Natural Frequency and Damping Ratio Calculation

## Definition

### Ride Frequency (Undamped Natural Frequency)

The **ride frequency** (or undamped natural frequency) is the frequency at which the sprung mass oscillates on the suspension springs in the absence of damping. It is the fundamental parameter governing ride quality and transient response:

$$f_n = \frac{1}{2\pi} \sqrt{\frac{K_{wheel}}{m_{sprung}}}$$

### Damping Ratio

The **damping ratio** ($\zeta$) describes how quickly oscillations decay after a disturbance. It is the ratio of the actual damping coefficient to the critical damping coefficient:

$$\zeta = \frac{C_{wheel}}{2\sqrt{K_{wheel} \cdot m_{sprung}}}$$

## Physical Interpretation

### Ride Frequency

The ride frequency is the single most important parameter for ride comfort. It determines how the vehicle responds to road undulations:

- **Low frequency (0.8 - 1.2 Hz)**: Soft ride, large body motions, good isolation from road inputs. Typical of luxury cars.
- **Medium frequency (1.2 - 1.8 Hz)**: Balanced ride and handling. Typical of sports sedans.
- **High frequency (2.0 - 3.5 Hz)**: Firm ride, minimal body motion, fast transient response. Typical of race cars.

The human body is most sensitive to vertical accelerations in the 4 - 8 Hz range (resonance of internal organs). Ride frequencies below ~1.5 Hz keep the vehicle's primary response well below this sensitive range.

### Front-to-Rear Frequency Split

It is common practice to set the rear ride frequency slightly higher (10 - 20%) than the front. This ensures that when the vehicle hits a bump, the rear catches up to the front motion, producing a **flat ride** (minimal pitch oscillation):

$$f_{rear} \approx 1.1 \times f_{front} \quad \text{to} \quad 1.2 \times f_{front}$$

### Damping Ratio

The damping ratio determines the character of the transient response:

| Damping Ratio ($\zeta$) | Behavior | Application |
|-------------------------|----------|-------------|
| 0 | Undamped, perpetual oscillation | Theoretical only |
| 0.1 - 0.2 | Heavily underdamped, many oscillations | Not used |
| 0.2 - 0.4 | Underdamped, comfortable but floaty | Luxury cars |
| 0.3 - 0.5 | Moderately underdamped, balanced | Most passenger cars |
| 0.5 - 0.7 | Lightly underdamped, controlled | Sports cars |
| 0.7 - 1.0 | Near critically damped, very controlled | Race cars |
| 1.0 | Critically damped, no overshoot | Theoretical target |
| > 1.0 | Overdamped, sluggish return | Generally avoided |

### Damped Natural Frequency

The actual oscillation frequency in the presence of damping is:

$$f_d = f_n \sqrt{1 - \zeta^2}$$

For typical automotive damping ratios (0.2 - 0.5), $f_d$ is within 3 - 13% of $f_n$.

## Mathematical Derivation

### Step 1: Quarter-Car Model

The simplest useful ride model is the **quarter-car model**: a sprung mass supported by a spring and damper, riding on an unsprung mass and tire spring:

```
    ┌─────────────┐
    │  m_sprung   │   Sprung mass (body)
    └──────┬──────┘
           │
         ══╪══  K_wheel (suspension spring, at wheel)
           │
         ──┤──  C_wheel (damper, at wheel)
           │
    ┌──────┴──────┐
    │ m_unsprung  │   Unsprung mass (wheel, hub, brake)
    └──────┬──────┘
           │
         ══╪══  K_tire (tire spring)
           │
    ───────────────   Road surface
```

The equation of motion for the sprung mass (ignoring tire compliance for the primary ride mode):

$$m_s \ddot{z}_s + C_w (\dot{z}_s - \dot{z}_u) + K_w (z_s - z_u) = 0$$

### Step 2: Undamped Natural Frequency

Setting $C_w = 0$ and assuming harmonic motion $z_s = Z e^{j\omega t}$:

$$-m_s \omega^2 + K_w = 0$$

$$\omega_n = \sqrt{\frac{K_w}{m_s}}$$

$$\boxed{f_n = \frac{1}{2\pi}\sqrt{\frac{K_{wheel}}{m_{sprung}}} \quad \text{[Hz]}}$$

Or equivalently in terms of static deflection:

$$f_n = \frac{1}{2\pi}\sqrt{\frac{g}{\delta_{static}}}$$

where $\delta_{static} = \frac{m_s \cdot g}{K_w}$ is the static spring deflection.

### Step 3: Critical Damping Coefficient

Critical damping is the minimum damping that prevents oscillation:

$$C_{crit} = 2\sqrt{K_w \cdot m_s} = 2 m_s \omega_n$$

### Step 4: Damping Ratio

$$\boxed{\zeta = \frac{C_{wheel}}{C_{crit}} = \frac{C_{wheel}}{2\sqrt{K_{wheel} \cdot m_{sprung}}}}$$

### Step 5: Wheel-Rate Damping Coefficient

The damper is also subject to the motion ratio. The effective damping at the wheel is:

$$C_{wheel} = C_{damper} \cdot MR^2$$

where $C_{damper}$ is the damper coefficient and $MR$ is the motion ratio (see [motion-ratio-and-wheel-rate.md](./motion-ratio-and-wheel-rate.md)).

### Step 6: Static Deflection Method

An alternative (and often more intuitive) way to express ride frequency uses static deflection:

$$\delta_{static} = \frac{m_s \cdot g}{K_w} \quad \text{[mm]}$$

$$f_n = \frac{1}{2\pi}\sqrt{\frac{g}{\delta_{static}}} \approx \frac{1}{2\pi}\sqrt{\frac{9810}{\delta_{static}}}$$

where $g$ is in mm/s^2 (9810 mm/s^2). This gives a useful rule of thumb:

| $f_n$ (Hz) | $\delta_{static}$ (mm) |
|------------|----------------------|
| 1.0 | 248 |
| 1.2 | 173 |
| 1.5 | 110 |
| 2.0 | 62 |
| 2.5 | 40 |
| 3.0 | 28 |

## Input Parameters

| Parameter | Symbol | Units | Description | Typical Range |
|-----------|--------|-------|-------------|---------------|
| Wheel rate | $K_{wheel}$ | N/mm | Effective spring rate at the wheel | 8 - 100 |
| Sprung mass (corner) | $m_s$ | kg | Sprung mass supported at this corner | 200 - 500 |
| Damper coefficient | $C_{damper}$ | N*s/mm | Linear damper rate | 1 - 10 |
| Motion ratio | $MR$ | -- | Damper motion ratio | 0.4 - 1.0 |

## Output Parameters

| Parameter | Symbol | Units | Description |
|-----------|--------|-------|-------------|
| Ride frequency | $f_n$ | Hz | Undamped natural frequency |
| Damping ratio | $\zeta$ | -- | Ratio of actual to critical damping |
| Critical damping | $C_{crit}$ | N*s/mm | Critical damping coefficient at wheel |
| Static deflection | $\delta_{static}$ | mm | Static spring deflection under sprung mass |
| Damped frequency | $f_d$ | Hz | Damped natural frequency |

## Validation Test Case

**Input**:

| Parameter | Value |
|-----------|-------|
| $K_{wheel}$ | 13.75 N/mm (from motion-ratio validation) |
| $m_s$ | 300 kg (corner sprung mass) |
| $C_{damper}$ | 3.0 N*s/mm |
| $MR$ | 0.586 |

**Calculation**:

**Ride frequency**:
$$\omega_n = \sqrt{\frac{13.75}{300}} = \sqrt{0.04583} = 0.2141 \text{ rad/s ... wait}$$

Units: $K_{wheel} = 13.75$ N/mm $= 13750$ N/m, $m_s = 300$ kg

$$\omega_n = \sqrt{\frac{13750}{300}} = \sqrt{45.833} = 6.770 \text{ rad/s}$$

$$f_n = \frac{6.770}{2\pi} = 1.077 \text{ Hz}$$

**Static deflection**:
$$\delta_{static} = \frac{300 \times 9.81}{13.75} = \frac{2943}{13.75} = 214.0 \text{ mm}$$

**Critical damping**:
$$C_{crit} = 2\sqrt{13750 \times 300} = 2\sqrt{4125000} = 2 \times 2031.0 = 4062.0 \text{ N*s/m} = 4.062 \text{ N*s/mm}$$

**Damping at wheel**:
$$C_{wheel} = 3.0 \times (0.586)^2 = 3.0 \times 0.3434 = 1.030 \text{ N*s/mm}$$

**Damping ratio**:
$$\zeta = \frac{1.030}{4.062} = 0.254$$

**Damped frequency**:
$$f_d = 1.077 \times \sqrt{1 - 0.254^2} = 1.077 \times \sqrt{0.9355} = 1.077 \times 0.9672 = 1.042 \text{ Hz}$$

**Result**:
- Ride frequency = **1.08 Hz**
- Damping ratio = **0.254**
- Static deflection = **214 mm**
- Damped frequency = **1.04 Hz**

This represents a soft, comfort-oriented suspension (1.08 Hz is at the luxury car end) with relatively light damping (0.254 is underdamped but reasonable for a comfort setup). The 214 mm static deflection confirms the soft spring.

## Typical Values

| Vehicle Type | $f_n$ (Hz) | $\zeta$ | Notes |
|-------------|------------|---------|-------|
| Luxury sedan | 0.9 - 1.2 | 0.20 - 0.35 | Maximum isolation |
| Family sedan | 1.1 - 1.4 | 0.25 - 0.40 | Balanced |
| Sports sedan | 1.3 - 1.8 | 0.30 - 0.50 | Firmer, more controlled |
| Sports car | 1.5 - 2.2 | 0.40 - 0.60 | Responsive |
| Formula car | 2.5 - 3.5 | 0.50 - 0.80 | Maximum control |
| Rally car | 2.0 - 4.0 | 0.40 - 0.70 | High travel, firm |

## References

1. Gillespie, T.D. *Fundamentals of Vehicle Dynamics*, SAE International, 1992. Chapter 6: "Ride" -- Primary reference for ride frequency and damping.
2. Milliken, W.F. & Milliken, D.L. *Race Car Vehicle Dynamics*, SAE International, 1995. Chapter 16: "Ride."
3. Dixon, J.C. *The Shock Absorber Handbook*, Wiley, 2007. Chapters 2-3: "Damper Characteristics."
4. ISO 2631-1:1997, "Mechanical vibration and shock -- Evaluation of human exposure to whole-body vibration."
