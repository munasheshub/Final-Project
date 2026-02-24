using CertifyChain.Data.Persistence;
using CertifyChain.Infrastructure.MultiTenancy;
using CertifyChain.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CertifyChain.Domain.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly ApplicationDbContext _context;
    private readonly DbSet<Tenant> _tenants;

    public TenantRepository(ApplicationDbContext context)
    {
        _context = context;
        _tenants = context.Tenants;
    }

    public async Task<Tenant?> GetTenantBySubDomainAsync(string subdomain)
    {
        return await _tenants.FirstOrDefaultAsync(t => t.Subdomain == subdomain);
    }

    public async Task<Tenant?> GetTenantBySubdomainAsync(string subdomain)
    {
        return await GetTenantBySubDomainAsync(subdomain);
    }

    public async Task<Tenant?> GetTenantByIdAsync(string tenantId)
    {
        return await _tenants.FirstOrDefaultAsync(t => t.Id == Guid.Parse(tenantId));
    }

    public async Task<Tenant?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        // Note: Tenant uses Guid as ID, not int
        throw new NotSupportedException("Use GetTenantByIdAsync with string tenantId instead");
    }

    public async Task<Tenant?> GetByGuidAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _tenants
            .AsNoTracking()
            .Include(t => t.Institution)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<List<Tenant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _tenants
            .AsNoTracking()
            .Include(t => t.Institution)
            .ToListAsync(cancellationToken);
    }

    public async Task<Tenant> AddAsync(Tenant entity, CancellationToken cancellationToken = default)
    {
        await _tenants.AddAsync(entity, cancellationToken);
        return entity;
    }

    public async Task<List<Tenant>> AddRangeAsync(List<Tenant> entities, CancellationToken cancellationToken = default)
    {
        await _tenants.AddRangeAsync(entities, cancellationToken);
        return entities;
    }

    public async Task UpdateAsync(Tenant entity, CancellationToken cancellationToken = default)
    {
        _tenants.Update(entity);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Tenant entity, CancellationToken cancellationToken = default)
    {
        _tenants.Remove(entity);
        await Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        // Note: Tenant uses Guid as ID
        throw new NotSupportedException("Use GetTenantByIdAsync with string tenantId instead");
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _tenants.CountAsync(cancellationToken);
    }
}