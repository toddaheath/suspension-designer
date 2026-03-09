# Development Setup Guide

## Prerequisites

Ensure the following tools are installed on your development machine:

| Tool | Version | Purpose |
|------|---------|---------|
| .NET SDK | 8.0.100+ | Backend build and run |
| Node.js | 20 LTS+ | Frontend build and run |
| npm | 10+ | Frontend package management |
| Docker | 24+ | Database and containerized dev |
| Docker Compose | 2.20+ | Multi-container orchestration |
| Git | 2.40+ | Source control |

### Verify installations

```bash
dotnet --version     # Should output 8.0.xxx
node --version       # Should output v20.x.x or higher
npm --version        # Should output 10.x.x or higher
docker --version     # Should output 24.x.x or higher
docker compose version  # Should output 2.20.x or higher
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<org>/suspension-designer.git
cd suspension-designer
```

### 2. Start Infrastructure (PostgreSQL)

```bash
docker compose up -d postgres
```

This starts a PostgreSQL 16 instance on port 5432 with:
- Database: `suspension_designer`
- Username: `postgres`
- Password: defined in `.env` (see below)

### 3. Configure Environment

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Key variables in `.env`:

```
POSTGRES_PASSWORD=your_secure_password
CONNECTION_STRING=Host=localhost;Port=5432;Database=suspension_designer;Username=postgres;Password=your_secure_password
JWT_SECRET=your_jwt_secret_at_least_32_chars_long
JWT_ISSUER=suspension-designer
```

### 4. Restore and Build Backend

```bash
# Restore NuGet packages
dotnet restore

# Build the solution
dotnet build

# Run database migrations
dotnet ef database update --project src/SuspensionDesigner.Infrastructure --startup-project src/SuspensionDesigner.Api
```

### 5. Run Backend

```bash
cd src/SuspensionDesigner.Api
dotnet run
```

The API will start on `http://localhost:5000`. Verify by accessing `http://localhost:5000/api/health`.

### 6. Install Frontend Dependencies

In a separate terminal:

```bash
cd src/web
npm install
```

### 7. Run Frontend

```bash
cd src/web
npm run dev
```

The development server will start on `http://localhost:5173` with hot module replacement (HMR).

### 8. Verify Everything Works

1. Open `http://localhost:5173` in your browser.
2. The default suspension geometry should render in the 3D viewer.
3. Adjust a pivot point in the property editor -- the 3D view and calculation results should update.
4. Check the API health endpoint: `http://localhost:5000/api/health`.

## Running with Docker Compose (Full Stack)

To run the entire stack in containers:

```bash
docker compose up --build
```

This starts:
- PostgreSQL on port 5432
- .NET API on port 5000
- Vite dev server on port 5173

## Running Tests

### Backend Tests

```bash
# Run all tests
dotnet test

# Run with verbose output
dotnet test --verbosity normal

# Run a specific test project
dotnet test tests/SuspensionDesigner.Domain.Tests

# Run tests matching a filter
dotnet test --filter "InstantCenter"
```

### Frontend Tests

```bash
cd src/web

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Project Structure

```
suspension-designer/
├── src/
│   ├── SuspensionDesigner.Domain/           # Core domain: entities + calculations
│   ├── SuspensionDesigner.Application/      # App services, DTOs
│   ├── SuspensionDesigner.Infrastructure/   # EF Core, repositories
│   ├── SuspensionDesigner.Api/              # ASP.NET Core API host
│   └── web/                                 # React + Vite frontend
├── tests/
│   ├── SuspensionDesigner.Domain.Tests/     # Calculation unit tests
│   └── SuspensionDesigner.Api.Tests/        # API integration tests
├── docs/                                    # Documentation (you are here)
├── docker-compose.yml
├── global.json                              # .NET SDK version pin
└── .gitignore
```

## Common Development Tasks

### Adding a New Calculation

1. Create a new calculator class in `src/SuspensionDesigner.Domain/Calculations/`.
2. The calculator should be a static class with a pure `Calculate` method.
3. Add the result type to the `CalculationResults` aggregate.
4. Write unit tests in `tests/SuspensionDesigner.Domain.Tests/` with known validation values.
5. Wire the calculator into `CalculationService` in the Application layer.
6. Add the endpoint in the API layer (if exposing individually).
7. Document the calculation in `docs/calculations/`.

### Modifying the Database Schema

```bash
# After changing entity models, create a migration:
dotnet ef migrations add <MigrationName> \
  --project src/SuspensionDesigner.Infrastructure \
  --startup-project src/SuspensionDesigner.Api

# Apply the migration:
dotnet ef database update \
  --project src/SuspensionDesigner.Infrastructure \
  --startup-project src/SuspensionDesigner.Api
```

### Updating Frontend Dependencies

```bash
cd src/web
npm update
npm audit fix
```

## Troubleshooting

### Backend won't start

- Check that PostgreSQL is running: `docker compose ps`
- Verify the connection string in `.env` matches the Docker PostgreSQL config
- Ensure port 5432 is not in use by another process
- Run migrations: `dotnet ef database update ...`

### Frontend won't start

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (must be 20+)
- Ensure port 5173 is not in use

### 3D viewer is blank

- Check browser console for WebGL errors
- Ensure the browser supports WebGL 2 (most modern browsers do)
- Try a hard refresh (Ctrl+Shift+R)

### Calculations return unexpected results

- Verify the coordinate system: SAE J670 (X forward, Y left, Z up)
- All lengths must be in millimeters, angles in degrees
- Check that left/right geometry is mirrored correctly (Y-coordinates have opposite signs)
- Run the domain unit tests to verify calculator correctness: `dotnet test tests/SuspensionDesigner.Domain.Tests`

## IDE Recommendations

| IDE | Extensions |
|-----|-----------|
| VS Code | C# Dev Kit, ESLint, Prettier, Tailwind CSS IntelliSense |
| JetBrains Rider | Built-in .NET and TypeScript support |
| Visual Studio | Default .NET workload + Node.js development tools |

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_PASSWORD` | Yes | -- | PostgreSQL password |
| `CONNECTION_STRING` | Yes | -- | Full Npgsql connection string |
| `JWT_SECRET` | Yes | -- | JWT signing key (min 32 chars) |
| `JWT_ISSUER` | No | `suspension-designer` | JWT issuer claim |
| `ASPNETCORE_ENVIRONMENT` | No | `Development` | .NET environment |
| `VITE_API_URL` | No | `http://localhost:5000/api` | API base URL for frontend |
