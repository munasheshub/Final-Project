using CertifyChain.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CertifyChain.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected User? Account => HttpContext.Items["Account"] as User;

    protected Guid? CurrentTenantId => HttpContext.Items["TenantId"] as Guid?;

    protected int GetCurrentUserId()
    {
        if (Account == null)
            throw new InvalidOperationException("User is not authenticated");

        return Account.Id;
    }

    protected Guid GetCurrentTenantId()
    {
        if (CurrentTenantId == null)
            throw new InvalidOperationException("Tenant not found in context");

        return CurrentTenantId.Value;
    }
}