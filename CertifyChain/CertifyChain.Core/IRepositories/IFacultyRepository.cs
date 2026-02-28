using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;

namespace CertifyChain.Infrastructure.IRepositories;

public interface IFacultyRepository : IRepository<Faculty>
{
    Task<List<Faculty>> GetByInstitutionIdAsync(int institutionId, CancellationToken cancellationToken = default);
}
