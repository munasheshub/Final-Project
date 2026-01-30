using AutoMapper;
using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Services;

public class InstitutionService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ILogger<InstitutionService> logger)
    : IInstitutionService
{
 

    public async Task<ServiceResponse<InstitutionDto>> CreateAsync(
        CreateInstitutionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var institution = mapper.Map<Institution>(request);

            await unitOfWork.Institutions.AddAsync(institution, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Institution {InstitutionCode} created successfully",
                institution.Code);

            return ServiceResponse<InstitutionDto>.Success(mapper.Map<Institution, InstitutionDto>(institution));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating Institution {InstitutionId}", request.Id);
            return ServiceResponse<InstitutionDto>.Failure("Failed to create Institution");
        }
    }

    // ================= UPDATE =================

    public async Task<ServiceResponse<InstitutionDto>> UpdateAsync(
        UpdateInstitutionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var institution = await unitOfWork.Institutions.GetByIdAsync(
                request.Id,
                cancellationToken);

            if (institution == null)
                return ServiceResponse<InstitutionDto>.Failure("Institution not found");

            mapper.Map(request, institution);

            await unitOfWork.Institutions.UpdateAsync(institution, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Institution {Id} updated successfully",
                institution.Id);

            return ServiceResponse<InstitutionDto>.Success(mapper.Map<Institution, InstitutionDto>(institution));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating Institution {Id}", request.Id);
            return ServiceResponse<InstitutionDto>.Failure("Failed to update Institution");
        }
    }

    // ================= GET BY ID =================

    public async Task<ServiceResponse<InstitutionDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var institution = await unitOfWork.Institutions.GetByIdAsync(id, cancellationToken);

            if (institution == null)
                return ServiceResponse<InstitutionDto>.Failure("Institution not found");

            return ServiceResponse<InstitutionDto>.Success(mapper.Map<Institution, InstitutionDto>(institution));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Institution {Id}", id);
            return ServiceResponse<InstitutionDto>.Failure("Failed to retrieve Institution");
        }
    }

    // ================= GET ALL =================

    public async Task<ServiceResponse<List<InstitutionDto>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var institutions = await unitOfWork.Institutions.GetAllAsync(cancellationToken);

            var result = mapper.Map<List<InstitutionDto>>(institutions);

            return ServiceResponse<List<InstitutionDto>>.Success(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Institutions");
            return ServiceResponse<List<InstitutionDto>>.Failure("Failed to retrieve Institutions");
        }
    }

    // ================= DELETE =================

    public async Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var institution = await unitOfWork.Institutions.GetByIdAsync(id, cancellationToken);

            if (institution == null)
                return ServiceResponse<bool>.Failure("Institution not found");

            await unitOfWork.Institutions.DeleteAsync(institution, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Institution {Id} deleted successfully",
                id);

            return ServiceResponse<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting Institution {Id}", id);
            return ServiceResponse<bool>.Failure("Failed to delete Institution");
        }
    }

  
    
    
}