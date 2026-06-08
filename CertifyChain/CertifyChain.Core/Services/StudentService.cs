using System.Globalization;
using CertiChain.Application.DTOs.Student;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using CsvHelper;
using CsvHelper.Configuration;
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
            var existingStudent = await _unitOfWork.Students.GetByStudentNumberAsync(
                request.StudentNumber,
                cancellationToken);

            if (existingStudent != null)
                return ServiceResponse<StudentDto>.Failure(
                    $"Student with number {request.StudentNumber} already exists");

            var student = Student.Create(
                request.StudentNumber,
                request.FirstName,
                request.LastName,
                request.Email,
                request.DateOfBirth,
                request.PhoneNumber ?? string.Empty,
                request.PhotoUrl ?? string.Empty);

            student.TenantId = request.TenantId;

            await _unitOfWork.Students.AddAsync(student, cancellationToken);

            // If a program is specified, create the StudentProgram association
            if (request.ProgramId.HasValue && request.ProgramId.Value > 0)
            {
                student.StudentPrograms.Add(new StudentProgram
                {
                    StudentId = student.Id,
                    ProgramId = request.ProgramId.Value,
                    EnrolledAt = DateTime.UtcNow
                });
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

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

    // ================= GET BY STUDENT NUMBER =================

    public async Task<ServiceResponse<StudentDto>> GetByStudentNumberAsync(
        string studentNumber,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var student = await _unitOfWork.Students.GetByStudentNumberAsync(
                studentNumber,
                cancellationToken);

            if (student == null)
                return ServiceResponse<StudentDto>.Failure("Student not found");

            return ServiceResponse<StudentDto>.Success(MapToDto(student));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student {StudentNumber}", studentNumber);
            return ServiceResponse<StudentDto>.Failure("Failed to retrieve student");
        }
    }

    // ================= BULK UPLOAD =================

    public async Task<ServiceResponse<BulkUploadResult>> BulkUploadAsync(
        Stream csvStream,
        CancellationToken cancellationToken = default)
    {
        var result = new BulkUploadResult();
        var studentsToAdd = new List<Student>();

        try
        {
            using var reader = new StreamReader(csvStream);
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                HeaderValidated = null
            };

            using var csv = new CsvReader(reader, config);

            var records = csv.GetRecords<StudentCsvRecord>().ToList();
            result.TotalRecords = records.Count;

            for (int i = 0; i < records.Count; i++)
            {
                var row = records[i];
                var rowNumber = i + 2;

                try
                {
                    if (string.IsNullOrWhiteSpace(row.StudentNumber))
                    {
                        result.Errors.Add(new BulkUploadError
                        {
                            RowNumber = rowNumber,
                            StudentNumber = row.StudentNumber ?? "N/A",
                            ErrorMessage = "Student number is required"
                        });
                        result.FailedRecords++;
                        continue;
                    }

                    var existingStudent = await _unitOfWork.Students.GetByStudentNumberAsync(
                        row.StudentNumber,
                        cancellationToken);

                    if (existingStudent != null)
                    {
                        result.Errors.Add(new BulkUploadError
                        {
                            RowNumber = rowNumber,
                            StudentNumber = row.StudentNumber,
                            ErrorMessage = "Student number already exists"
                        });
                        result.FailedRecords++;
                        continue;
                    }

                    if (!DateTime.TryParse(row.DateOfBirth, out var dateOfBirth))
                    {
                        result.Errors.Add(new BulkUploadError
                        {
                            RowNumber = rowNumber,
                            StudentNumber = row.StudentNumber,
                            ErrorMessage = "Invalid date of birth format"
                        });
                        result.FailedRecords++;
                        continue;
                    }

                    var student = Student.Create(
                        row.StudentNumber,
                        row.FirstName ?? string.Empty,
                        row.LastName ?? string.Empty,
                        row.Email ?? string.Empty,
                        dateOfBirth,
                        row.PhoneNumber ?? string.Empty,
                        row.PhotoUrl ?? string.Empty);

                    student.TenantId = row.TenantId ?? string.Empty;

                    studentsToAdd.Add(student);
                    result.SuccessfulRecords++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add(new BulkUploadError
                    {
                        RowNumber = rowNumber,
                        StudentNumber = row.StudentNumber ?? "N/A",
                        ErrorMessage = ex.Message
                    });
                    result.FailedRecords++;
                    _logger.LogWarning(ex, "Error processing row {RowNumber}", rowNumber);
                }
            }

            if (studentsToAdd.Any())
            {
                await _unitOfWork.Students.AddRangeAsync(studentsToAdd, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation(
                    "Bulk upload completed: {SuccessCount} successful, {FailCount} failed",
                    result.SuccessfulRecords,
                    result.FailedRecords);
            }

            return ServiceResponse<BulkUploadResult>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk upload");
            return ServiceResponse<BulkUploadResult>.Failure("Failed to process bulk upload");
        }
    }

    // ================= MAPPER =================

    private static StudentDto MapToDto(Student student)
    {
        var primaryProgram = student.StudentPrograms?.FirstOrDefault();
        return new StudentDto
        {
            Id = student.Id,
            TenantId = student.TenantId,
            StudentNumber = student.StudentNumber,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email,
            DateOfBirth = student.DateOfBirth,
            PhoneNumber = student.PhoneNumber,
            PhotoUrl = student.PhotoUrl,
            ProgramId = primaryProgram?.ProgramId,
            ProgramName = primaryProgram?.Program?.Name,
            CreatedAt = student.CreationDate,
            UpdatedAt = null
        };
    }
}

public class StudentCsvRecord
{
    public string? TenantId { get; set; }
    public string? StudentNumber { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? DateOfBirth { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PhotoUrl { get; set; }
}