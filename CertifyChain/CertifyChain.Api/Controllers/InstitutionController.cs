using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/institution")]
[Authorize]
public class InstitutionsController(
    IInstitutionService institutionService,
    ILogger<InstitutionsController> logger)
    : BaseController
{
    private readonly ILogger<InstitutionsController> _logger = logger;

    // ================= GET MY INSTITUTION =================
    [HttpGet("mine")]
    [RequirePermission(Permission.ManageInstitution)]
    public async Task<IActionResult> GetMyInstitution(
        CancellationToken cancellationToken)
    {
        if (Account == null)
            return Unauthorized();

        var result = await institutionService.GetByTenantIdAsync(
            Account.TenantId, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= CREATE =================
    [HttpPost]
    [RequirePermission(Permission.ManageInstitution)]
    public async Task<IActionResult> CreateInstitution(
        [FromBody] CreateInstitutionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await institutionService.CreateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= GET BY ID =================
    [HttpGet("{id:int}")]
    [RequirePermission(Permission.ManageInstitution)]
    public async Task<IActionResult> GetByIdInstitution(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await institutionService.GetByIdAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= GET ALL =================
    [HttpGet]
    [RequirePermission(Permission.ManageInstitution)]
    public async Task<IActionResult> GetAllInstitutions(
        CancellationToken cancellationToken)
    {
        var result = await institutionService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= UPDATE =================
    [HttpPut]
    [RequirePermission(Permission.ManageInstitution)]
    public async Task<IActionResult> UpdateInstitution(
        [FromBody] UpdateInstitutionRequest request,

        CancellationToken cancellationToken)
    {

        var result = await institutionService.UpdateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= DELETE =================
    [HttpDelete("{id:int}")]
    [RequirePermission(Permission.ManageInstitution)]
    public async Task<IActionResult> DeleteInstitution(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await institutionService.DeleteAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }
}