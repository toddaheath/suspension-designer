using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuspensionDesigner.Application.Commands;
using SuspensionDesigner.Application.DTOs;
using SuspensionDesigner.Application.Handlers;

namespace SuspensionDesigner.API.Controllers;

[ApiController]
[Route("api/v1/designs")]
[Authorize]
public class DesignsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DesignsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SuspensionDesignDto>>> List(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var result = await _mediator.Send(new ListDesignsRequest(userId), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SuspensionDesignDto>> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDesignRequest(id), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<SuspensionDesignDto>> Create(
        [FromBody] CreateDesignCommand command, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var cmd = command with { UserId = userId };
        var result = await _mediator.Send(cmd, ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SuspensionDesignDto>> Update(
        Guid id, [FromBody] UpdateDesignCommand command, CancellationToken ct)
    {
        var cmd = command with { Id = id };
        var result = await _mediator.Send(cmd, ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteDesignRequest(id), ct);
        if (!result) return NotFound();
        return NoContent();
    }
}
