using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.Repositories;

namespace CertifyChain.Core.IRepositories;


public interface IUnitOfWork : IDisposable
{
    ICertificateRepository Certificates { get; }
    IStudentRepository Students { get; }
    IUserRepository Users { get; }
    
    IInstitutionRepository Institutions { get; }
    IProgramRepository Programs { get; }
    //IVerificationLogRepository VerificationLogs { get; }
    //IAuditLogRepository AuditLogs { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}