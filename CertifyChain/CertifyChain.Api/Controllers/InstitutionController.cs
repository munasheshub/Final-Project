using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/institution")]
[Authorize]
[Produces("application/json")]
public class InstitutionsController(
    IInstitutionService institutionService,
    ILogger<InstitutionsController> logger)
    : BaseController
{
    private readonly ILogger<InstitutionsController> _logger = logger;

    // ================= GET MY INSTITUTION =================
    [HttpGet("mine")]
    [RequirePermission(Permission.ManageInstitution)]
    [ProducesResponseType(typeof(ServiceResponse<InstitutionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
    [ProducesResponseType(typeof(ServiceResponse<InstitutionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
    [ProducesResponseType(typeof(ServiceResponse<InstitutionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
    [ProducesResponseType(typeof(ServiceResponse<List<InstitutionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllInstitutions(
        CancellationToken cancellationToken)
    {
        var result = await institutionService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= PUBLIC LIST (for AI scan picker) =================
    /// <summary>
    /// Public endpoint: Returns a minimal list of institutions (id + name) for the AI scan institution picker.
    /// </summary>
    [HttpGet("public-list")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicList(CancellationToken cancellationToken)
    {
        var result = await institutionService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
            return Ok(new { data = Array.Empty<object>() });

        var list = result.Data!.Select(i => new { id = i.Id, name = i.Name }).ToList();
        return Ok(new { data = list });
    }

    // ================= UPDATE =================
    [HttpPut]
    [RequirePermission(Permission.ManageInstitution)]
    [ProducesResponseType(typeof(ServiceResponse<InstitutionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
    [ProducesResponseType(typeof(ServiceResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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