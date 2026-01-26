using CertifyChain.Data.Persistence;
using CertifyChain.Infrastructure.MultiTenancy;
using CertifyChain.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Domain.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly ApplicationDbContext _context;

    public TenantRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Tenant?> GetTenantBySubDomainAsync(string subdomain)
    {
        return await _context.Tenants.FirstOrDefaultAsync(t => t.Subdomain == subdomain);
    }

    public async Task<Tenant?> GetTenantByIdAsync(string tenantId)
    {
        return await _context.Tenants.FirstOrDefaultAsync(t => t.Id ==  Guid.Parse(tenantId));
    }
}