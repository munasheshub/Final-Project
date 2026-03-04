using AutoMapper;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.IRepositories;
using CertifyChain.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace CertifyChain.Tests.Services;

public class FacultyServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<FacultyService>> _loggerMock;
    private readonly FacultyService _sut;

    public FacultyServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<FacultyService>>();
        _sut = new FacultyService(_unitOfWorkMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_InstitutionExists_ReturnsSuccess()
    {
        var institution = new Institution();
        _unitOfWorkMock.Setup(x => x.Institutions.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(institution);
        _unitOfWorkMock.Setup(x => x.Faculties.AddAsync(It.IsAny<Faculty>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Faculty f, CancellationToken _) => f);

        var expectedDto = new FacultyDto { Id = 1, Name = "Engineering", Code = "ENG", InstitutionId = 1 };
        _mapperMock.Setup(x => x.Map<FacultyDto>(It.IsAny<Faculty>())).Returns(expectedDto);

        var request = new CreateFacultyRequest { Name = "Engineering", Code = "ENG", InstitutionId = 1 };

        var result = await _sut.CreateAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Engineering", result.Data!.Name);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_InstitutionNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Institutions.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Institution?)null);

        var request = new CreateFacultyRequest { Name = "Eng", Code = "ENG", InstitutionId = 999 };

        var result = await _sut.CreateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Institution not found", result.Message);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_FacultyExists_ReturnsSuccess()
    {
        var faculty = Faculty.Create("Old Name", "OLD", 1);

        _unitOfWorkMock.Setup(x => x.Faculties.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(faculty);

        var expectedDto = new FacultyDto { Id = 1, Name = "New Name", Code = "NEW", InstitutionId = 1 };
        _mapperMock.Setup(x => x.Map<FacultyDto>(It.IsAny<Faculty>())).Returns(expectedDto);

        var request = new UpdateFacultyRequest { Id = 1, Name = "New Name", Code = "NEW" };

        var result = await _sut.UpdateAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("New Name", result.Data!.Name);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_FacultyNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Faculties.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Faculty?)null);

        var request = new UpdateFacultyRequest { Id = 999, Name = "X", Code = "X" };

        var result = await _sut.UpdateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Faculty not found", result.Message);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_FacultyExists_ReturnsSuccess()
    {
        var faculty = Faculty.Create("Engineering", "ENG", 1);

        _unitOfWorkMock.Setup(x => x.Faculties.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(faculty);

        var expectedDto = new FacultyDto { Id = 1, Name = "Engineering", Code = "ENG", InstitutionId = 1 };
        _mapperMock.Setup(x => x.Map<FacultyDto>(It.IsAny<Faculty>())).Returns(expectedDto);

        var result = await _sut.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal("Engineering", result.Data!.Name);
    }

    [Fact]
    public async Task GetByIdAsync_FacultyNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Faculties.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Faculty?)null);

        var result = await _sut.GetByIdAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Faculty not found", result.Message);
    }

    #endregion

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsFaculties()
    {
        var faculties = new List<Faculty>
        {
            Faculty.Create("Engineering", "ENG", 1),
            Faculty.Create("Science", "SCI", 1)
        };

        _unitOfWorkMock.Setup(x => x.Faculties.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(faculties);

        var dtos = new List<FacultyDto>
        {
            new() { Id = 1, Name = "Engineering", Code = "ENG", InstitutionId = 1 },
            new() { Id = 2, Name = "Science", Code = "SCI", InstitutionId = 1 }
        };
        _mapperMock.Setup(x => x.Map<List<FacultyDto>>(faculties)).Returns(dtos);

        var result = await _sut.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
    }

    #endregion

    #region GetByInstitutionIdAsync

    [Fact]
    public async Task GetByInstitutionIdAsync_ReturnsFacultiesForInstitution()
    {
        var faculties = new List<Faculty> { Faculty.Create("Engineering", "ENG", 1) };

        _unitOfWorkMock.Setup(x => x.Faculties.GetByInstitutionIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(faculties);

        var dtos = new List<FacultyDto> { new() { Id = 1, Name = "Engineering", Code = "ENG", InstitutionId = 1 } };
        _mapperMock.Setup(x => x.Map<List<FacultyDto>>(faculties)).Returns(dtos);

        var result = await _sut.GetByInstitutionIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_FacultyExists_ReturnsSuccess()
    {
        var faculty = Faculty.Create("Engineering", "ENG", 1);

        _unitOfWorkMock.Setup(x => x.Faculties.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(faculty);

        var result = await _sut.DeleteAsync(1);

        Assert.True(result.IsSuccess);
        _unitOfWorkMock.Verify(x => x.Faculties.DeleteAsync(faculty, It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_FacultyNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Faculties.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Faculty?)null);

        var result = await _sut.DeleteAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Faculty not found", result.Message);
    }

    #endregion
}
