using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.DataTransferObjects.Dashboard;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Services;

public class DashboardService(
    IUnitOfWork unitOfWork,
    ILogger<DashboardService> logger)
    : IDashboardService
{
    // ================= METRICS =================

    public async Task<ServiceResponse<DashboardMetricsDto>> GetMetricsAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var previousMonthStart = currentMonthStart.AddMonths(-1);

            var certificates = await unitOfWork.Certificates.GetAllAsync(cancellationToken);
            var verificationLogs = await unitOfWork.VerificationLogs.GetAllAsync(cancellationToken);

            var totalCertificates = certificates.Count;
            var activeCertificates = certificates.Count(c => c.Status == CertificateStatus.Verified);
            var revokedCertificates = certificates.Count(c => c.Status == CertificateStatus.Revoked);
            var pendingVerifications = certificates.Count(c => c.Status == CertificateStatus.PendingVerification);
            var fraudDetected = certificates.Count(c => c.Status == CertificateStatus.Flagged);
            var totalVerifications = verificationLogs.Count;

            var currentMonthCerts = certificates.Count(c => c.CreationDate >= currentMonthStart);
            var prevMonthCerts = certificates.Count(
                c => c.CreationDate >= previousMonthStart && c.CreationDate < currentMonthStart);

            var currentMonthVerifications = verificationLogs.Count(v => v.VerifiedAt >= currentMonthStart);
            var prevMonthVerifications = verificationLogs.Count(
                v => v.VerifiedAt >= previousMonthStart && v.VerifiedAt < currentMonthStart);

            // Gas calculation from Certificate.GasUsed (wei -> ETH approximation)
            var totalGasUsed = certificates
                .Where(c => c.GasUsed.HasValue)
                .Sum(c => c.GasUsed!.Value);
            var gasSpentEth = Math.Round(totalGasUsed * 0.000000001 * 20, 3); // gas * gwei price estimate

            var currentMonthGas = certificates
                .Where(c => c.GasUsed.HasValue && c.CreationDate >= currentMonthStart)
                .Sum(c => c.GasUsed!.Value);
            var prevMonthGas = certificates
                .Where(c => c.GasUsed.HasValue && c.CreationDate >= previousMonthStart && c.CreationDate < currentMonthStart)
                .Sum(c => c.GasUsed!.Value);

            var metrics = new DashboardMetricsDto
            {
                TotalCertificates = totalCertificates,
                TotalCertificatesChange = CalculateChange(currentMonthCerts, prevMonthCerts),
                ActiveCertificates = activeCertificates,
                ActiveCertificatesChange = CalculateChange(currentMonthCerts, prevMonthCerts),
                RevokedCertificates = revokedCertificates,
                RevokedCertificatesChange = 0,
                TotalVerifications = totalVerifications,
                TotalVerificationsChange = CalculateChange(currentMonthVerifications, prevMonthVerifications),
                PendingVerifications = pendingVerifications,
                PendingVerificationsChange = 0,
                FraudDetected = fraudDetected,
                FraudDetectedChange = 0,
                GasSpentEth = gasSpentEth,
                GasSpentChange = CalculateChange((int)currentMonthGas, (int)prevMonthGas)
            };

            return ServiceResponse<DashboardMetricsDto>.Success(metrics, "Metrics retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving dashboard metrics");
            return ServiceResponse<DashboardMetricsDto>.Failure("Failed to retrieve metrics");
        }
    }

    // ================= ACTIVITY CHART =================

    public async Task<ServiceResponse<ActivityChartDto>> GetActivityChartAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var sixMonthsAgo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);

            var certificates = await unitOfWork.Certificates.GetAllAsync(cancellationToken);
            var verificationLogs = await unitOfWork.VerificationLogs.GetAllAsync(cancellationToken);

            var issuedByMonth = certificates
                .Where(c => c.CreationDate >= sixMonthsAgo)
                .GroupBy(c => new { c.CreationDate.Year, c.CreationDate.Month })
                .ToDictionary(g => (g.Key.Year, g.Key.Month), g => g.Count());

            var verifiedByMonth = verificationLogs
                .Where(v => v.VerifiedAt >= sixMonthsAgo)
                .GroupBy(v => new { v.VerifiedAt.Year, v.VerifiedAt.Month })
                .ToDictionary(g => (g.Key.Year, g.Key.Month), g => g.Count());

            var result = BuildMonthlyChart(sixMonthsAgo, 6, issuedByMonth, verifiedByMonth);

            return ServiceResponse<ActivityChartDto>.Success(result, "Activity chart data retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving activity chart data");
            return ServiceResponse<ActivityChartDto>.Failure("Failed to retrieve activity chart data");
        }
    }

    // ================= VERIFICATION SOURCES =================

    public async Task<ServiceResponse<VerificationSourcesDto>> GetVerificationSourcesAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var verificationLogs = await unitOfWork.VerificationLogs.GetAllAsync(cancellationToken);
            var total = verificationLogs.Count;

            VerificationSourcesDto sources;
            if (total == 0)
            {
                sources = new VerificationSourcesDto
                {
                    Employers = 0,
                    EducationalInstitutions = 0,
                    Government = 0,
                    Others = 0
                };
            }
            else
            {
                sources = new VerificationSourcesDto
                {
                    Employers = (int)Math.Round(
                        (double)verificationLogs.Count(v => v.VerifierType == VerifierType.Employer) / total * 100),
                    EducationalInstitutions = (int)Math.Round(
                        (double)verificationLogs.Count(v => v.VerifierType == VerifierType.EducationalInstitution) / total * 100),
                    Government = (int)Math.Round(
                        (double)verificationLogs.Count(v => v.VerifierType == VerifierType.Government) / total * 100),
                    Others = (int)Math.Round(
                        (double)verificationLogs.Count(v => v.VerifierType == VerifierType.Other) / total * 100)
                };
            }

            return ServiceResponse<VerificationSourcesDto>.Success(
                sources, "Verification sources retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving verification sources");
            return ServiceResponse<VerificationSourcesDto>.Failure("Failed to retrieve verification sources");
        }
    }

    // ================= MONTHLY OVERVIEW =================

    public async Task<ServiceResponse<MonthlyOverviewDto>> GetMonthlyOverviewAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var sixMonthsAgo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);

            var certificates = await unitOfWork.Certificates.GetAllAsync(cancellationToken);

            var issuedByMonth = certificates
                .Where(c => c.CreationDate >= sixMonthsAgo)
                .GroupBy(c => new { c.CreationDate.Year, c.CreationDate.Month })
                .ToDictionary(g => (g.Key.Year, g.Key.Month), g => g.Count());

            var revokedByMonth = certificates
                .Where(c => c.RevokedAt != null && c.RevokedAt >= sixMonthsAgo)
                .GroupBy(c => new { c.RevokedAt!.Value.Year, c.RevokedAt!.Value.Month })
                .ToDictionary(g => (g.Key.Year, g.Key.Month), g => g.Count());

            var labels = new List<string>();
            var issued = new List<int>();
            var revoked = new List<int>();

            for (var i = 0; i < 6; i++)
            {
                var month = sixMonthsAgo.AddMonths(i);
                labels.Add(month.ToString("MMM"));
                issued.Add(issuedByMonth.GetValueOrDefault((month.Year, month.Month)));
                revoked.Add(revokedByMonth.GetValueOrDefault((month.Year, month.Month)));
            }

            var result = new MonthlyOverviewDto
            {
                Labels = labels,
                Issued = issued,
                Revoked = revoked
            };

            return ServiceResponse<MonthlyOverviewDto>.Success(result, "Monthly overview retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving monthly overview");
            return ServiceResponse<MonthlyOverviewDto>.Failure("Failed to retrieve monthly overview");
        }
    }

    // ================= RECENT ACTIVITY =================

    public async Task<ServiceResponse<List<RecentActivityDto>>> GetRecentActivityAsync(
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificates = await unitOfWork.Certificates.GetAllAsync(cancellationToken);
            var verificationLogs = await unitOfWork.VerificationLogs.GetAllAsync(cancellationToken);

            var certActivities = certificates
                .OrderByDescending(c => c.CreationDate)
                .Take(limit)
                .Select(c => new RecentActivityDto
                {
                    User = c.Student != null
                        ? $"{c.Student.FirstName} {c.Student.LastName}"
                        : "System",
                    Action = c.Status == CertificateStatus.Revoked
                        ? "Revoked certificate"
                        : "Issued certificate",
                    CertNumber = c.CertificateNumber,
                    Timestamp = c.Status == CertificateStatus.Revoked && c.RevokedAt.HasValue
                        ? c.RevokedAt.Value
                        : c.CreationDate,
                    Type = c.Status == CertificateStatus.Revoked ? "revoked" : "issued"
                });

            var verificationActivities = verificationLogs
                .OrderByDescending(v => v.VerifiedAt)
                .Take(limit)
                .Select(v => new RecentActivityDto
                {
                    User = v.Creator != null
                        ? $"{v.Creator.FirstName} {v.Creator.LastName}"
                        : v.IpAddress ?? "Unknown",
                    Action = v.isSuccess ? "Verified certificate" : "Failed verification",
                    CertNumber = v.Certificate?.CertificateNumber ?? v.CertificateHash,
                    Timestamp = v.VerifiedAt,
                    Type = "verified"
                });

            var combined = certActivities
                .Concat(verificationActivities)
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .ToList();

            return ServiceResponse<List<RecentActivityDto>>.Success(
                combined, "Recent activity retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving recent activity");
            return ServiceResponse<List<RecentActivityDto>>.Failure("Failed to retrieve recent activity");
        }
    }

    // ================= RECENT CERTIFICATES =================

    public async Task<ServiceResponse<List<RecentCertificateDto>>> GetRecentCertificatesAsync(
        int limit = 5,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var certificates = await unitOfWork.Certificates.GetAllAsync(cancellationToken);

            var result = certificates
                .OrderByDescending(c => c.CreationDate)
                .Take(limit)
                .Select(c =>
                {
                    var firstName = c.Student?.FirstName ?? "";
                    var lastName = c.Student?.LastName ?? "";
                    var fullName = $"{firstName} {lastName}".Trim();
                    var initials = string.Concat(
                        firstName.Length > 0 ? firstName[..1] : "",
                        lastName.Length > 0 ? lastName[..1] : "");

                    return new RecentCertificateDto
                    {
                        Id = c.Id,
                        StudentName = fullName,
                        ProgramName = c.ProgramName,
                        CertificateNumber = c.CertificateNumber,
                        Status = c.Status switch
                        {
                            CertificateStatus.Verified => "active",
                            CertificateStatus.Revoked => "revoked",
                            _ => "pending"
                        },
                        IssuedDate = c.CreationDate,
                        StudentInitials = initials
                    };
                }).ToList();

            return ServiceResponse<List<RecentCertificateDto>>.Success(
                result, "Recent certificates retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving recent certificates");
            return ServiceResponse<List<RecentCertificateDto>>.Failure("Failed to retrieve recent certificates");
        }
    }

    // ================= VERIFICATION REQUESTS =================

    public async Task<ServiceResponse<List<VerificationRequestDto>>> GetVerificationRequestsAsync(
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var verificationLogs = await unitOfWork.VerificationLogs.GetAllAsync(cancellationToken);

            var result = verificationLogs
                .OrderByDescending(v => v.VerifiedAt)
                .Take(limit)
                .Select(v => new VerificationRequestDto
                {
                    CertificateNumber = v.Certificate?.CertificateNumber ?? v.CertificateHash,
                    VerifierName = v.Creator != null
                        ? $"{v.Creator.FirstName} {v.Creator.LastName}"
                        : v.IpAddress ?? "Unknown",
                    VerificationDate = v.VerifiedAt,
                    Status = v.isSuccess ? "verified" : "fraud"
                }).ToList();

            return ServiceResponse<List<VerificationRequestDto>>.Success(
                result, "Verification requests retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving verification requests");
            return ServiceResponse<List<VerificationRequestDto>>.Failure("Failed to retrieve verification requests");
        }
    }

    // ================= TOP PROGRAMS =================

    public async Task<ServiceResponse<List<TopProgramDto>>> GetTopProgramsAsync(
        int limit = 5,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var previousMonthStart = currentMonthStart.AddMonths(-1);

            var certificates = await unitOfWork.Certificates.GetAllAsync(cancellationToken);

            var result = certificates
                .GroupBy(c => c.ProgramName)
                .Select(g => new
                {
                    ProgramName = g.Key,
                    Total = g.Count(),
                    CurrentMonth = g.Count(c => c.CreationDate >= currentMonthStart),
                    PreviousMonth = g.Count(c =>
                        c.CreationDate >= previousMonthStart && c.CreationDate < currentMonthStart)
                })
                .OrderByDescending(x => x.Total)
                .Take(limit)
                .Select((p, index) => new TopProgramDto
                {
                    Rank = index + 1,
                    ProgramName = p.ProgramName,
                    CertificateCount = p.Total,
                    ChangePercentage = CalculateChange(p.CurrentMonth, p.PreviousMonth)
                }).ToList();

            return ServiceResponse<List<TopProgramDto>>.Success(
                result, "Top programs retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving top programs");
            return ServiceResponse<List<TopProgramDto>>.Failure("Failed to retrieve top programs");
        }
    }

    // ================= HELPERS =================

    private static double CalculateChange(int current, int previous)
    {
        if (previous == 0)
            return current > 0 ? 100 : 0;

        return Math.Round((double)(current - previous) / previous * 100, 1);
    }

    private static ActivityChartDto BuildMonthlyChart(
        DateTime startMonth,
        int months,
        Dictionary<(int Year, int Month), int> issued,
        Dictionary<(int Year, int Month), int> verified)
    {
        var labels = new List<string>();
        var issuedCounts = new List<int>();
        var verifiedCounts = new List<int>();

        for (var i = 0; i < months; i++)
        {
            var month = startMonth.AddMonths(i);
            labels.Add(month.ToString("MMM"));
            issuedCounts.Add(issued.GetValueOrDefault((month.Year, month.Month)));
            verifiedCounts.Add(verified.GetValueOrDefault((month.Year, month.Month)));
        }

        return new ActivityChartDto
        {
            Labels = labels,
            Issued = issuedCounts,
            Verified = verifiedCounts
        };
    }
}
