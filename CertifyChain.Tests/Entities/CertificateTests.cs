using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;

namespace CertifyChain.Tests.Entities;

public class CertificateTests
{
    private const string ValidTenantId = "tenant-001";

    private static CertificateData DefaultData => new()
    {
        QualificationType = QualificationType.Degree,
        ProgramName = "Computer Science",
        AwardClass = AwardClass.FirstClass,
        GraduationDate = new DateTime(2025, 6, 15)
    };

    [Fact]
    public void Create_WithValidData_ReturnsCertificateWithExpectedProperties()
    {
        var certificate = Certificate.Create(ValidTenantId, studentId: 1, programId: 2, DefaultData);

        Assert.Equal(ValidTenantId, certificate.TenantId);
        Assert.Equal(1, certificate.StudentId);
        Assert.Equal(2, certificate.ProgramId);
        Assert.Equal(QualificationType.Degree, certificate.QualificationType);
        Assert.Equal("Computer Science", certificate.ProgramName);
        Assert.Equal(AwardClass.FirstClass, certificate.AwardClass);
        Assert.Equal(new DateTime(2025, 6, 15), certificate.GraduationDate);
        Assert.Equal(CertificateStatus.PendingVerification, certificate.Status);
        Assert.StartsWith("CERT-", certificate.CertificateNumber);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidTenantId_ThrowsArgumentException(string? tenantId)
    {
        Assert.Throws<ArgumentException>(() =>
            Certificate.Create(tenantId!, studentId: 1, programId: 2, DefaultData));
    }

    [Fact]
    public void Create_GeneratesUniqueCertificateNumbers()
    {
        var cert1 = Certificate.Create(ValidTenantId, 1, 1, DefaultData);
        var cert2 = Certificate.Create(ValidTenantId, 1, 1, DefaultData);

        Assert.NotEqual(cert1.CertificateNumber, cert2.CertificateNumber);
    }

    [Fact]
    public void RegisterOnBlockchain_SetsBlockchainFieldsAndChangesStatusToVerified()
    {
        var certificate = Certificate.Create(ValidTenantId, 1, 1, DefaultData);

        certificate.RegisterOnBlockchain(
            transactionHash: "0xabc123",
            ipfsCid: "QmXyz",
            certificateHash: "hash123",
            gasUsed: 21000,
            frontendBaseUrl: "https://app.certifychain.com");

        Assert.Equal("0xabc123", certificate.BlockchainTxHash);
        Assert.Equal("QmXyz", certificate.IpfsCid);
        Assert.Equal("hash123", certificate.CertificateHash);
        Assert.Equal(21000, certificate.GasUsed);
        Assert.NotNull(certificate.VerificationCode);
        Assert.NotEmpty(certificate.VerificationCode!);
        Assert.Equal("https://app.certifychain.com/verify/hash123", certificate.QrCodeData);
        Assert.Equal(CertificateStatus.Verified, certificate.Status);
    }

    [Fact]
    public void RegisterOnBlockchain_WithNullFrontendUrl_UsesFallbackScheme()
    {
        var certificate = Certificate.Create(ValidTenantId, 1, 1, DefaultData);

        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123", frontendBaseUrl: null);

        Assert.Equal("certifychain://verify/hash123", certificate.QrCodeData);
    }

    [Fact]
    public void RegisterOnBlockchain_WithTrailingSlashUrl_TrimsCorrectly()
    {
        var certificate = Certificate.Create(ValidTenantId, 1, 1, DefaultData);

        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123", frontendBaseUrl: "https://app.com/");

        Assert.Equal("https://app.com/verify/hash123", certificate.QrCodeData);
    }

    [Fact]
    public void Revoke_SetsStatusToRevokedWithReasonAndTimestamp()
    {
        var certificate = Certificate.Create(ValidTenantId, 1, 1, DefaultData);
        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123");

        certificate.Revoke("Fraudulent document");

        Assert.Equal(CertificateStatus.Revoked, certificate.Status);
        Assert.Equal("Fraudulent document", certificate.RevocationReason);
        Assert.NotNull(certificate.RevokedAt);
        Assert.True(certificate.RevokedAt!.Value <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_CertificateNumber_ContainsCurrentDate()
    {
        var certificate = Certificate.Create(ValidTenantId, 1, 1, DefaultData);
        var expectedDatePart = DateTime.UtcNow.ToString("yyyyMMdd");

        Assert.Contains(expectedDatePart, certificate.CertificateNumber);
    }
}
