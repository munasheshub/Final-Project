using AutoMapper;
using CertifyChain.Core.IRepositories;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace CertifyChain.Tests.Services;

public class ProgramServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<ProgramService>> _loggerMock;
    private readonly ProgramService _sut;

    public ProgramServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<ProgramService>>();
        _sut = new ProgramService(_unitOfWorkMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_WithValidRequest_ReturnsSuccess()
    {
        var program = new Program { TenantId = "t1", Name = "Computer Science", Description = "CS Degree", Code = "CS101" };
        var dto = new ProgramDto { Id = 1, Name = "Computer Science", Description = "CS Degree", Code = "CS101" };

        _mapperMock.Setup(x => x.Map<Program>(It.IsAny<ProgramDto>())).Returns(program);
        _mapperMock.Setup(x => x.Map<Program, ProgramDto>(It.IsAny<Program>())).Returns(dto);
        _unitOfWorkMock.Setup(x => x.Programs.AddAsync(It.IsAny<Program>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(program);

        var request = new ProgramDto { Name = "Computer Science", Description = "CS Degree", Code = "CS101" };

        var result = await _sut.CreateAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Computer Science", result.Data!.Name);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_ProgramExists_ReturnsSuccess()
    {
        var program = new Program { TenantId = "t1", Name = "Old", Description = "Old Desc", Code = "OLD" };
        var dto = new ProgramDto { Id = 1, Name = "Updated", Description = "Updated Desc", Code = "UPD" };

        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(program);
        _mapperMock.Setup(x => x.Map<Program, ProgramDto>(It.IsAny<Program>())).Returns(dto);

        var request = new ProgramDto { Id = 1, Name = "Updated", Description = "Updated Desc", Code = "UPD" };

        var result = await _sut.UpdateAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Updated", result.Data!.Name);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ProgramNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Program?)null);

        var request = new ProgramDto { Id = 999, Name = "X", Description = "X", Code = "X" };

        var result = await _sut.UpdateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Program not found", result.Message);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ProgramExists_ReturnsSuccess()
    {
        var program = new Program { TenantId = "t1", Name = "CS", Description = "Comp Sci", Code = "CS101" };
        var dto = new ProgramDto { Id = 1, Name = "CS", Description = "Comp Sci", Code = "CS101" };

        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(program);
        _mapperMock.Setup(x => x.Map<Program, ProgramDto>(It.IsAny<Program>())).Returns(dto);

        var result = await _sut.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal("CS", result.Data!.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ProgramNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Program?)null);

        var result = await _sut.GetByIdAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Program not found", result.Message);
    }

    #endregion

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsAllPrograms()
    {
        var programs = new List<Program>
        {
            new() { TenantId = "t1", Name = "CS", Description = "Comp Sci", Code = "CS101" },
            new() { TenantId = "t1", Name = "IT", Description = "Info Tech", Code = "IT101" }
        };
        var dtos = new List<ProgramDto>
        {
            new() { Id = 1, Name = "CS", Description = "Comp Sci", Code = "CS101" },
            new() { Id = 2, Name = "IT", Description = "Info Tech", Code = "IT101" }
        };

        _unitOfWorkMock.Setup(x => x.Programs.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(programs);
        _mapperMock.Setup(x => x.Map<List<ProgramDto>>(programs)).Returns(dtos);

        var result = await _sut.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_ProgramExists_ReturnsSuccess()
    {
        var program = new Program { TenantId = "t1", Name = "CS", Description = "Comp Sci", Code = "CS101" };

        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(program);

        var result = await _sut.DeleteAsync(1);

        Assert.True(result.IsSuccess);
        _unitOfWorkMock.Verify(x => x.Programs.DeleteAsync(program, It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ProgramNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Programs.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Program?)null);

        var result = await _sut.DeleteAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Program not found", result.Message);
    }

    #endregion
}
