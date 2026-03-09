# System Architecture Overview

## Introduction

The Suspension Designer is a web-based engineering tool for designing and analyzing double-wishbone (SLA) suspension geometry. It provides real-time kinematic calculations, interactive 3D visualization, and parametric analysis of suspension characteristics.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   React UI    │  │  Three.js 3D │  │  Recharts / Charts │   │
│  │  Components   │  │   Viewer     │  │                    │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘   │
│         │                  │                    │               │
│  ┌──────┴──────────────────┴────────────────────┴───────────┐  │
│  │                    Zustand Store                           │  │
│  │  (Suspension geometry state, calculation results, UI)      │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │                  API Client (fetch)                        │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/JSON
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                    API Gateway (ASP.NET Core)                    │
│                         │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │              REST API Controllers                         │  │
│  │   /api/suspension    /api/calculations    /api/projects   │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │                Application Services                       │  │
│  │   SuspensionService   CalculationService   ProjectService │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │                    Domain Layer                            │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │  Entities    │  │ Calculations │  │  Value Objects  │  │  │
│  │  │  Suspension  │  │ IC, RC, etc. │  │  Point3D, etc.  │  │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Infrastructure                           │  │
│  │   PostgreSQL (via EF Core)    Identity / Auth             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | .NET 8 | Application runtime |
| Web framework | ASP.NET Core Minimal APIs | HTTP API layer |
| Domain modeling | C# records, value objects | Suspension geometry and calculations |
| Database | PostgreSQL | Persistent storage for projects |
| ORM | Entity Framework Core 8 | Data access |
| Auth | ASP.NET Identity + JWT | Authentication and authorization |
| Testing | xUnit + FluentAssertions | Unit and integration tests |

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| UI framework | React 18 + TypeScript | Component-based UI |
| Build tool | Vite | Fast development server and bundling |
| State management | Zustand | Lightweight reactive state |
| 3D visualization | Three.js (raw) | WebGL-based suspension viewer |
| Charts | Recharts | Kinematic plots and graphs |
| Styling | Tailwind CSS | Utility-first CSS |
| HTTP client | Fetch API | API communication |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker + docker-compose | Development and deployment |
| Database | PostgreSQL 16 | Data persistence |
| CI/CD | GitHub Actions | Automated testing and deployment |

## Data Flow

### 1. User Edits Suspension Geometry

```
User Input (point coordinates)
    │
    ▼
React Property Editor
    │
    ▼
Zustand Store (local state update)
    │
    ├──▶ Three.js Viewer (immediate visual update)
    │
    ▼
API Client → POST /api/calculations/analyze
    │
    ▼
CalculationService (server-side)
    │
    ├── InstantCenterCalculator
    ├── RollCenterCalculator
    ├── CamberGainCalculator
    ├── AntiDiveCalculator
    ├── BumpSteerCalculator
    └── ... (all calculators)
    │
    ▼
CalculationResults (JSON response)
    │
    ▼
Zustand Store (results update)
    │
    ├──▶ Charts (kinematic plots update)
    └──▶ Results Panel (numerical display update)
```

### 2. Save / Load Project

```
Save:  Zustand Store → POST /api/projects → EF Core → PostgreSQL
Load:  GET /api/projects/{id} → EF Core → PostgreSQL → Zustand Store
```

## Domain Model

### Core Entities

