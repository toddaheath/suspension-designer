# API Reference

## Base URL

```
http://localhost:5000/api/v1
```

All endpoints return JSON. Authentication is via JWT Bearer token in the `Authorization` header where noted.

## Common Types

### Point3D

All point coordinates are in millimeters (mm) using the SAE J670 coordinate system (X forward, Y left, Z up).

```json
{ "x": 0.0, "y": 625.0, "z": 330.0 }
```

### SuspensionDesignDto

Flat object containing 12 hardpoints (as Point3D) and vehicle parameters. Used as the request body for all calculation endpoints and design CRUD.

```json
{
  "name": "My Design",
  "suspensionType": 0,
  "axlePosition": 0,
  "upperWishboneFrontPivot": { "x": 100, "y": 250, "z": 300 },
  "upperWishboneRearPivot": { "x": -100, "y": 250, "z": 300 },
  "upperBallJoint": { "x": 0, "y": 600, "z": 280 },
  "lowerWishboneFrontPivot": { "x": 120, "y": 200, "z": 150 },
  "lowerWishboneRearPivot": { "x": -120, "y": 200, "z": 150 },
  "lowerBallJoint": { "x": 0, "y": 620, "z": 130 },
  "tieRodInner": { "x": -80, "y": 220, "z": 160 },
  "tieRodOuter": { "x": -80, "y": 610, "z": 155 },
  "springDamperUpper": { "x": 0, "y": 350, "z": 400 },
  "springDamperLower": { "x": 0, "y": 400, "z": 150 },
  "pushrodWheelEnd": { "x": 0, "y": 500, "z": 140 },
  "pushrodRockerEnd": { "x": 0, "y": 300, "z": 350 },
  "trackWidth": 1200,
  "wheelbase": 1550,
  "sprungMass": 200,
  "unsprungMass": 25,
  "springRate": 25000,
  "dampingCoefficient": 1500,
  "rideHeight": 50,
  "tireRadius": 228,
  "cgHeight": 300,
  "frontBrakeProportion": 0.6
}
```

Units: lengths in mm, masses in kg, spring rates in N/mm, damping in N*s/mm.

---

## Calculation Endpoints

All calculation endpoints accept a `SuspensionDesignDto` as the request body.

### POST /api/v1/calculations/geometry

Static geometry results for the given hardpoints.

**Response (200 OK):**

```json
{
  "instantCenter": { "x": 0, "y": 5000, "z": -100 },
  "rollCenterHeight": 25.4,
  "kingpinInclinationDegrees": 7.13,
  "casterAngleDegrees": 5.21,
  "scrubRadius": -28.75,
  "mechanicalTrail": 26.25
}
```

### POST /api/v1/calculations/camber-curve

Camber angle change vs wheel travel (-50mm to +50mm).

**Response (200 OK):**

```json
[
  { "wheelTravel": -50, "camberAngleDegrees": -0.85 },
  { "wheelTravel": -45, "camberAngleDegrees": -0.76 },
  ...
]
```

### POST /api/v1/calculations/roll-center

Roll center height vs body roll angle (0 to 5 degrees).

**Response (200 OK):**

```json
[
  { "rollAngleDegrees": 0, "rollCenterHeight": 25.4 },
  { "rollAngleDegrees": 0.5, "rollCenterHeight": 24.8 },
  ...
]
```

### POST /api/v1/calculations/dynamics

Static dynamics parameters: motion ratio, wheel rate, natural frequency, damping.

**Response (200 OK):**

```json
{
  "motionRatio": 0.586,
  "wheelRate": 8587.5,
  "naturalFrequency": 1.08,
  "dampingRatio": 0.254,
  "criticalDamping": 2950.0
}
```

### POST /api/v1/calculations/anti-geometry

Anti-dive and anti-squat percentages.

**Response (200 OK):**

```json
{
  "antiDivePercent": 39.9,
  "antiSquatPercent": 31.2
}
```

### POST /api/v1/calculations/steering

Ackermann percentage across steering angles 1-30 degrees.

**Response (200 OK):**

```json
{
  "ackermannCurve": [
    { "steeringAngleDegrees": 1, "ackermannPercent": 72.5 },
    { "steeringAngleDegrees": 2, "ackermannPercent": 71.8 },
    ...
  ]
}
```

### POST /api/v1/calculations/bump-steer

Bump steer (toe angle change) vs wheel travel (-50mm to +50mm).

**Response (200 OK):**

```json
[
  { "wheelTravel": -50, "toeAngleDegrees": 0.12 },
  { "wheelTravel": -45, "toeAngleDegrees": 0.10 },
  ...
]
```

### POST /api/v1/calculations/sweep

Full parametric sweep returning all calculations in one response.

**Response (200 OK):**

```json
{
  "geometry": { /* GeometryResult */ },
  "camberCurve": [ /* CamberCurvePoint[] */ ],
  "rollCenterMigration": [ /* RollCenterMigrationPoint[] */ ],
  "dynamics": { /* DynamicsResult */ },
  "antiGeometry": { /* AntiGeometryResult */ },
  "steering": { /* SteeringResult */ },
  "bumpSteer": [ /* BumpSteerPoint[] */ ]
}
```

---

## Design Endpoints

All design endpoints require authentication (`Authorization: Bearer <token>`).

### GET /api/v1/designs

List all designs for the authenticated user.

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Track Day Car Front Suspension",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-02-20T14:22:00Z"
  }
]
```

### GET /api/v1/designs/{id}

Get a single design with full geometry data.

### POST /api/v1/designs

Create a new design. Request body: `SuspensionDesignDto`.

**Response (201 Created):** Returns the created design with ID.

### PUT /api/v1/designs/{id}

Update an existing design. Request body: `SuspensionDesignDto`.

### DELETE /api/v1/designs/{id}

Delete a design. **Response (204 No Content)**

---

## Authentication Endpoints

### POST /api/v1/auth/register

```json
{
  "email": "engineer@example.com",
  "name": "Jane Engineer",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "user-uuid", "email": "engineer@example.com", "name": "Jane Engineer" }
}
```

### POST /api/v1/auth/login

```json
{
  "email": "engineer@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):** Same as register.

### POST /api/v1/auth/refresh

Requires `Authorization: Bearer <current-token>`.

**Response (200 OK):** Same as register/login (new token + user).

---

## Health Check

### GET /api/health

No authentication required.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-09T12:00:00Z"
}
```

---

## Error Responses

| HTTP Status | Description |
|-------------|-------------|
| 400 | Validation error (invalid input) |
| 401 | Missing or invalid JWT token |
| 404 | Design not found |
| 409 | Conflict (e.g., email already registered) |
| 500 | Internal server error |
