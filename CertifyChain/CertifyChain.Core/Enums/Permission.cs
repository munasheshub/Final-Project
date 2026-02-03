namespace CertifyChain.Domain.Enums;

[Flags]
public enum Permission
{
    None = 0,

    // Certificates
    ViewCertificates = 1,           // CERTIFICATE_VIEW
    CreateCertificates = 2,         // CERTIFICATE_CREATE
    UpdateCertificates = 4,         // CERTIFICATE_UPDATE
    DeleteCertificates = 8,         // (optional, TS does not have DELETE)
    RevokeCertificates = 16,        // CERTIFICATE_REVOKE
    BatchUploadCertificates = 32,   // CERTIFICATE_BATCH_UPLOAD

    // User Management
    CreateUsers = 64,               // USER_CREATE
    ViewUsers = 128,                // USER_VIEW
    UpdateUsers = 256,              // USER_UPDATE
    DeleteUsers = 512,              // USER_DELETE

    // Verification
    VerifyCertificate = 1024,       // VERIFY_CERTIFICATE
    ViewVerificationHistory = 2048, // VIEW_VERIFICATION_HISTORY
    RunFraudDetection = 4096,       // RUN_FRAUD_DETECTION

    // Settings
    ManageInstitution = 8192,       // SETTINGS_INSTITUTION
    ManageBlockchain = 16384,       // SETTINGS_BLOCKCHAIN
    ManageSignatures = 32768,       // SETTINGS_SIGNATURES
    ManageTemplates = 65536,        // SETTINGS_TEMPLATES

    // Reports & Audit
    ViewReports = 131072,           // REPORTS_VIEW
    ExportReports = 262144,         // REPORTS_EXPORT
    ViewAuditLogs = 524288,         // AUDIT_VIEW
    ExportAuditLogs = 1048576,      // AUDIT_EXPORT

    // Convenience flag
    All = int.MaxValue
}