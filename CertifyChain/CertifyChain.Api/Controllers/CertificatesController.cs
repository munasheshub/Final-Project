using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Blockchain.Dtos;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Api.Controllers;

[ApiController]
[Route("api/certificates")]
[Authorize]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificateService;

    public CertificatesController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    // ================= CREATE =================

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        [FromForm] CreateCertificateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.CreateAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    // ================= GET =================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByIdAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("by-number/{certificateNumber}")]
    public async Task<IActionResult> GetByCertificateNumber(
        string certificateNumber,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByCertificateNumberAsync(
            certificateNumber,
            cancellationToken);

        return ToActionResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetCertificatesRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetAllAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<IActionResult> GetByStudent(
        int studentId,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GetByStudentIdAsync(studentId, cancellationToken);
        return ToActionResult(result);
    }

    // ================= UPDATE =================

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCertificateRequest request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _certificateService.UpdateAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    // ================= REVOKE =================

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke(
        [FromBody] RevokeCertificateRequest request,
        CancellationToken cancellationToken)
    {
        var user = HttpContext.Items["User"] as User
                   ?? throw new UnauthorizedAccessException();

        var result = await _certificateService.RevokeAsync(
            request,
            user,
            cancellationToken);

        return ToActionResult(result);
    }

    // ================= DELETE =================

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.DeleteAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    // ================= FILES =================

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.DownloadAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return File(
            result.Data!,
            "application/pdf",
            $"certificate-{id}.pdf");
    }

    [HttpGet("{id:int}/qr")]
    public async Task<IActionResult> GenerateQrCode(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _certificateService.GenerateQrCodeAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return File(
            result.Data!,
            "image/png",
            $"certificate-{id}-qr.png");
    }

    // ================= BATCH =================

   

    // ================= HELPER =================

    private IActionResult ToActionResult<T>(ServiceResponse<T> response)
    {
        if (response.IsSuccess)
            return Ok(response);

        return BadRequest(response);
    }
}