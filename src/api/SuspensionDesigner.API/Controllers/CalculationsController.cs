using MediatR;
using Microsoft.AspNetCore.Mvc;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;

namespace SuspensionDesigner.API.Controllers;

[ApiController]
[Route("api/v1/calculations")]
public class CalculationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CalculationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("geometry")]
    public async Task<ActionResult<GeometryResultDto>> CalculateGeometry(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateGeometryRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("camber-curve")]
    public async Task<ActionResult<IReadOnlyList<CamberCurvePointDto>>> CalculateCamberCurve(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateCamberCurveRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("roll-center")]
    public async Task<ActionResult<IReadOnlyList<RollCenterMigrationPointDto>>> CalculateRollCenter(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateRollCenterRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("dynamics")]
    public async Task<ActionResult<DynamicsResultDto>> CalculateDynamics(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateDynamicsRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("anti-geometry")]
    public async Task<ActionResult<AntiGeometryResultDto>> CalculateAntiGeometry(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateAntiGeometryRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("steering")]
    public async Task<ActionResult<SteeringResultDto>> CalculateSteering(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateSteeringRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("bump-steer")]
    public async Task<ActionResult<IReadOnlyList<BumpSteerPointDto>>> CalculateBumpSteer(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var result = await _mediator.Send(new CalculateBumpSteerRequest(design), ct);
        return Ok(result);
    }

    [HttpPost("sweep")]
    public async Task<ActionResult<SweepResultDto>> CalculateSweep(
        [FromBody] SuspensionDesignDto design, CancellationToken ct)
    {
        var geometry = await _mediator.Send(new CalculateGeometryRequest(design), ct);
        var camberCurve = await _mediator.Send(new CalculateCamberCurveRequest(design), ct);
        var rollCenter = await _mediator.Send(new CalculateRollCenterRequest(design), ct);
        var dynamics = await _mediator.Send(new CalculateDynamicsRequest(design), ct);
        var antiGeometry = await _mediator.Send(new CalculateAntiGeometryRequest(design), ct);
        var steering = await _mediator.Send(new CalculateSteeringRequest(design), ct);
        var bumpSteer = await _mediator.Send(new CalculateBumpSteerRequest(design), ct);

        return Ok(new SweepResultDto(geometry, camberCurve, rollCenter, dynamics, antiGeometry, steering, bumpSteer));
    }
}
