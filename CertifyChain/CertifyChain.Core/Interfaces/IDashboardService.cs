using CertifyChain.Infrastructure.DataTransferObjects.Dashboard;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;

public interface IDashboardService
{
    Task<ServiceResponse<DashboardMetricsDto>> GetMetricsAsync(CancellationToken cancellationToken = default);
    Task<ServiceResponse<ActivityChartDto>> GetActivityChartAsync(CancellationToken cancellationToken = default);
    Task<ServiceResponse<VerificationSourcesDto>> GetVerificationSourcesAsync(CancellationToken cancellationToken = default);
    Task<ServiceResponse<MonthlyOverviewDto>> GetMonthlyOverviewAsync(CancellationToken cancellationToken = default);
    Task<ServiceResponse<List<RecentActivityDto>>> GetRecentActivityAsync(int limit = 10, CancellationToken cancellationToken = default);
    Task<ServiceResponse<List<RecentCertificateDto>>> GetRecentCertificatesAsync(int limit = 5, CancellationToken cancellationToken = default);
    Task<ServiceResponse<List<VerificationRequestDto>>> GetVerificationRequestsAsync(int limit = 10, CancellationToken cancellationToken = default);
    Task<ServiceResponse<List<TopProgramDto>>> GetTopProgramsAsync(int limit = 5, CancellationToken cancellationToken = default);
}
