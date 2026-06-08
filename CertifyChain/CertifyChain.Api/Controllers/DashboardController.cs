using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects.Dashboard;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CertifyChain.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
[RequirePermission(Permission.ViewDashboard)]
[Produces("application/json")]
public class DashboardController(
    IDashboardService dashboardService,
    ApplicationDbContext dbContext,
    ILogger<DashboardController> logger)
    : ControllerBase
{
    // GET /api/dashboard/metrics
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(ServiceResponse<DashboardMetricsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetMetricsAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/activity-chart
    [HttpGet("activity-chart")]
    [ProducesResponseType(typeof(ServiceResponse<ActivityChartDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetActivityChart(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetActivityChartAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/verification-sources
    [HttpGet("verification-sources")]
    [ProducesResponseType(typeof(ServiceResponse<VerificationSourcesDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetVerificationSources(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetVerificationSourcesAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/monthly-overview
    [HttpGet("monthly-overview")]
    [ProducesResponseType(typeof(ServiceResponse<MonthlyOverviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMonthlyOverview(CancellationToken cancellationToken)
    {
        var result = await dashboardService.GetMonthlyOverviewAsync(cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/recent-activity?limit=10
    [HttpGet("recent-activity")]
    [ProducesResponseType(typeof(ServiceResponse<List<RecentActivityDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetRecentActivity(
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetRecentActivityAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/recent-certificates?limit=5
    [HttpGet("recent-certificates")]
    [ProducesResponseType(typeof(ServiceResponse<List<RecentCertificateDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetRecentCertificates(
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetRecentCertificatesAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/verification-requests?limit=10
    [HttpGet("verification-requests")]
    [ProducesResponseType(typeof(ServiceResponse<List<VerificationRequestDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetVerificationRequests(
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetVerificationRequestsAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // GET /api/dashboard/top-programs?limit=5
    [HttpGet("top-programs")]
    [ProducesResponseType(typeof(ServiceResponse<List<TopProgramDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTopPrograms(
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await dashboardService.GetTopProgramsAsync(limit, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    // ─── AI FRAUD DETECTION STATS ───

    /// <summary>
    /// Returns AI fraud detection statistics for the dashboard widget.
    /// Includes total scanned, fraud detected, flagged, cleared, average score, and daily scan counts.
    /// </summary>
    [HttpGet("ai-stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAiStats(CancellationToken cancellationToken)
    {
        var logs = dbContext.AiDetectionLogs.AsQueryable();

        var totalScanned = await logs.CountAsync(cancellationToken);
        var fraudDetected = await logs.CountAsync(x => x.FraudProbability >= 0.70, cancellationToken);
        var flaggedForReview = await logs.CountAsync(x => x.FraudProbability >= 0.30 && x.FraudProbability < 0.70, cancellationToken);
        var cleared = await logs.CountAsync(x => x.FraudProbability < 0.30, cancellationToken);
        var averageScore = totalScanned > 0
            ? await logs.AverageAsync(x => x.FraudProbability, cancellationToken)
            : 0.0;

        // Daily scans for last 7 days
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
        var dailyScans = await logs
            .Where(x => x.CreatedAt >= sevenDaysAgo)
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .OrderBy(x => x.date)
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            totalScanned,
            fraudDetected,
            flaggedForReview,
            cleared,
            averageScore = Math.Round(averageScore, 3),
            dailyScans
        });
    }
}
