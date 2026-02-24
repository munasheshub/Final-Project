using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.IRepositories;

public interface IVerificationLogRepository : IRepository<VerificationLog>
{
    Task<List<VerificationLog>> GetByCertificateHashAsync(string certificateHash, CancellationToken cancellationToken = default);
    Task<List<VerificationLog>> GetByCertificateIdAsync(int certificateId, CancellationToken cancellationToken = default);
}
