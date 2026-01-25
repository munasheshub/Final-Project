using System.Text.Json;
using CertifyChain.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CertifyChain.Middleware;

public class RequirePermissionAttribute : TypeFilterAttribute
{
    public RequirePermissionAttribute(Permission permission) 
        : base(typeof(PermissionFilter))
    {
        Arguments = new object[] { permission };
    }
}

public class PermissionFilter : IAsyncActionFilter
{
    private readonly Permission _permission;
    
    public PermissionFilter(Permission permission)
    {
        _permission = permission;
    }
    
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;
        
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }
        
        var permissionsClaim = user.FindFirst("permissions")?.Value;
        if (string.IsNullOrEmpty(permissionsClaim))
        {
            context.Result = new ForbidResult();
            return;
        }
        
        var userPermissions = JsonSerializer.Deserialize<List<string>>(permissionsClaim) ?? new();
        
        if (!userPermissions.Contains(_permission.ToString()))
        {
            context.Result = new ForbidResult();
            return;
        }
        
        await next();
    }
}