using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Helpers;
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
        var account = context.HttpContext.Items["Account"] as User;

        if (account is null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var rolePermissions = RolePermissions.GetPermissions(account.Role);

        if (!rolePermissions.HasFlag(_permission))
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}