using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace CertifyChain.Tests.Services;

public class VerificationLogServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<VerificationLogService>> _loggerMock;
    private readonly VerificationLogService _sut;

    public VerificationLogServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<VerificationLogService>>();

        _sut = new VerificationLogService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_CertificateExists_ReturnsSuccess()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.FirstClass,
            GraduationDate = DateTime.Now
        });
        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123");

        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertHashWithDetailsAsync("hash123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.AddAsync(It.IsAny<VerificationLog>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VerificationLog vl, CancellationToken _) => vl);

        var request = new CreateVerificationLogRequest
        {
            CertificateHash = "hash123",
            IsSuccess = true,
            FailureReason = null
        };

        var result = await _sut.CreateAsync(request, "192.168.1.1", "Mozilla/5.0", UserRole.Viewer);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal("hash123", result.Data!.CertificateHash);
        Assert.True(result.Data.IsSuccess);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_CertificateNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertHashWithDetailsAsync("bad-hash", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var request = new CreateVerificationLogRequest
        {
            CertificateHash = "bad-hash",
            IsSuccess = false,
            FailureReason = "Not found"
        };

        var result = await _sut.CreateAsync(request, "1.2.3.4", "Chrome");

        Assert.False(result.IsSuccess);
        Assert.Contains("Certificate not found", result.Message);
    }

    [Fact]
    public async Task CreateAsync_FailedVerification_StoresFailureReason()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.Pass,
            GraduationDate = DateTime.Now
        });
        certificate.RegisterOnBlockchain("0x1", "Qm1", "failhash");

        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertHashWithDetailsAsync("failhash", It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);
        _unitOfWorkMock.Setup(x => x.VerificationLogs.AddAsync(It.IsAny<VerificationLog>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VerificationLog vl, CancellationToken _) => vl);

        var request = new CreateVerificationLogRequest
        {
            CertificateHash = "failhash",
            IsSuccess = false,
            FailureReason = "Certificate was revoked"
        };

        var result = await _sut.CreateAsync(request, "10.0.0.1", "TestAgent");

        Assert.True(result.IsSuccess);
        Assert.False(result.Data!.IsSuccess);
        Assert.Equal("Certificate was revoked", result.Data.FailureReason);
    }

    #endregion

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_NoFilters_ReturnsAllLogs()
    {
        var log1 = VerificationLog.Create("t1", "hash1", 1, true, null, "1.1.1.1", "Agent1");
        var log2 = VerificationLog.Create("t1", "hash2", 2, false, "Revoked", "2.2.2.2", "Agent2");

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log1, log2]);

        var result = await _sut.GetAllAsync(new GetVerificationLogsRequest());

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
    }

    [Fact]
    public async Task GetAllAsync_FilterByCertificateHash_ReturnsFiltered()
    {
        var log1 = VerificationLog.Create("t1", "hash1", 1, true, null, "1.1.1.1", "Agent1");
        var log2 = VerificationLog.Create("t1", "hash2", 2, false, "Revoked", "2.2.2.2", "Agent2");

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log1, log2]);

        var result = await _sut.GetAllAsync(new GetVerificationLogsRequest { CertificateHash = "hash1" });

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Equal("hash1", result.Data[0].CertificateHash);
    }

    [Fact]
    public async Task GetAllAsync_FilterBySuccess_ReturnsOnlySuccessful()
    {
        var log1 = VerificationLog.Create("t1", "h1", 1, true, null, null, null);
        var log2 = VerificationLog.Create("t1", "h2", 2, false, "Bad", null, null);

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log1, log2]);

        var result = await _sut.GetAllAsync(new GetVerificationLogsRequest { IsSuccess = true });

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.True(result.Data[0].IsSuccess);
    }

    [Fact]
    public async Task GetAllAsync_FilterByIpAddress_ReturnsMatching()
    {
        var log1 = VerificationLog.Create("t1", "h1", 1, true, null, "192.168.1.1", null);
        var log2 = VerificationLog.Create("t1", "h2", 2, true, null, "10.0.0.1", null);

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([log1, log2]);

        var result = await _sut.GetAllAsync(new GetVerificationLogsRequest { IpAddress = "192.168" });

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
        Assert.Equal("192.168.1.1", result.Data[0].IpAddress);
    }

    #endregion

    #region GetByCertificateHashAsync

    [Fact]
    public async Task GetByCertificateHashAsync_ReturnsMatchingLogs()
    {
        var log = VerificationLog.Create("t1", "target-hash", 1, true, null, null, null);

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetByCertificateHashAsync("target-hash", It.IsAny<CancellationToken>()))
            .ReturnsAsync([log]);

        var result = await _sut.GetByCertificateHashAsync("target-hash");

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
    }

    #endregion

    #region GetByCertificateIdAsync

    [Fact]
    public async Task GetByCertificateIdAsync_ReturnsMatchingLogs()
    {
        var log = VerificationLog.Create("t1", "h1", 5, true, null, null, null);

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetByCertificateIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([log]);

        var result = await _sut.GetByCertificateIdAsync(5);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
    }

    #endregion

    #region GetMyLogsAsync

    [Fact]
    public async Task GetMyLogsAsync_ReturnsLogsForCreator()
    {
        var log = VerificationLog.Create("t1", "h1", 1, true, null, null, null);

        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetByCreatorIdAsync(42, It.IsAny<CancellationToken>()))
            .ReturnsAsync([log]);

        var result = await _sut.GetMyLogsAsync(42);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
    }

    [Fact]
    public async Task GetMyLogsAsync_NoLogs_ReturnsEmptyList()
    {
        _unitOfWorkMock.Setup(x => x.VerificationLogs.GetByCreatorIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetMyLogsAsync(99);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }

    #endregion
}
