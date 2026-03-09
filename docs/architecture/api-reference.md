# API Reference

## Base URL

```
http://localhost:5000/api
```

All endpoints return JSON. Authentication is via JWT Bearer token in the `Authorization` header where noted.

## Common Types

### Point3D

All point coordinates are in millimeters (mm) using the SAE J670 coordinate system (X forward, Y left, Z up).

```json
{
  "x": 0.0,
  "y": 625.0,
  "z": 330.0
}
```

### SuspensionCorner

Defines the geometry of one corner (e.g., front-left) of the suspension.

```json
{
  "upperArmInnerPivot": { "x": 0, "y": 300, "z": 350 },
  "upperArmOuterPivot": { "x": 0, "y": 625, "z": 330 },
  "lowerArmInnerPivot": { "x": 0, "y": 200, "z": 150 },
  "lowerArmOuterPivot": { "x": 0, "y": 700, "z": 130 },
  "tieRodInnerEnd": { "x": -50, "y": 280, "z": 140 },
  "tieRodOuterEnd": { "x": -50, "y": 650, "z": 130 },
  "springAttachmentArm": { "x": 0, "y": 400, "z": 150 },
  "springAttachmentChassis": { "x": 0, "y": 350, "z": 500 },
  "wheelCenter": { "x": 0, "y": 700, "z": 310 },
  "contactPatch": { "x": 0, "y": 720, "z": 0 }
}
```

### VehicleParameters

```json
{
  "wheelbase": 2700,
  "trackWidthFront": 1500,
  "trackWidthRear": 1480,
  "cgHeight": 500,
  "sprungMassFront": 600,
  "sprungMassRear": 550,
  "springRateFront": 40,
  "springRateRear": 35,
  "damperRateFront": 3.0,
  "damperRateRear": 2.5,
  "frontBrakeBias": 0.65
}
```

Units: lengths in mm, masses in kg, spring rates in N/mm, damper rates in N*s/mm.

---

## Endpoints

### Calculations

#### POST /api/calculations/analyze

Performs a full kinematic analysis of the given suspension geometry. Returns all calculated parameters.

**Request body:**

```json
{
  "frontLeft": { /* SuspensionCorner */ },
  "frontRight": { /* SuspensionCorner */ },
  "rearLeft": { /* SuspensionCorner */ },
  "rearRight": { /* SuspensionCorner */ },
  "vehicle": { /* VehicleParameters */ },
  "travelRange": {
    "bumpMm": 80,
    "reboundMm": 80,
    "stepMm": 2
  }
}
```

**Response (200 OK):**

```json
{
  "frontLeft": {
    "instantCenter": {
      "y": 9771.4,
      "z": -232.9,
      "isParallel": false
    },
    "camberGain": {
      "rateAtDesignHeight": 0.00631,
      "curve": [
        { "travel": -80, "camberChange": -0.505 },
        { "travel": -78, "camberChange": -0.492 },
        ...
      ]
    },
    "scrubRadius": -28.75,
    "casterAngle": 7.13,
    "kpiAngle": 20.56,
    "mechanicalTrail": 26.25,
    "motionRatio": 0.586,
    "wheelRate": 13.75,
    "bumpSteer": {
      "curve": [
        { "travel": -80, "toeChange": 0.12 },
        ...
      ]
    }
  },
  "frontRight": { /* mirror of frontLeft for symmetric */ },
  "rearLeft": { /* similar structure */ },
  "rearRight": { /* similar structure */ },
  "front": {
    "rollCenterHeight": 19.4,
    "rollCenterLateralOffset": 0.0,
    "antiDive": 39.9,
    "antiLift": null
  },
  "rear": {
    "rollCenterHeight": 85.2,
    "rollCenterLateralOffset": 0.0,
    "antiSquat": 31.2,
    "antiLift": null
  },
  "rideFrequency": {
    "front": 1.08,
    "rear": 1.15,
    "ratio": 1.065
  },
  "dampingRatio": {
    "front": 0.254,
    "rear": 0.231
  },
  "ackermann": {
    "percentage": 72.5,
    "curveBySteerAngle": [
      { "innerAngle": 5, "idealOuterAngle": 4.88, "actualOuterAngle": 4.91 },
      ...
    ]
  }
}
```

#### POST /api/calculations/instant-center

Computes only the instant center for a single suspension corner.

**Request body:**

