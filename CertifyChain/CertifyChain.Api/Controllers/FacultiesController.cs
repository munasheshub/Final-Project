using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/faculties")]
[Authorize]
[Produces("application/json")]
public class FacultiesController(
    IFacultyService facultyService,
    ILogger<FacultiesController> logger)
    : ControllerBase
{
    private readonly ILogger<FacultiesController> _logger = logger;

    // ================= CREATE =================
    [HttpPost]
    [RequirePermission(Permission.ManageFaculties)]
    [ProducesResponseType(typeof(ServiceResponse<FacultyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateFaculty(
        [FromBody] CreateFacultyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await facultyService.CreateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= GET BY ID =================
    [HttpGet("{id:int}")]
    [RequirePermission(Permission.ViewFaculties)]
    [ProducesResponseType(typeof(ServiceResponse<FacultyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByIdFaculty(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await facultyService.GetByIdAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= GET ALL =================
    [HttpGet]
    [RequirePermission(Permission.ViewFaculties)]
    [ProducesResponseType(typeof(ServiceResponse<List<FacultyDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllFaculties(
        CancellationToken cancellationToken)
    {
        var result = await facultyService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= GET BY INSTITUTION =================
    [HttpGet("institution/{institutionId:int}")]
    [RequirePermission(Permission.ViewFaculties)]
    [ProducesResponseType(typeof(ServiceResponse<List<FacultyDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByInstitution(
        int institutionId,
        CancellationToken cancellationToken)
    {
        var result = await facultyService.GetByInstitutionIdAsync(institutionId, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= UPDATE =================
    [HttpPut("{id:int}")]
    [RequirePermission(Permission.ManageFaculties)]
    [ProducesResponseType(typeof(ServiceResponse<FacultyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateFaculty(
        int id,
        [FromBody] UpdateFacultyRequest request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await facultyService.UpdateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= DELETE =================
    [HttpDelete("{id:int}")]
    [RequirePermission(Permission.ManageFaculties)]
    [ProducesResponseType(typeof(ServiceResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteFaculty(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await facultyService.DeleteAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }
}