```
SuspensionDesign
├── Name, Description, CreatedAt, UpdatedAt
├── FrontSuspension: SuspensionCorner
│   ├── UpperArmInnerPivot: Point3D
│   ├── UpperArmOuterPivot: Point3D
│   ├── LowerArmInnerPivot: Point3D
│   ├── LowerArmOuterPivot: Point3D
│   ├── TieRodInnerEnd: Point3D
│   ├── TieRodOuterEnd: Point3D
│   ├── SpringAttachment: Point3D
│   ├── DamperAttachment: Point3D
│   ├── WheelCenter: Point3D
│   ├── ContactPatch: Point3D
│   └── SteeringArmEnd: Point3D
├── RearSuspension: SuspensionCorner
│   └── (same structure)
├── VehicleParameters
│   ├── Wheelbase: double (mm)
│   ├── TrackWidthFront: double (mm)
│   ├── TrackWidthRear: double (mm)
│   ├── CGHeight: double (mm)
│   ├── SprungMassFront: double (kg)
│   ├── SprungMassRear: double (kg)
│   ├── SpringRateFront: double (N/mm)
│   ├── SpringRateRear: double (N/mm)
│   ├── DamperRateFront: double (N*s/mm)
│   ├── DamperRateRear: double (N*s/mm)
│   └── FrontBrakeBias: double (0-1)
└── CalculationResults (computed, not persisted)
```

### Calculation Pipeline

Each calculator is a pure function: geometry in, results out. No side effects, no state.

```
Calculators (pure functions):
│
├── InstantCenterCalculator.Calculate(corner) → InstantCenterResult
├── RollCenterCalculator.Calculate(left, right, track) → RollCenterResult
├── CamberGainCalculator.Calculate(corner, travel[]) → CamberGainCurve
├── ScrubRadiusCalculator.Calculate(corner) → ScrubRadiusResult
├── CasterKpiCalculator.Calculate(corner) → CasterKpiResult
├── AntiDiveCalculator.Calculate(corner, vehicle) → AntiDiveResult
├── MotionRatioCalculator.Calculate(corner) → MotionRatioResult
├── NaturalFrequencyCalculator.Calculate(corner, mass, spring) → FrequencyResult
├── BumpSteerCalculator.Calculate(corner, travel[]) → BumpSteerCurve
└── AckermannCalculator.Calculate(steering, vehicle) → AckermannResult
```

## Project Structure

```
suspension-designer/
├── src/
│   ├── SuspensionDesigner.Domain/           # Domain entities, value objects
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   └── Calculations/                    # Pure calculation functions
│   ├── SuspensionDesigner.Application/      # Application services
│   │   ├── Services/
│   │   └── DTOs/
│   ├── SuspensionDesigner.Infrastructure/   # EF Core, external services
│   │   ├── Data/
│   │   └── Repositories/
│   ├── SuspensionDesigner.Api/              # ASP.NET Core API host
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Program.cs
│   └── web/                                 # React frontend
│       ├── src/
│       │   ├── components/                  # React components
│       │   │   ├── viewer/                  # Three.js 3D viewer
│       │   │   ├── editors/                 # Property editors
│       │   │   ├── charts/                  # Recharts kinematic plots
│       │   │   └── layout/                  # App shell, navigation
│       │   ├── stores/                      # Zustand stores
│       │   ├── api/                         # API client
│       │   ├── types/                       # TypeScript type definitions
│       │   └── App.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── tailwind.config.js
├── tests/
│   ├── SuspensionDesigner.Domain.Tests/     # Unit tests for calculations
│   └── SuspensionDesigner.Api.Tests/        # Integration tests
├── docker-compose.yml
├── global.json
└── docs/                                    # This documentation
```

## Key Design Decisions

1. **Calculations are server-side**: All engineering calculations run on the .NET backend. This ensures precision, testability, and a single source of truth for the math. The frontend never duplicates calculation logic.

2. **Pure calculation functions**: Calculators are stateless, pure functions with no dependencies. This makes them easy to test with known validation values from engineering references.

3. **Zustand over Redux**: Zustand provides simpler, less boilerplate state management. Suspension geometry state is inherently a single tree, fitting Zustand's model well.

4. **Raw Three.js over React-Three-Fiber**: Direct Three.js gives full control over the rendering pipeline, which is needed for custom suspension link rendering, interactive point manipulation, and overlay annotations.

5. **SAE J670 coordinate system**: Consistent use of X-forward, Y-left, Z-up throughout the entire stack (domain, API, frontend, 3D viewer) to avoid coordinate confusion.

6. **Millimeters and degrees**: All internal units are mm for length and degrees for angles. Conversion to other unit systems happens only at the display layer.
