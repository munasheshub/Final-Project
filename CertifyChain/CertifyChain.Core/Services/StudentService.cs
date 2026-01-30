using CertiChain.Application.DTOs.Certificate.CertiChain.Application.DTOs.Student;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Services;

public class StudentService : IStudentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StudentService> _logger;

    public StudentService(
        IUnitOfWork unitOfWork,
        ILogger<StudentService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // ================= CREATE =================

    public async Task<ServiceResponse<StudentDto>> CreateAsync(
        CreateStudentRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var student = Student.Create(
                request.StudentNumber,
                request.FirstName,
                request.LastName,
                request.Email,
                request.DateOfBirth,
                request.PhoneNumber,
                request.PhotoUrl);

            await _unitOfWork.Students.AddAsync(student, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Student {StudentNumber} created successfully",
                student.StudentNumber);

            return ServiceResponse<StudentDto>.Success(MapToDto(student));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating student {StudentNumber}", request.StudentNumber);
            return ServiceResponse<StudentDto>.Failure("Failed to create student");
        }
    }

    // ================= UPDATE =================

    public async Task<ServiceResponse<StudentDto>> UpdateAsync(
        UpdateStudentRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var student = await _unitOfWork.Students.GetByIdAsync(
                request.Id,
                cancellationToken);

            if (student == null)
                return ServiceResponse<StudentDto>.Failure("Student not found");

            student.UpdateProfile(
                request.FirstName,
                request.LastName,
                request.Email,
                request.PhoneNumber,
                request.PhotoUrl);

            await _unitOfWork.Students.UpdateAsync(student, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Student {Id} updated successfully",
                student.Id);

            return ServiceResponse<StudentDto>.Success(MapToDto(student));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating student {Id}", request.Id);
            return ServiceResponse<StudentDto>.Failure("Failed to update student");
        }
    }

    // ================= GET BY ID =================

    public async Task<ServiceResponse<StudentDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var student = await _unitOfWork.Students.GetByIdAsync(id, cancellationToken);

            if (student == null)
                return ServiceResponse<StudentDto>.Failure("Student not found");

            return ServiceResponse<StudentDto>.Success(MapToDto(student));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student {Id}", id);
            return ServiceResponse<StudentDto>.Failure("Failed to retrieve student");
        }
    }

    // ================= GET ALL =================

    public async Task<ServiceResponse<List<StudentDto>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var students = await _unitOfWork.Students.GetAllAsync(cancellationToken);

            var result = students.Select(MapToDto).ToList();

            return ServiceResponse<List<StudentDto>>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving students");
            return ServiceResponse<List<StudentDto>>.Failure("Failed to retrieve students");
        }
    }

    // ================= DELETE =================

    public async Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var student = await _unitOfWork.Students.GetByIdAsync(id, cancellationToken);

            if (student == null)
                return ServiceResponse<bool>.Failure("Student not found");

            await _unitOfWork.Students.DeleteAsync(student, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Student {Id} deleted successfully",
                id);

            return ServiceResponse<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting student {Id}", id);
            return ServiceResponse<bool>.Failure("Failed to delete student");
        }
    }

    // ================= MAPPER =================

    private static StudentDto MapToDto(Student student)
    {
        return new StudentDto
        {
            Id = student.Id,
            StudentNumber = student.StudentNumber,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email,
            DateOfBirth = student.DateOfBirth,
            PhoneNumber = student.PhoneNumber,
            PhotoUrl = student.PhotoUrl
        };
    }
    
    
}