using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace CertifyChain.Infrastructure.MultiTenancy;


public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    
    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    
    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        if (context.Request.Path.StartsWithSegments("/api/auth/login") ||
            context.Request.Path.StartsWithSegments("/api/auth/google-signin") ||
            context.Request.Path.StartsWithSegments("/api/auth/forgot-password") ||
            context.Request.Path.StartsWithSegments("/api/auth/reset-password") ||
            context.Request.Path.StartsWithSegments("/api/auth/refresh") ||
            context.Request.Path.StartsWithSegments("/api/verification-logs") ||
            context.Request.Path.StartsWithSegments("/swagger") ||
            context.Request.Path.StartsWithSegments("/health"))
        {
            await this._next(context);
            return;
        }
        var tenant = await tenantService.GetCurrentTenantAsync();
        
        if (tenant == null && RequiresTenant(context.Request.Path))
        {
            context.Response.StatusCode = 400;
            var json = JsonSerializer.Serialize(new { error = "Tenant not found" });
            await context.Response.WriteAsync(json);
            return;
        }
        
        if (tenant != null && !tenant.IsActive)
        {
            context.Response.StatusCode = 403;
            var json = JsonSerializer.Serialize(new { error = "Tenant not active" });
            await context.Response.WriteAsync(json);
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