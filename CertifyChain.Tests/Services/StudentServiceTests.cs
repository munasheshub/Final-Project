using CertiChain.Application.DTOs.Student;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace CertifyChain.Tests.Services;

public class StudentServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<StudentService>> _loggerMock;
    private readonly StudentService _sut;

    public StudentServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<StudentService>>();
        _sut = new StudentService(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_WithValidRequest_ReturnsSuccess()
    {
        _unitOfWorkMock.Setup(x => x.Students.GetByStudentNumberAsync("STU-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Student?)null);
        _unitOfWorkMock.Setup(x => x.Students.AddAsync(It.IsAny<Student>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Student s, CancellationToken _) => s);

        var request = new CreateStudentRequest
        {
            TenantId = "tenant-001",
            StudentNumber = "STU-001",
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            DateOfBirth = new DateTime(2000, 1, 15)
        };

        var result = await _sut.CreateAsync(request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal("STU-001", result.Data!.StudentNumber);
        Assert.Equal("John", result.Data.FirstName);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_DuplicateStudentNumber_ReturnsFailure()
    {
        var existing = Student.Create("STU-001", "Existing", "Student", "e@t.com", DateTime.Now, "", "");

        _unitOfWorkMock.Setup(x => x.Students.GetByStudentNumberAsync("STU-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var request = new CreateStudentRequest
        {
            TenantId = "tenant-001",
            StudentNumber = "STU-001",
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            DateOfBirth = DateTime.Now
        };

        var result = await _sut.CreateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Contains("already exists", result.Message);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_StudentExists_ReturnsUpdatedStudent()
    {
        var student = Student.Create("STU-001", "John", "Doe", "john@test.com", DateTime.Now, "", "");
        student.TenantId = "tenant-001";

        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(student);

        var request = new UpdateStudentRequest
        {
            Id = 1,
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane@test.com",
            PhoneNumber = "+263771234567"
        };

        var result = await _sut.UpdateAsync(request);

        Assert.True(result.IsSuccess);
        Assert.Equal("Jane", result.Data!.FirstName);
        Assert.Equal("Smith", result.Data.LastName);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_StudentNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Student?)null);

        var request = new UpdateStudentRequest { Id = 999, FirstName = "X", LastName = "Y", Email = "x@t.com" };

        var result = await _sut.UpdateAsync(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Student not found", result.Message);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_StudentExists_ReturnsSuccess()
    {
        var student = Student.Create("STU-001", "John", "Doe", "john@test.com", DateTime.Now, "", "");
        student.TenantId = "tenant-001";

        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(student);

        var result = await _sut.GetByIdAsync(1);

        Assert.True(result.IsSuccess);
        Assert.Equal("STU-001", result.Data!.StudentNumber);
    }

    [Fact]
    public async Task GetByIdAsync_StudentNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Student?)null);

        var result = await _sut.GetByIdAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Student not found", result.Message);
    }

    #endregion

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsAllStudents()
    {
        var s1 = Student.Create("STU-001", "John", "Doe", "j@t.com", DateTime.Now, "", "");
        s1.TenantId = "t1";
        var s2 = Student.Create("STU-002", "Jane", "Smith", "js@t.com", DateTime.Now, "", "");
        s2.TenantId = "t1";

        _unitOfWorkMock.Setup(x => x.Students.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([s1, s2]);

        var result = await _sut.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Data!.Count);
    }

    [Fact]
    public async Task GetAllAsync_Empty_ReturnsEmptyList()
    {
        _unitOfWorkMock.Setup(x => x.Students.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _sut.GetAllAsync();

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Data!);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_StudentExists_ReturnsSuccess()
    {
        var student = Student.Create("STU-001", "John", "Doe", "j@t.com", DateTime.Now, "", "");

        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(student);

        var result = await _sut.DeleteAsync(1);

        Assert.True(result.IsSuccess);
        _unitOfWorkMock.Verify(x => x.Students.DeleteAsync(student, It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_StudentNotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Students.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Student?)null);

        var result = await _sut.DeleteAsync(999);

        Assert.False(result.IsSuccess);
        Assert.Equal("Student not found", result.Message);
    }

    #endregion

    #region GetByStudentNumberAsync

    [Fact]
    public async Task GetByStudentNumberAsync_Found_ReturnsSuccess()
    {
        var student = Student.Create("STU-001", "John", "Doe", "j@t.com", DateTime.Now, "", "");
        student.TenantId = "t1";

        _unitOfWorkMock.Setup(x => x.Students.GetByStudentNumberAsync("STU-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(student);

        var result = await _sut.GetByStudentNumberAsync("STU-001");

        Assert.True(result.IsSuccess);
        Assert.Equal("STU-001", result.Data!.StudentNumber);
    }

    [Fact]
    public async Task GetByStudentNumberAsync_NotFound_ReturnsFailure()
    {
        _unitOfWorkMock.Setup(x => x.Students.GetByStudentNumberAsync("INVALID", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Student?)null);

        var result = await _sut.GetByStudentNumberAsync("INVALID");

        Assert.False(result.IsSuccess);
        Assert.Equal("Student not found", result.Message);
    }

    #endregion
}
