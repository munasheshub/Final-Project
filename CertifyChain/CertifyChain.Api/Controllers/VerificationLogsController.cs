using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/verification-logs")]
[Produces("application/json")]
public class VerificationLogsController(
    IVerificationLogService verificationLogService)
    : BaseController
{
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ServiceResponse<VerificationLogResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateVerificationLogRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();
        var account = Account;

        var result = await verificationLogService.CreateAsync(
            request,
            ipAddress,
            userAgent,
            account?.Role,
            cancellationToken);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet]
    [Authorize]
    [RequirePermission(Permission.ViewVerificationHistory)]
    [ProducesResponseType(typeof(ServiceResponse<List<VerificationLogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
    [ProducesResponseType(typeof(ServiceResponse<List<VerificationLogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyLogs(CancellationToken cancellationToken)
    {
        var account = Account;
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
    [ProducesResponseType(typeof(ServiceResponse<List<VerificationLogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
    [ProducesResponseType(typeof(ServiceResponse<List<VerificationLogResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
