using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.IRepositories;

public interface ICertificateRepository : IRepository<Certificate>
{
    Task<Certificate?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<Certificate?> GetByCertHashWithDetailsAsync(string hash, CancellationToken cancellationToken = default);
    Task<Certificate?> GetByCertificateNumberAsync(string certificateNumber, CancellationToken cancellationToken = default);
    Task<Certificate?> GetByVerificationCodeAsync(string verificationCode, CancellationToken cancellationToken = default);
    Task<PaginatedResult<Certificate>> GetPaginatedAsync(
        int pageNumber, 
        int pageSize, 
        string? searchTerm = null,
        CertificateStatus? status = null,
        QualificationType? qualificationType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? sortBy = null,
        bool sortDescending = true,
        CancellationToken cancellationToken = default);
    Task<List<Certificate>> GetByStudentIdAsync(int studentId, CancellationToken cancellationToken = default);
    Task<List<Certificate>> GetByStatusAsync(CertificateStatus status, CancellationToken cancellationToken = default);
    Task<bool> CertificateNumberExistsAsync(string certificateNumber, CancellationToken cancellationToken = default);
    Task<int> CountByStatusAsync(CertificateStatus status, CancellationToken cancellationToken = default);
    Task<int> CountByDateRangeAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
}