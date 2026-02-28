using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Middleware;
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

    [HttpGet]
    [Authorize]
    [RequirePermission(Permission.ViewVerificationHistory)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetVerificationLogsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await verificationLogService.GetAllAsync(
            request,
            cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("mine")]
    [Authorize]
    [RequirePermission(Permission.VerifyCertificate)]
    public async Task<IActionResult> GetMyLogs(CancellationToken cancellationToken)
    {
        var account = HttpContext.Items["Account"] as User;
        if (account == null)
            return Unauthorized();

        var result = await verificationLogService.GetMyLogsAsync(
            account.Id,
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
