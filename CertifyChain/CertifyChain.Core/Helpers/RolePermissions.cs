using CertifyChain.Domain.Enums;

namespace CertifyChain.Infrastructure.Helpers;

public static class RolePermissions
{
    public static Permission GetPermissions(UserRole role)
    {
        return role switch
        {
            UserRole.SuperAdmin => Permission.All,

            UserRole.InstitutionAdmin => Permission.ViewCertificates |
                                         Permission.CreateCertificates |
                                         Permission.UpdateCertificates |
                                         Permission.DeleteCertificates |
                                         Permission.RevokeCertificates |
                                         Permission.ManageUsers |
                                         Permission.ManageInstitution |
                                         Permission.ViewReports,

            UserRole.Registrar => Permission.ViewCertificates |
                                  Permission.CreateCertificates |
                                  Permission.UpdateCertificates |
                                  Permission.DeleteCertificates,

            UserRole.VerificationOfficer => Permission.ViewCertificates |
                                            Permission.RevokeCertificates,

            UserRole.Auditor => Permission.ViewCertificates |
                                Permission.ViewAuditLogs |
                                Permission.ViewReports,

            _ => Permission.None
        };
    }
}