```json
{
  "upperInnerPivot": { "y": 300, "z": 350 },
  "upperOuterPivot": { "y": 625, "z": 330 },
  "lowerInnerPivot": { "y": 200, "z": 150 },
  "lowerOuterPivot": { "y": 700, "z": 130 }
}
```

**Response (200 OK):**

```json
{
  "y": 9771.4,
  "z": -232.9,
  "isParallel": false
}
```

#### POST /api/calculations/roll-center

Computes the roll center from left and right instant centers and track width.

**Request body:**

```json
{
  "leftInstantCenter": { "y": 9771.4, "z": -232.9 },
  "rightInstantCenter": { "y": -9771.4, "z": -232.9 },
  "trackWidth": 1500
}
```

**Response (200 OK):**

```json
{
  "height": 19.4,
  "lateralOffset": 0.0
}
```

#### POST /api/calculations/sweep

Computes kinematic parameters across a range of suspension travel.

**Request body:**

```json
{
  "corner": { /* SuspensionCorner */ },
  "vehicle": { /* VehicleParameters */ },
  "travelRange": {
    "bumpMm": 80,
    "reboundMm": 80,
    "stepMm": 2
  },
  "parameters": ["camberGain", "bumpSteer", "rollCenterHeight", "motionRatio"]
}
```

**Response (200 OK):**

```json
{
  "travelPoints": [-80, -78, -76, ...],
  "camberGain": [-0.505, -0.492, -0.480, ...],
  "bumpSteer": [0.12, 0.11, 0.10, ...],
  "rollCenterHeight": [45.2, 42.1, 39.5, ...],
  "motionRatio": [0.612, 0.608, 0.603, ...]
}
```

---

### Projects

All project endpoints require authentication.

#### GET /api/projects

List all projects for the authenticated user.

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Track Day Car Front Suspension",
    "description": "Double wishbone front, optimized for camber gain",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-02-20T14:22:00Z"
  }
]
```

#### GET /api/projects/{id}

Get a single project with full geometry data.

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Track Day Car Front Suspension",
  "description": "Double wishbone front, optimized for camber gain",
  "frontLeft": { /* SuspensionCorner */ },
  "frontRight": { /* SuspensionCorner */ },
  "rearLeft": { /* SuspensionCorner */ },
  "rearRight": { /* SuspensionCorner */ },
  "vehicle": { /* VehicleParameters */ },
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-20T14:22:00Z"
}
```

#### POST /api/projects

Create a new project.

**Request body:**

```json
{
  "name": "New Suspension Design",
  "description": "Initial geometry exploration",
  "frontLeft": { /* SuspensionCorner */ },
  "frontRight": { /* SuspensionCorner */ },
  "rearLeft": { /* SuspensionCorner */ },
  "rearRight": { /* SuspensionCorner */ },
  "vehicle": { /* VehicleParameters */ }
}
```

**Response (201 Created):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "New Suspension Design",
  "createdAt": "2026-03-03T09:00:00Z"
}
```

#### PUT /api/projects/{id}

Update an existing project.

**Request body:** Same as POST.

**Response (200 OK):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "updatedAt": "2026-03-03T10:15:00Z"
}
```

#### DELETE /api/projects/{id}

Delete a project.

**Response (204 No Content)**

---

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request body:**

```json
{
  "email": "engineer@example.com",
  "password": "SecurePassword123!",
  "displayName": "Jane Engineer"
}
```

**Response (201 Created):**

```json
{
  "userId": "user-uuid",
  "email": "engineer@example.com",
  "displayName": "Jane Engineer"
}
```

#### POST /api/auth/login

Authenticate and receive a JWT token.

**Request body:**

```json
{
  "email": "engineer@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-03-04T09:00:00Z",
  "userId": "user-uuid",
  "displayName": "Jane Engineer"
}
```

#### POST /api/auth/refresh

Refresh an expiring JWT token.

**Request header:** `Authorization: Bearer <current-token>`

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-03-04T09:00:00Z"
}
```

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred.",
    "details": [
      {
        "field": "frontLeft.upperArmInnerPivot.y",
        "message": "Value must be between -2000 and 2000 mm."
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input parameters |
| 400 | `CALCULATION_ERROR` | Geometry produces degenerate result (e.g., parallel arms) |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 403 | `FORBIDDEN` | User does not own this resource |
| 404 | `NOT_FOUND` | Project or resource not found |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
