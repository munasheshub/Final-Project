using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace CertifyChain.Tests.Services;

public class DashboardServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<DashboardService>> _loggerMock;
    private readonly DashboardService _sut;

    public DashboardServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<DashboardService>>();
        _sut = new DashboardService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    private static Certificate CreateCert(string tenantId, CertificateStatus status, DateTime? creationDate = null, long? gasUsed = null)
    {
        var cert = Certificate.Create(tenantId, 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.FirstClass,
            GraduationDate = DateTime.UtcNow
        });

        if (status == CertificateStatus.Verified || status == CertificateStatus.Revoked)
        {
            cert.RegisterOnBlockchain("0xabc", "QmXyz", Guid.NewGuid().ToString("N"), gasUsed);
        }

        if (status == CertificateStatus.Revoked)
        {
            cert.Revoke("Test revocation");
        }

        return cert;
    }

    #region GetMetricsAsync

    [Fact]
    public async Task GetMetricsAsync_WithCertificatesAndLogs_ReturnsCorrectCounts()
    {
        var certs = new List<Certificate>
        {
            CreateCert("t1", CertificateStatus.Verified, gasUsed: 21000),
            CreateCert("t1", CertificateStatus.Verified, gasUsed: 30000),
            CreateCert("t1", CertificateStatus.Revoked),
            CreateCert("t1", CertificateStatus.PendingVerification)
        };

        var logs = new List<VerificationLog>
        {
            VerificationLog.Create("t1", "h1", 1, true, null, null, null, VerifierType.Employer),
            VerificationLog.Create("t1", "h2", 2, false, "Bad", null, null, VerifierType.Other)
        };

        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(certs);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(logs);

        var result = await _sut.GetMetricsAsync();

        Assert.True(result.IsSuccess);
        var metrics = result.Data!;
        Assert.Equal(4, metrics.TotalCertificates);
        Assert.Equal(2, metrics.ActiveCertificates);
        Assert.Equal(1, metrics.RevokedCertificates);
        Assert.Equal(1, metrics.PendingVerifications);
        Assert.Equal(2, metrics.TotalVerifications);
    }

    [Fact]
    public async Task GetMetricsAsync_EmptyData_ReturnsZeros()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetMetricsAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Data!.TotalCertificates);
        Assert.Equal(0, result.Data.TotalVerifications);
    }

    #endregion

    #region GetVerificationSourcesAsync

    [Fact]
    public async Task GetVerificationSourcesAsync_WithLogs_ReturnsPercentages()
    {
        var logs = new List<VerificationLog>
        {
            VerificationLog.Create("t1", "h1", 1, true, null, null, null, VerifierType.Employer),
            VerificationLog.Create("t1", "h2", 2, true, null, null, null, VerifierType.Employer),
            VerificationLog.Create("t1", "h3", 3, true, null, null, null, VerifierType.EducationalInstitution),
            VerificationLog.Create("t1", "h4", 4, true, null, null, null, VerifierType.Other)
        };

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(logs);

        var result = await _sut.GetVerificationSourcesAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(50, result.Data!.Employers); // 2/4 = 50%
        Assert.Equal(25, result.Data.EducationalInstitutions); // 1/4 = 25%
        Assert.Equal(0, result.Data.Government);
        Assert.Equal(25, result.Data.Others); // 1/4 = 25%
    }

    [Fact]
    public async Task GetVerificationSourcesAsync_NoLogs_ReturnsAllZeros()
    {
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetVerificationSourcesAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Data!.Employers);
        Assert.Equal(0, result.Data.EducationalInstitutions);
        Assert.Equal(0, result.Data.Government);
        Assert.Equal(0, result.Data.Others);
    }

    #endregion

    #region GetActivityChartAsync

    [Fact]
    public async Task GetActivityChartAsync_ReturnsChartWithLabels()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetActivityChartAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(6, result.Data!.Labels.Count);
        Assert.Equal(6, result.Data.Issued.Count);
        Assert.Equal(6, result.Data.Verified.Count);
    }

    #endregion

    #region GetMonthlyOverviewAsync

    [Fact]
    public async Task GetMonthlyOverviewAsync_ReturnsChartWithSixMonths()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetMonthlyOverviewAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(6, result.Data!.Labels.Count);
        Assert.Equal(6, result.Data.Issued.Count);
        Assert.Equal(6, result.Data.Revoked.Count);
    }

    #endregion

    #region GetRecentActivityAsync

    [Fact]
    public async Task GetRecentActivityAsync_ReturnsCombinedActivity()
    {
        var cert = CreateCert("t1", CertificateStatus.Verified);
        var log = VerificationLog.Create("t1", "h1", 1, true, null, "1.1.1.1", "Agent");

        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([cert]);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log]);

        var result = await _sut.GetRecentActivityAsync(10);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
    }

    [Fact]
    public async Task GetRecentActivityAsync_RespectsLimit()
    {
        var certs = Enumerable.Range(1, 20).Select(_ => CreateCert("t1", CertificateStatus.Verified)).ToList();

        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(certs);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetRecentActivityAsync(5);

        Assert.True(result.IsSuccess);
        Assert.Equal(5, result.Data!.Count);
    }

    #endregion

    #region GetTopProgramsAsync

    [Fact]
    public async Task GetTopProgramsAsync_ReturnsRankedPrograms()
    {
        var certs = new List<Certificate>();

        // 3 certificates for CS
        for (int i = 0; i < 3; i++)
        {
            certs.Add(Certificate.Create("t1", 1, 1, new CertificateData
            {
                QualificationType = QualificationType.Degree,
                ProgramName = "Computer Science",
                AwardClass = AwardClass.FirstClass,
                GraduationDate = DateTime.UtcNow
            }));
        }

        // 1 certificate for IT
        certs.Add(Certificate.Create("t1", 2, 2, new CertificateData
        {
            QualificationType = QualificationType.Diploma,
            ProgramName = "Information Technology",
            AwardClass = AwardClass.Pass,
            GraduationDate = DateTime.UtcNow
        }));

        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(certs);

        var result = await _sut.GetTopProgramsAsync(5);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
        Assert.Equal("Computer Science", result.Data[0].ProgramName);
        Assert.Equal(3, result.Data[0].CertificateCount);
        Assert.Equal(1, result.Data[0].Rank);
        Assert.Equal("Information Technology", result.Data[1].ProgramName);
        Assert.Equal(2, result.Data[1].Rank);
    }

    [Fact]
    public async Task GetTopProgramsAsync_Empty_ReturnsEmptyList()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetTopProgramsAsync(5);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }

    #endregion

    #region GetVerificationRequestsAsync

    [Fact]
    public async Task GetVerificationRequestsAsync_ReturnsFormattedRequests()
    {
        var log = VerificationLog.Create("t1", "hash1", 1, true, null, "1.1.1.1", "Agent");

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log]);

        var result = await _sut.GetVerificationRequestsAsync(10);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Equal("verified", result.Data[0].Status);
    }

    [Fact]
    public async Task GetVerificationRequestsAsync_FailedVerification_ShowsFraudStatus()
    {
        var log = VerificationLog.Create("t1", "hash1", 1, false, "Tampered", "1.1.1.1", "Agent");

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log]);

        var result = await _sut.GetVerificationRequestsAsync(10);

        Assert.True(result.IsSuccess);
        Assert.Equal("fraud", result.Data![0].Status);
    }

    #endregion

    #region GetRecentCertificatesAsync

    [Fact]
    public async Task GetRecentCertificatesAsync_ReturnsCertificatesWithStatus()
    {
        var verified = CreateCert("t1", CertificateStatus.Verified);
        var pending = CreateCert("t1", CertificateStatus.PendingVerification);

        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([verified, pending]);

        var result = await _sut.GetRecentCertificatesAsync(5);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
    }

    #endregion
}
