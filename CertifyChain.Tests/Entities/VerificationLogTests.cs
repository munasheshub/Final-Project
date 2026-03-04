using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;

namespace CertifyChain.Tests.Entities;

public class VerificationLogTests
{
    private const string ValidTenantId = "tenant-001";
    private const string ValidHash = "abc123hash";

    [Fact]
    public void Create_WithValidData_ReturnsLogWithExpectedProperties()
    {
        var log = VerificationLog.Create(
            ValidTenantId,
            certificateHash: ValidHash,
            certificateId: 5,
            isSuccess: true,
            failureReason: null,
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0",
            verifierType: VerifierType.Employer);

        Assert.Equal(ValidTenantId, log.TenantId);
        Assert.Equal(ValidHash, log.CertificateHash);
        Assert.Equal(5, log.CertificateId);
        Assert.True(log.isSuccess);
        Assert.Null(log.FailureReason);
        Assert.Equal("192.168.1.1", log.IpAddress);
        Assert.Equal("Mozilla/5.0", log.UserAgent);
        Assert.Equal(VerifierType.Employer, log.VerifierType);
        Assert.True(log.VerifiedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_FailedVerification_StoresFailureReason()
    {
        var log = VerificationLog.Create(
            ValidTenantId,
            ValidHash,
            certificateId: 5,
            isSuccess: false,
            failureReason: "Certificate revoked",
            ipAddress: null,
            userAgent: null);

        Assert.False(log.isSuccess);
        Assert.Equal("Certificate revoked", log.FailureReason);
    }

    [Fact]
    public void Create_DefaultVerifierType_IsOther()
    {
        var log = VerificationLog.Create(
            ValidTenantId,
            ValidHash,
            certificateId: 1,
            isSuccess: true,
            failureReason: null,
            ipAddress: null,
            userAgent: null);

        Assert.Equal(VerifierType.Other, log.VerifierType);
    }

    [Fact]
    public void Create_WithNullOptionalFields_Succeeds()
    {
        var log = VerificationLog.Create(
            ValidTenantId,
            ValidHash,
            certificateId: 1,
            isSuccess: true,
            failureReason: null,
            ipAddress: null,
            userAgent: null);

        Assert.Null(log.IpAddress);
        Assert.Null(log.UserAgent);
        Assert.Null(log.FailureReason);
    }
}
