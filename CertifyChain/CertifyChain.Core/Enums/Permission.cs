namespace CertifyChain.Domain.Enums;

[Flags]
public enum Permission
{
    None = 0,

    // Certificates
    ViewCertificates = 1,           // certificate:view
    CreateCertificates = 2,         // certificate:create
    UpdateCertificates = 4,         // certificate:update
    DeleteCertificates = 8,         // certificate:delete
    RevokeCertificates = 16,        // certificate:revoke
    BatchUploadCertificates = 32,   // certificate:batch-upload

    // User Management
    CreateUsers = 64,               // user:create
    ViewUsers = 128,                // user:view
    UpdateUsers = 256,              // user:update
    DeleteUsers = 512,              // user:delete

    // Verification
    VerifyCertificate = 1024,       // verify:certificate
    ViewVerificationHistory = 2048, // verify:history
    RunFraudDetection = 4096,       // verify:fraud-detection

    // Settings
    ManageInstitution = 8192,       // settings:institution
    ManageBlockchain = 16384,       // settings:blockchain
    ManageSignatures = 32768,       // settings:signatures
    ManageTemplates = 65536,        // settings:templates

    // Reports & Audit
    ViewReports = 131072,           // reports:view
    ExportReports = 262144,         // reports:export
    ViewAuditLogs = 524288,         // audit:view
    ExportAuditLogs = 1048576,      // audit:export

    // Students
    ViewStudents = 2097152,         // student:view
    ManageStudents = 4194304,       // student:manage  (create/update/delete)
    BulkUploadStudents = 8388608,   // student:bulk-upload

    // Programs
    ViewPrograms = 16777216,        // program:view
    ManagePrograms = 33554432,      // program:manage  (create/update/delete)

    // Faculties
    ViewFaculties = 67108864,       // faculty:view
    ManageFaculties = 134217728,    // faculty:manage  (create/update/delete)

    // Dashboard
    ViewDashboard = 268435456,      // dashboard:view

    // Convenience flag
    All = int.MaxValue
}