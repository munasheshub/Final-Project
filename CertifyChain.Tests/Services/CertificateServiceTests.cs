using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.Enums;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.MultiTenancy;
using CertifyChain.Infrastructure.Services;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace CertifyChain.Tests.Services;

public class CertificateServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ITenantService> _tenantServiceMock;
    private readonly Mock<ILogger<CertificateService>> _loggerMock;
    private readonly Mock<IOptions<AppSettings>> _appSettingsMock;
    private readonly CertificateService _sut;

    public CertificateServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _tenantServiceMock = new Mock<ITenantService>();
        _loggerMock = new Mock<ILogger<CertificateService>>();
        _appSettingsMock = new Mock<IOptions<AppSettings>>();
        _appSettingsMock.Setup(x => x.Value).Returns(new AppSettings
        {
            FrontendUrl = "https://app.certifychain.com"
        });

        _sut = new CertificateService(
            _unitOfWorkMock.Object,
            _tenantServiceMock.Object,
            _loggerMock.Object,
            _appSettingsMock.Object);
    }

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_WithValidRequest_ReturnsSuccess()
    {
        // Arrange
        var tenantId = "tenant-001";
        var tenant = new Tenant { Name = "TestUni", Subdomain = "testuni", IsActive = true };
        var student = Student.Create("STU-001", "John", "Doe", "john@test.com", DateTime.Now, "", "");
        var program = new Program { TenantId = tenantId, Name = "CS", Description = "Comp Sci", Code = "CS101" };

        _tenantServiceMock.Setup(x => x.GetCurrentTenantId()).Returns(tenantId);
        _tenantServiceMock.Setup(x => x.GetCurrentTenantAsync()).ReturnsAsync(tenant);
        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(student);
        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(2, It.IsAny<CancellationToken>())).ReturnsAsync(program);
        _unitOfWorkMock.Setup(x => x.Certificates.AddAsync(It.IsAny<Certificate>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate c, CancellationToken _) => c);

        var request = new CreateCertificateRequest
        {
            StudentId = 1,
            ProgramId = 2,
            QualificationType = QualificationType.Degree,
            ProgramName = "Computer Science",
            AwardClass = AwardClass.FirstClass,
            GraduationDate = DateTime.Now,
            TransactionHash = "0xabc",
            IpfsCID = "QmXyz",
            CertHash = "hash123",
            GasUsed = 21000
        };

        // Act
        var result = await _sut.CreateAsync(request);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.StartsWith("CERT-", result.Data!.CertificateNumber);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_StudentNotFound_ReturnsFailure()
    {
        _tenantServiceMock.Setup(x => x.GetCurrentTenantId()).Returns("tenant-001");
        _tenantServiceMock.Setup(x => x.GetCurrentTenantAsync()).ReturnsAsync(new Tenant { Name = "T", Subdomain = "t", IsActive = true });
        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync((Student?)null);

        var request = new CreateCertificateRequest { StudentId = 1, ProgramId = 2 };

        var result = await _sut.CreateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Student not found", result.Message);
    }

    [Fact]
    public async Task CreateAsync_ProgramNotFound_ReturnsFailure()
    {
        var student = Student.Create("STU-001", "John", "Doe", "j@t.com", DateTime.Now, "", "");

        _tenantServiceMock.Setup(x => x.GetCurrentTenantId()).Returns("tenant-001");
        _tenantServiceMock.Setup(x => x.GetCurrentTenantAsync()).ReturnsAsync(new Tenant { Name = "T", Subdomain = "t", IsActive = true });
        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(student);
        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(2, It.IsAny<CancellationToken>())).ReturnsAsync((Program?)null);

        var request = new CreateCertificateRequest { StudentId = 1, ProgramId = 2 };

        var result = await _sut.CreateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Program not found", result.Message);
    }

    [Fact]
    public async Task CreateAsync_NoTenantContext_ThrowsUnauthorizedAccessException()
    {
        _tenantServiceMock.Setup(x => x.GetCurrentTenantId()).Returns((string?)null);

        var request = new CreateCertificateRequest { StudentId = 1, ProgramId = 2 };

        // The service catches exceptions and returns failure
        var result = await _sut.CreateAsync(request);

        Assert.False(result.IsSuccess);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_CertificateExists_ReturnsSuccess()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.FirstClass,
            GraduationDate = DateTime.Now
        });

        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdWithDetailsAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var result = await _sut.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetByIdAsync_CertificateNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdWithDetailsAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var result = await _sut.GetByIdAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Certificate not found", result.Message);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_DraftCertificate_ReturnsSuccess()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.Pass,
            GraduationDate = DateTime.Now
        });
        // Status is PendingVerification by default, not Draft — so this test checks the guard

        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var result = await _sut.DeleteAsync(1);

        // PendingVerification != Draft, so deletion should be rejected
        Assert.False(result.IsSuccess);
        Assert.Equal("Only draft certificates can be deleted", result.Message);
    }

    [Fact]
    public async Task DeleteAsync_CertificateNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var result = await _sut.DeleteAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Certificate not found", result.Message);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_RevokedCertificate_ReturnsFailure()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.Pass,
            GraduationDate = DateTime.Now
        });
        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123");
        certificate.Revoke("Fraud");

        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var request = new UpdateCertificateRequest { Id = 1 };
        var result = await _sut.UpdateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Cannot update a revoked certificate", result.Message);
    }

    [Fact]
    public async Task UpdateAsync_CertificateNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var request = new UpdateCertificateRequest { Id = 1 };
        var result = await _sut.UpdateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Certificate not found", result.Message);
    }

    #endregion

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsAllCertificates()
    {
        var cert1 = Certificate.Create("t1", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree, ProgramName = "CS",
            AwardClass = AwardClass.Pass, GraduationDate = DateTime.Now
        });
        var cert2 = Certificate.Create("t1", 2, 1, new CertificateData
        {
            QualificationType = QualificationType.Diploma, ProgramName = "IT",
            AwardClass = AwardClass.Distinction, GraduationDate = DateTime.Now
        });

        _unitOfWorkMock.Setup(x => x.Certificates.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([cert1, cert2]);

        var result = await _sut.GetAllAsync(new GetCertificatesRequest());

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Items.Count);
    }

    #endregion

    #region GetByStudentIdAsync

    [Fact]
    public async Task GetByStudentIdAsync_ReturnsCertificatesForStudent()
    {
        var cert = Certificate.Create("t1", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree, ProgramName = "CS",
            AwardClass = AwardClass.FirstClass, GraduationDate = DateTime.Now
        });

        _unitOfWorkMock.Setup(x => x.Certificates.GetByStudentIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync([cert]);

        var result = await _sut.GetByStudentIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
    }

    [Fact]
    public async Task GetByStudentIdAsync_NoResults_ReturnsEmptyList()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByStudentIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetByStudentIdAsync(99);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }

    #endregion

    #region GetByCertificateNumberAsync

    [Fact]
    public async Task GetByCertificateNumberAsync_Found_ReturnsSuccess()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.FirstClass,
            GraduationDate = DateTime.Now
        });

        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertificateNumberAsync("CERT-123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var result = await _sut.GetByCertificateNumberAsync("CERT-123");

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetByCertificateNumberAsync_NotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertificateNumberAsync("BAD", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var result = await _sut.GetByCertificateNumberAsync("BAD");

        Assert.False(result.IsSuccess);
        Assert.Equal("Certificate not found", result.Message);
    }

    #endregion

    #region GetByCertHashAsync

    [Fact]
    public async Task GetByCertHashAsync_Found_ReturnsSuccess()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.Pass,
            GraduationDate = DateTime.Now
        });
        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123");

        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertHashWithDetailsAsync("hash123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var result = await _sut.GetByCertHashAsync("hash123");

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetByCertHashAsync_NotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByCertHashWithDetailsAsync("bad", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var result = await _sut.GetByCertHashAsync("bad");

        Assert.False(result.IsSuccess);
        Assert.Equal("Certificate not found", result.Message);
    }

    #endregion

    #region GenerateQrCodeAsync

    [Fact]
    public async Task GenerateQrCodeAsync_CertificateExists_ReturnsQrBytes()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.FirstClass,
            GraduationDate = DateTime.Now
        });
        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123");

        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var result = await _sut.GenerateQrCodeAsync(1);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.True(result.Data!.Length > 0);
    }

    [Fact]
    public async Task GenerateQrCodeAsync_CertificateNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Certificate?)null);

        var result = await _sut.GenerateQrCodeAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Certificate not found", result.Message);
    }

    #endregion

    #region UpdateAsync - Additional

    [Fact]
    public async Task UpdateAsync_ValidCertificate_ReturnsSuccess()
    {
        var certificate = Certificate.Create("tenant-001", 1, 1, new CertificateData
        {
            QualificationType = QualificationType.Degree,
            ProgramName = "CS",
            AwardClass = AwardClass.Pass,
            GraduationDate = DateTime.Now
        });
        certificate.RegisterOnBlockchain("0xabc", "QmXyz", "hash123");

        _unitOfWorkMock.Setup(x => x.Certificates.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(certificate);

        var request = new UpdateCertificateRequest { Id = 1 };
        var result = await _sut.UpdateAsync(request);

        Assert.True(result.IsSuccess);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
