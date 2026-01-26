namespace CertifyChain.Domain.Enums;

[Flags]
public enum Permission
{
    None = 0,
    ViewCertificates = 1,
    CreateCertificates = 2,
    UpdateCertificates = 4,
    DeleteCertificates = 8,
    RevokeCertificates = 16,
    ManageUsers = 32,
    ManageInstitution = 64,
    ViewAuditLogs = 128,
    ViewReports = 256,
    ManageBlockchain = 512,
    All = int.MaxValue
}