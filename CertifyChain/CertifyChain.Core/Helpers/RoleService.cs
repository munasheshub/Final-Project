using CertifyChain.Domain.Enums;

namespace CertifyChain.Infrastructure.Helpers;

public class RoleService
{
    public static List<string> GetRolePermissionsForFrontend(UserRole role)
    {
        var permissions = RolePermissions.GetPermissions(role);
        return PermissionMapper.ToFrontendPermissions(permissions);
    }
}