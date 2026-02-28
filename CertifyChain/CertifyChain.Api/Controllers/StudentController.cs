using CertiChain.Application.DTOs.Student;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;


[ApiController]
[Route("api/students")]
[Authorize]
public class StudentsController(
    IStudentService studentService,
    ILogger<StudentsController> logger)
    : ControllerBase
{

    // ================= CREATE =================
    [HttpPost]
    [RequirePermission(Permission.ManageStudents)]
    public async Task<IActionResult> Create(
        [FromBody] CreateStudentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await studentService.CreateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Data!.Id },
            result);
    }

    // ================= GET BY ID =================
    [HttpGet("{id:int}")]
    [RequirePermission(Permission.ViewStudents)]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await studentService.GetByIdAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= GET ALL =================
    [HttpGet]
    [RequirePermission(Permission.ViewStudents)]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await studentService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= UPDATE =================
    [HttpPut]
    [RequirePermission(Permission.ManageStudents)]
    public async Task<IActionResult> Update(
        [FromBody] UpdateStudentRequest request,

        CancellationToken cancellationToken)
    {

        var result = await studentService.UpdateAsync(request, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    // ================= DELETE =================
    [HttpDelete("{id:int}")]
    [RequirePermission(Permission.ManageStudents)]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await studentService.DeleteAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= GET BY STUDENT NUMBER =================
    [HttpGet("by-number/{studentNumber}")]
    [RequirePermission(Permission.ViewStudents)]
    public async Task<IActionResult> GetByStudentNumber(
        string studentNumber,
        CancellationToken cancellationToken)
    {
        var result = await studentService.GetByStudentNumberAsync(studentNumber, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    // ================= BULK UPLOAD =================
    [HttpPost("bulk-upload")]
    [RequirePermission(Permission.BulkUploadStudents)]
    public async Task<IActionResult> BulkUpload(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only CSV files are supported");

        try
        {
            using var stream = file.OpenReadStream();
            var result = await studentService.BulkUploadAsync(stream, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during bulk upload");
            return StatusCode(500, "An error occurred during bulk upload");
        }
    }
}