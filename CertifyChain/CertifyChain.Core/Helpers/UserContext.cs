using CertifyChain.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace CertifyChain.Infrastructure.Helpers;

public interface IUserContext
{
    int? UserId { get; set; }
    string? TenantId { get; set; }
}

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? UserId
    {
        get => _httpContextAccessor.HttpContext?.Items["UserId"] as int?;
        set => _httpContextAccessor.HttpContext!.Items["UserId"] = value;
    }

    public string? TenantId
    {
        get => _httpContextAccessor.HttpContext?.Items["TenantId"] as string;
        set => _httpContextAccessor.HttpContext!.Items["TenantId"] = value;
    }
}