using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/verification-logs")]
public class VerificationLogsController(
    IVerificationLogService verificationLogService)
    : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(
        [FromBody] CreateVerificationLogRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var result = await verificationLogService.CreateAsync(
            request,
            ipAddress,
            userAgent,
            cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("by-hash/{certificateHash}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByCertificateHash(
        string certificateHash,
        CancellationToken cancellationToken)
    {
        var result = await verificationLogService.GetByCertificateHashAsync(
            certificateHash,
            cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("by-certificate/{certificateId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByCertificateId(
        int certificateId,
        CancellationToken cancellationToken)
    {
        var result = await verificationLogService.GetByCertificateIdAsync(
            certificateId,
            cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}
