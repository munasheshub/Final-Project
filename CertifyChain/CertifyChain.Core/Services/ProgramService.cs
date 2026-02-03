using AutoMapper;
using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Infrastructure.DataTransferObjects;
using CertifyChain.Infrastructure.Entities;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Services;

public class ProgramService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ILogger<ProgramService> logger)
    : IProgramService
{
 

    public async Task<ServiceResponse<ProgramDto>> CreateAsync(
        ProgramDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var Program = mapper.Map<Program>(request);

            await unitOfWork.Programs.AddAsync(Program, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Program {ProgramCode} created successfully",
                Program.Code);

            return ServiceResponse<ProgramDto>.Success(mapper.Map<Program, ProgramDto>(Program));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating Program {ProgramId}", request.Id);
            return ServiceResponse<ProgramDto>.Failure("Failed to create Program");
        }
    }

    // ================= UPDATE =================

    public async Task<ServiceResponse<ProgramDto>> UpdateAsync(
        ProgramDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var Program = await unitOfWork.Programs.GetByIdAsync(
                request.Id,
                cancellationToken);

            if (Program == null)
                return ServiceResponse<ProgramDto>.Failure("Program not found");

            mapper.Map(request, Program);

            await unitOfWork.Programs.UpdateAsync(Program, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Program {Id} updated successfully",
                Program.Id);

            return ServiceResponse<ProgramDto>.Success(mapper.Map<Program, ProgramDto>(Program));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating Program {Id}", request.Id);
            return ServiceResponse<ProgramDto>.Failure("Failed to update Program");
        }
    }

    // ================= GET BY ID =================

    public async Task<ServiceResponse<ProgramDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var Program = await unitOfWork.Programs.GetByIdAsync(id, cancellationToken);

            if (Program == null)
                return ServiceResponse<ProgramDto>.Failure("Program not found");

            return ServiceResponse<ProgramDto>.Success(mapper.Map<Program, ProgramDto>(Program));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Program {Id}", id);
            return ServiceResponse<ProgramDto>.Failure("Failed to retrieve Program");
        }
    }

    // ================= GET ALL =================

    public async Task<ServiceResponse<List<ProgramDto>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var Programs = await unitOfWork.Programs.GetAllAsync(cancellationToken);

            var result = mapper.Map<List<ProgramDto>>(Programs);

            return ServiceResponse<List<ProgramDto>>.Success(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Programs");
            return ServiceResponse<List<ProgramDto>>.Failure("Failed to retrieve Programs");
        }
    }

    // ================= DELETE =================

    public async Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var Program = await unitOfWork.Programs.GetByIdAsync(id, cancellationToken);

            if (Program == null)
                return ServiceResponse<bool>.Failure("Program not found");

            await unitOfWork.Programs.DeleteAsync(Program, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Program {Id} deleted successfully",
                id);

            return ServiceResponse<bool>.Success(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting Program {Id}", id);
            return ServiceResponse<bool>.Failure("Failed to delete Program");
        }
    }

  
    
    
}