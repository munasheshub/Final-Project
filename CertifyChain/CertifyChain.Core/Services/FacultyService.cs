using AutoMapper;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Services;

public class FacultyService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ILogger<FacultyService> logger)
    : IFacultyService
{

    // ================= CREATE =================

    public async Task<ServiceResponse<FacultyDto>> CreateAsync(
        CreateFacultyRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var institution = await unitOfWork.Institutions.GetByIdAsync(
                request.InstitutionId, cancellationToken);

            if (institution == null)
                return ServiceResponse<FacultyDto>.Failure("Institution not found");

            var faculty = Faculty.Create(
                request.Name,
                request.Code,
                request.InstitutionId);

            await unitOfWork.Faculties.AddAsync(faculty, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Faculty {FacultyCode} created successfully",
                faculty.Code);

            return ServiceResponse<FacultyDto>.Success(mapper.Map<FacultyDto>(faculty));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating Faculty");
            return ServiceResponse<FacultyDto>.Failure("Failed to create Faculty");
        }
    }

    // ================= UPDATE =================

    public async Task<ServiceResponse<FacultyDto>> UpdateAsync(
        UpdateFacultyRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var faculty = await unitOfWork.Faculties.GetByIdAsync(
                request.Id, cancellationToken);

            if (faculty == null)
                return ServiceResponse<FacultyDto>.Failure("Faculty not found");

            faculty.Update(request.Name, request.Code);

            await unitOfWork.Faculties.UpdateAsync(faculty, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Faculty {Id} updated successfully",
                faculty.Id);

            return ServiceResponse<FacultyDto>.Success(mapper.Map<FacultyDto>(faculty));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating Faculty {Id}", request.Id);
            return ServiceResponse<FacultyDto>.Failure("Failed to update Faculty");
        }
    }

    // ================= GET BY ID =================

    public async Task<ServiceResponse<FacultyDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var faculty = await unitOfWork.Faculties.GetByIdAsync(id, cancellationToken);

            if (faculty == null)
                return ServiceResponse<FacultyDto>.Failure("Faculty not found");

            return ServiceResponse<FacultyDto>.Success(mapper.Map<FacultyDto>(faculty));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Faculty {Id}", id);
            return ServiceResponse<FacultyDto>.Failure("Failed to retrieve Faculty");
        }
    }

    // ================= GET ALL =================

    public async Task<ServiceResponse<List<FacultyDto>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var faculties = await unitOfWork.Faculties.GetAllAsync(cancellationToken);

            var result = mapper.Map<List<FacultyDto>>(faculties);

            return ServiceResponse<List<FacultyDto>>.Success(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Faculties");
            return ServiceResponse<List<FacultyDto>>.Failure("Failed to retrieve Faculties");
        }
    }

    // ================= GET BY INSTITUTION =================

    public async Task<ServiceResponse<List<FacultyDto>>> GetByInstitutionIdAsync(
        int institutionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var faculties = await unitOfWork.Faculties.GetByInstitutionIdAsync(
                institutionId, cancellationToken);

            var result = mapper.Map<List<FacultyDto>>(faculties);

            return ServiceResponse<List<FacultyDto>>.Success(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Faculties for Institution {Id}", institutionId);
            return ServiceResponse<List<FacultyDto>>.Failure("Failed to retrieve Faculties");
        }
    }

    // ================= DELETE =================

    public async Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var faculty = await unitOfWork.Faculties.GetByIdAsync(id, cancellationToken);

            if (faculty == null)
                return ServiceResponse<bool>.Failure("Faculty not found");

            await unitOfWork.Faculties.DeleteAsync(faculty, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Faculty {Id} deleted successfully",
                id);

            return ServiceResponse<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting Faculty {Id}", id);
            return ServiceResponse<bool>.Failure("Failed to delete Faculty");
        }
    }
}
