namespace CertifyChain.Infrastructure.MultiTenancy;

// Infrastructure/MultiTenancy/ITenantService.cs
public interface ITenantService
{
    string? GetCurrentTenantId();
    Task<Tenant?> GetCurrentTenantAsync();
    Task<Tenant?> GetTenantByIdAsync(string tenantId);
    Task<Tenant?> GetTenantBySubdomainAsync(string subdomain);
}





