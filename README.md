# Suspension Designer

A web-based engineering tool for designing and analyzing double-wishbone (SLA) suspension geometry. Provides real-time kinematic calculations, interactive 3D visualization, and parametric analysis of suspension characteristics.

## Tech Stack

- **Backend**: .NET 8 / ASP.NET Core / Entity Framework Core / PostgreSQL
- **Frontend**: React 19 / TypeScript / Three.js / Recharts / Zustand / Tailwind CSS
- **Infrastructure**: Docker / docker-compose

## Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Start the database

```bash
docker compose -f docker-compose.dev.yml up postgres -d
```

### 2. Start the API

```bash
cd src/api
dotnet run --project SuspensionDesigner.API
```

The API starts at `http://localhost:5000` with Swagger UI at `/swagger`.

### 3. Start the frontend

```bash
cd src/web
npm install
npm run dev
```

The frontend starts at `http://localhost:5173` and proxies API requests to the backend.

### Full stack via Docker

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`

## Calculations

All calculations use the SAE J670 coordinate system (X forward, Y left, Z up) with millimeters and degrees.

| Calculation | Description |
|-------------|-------------|
| Instant Center | Front-view IC from wishbone pivot axes |
| Roll Center Height | From IC to contact patch intersection at centerline |
| KPI / Caster | Steering axis angles in front and side views |
| Scrub Radius / Trail | Steering axis ground intercept offsets |
| Camber Curve | Camber gain vs wheel travel |
| Roll Center Migration | RC height vs body roll angle |
| Motion Ratio | Spring displacement / wheel displacement |
| Wheel Rate / Frequency | Effective rate and natural frequency |
| Anti-Dive / Anti-Squat | Load transfer geometry percentages |
| Ackermann | Steering geometry analysis |

## Project Structure

```
src/
  api/
    SuspensionDesigner.Core/          # Domain entities, value objects
    SuspensionDesigner.Application/   # Calculators, handlers, DTOs
    SuspensionDesigner.Infrastructure/ # EF Core, repositories, JWT
    SuspensionDesigner.API/           # ASP.NET Core controllers
    SuspensionDesigner.Tests/         # xUnit tests
  web/
    src/
      components/    # React UI (viewer, editors, charts, results)
      stores/        # Zustand state management
      services/      # API client
      types/         # TypeScript interfaces
docs/
  architecture/      # System design docs
  calculations/      # Engineering calculation references
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/designs` | List user's designs |
| POST | `/api/v1/designs` | Create design |
| PUT | `/api/v1/designs/{id}` | Update design |
| DELETE | `/api/v1/designs/{id}` | Delete design |
| POST | `/api/v1/calculations/geometry` | Static geometry results |
| POST | `/api/v1/calculations/camber-curve` | Camber vs travel curve |
| POST | `/api/v1/calculations/roll-center` | Roll center vs roll angle |
| POST | `/api/v1/calculations/dynamics` | Motion ratio, frequency, damping |
| POST | `/api/v1/calculations/anti-geometry` | Anti-dive, anti-squat |
| POST | `/api/v1/calculations/steering` | Ackermann analysis |
| GET | `/api/health` | Health check |
