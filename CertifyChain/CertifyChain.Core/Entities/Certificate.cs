using System.ComponentModel.DataAnnotations;
using CertifyChain.Domain.AggregateRoots;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Entities;

namespace CertifyChain.Domain.Entities;

public class Certificate : AuditableEntity<int>, ITenantEntity
{
    public string TenantId { get; set; }

    public string CertificateNumber { get; private set; }
    public int StudentId { get; private set; }
    public int ProgramId { get; private set; }

    public QualificationType QualificationType { get; private set; }
    public string ProgramName { get; private set; }
    public AwardClass AwardClass { get; private set; }
    public DateTime GraduationDate { get; private set; }

    // Blockchain
    [StringLength(100)]
    public string BlockchainTxHash { get; private set; }
    public string IpfsCid { get; private set; }
    [StringLength(120)]
    public string CertificateHash { get; private set; }
    public string? VerificationCode { get; private set; }
    public string QrCodeData { get; private set; }
    public long? GasUsed { get; private set; }

    // Status
    public CertificateStatus Status { get; private set; } = CertificateStatus.PendingVerification;
    public DateTime? RevokedAt { get; private set; }
    public string? RevocationReason { get; private set; }

    // Relationships
    public Student? Student { get; private set; }
    public Program? Program { get; private set; }
    public List<VerificationLog>? VerificationLogs { get; private set; } = new();


    private Certificate() { } 
    
    public static Certificate Create(
        string tenantId,
        int studentId,
        int programId,
        CertificateData data)
    {
        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("TenantId is required");

        return new Certificate
        {
            TenantId = tenantId,
            StudentId = studentId,
            ProgramId = programId,

            QualificationType = data.QualificationType,
            ProgramName = data.ProgramName,
            AwardClass = data.AwardClass,
            GraduationDate = data.GraduationDate,

            CertificateNumber = GenerateCertificateNumber(),
            Status = CertificateStatus.PendingVerification
        };
    }

    public void RegisterOnBlockchain(
        string transactionHash,
        string ipfsCid,
        string certificateHash,
        long? gasUsed = null,
        string? verificationBaseUrl = null)
    {
        BlockchainTxHash = transactionHash;
        IpfsCid = ipfsCid;
        CertificateHash = certificateHash;
        GasUsed = gasUsed;
        VerificationCode = GenerateVerificationCode();
        QrCodeData = BuildVerificationUrl(certificateHash, verificationBaseUrl);

        Status = CertificateStatus.Verified;
    }

    public static string BuildVerificationUrl(string certificateHash, string? verificationBaseUrl)
    {
        return string.IsNullOrEmpty(verificationBaseUrl)
            ? $"certifychain://verify/{certificateHash}"
            : $"{verificationBaseUrl.TrimEnd('/')}/verify/{certificateHash}";
    }

    public void Revoke(string reason)
    {
        Status = CertificateStatus.Revoked;
        RevokedAt = DateTime.UtcNow;
        RevocationReason = reason;
    }

    private static string GenerateCertificateNumber()
    {
        var guidPart = Guid.NewGuid().ToString("N").Substring(0, 8);
        return $"CERT-{DateTime.UtcNow:yyyyMMdd}-{guidPart}";
    }

    private static string GenerateVerificationCode()
        => Guid.NewGuid().ToString("N");


 
}


public class CertificateData
{
    public QualificationType QualificationType { get; set; }
    public string ProgramName { get; set; }
    public AwardClass AwardClass { get; set; }
    public DateTime GraduationDate { get; set; }
}

