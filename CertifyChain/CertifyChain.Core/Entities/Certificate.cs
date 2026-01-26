using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Enums;

namespace CertifyChain.Domain.Entities;

public class Certificate : AuditableEntity<int>, ITenantEntity
{
    public string TenantId { get; set; }

    public string CertificateNumber { get; private set; }
    public int StudentId { get; private set; }
    public int InstitutionId { get; private set; }

    public QualificationType QualificationType { get; private set; }
    public string ProgramName { get; private set; }
    public AwardClass AwardClass { get; private set; }
    public DateTime GraduationDate { get; private set; }

    // Blockchain
    public string BlockchainTxHash { get; private set; }
    public string IpfsCid { get; private set; }
    public string CertificateHash { get; private set; }
    public string VerificationCode { get; private set; }
    public string QrCodeData { get; private set; }

    // Status
    public CertificateStatus Status { get; private set; } = CertificateStatus.PendingVerification;
    public DateTime? RevokedAt { get; private set; }
    public string? RevocationReason { get; private set; }

    // Relationships
    public Student? Student { get; private set; }
    public Institution? Institution { get; private set; }
    public List<VerificationLog>? VerificationLogs { get; private set; } = new();


    private Certificate() { } 

    public static Certificate Create(
        string tenantId,
        int studentId,
        int institutionId,
        CertificateData data)
    {
        TenantId = tenantId;
        StudentId = studentId;
        InstitutionId = institutionId;

        CertificateNumber = GenerateCertificateNumber();
        VerificationCode = GenerateVerificationCode();

        QualificationType = data.QualificationType;
        ProgramName = data.ProgramName;
        AwardClass = data.AwardClass;
        GraduationDate = data.GraduationDate;

        Status = CertificateStatus.PendingVerification;
    }


    public void RegisterOnBlockchain(string txHash, string ipfsCid, string certificateHash)
    {
        BlockchainTxHash = txHash;
        IpfsCid = ipfsCid;
        CertificateHash = certificateHash;
        Status = CertificateStatus.Verified;
    }


    public void UpdateDetails(string programName, AwardClass awardClass, DateTime graduationDate)
    {
        if (Status == CertificateStatus.Revoked)
            throw new InvalidOperationException("Cannot update a revoked certificate.");

        ProgramName = programName;
        AwardClass = awardClass;
        GraduationDate = graduationDate;
    }

    public void Revoke(string reason, int revokedByUserId)
    {
        if (Status == CertificateStatus.Revoked)
            throw new InvalidOperationException("Certificate is already revoked.");

        RevocationReason = reason;
        RevokedAt = DateTime.UtcNow;
        Status = CertificateStatus.Revoked;

        // Optionally log the revocation in VerificationLogs
        VerificationLogs ??= new List<VerificationLog>();
        // VerificationLogs.Add(new VerificationLog
        // {
        //     CertificateId = this.Id,
        //     Action = "Revoked",
        //     ActorUserId = revokedByUserId,
        //     Timestamp = DateTime.UtcNow,
        //     Notes = reason
        // });
    }


    private static string GenerateCertificateNumber()
        => $"CERT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..20].ToUpper();

    private static string GenerateVerificationCode()
        => Guid.NewGuid().ToString("N")[..12].ToUpper();
}


public class CertificateData
{
    public QualificationType QualificationType { get; set; }
    public string ProgramName { get; set; }
    public AwardClass AwardClass { get; set; }
    public DateTime GraduationDate { get; set; }
}