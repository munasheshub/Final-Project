using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
[RequirePermission(Permission.ViewDashboard)]
public class DashboardController(
    IDashboardService dashboardService,
    ILogger<DashboardController> logger)
    : ControllerBase
{
    // GET /api/dashboard/metrics
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetMetricsAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/activity-chart
    [HttpGet("activity-chart")]
    public async Task<IActionResult> GetActivityChart(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetActivityChartAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/verification-sources
    [HttpGet("verification-sources")]
    public async Task<IActionResult> GetVerificationSources(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetVerificationSourcesAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/monthly-overview
    [HttpGet("monthly-overview")]
    public async Task<IActionResult> GetMonthlyOverview(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetMonthlyOverviewAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/recent-activity?limit=10
    [HttpGet("recent-activity")]
    public async Task<IActionResult> GetRecentActivity(
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetRecentActivityAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/recent-certificates?limit=5
    [HttpGet("recent-certificates")]
    public async Task<IActionResult> GetRecentCertificates(
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetRecentCertificatesAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/verification-requests?limit=10
    [HttpGet("verification-requests")]
    public async Task<IActionResult> GetVerificationRequests(
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetVerificationRequestsAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/top-programs?limit=5
    [HttpGet("top-programs")]
    public async Task<IActionResult> GetTopPrograms(
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetTopProgramsAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }
}
