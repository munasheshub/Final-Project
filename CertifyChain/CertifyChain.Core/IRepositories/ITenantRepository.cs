using CertifyChain.Infrastructure.MultiTenancy;

namespace CertifyChain.Infrastructure.Repositories;

public interface ITenantRepository
{
    Task<Tenant?> GetTenantBySubDomainAsync(string subdomain);
    Task<Tenant?> GetTenantByIdAsync(string tenantId);
}