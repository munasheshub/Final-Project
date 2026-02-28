using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/program")]
[Authorize]
public class ProgramsController(
    IProgramService ProgramService,
    ILogger<ProgramsController> logger)
    : ControllerBase
{
    private readonly ILogger<ProgramsController> _logger = logger;

    // ================= CREATE =================
    [HttpPost]
    [RequirePermission(Permission.ManagePrograms)]
    public async Task<IActionResult> CreateProgram(
        [FromBody] ProgramDto request,
        CancellationToken cancellationToken)
    {
        var result = await ProgramService.CreateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= GET BY ID =================
    [HttpGet("{id:int}")]
    [RequirePermission(Permission.ViewPrograms)]
    public async Task<IActionResult> GetByIdProgram(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await ProgramService.GetByIdAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= GET ALL =================
    [HttpGet]
    [RequirePermission(Permission.ViewPrograms)]
    public async Task<IActionResult> GetAllPrograms(
        CancellationToken cancellationToken)
    {
        var result = await ProgramService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= UPDATE =================
    [HttpPut]
    [RequirePermission(Permission.ManagePrograms)]
    public async Task<IActionResult> UpdateProgram(
        [FromBody] ProgramDto request,

        CancellationToken cancellationToken)
    {

        var result = await ProgramService.UpdateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= DELETE =================
    [HttpDelete("{id:int}")]
    [RequirePermission(Permission.ManagePrograms)]
    public async Task<IActionResult> DeleteProgram(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await ProgramService.DeleteAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }
}