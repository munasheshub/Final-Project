

using CertifyChain.Data.Persistence;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Options;



namespace CertifyChain.Infrastructure.Helpers;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly AppSettings _appSettings;
    private readonly IUserContext _userContext;

    public JwtMiddleware(RequestDelegate next, IOptions<AppSettings> appSettings, IUserContext userContext)
    {
        _next = next;
        _appSettings = appSettings.Value;
        _userContext = userContext;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IJwtUtils jwtUtils)
    {
        if (context.Request.Path.StartsWithSegments("/api/auth/login"))
        {
            
            await this._next(context);
            return;
        }
        string str = context.Request.Headers["Authorization"].FirstOrDefault<string>();
        var token = str != null ?  str.Split(" ").Last() :  null;
        User account = await jwtUtils.ValidateJwtToken(token);
        if (account != null)
        {
            
            context.Items["Account"] = account;
            context.Items["TenantId"] = account.TenantId;
            _userContext.UserId = account.Id;
            _userContext.TenantId = account.TenantId;
            _userContext.IsSuperAdmin = account.Role == CertifyChain.Domain.Enums.UserRole.SuperAdmin;

        }
        
        

        await this._next(context);
    }
}