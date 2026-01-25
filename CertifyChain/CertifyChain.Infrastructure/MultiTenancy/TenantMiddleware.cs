namespace CertifyChain.Infrastructure.MultiTenancy;

// Infrastructure/MultiTenancy/TenantMiddleware.cs
public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    
    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    
    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        var tenant = await tenantService.GetCurrentTenantAsync();
        
        if (tenant == null && RequiresTenant(context.Request.Path))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant not found" });
            return;
        }
        
        if (tenant != null && !tenant.IsActive)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant is inactive" });
            return;
        }
        
        await _next(context);
    }
    
    private bool RequiresTenant(PathString path)
    {
        
        var publicPaths = new[] { "/api/auth/login", "/api/verification/public", "/health" };
        return !publicPaths.Any(p => path.StartsWithSegments(p));
    }
}