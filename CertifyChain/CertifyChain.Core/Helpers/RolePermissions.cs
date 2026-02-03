using CertifyChain.Domain.Enums;

namespace CertifyChain.Infrastructure.Helpers;

public static class RolePermissions
{
    public static Permission GetPermissions(UserRole role)
    {
        return role switch
        {
            // SuperAdmin gets all permissions
            UserRole.SuperAdmin => Permission.All,

            // Institution Admin
            UserRole.InstitutionAdmin => Permission.ViewCertificates |
                                         Permission.CreateCertificates |
                                         Permission.UpdateCertificates |
                                         Permission.RevokeCertificates |
                                         Permission.BatchUploadCertificates |
                                         Permission.ManageInstitution |
                                         Permission.ViewReports |
                                         Permission.ExportReports |
                                         Permission.ManageBlockchain |
                                         Permission.ManageSignatures |
                                         Permission.ManageTemplates,

            // Registrar (handles certificate CRUD)
            UserRole.Registrar => Permission.ViewCertificates |
                                  Permission.CreateCertificates |
                                  Permission.UpdateCertificates |
                                  Permission.DeleteCertificates |
                                  Permission.BatchUploadCertificates,

            // Verification Officer
            UserRole.VerificationOfficer => Permission.ViewCertificates |
                                            Permission.RevokeCertificates |
                                            Permission.VerifyCertificate |
                                            Permission.ViewVerificationHistory |
                                            Permission.RunFraudDetection,

            // Auditor
            UserRole.Auditor => Permission.ViewCertificates |
                                Permission.ViewAuditLogs |
                                Permission.ViewReports |
                                Permission.ExportReports |
                                Permission.ExportAuditLogs,

            // Default fallback
            _ => Permission.None
        };
    }
}