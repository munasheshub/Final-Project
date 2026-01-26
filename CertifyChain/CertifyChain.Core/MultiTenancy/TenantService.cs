
using CertifyChain.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;

namespace CertifyChain.Infrastructure.MultiTenancy;


public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    //private readonly ICacheService _cache;
    private readonly ITenantRepository _tenantRepository;
    
    public TenantService(
        IHttpContextAccessor httpContextAccessor,
        //ICacheService cache,
        ITenantRepository context)
    {
        _httpContextAccessor = httpContextAccessor;
        //_cache = cache;
        _tenantRepository = context;
    }
    
    public string? GetCurrentTenantId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;
        
        // 1. Check JWT claims
        var tenantIdClaim = httpContext.Items["TenantId"].ToString();
        if (!string.IsNullOrEmpty(tenantIdClaim))
            return tenantIdClaim;
        
        // 2. Check custom header
        if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerValue))
            return headerValue.ToString();
        
        // 3. Extract from subdomain
        var host = httpContext.Request.Host.Host;
        var subdomain = ExtractSubdomain(host);
        if (!string.IsNullOrEmpty(subdomain))
        {
            var tenant = GetTenantBySubdomainAsync(subdomain).GetAwaiter().GetResult();
            return tenant?.Id.ToString();
        }
        
        return null;
    }
    
    public async Task<Tenant?> GetCurrentTenantAsync()
    {
        var tenantId = GetCurrentTenantId();
        if (string.IsNullOrEmpty(tenantId)) return null;
        
        return await GetTenantByIdAsync(tenantId);
    }
    
    public async Task<Tenant?> GetTenantByIdAsync(string tenantId)
    {
        var cacheKey = $"tenant:{tenantId}";
        
        return await _tenantRepository.GetTenantByIdAsync(tenantId);
        
        // return await _cache.GetOrCreateAsync(cacheKey, async () =>
        // {
        //     return await _context.Tenants
        //         .Include(t => t.Institution)
        //         .FirstOrDefaultAsync(t => t.Id == tenantId);
        // }, TimeSpan.FromHours(1));
    }
    
    public async Task<Tenant?> GetTenantBySubdomainAsync(string subdomain)
    {
        var cacheKey = $"tenant:subdomain:{subdomain}";
        
        return await _tenantRepository.GetTenantByIdAsync(subdomain);
        
        // return await _cache.GetOrCreateAsync(cacheKey, async () =>
        // {
        //     return await _context.Tenants
        //         .Include(t => t.Institution)
        //         .FirstOrDefaultAsync(t => t.Subdomain == subdomain);
        // }, TimeSpan.FromHours(1));
    }
    
    private string? ExtractSubdomain(string host)
    {
        // certichain.com -> null
        // nust.certichain.com -> nust
        var parts = host.Split('.');
        return parts.Length > 2 ? parts[0] : null;
    }
}