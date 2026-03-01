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

            // Institution Admin – full access within their institution
            UserRole.InstitutionAdmin => Permission.ViewCertificates |
                                         Permission.CreateCertificates |
                                         Permission.UpdateCertificates |
                                         Permission.DeleteCertificates |
                                         Permission.RevokeCertificates |
                                         Permission.BatchUploadCertificates |
                                         Permission.CreateUsers |
                                         Permission.ViewUsers |
                                         Permission.UpdateUsers |
                                         Permission.DeleteUsers |
                                         Permission.VerifyCertificate |
                                         Permission.ViewVerificationHistory |
                                         Permission.RunFraudDetection |
                                         Permission.ManageInstitution |
                                         Permission.ManageBlockchain |
                                         Permission.ManageSignatures |
                                         Permission.ManageTemplates |
                                         Permission.ViewReports |
                                         Permission.ExportReports |
                                         Permission.ViewAuditLogs |
                                         Permission.ExportAuditLogs |
                                         Permission.ViewStudents |
                                         Permission.ManageStudents |
                                         Permission.BulkUploadStudents |
                                         Permission.ViewPrograms |
                                         Permission.ManagePrograms |
                                         Permission.ViewFaculties |
                                         Permission.ManageFaculties |
                                         Permission.ViewDashboard,

            // Faculty Admin – manages programs, students and certificates within their faculty
            UserRole.FacultyAdmin => Permission.ViewCertificates |
                                     Permission.CreateCertificates |
                                     Permission.UpdateCertificates |
                                     Permission.BatchUploadCertificates |
                                     Permission.ViewStudents |
                                     Permission.ManageStudents |
                                     Permission.BulkUploadStudents |
                                     Permission.ViewPrograms |
                                     Permission.ManagePrograms |
                                     Permission.ViewFaculties |
                                     Permission.ViewReports |
                                     Permission.ViewDashboard,

            // Registrar – handles certificate and student CRUD
            UserRole.Registrar => Permission.ViewCertificates |
                                  Permission.CreateCertificates |
                                  Permission.UpdateCertificates |
                                  Permission.DeleteCertificates |
                                  Permission.BatchUploadCertificates |
                                  Permission.ViewStudents |
                                  Permission.ManageStudents |
                                  Permission.BulkUploadStudents |
                                  Permission.ViewPrograms |
                                  Permission.ViewFaculties |
                                  Permission.ViewDashboard,

            // Verification Officer
            UserRole.VerificationOfficer => Permission.ViewCertificates |
                                            Permission.RevokeCertificates |
                                            Permission.VerifyCertificate |
                                            Permission.ViewVerificationHistory |
                                            Permission.RunFraudDetection |
                                            Permission.ViewStudents |
                                            Permission.ViewDashboard,

            // Auditor – read-only reporting and audit
            UserRole.Auditor => Permission.ViewCertificates |
                                Permission.ViewStudents |
                                Permission.ViewPrograms |
                                Permission.ViewFaculties |
                                Permission.ViewVerificationHistory |
                                Permission.ViewAuditLogs |
                                Permission.ExportAuditLogs |
                                Permission.ViewReports |
                                Permission.ExportReports |
                                Permission.ViewDashboard,

            // Viewer – external user (e.g. employer) who can verify certificates
            UserRole.Viewer => Permission.ViewCertificates |
                               Permission.VerifyCertificate |
                               Permission.ViewVerificationHistory,

            // Default fallback
            _ => Permission.None
        };
    }
}