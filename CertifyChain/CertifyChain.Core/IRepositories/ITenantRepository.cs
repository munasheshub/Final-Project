using CertifyChain.Core.IRepositories;
using CertifyChain.Infrastructure.MultiTenancy;

namespace CertifyChain.Infrastructure.Repositories;

public interface ITenantRepository : IRepository<Tenant>
{
    Task<Tenant?> GetTenantBySubDomainAsync(string subdomain);
    Task<Tenant?> GetTenantByIdAsync(string tenantId);
    Task<Tenant?> GetTenantBySubdomainAsync(string subdomain);
}