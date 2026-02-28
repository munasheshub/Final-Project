using AutoMapper;
using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Core.IRepositories;
using CertifyChain.Domain.Entities;
using CertifyChain.Domain.ValueObject;
using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.MultiTenancy;
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
            // Check if subdomain already exists
            var existingTenant = await unitOfWork.Tenants.GetTenantBySubDomainAsync(request.Subdomain);
            if (existingTenant != null)
                return ServiceResponse<InstitutionDto>.Failure($"Subdomain '{request.Subdomain}' is already taken");

            // Begin transaction to ensure institution, address, and tenant are created together
            await unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                // Create the address if provided
                Address? address = null;
                if (request.Address != null)
                {
                    address = Address.Create(
                        request.Address.Street,
                        request.Address.City,
                        request.Address.Province,
                        request.Address.Country,
                        request.Address.PostalCode);

                    await unitOfWork.Addresses.AddAsync(address, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }

                // Create the institution
                var institution = mapper.Map<Institution>(request);
                if (address != null)
                {
                    institution.SetAddress(address.Id);
                }

                await unitOfWork.Institutions.AddAsync(institution, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                // Create the tenant
                var tenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Subdomain = request.Subdomain,
                    IsActive = true,
                    InstitutionId = institution.Id
                };

                await unitOfWork.Tenants.AddAsync(tenant, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                // Commit the transaction
                await unitOfWork.CommitTransactionAsync(cancellationToken);

                logger.LogInformation(
                    "Institution {InstitutionCode}, Address, and Tenant {TenantId} created successfully",
                    institution.Code,
                    tenant.Id);

                // Fetch the complete institution with address for response
                var createdInstitution = await unitOfWork.Institutions.GetByIdAsync(institution.Id, cancellationToken);
                var result = mapper.Map<InstitutionDto>(createdInstitution);
                if (address != null)
                {
                    result.Address = mapper.Map<AddressDto>(address);
                }

                return ServiceResponse<InstitutionDto>.Success(
                    result,
                    "Institution, address, and tenant created successfully");
            }
            catch
            {
                await unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating Institution");
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

            // Begin transaction to ensure institution and address are updated together
            await unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                // Update or create address if provided
                if (request.Address != null)
                {
                    if (institution.AddressId.HasValue)
                    {
                        // Update existing address
                        var existingAddress = await unitOfWork.Addresses.GetByIdAsync(
                            institution.AddressId.Value,
                            cancellationToken);

                        if (existingAddress != null)
                        {
                            existingAddress.Update(
                                request.Address.Street,
                                request.Address.City,
                                request.Address.Province,
                                request.Address.Country,
                                request.Address.PostalCode);

                            await unitOfWork.Addresses.UpdateAsync(existingAddress, cancellationToken);
                            await unitOfWork.SaveChangesAsync(cancellationToken);
                        }
                    }
                    else
                    {
                        // Create new address
                        var newAddress = Address.Create(
                            request.Address.Street,
                            request.Address.City,
                            request.Address.Province,
                            request.Address.Country,
                            request.Address.PostalCode);

                        await unitOfWork.Addresses.AddAsync(newAddress, cancellationToken);
                        await unitOfWork.SaveChangesAsync(cancellationToken);

                        institution.SetAddress(newAddress.Id);
                    }
                }

                // Update institution
                mapper.Map(request, institution);
                await unitOfWork.Institutions.UpdateAsync(institution, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                // Commit the transaction
                await unitOfWork.CommitTransactionAsync(cancellationToken);

                logger.LogInformation(
                    "Institution {Id} updated successfully",
                    institution.Id);

                // Fetch the complete institution with address for response
                var updatedInstitution = await unitOfWork.Institutions.GetByIdAsync(institution.Id, cancellationToken);
                var result = mapper.Map<InstitutionDto>(updatedInstitution);

                if (institution.AddressId.HasValue)
                {
                    var address = await unitOfWork.Addresses.GetByIdAsync(institution.AddressId.Value, cancellationToken);
                    if (address != null)
                    {
                        result.Address = mapper.Map<AddressDto>(address);
                    }
                }

                return ServiceResponse<InstitutionDto>.Success(result, "Institution updated successfully");
            }
            catch
            {
                await unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
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

            var result = mapper.Map<InstitutionDto>(institution);

            // Load address if exists
            if (institution.AddressId.HasValue)
            {
                var address = await unitOfWork.Addresses.GetByIdAsync(
                    institution.AddressId.Value,
                    cancellationToken);

                if (address != null)
                {
                    result.Address = mapper.Map<AddressDto>(address);
                }
            }

            // Load tenant information from Tenant table
            var allTenants = await unitOfWork.Tenants.GetAllAsync(cancellationToken);
            var associatedTenant = allTenants.FirstOrDefault(t => t.InstitutionId == id);

            if (associatedTenant != null)
            {
                result.TenantId = associatedTenant.Id.ToString();
            }

            return ServiceResponse<InstitutionDto>.Success(result);
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
            var allTenants = await unitOfWork.Tenants.GetAllAsync(cancellationToken);
            var result = new List<InstitutionDto>();

            foreach (var institution in institutions)
            {
                var dto = mapper.Map<InstitutionDto>(institution);

                // Load address if exists
                if (institution.AddressId.HasValue)
                {
                    var address = await unitOfWork.Addresses.GetByIdAsync(
                        institution.AddressId.Value,
                        cancellationToken);

                    if (address != null)
                    {
                        dto.Address = mapper.Map<AddressDto>(address);
                    }
                }

                // Load tenant information from Tenant table
                var associatedTenant = allTenants.FirstOrDefault(t => t.InstitutionId == institution.Id);
                if (associatedTenant != null)
                {
                    dto.TenantId = associatedTenant.Id.ToString();
                }

                result.Add(dto);
            }

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

            // Begin transaction to ensure institution, address, and tenant are deleted together
            await unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                // Find and delete associated tenant
                var allTenants = await unitOfWork.Tenants.GetAllAsync(cancellationToken);
                var associatedTenant = allTenants.FirstOrDefault(t => t.InstitutionId == id);

                if (associatedTenant != null)
                {
                    await unitOfWork.Tenants.DeleteAsync(associatedTenant, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }

                // Delete associated address
                if (institution.AddressId.HasValue)
                {
                    var address = await unitOfWork.Addresses.GetByIdAsync(
                        institution.AddressId.Value,
                        cancellationToken);

                    if (address != null)
                    {
                        await unitOfWork.Addresses.DeleteAsync(address, cancellationToken);
                        await unitOfWork.SaveChangesAsync(cancellationToken);
                    }
                }

                // Delete institution
                await unitOfWork.Institutions.DeleteAsync(institution, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                // Commit the transaction
                await unitOfWork.CommitTransactionAsync(cancellationToken);

                logger.LogInformation(
                    "Institution {Id}, associated address, and tenant deleted successfully",
                    id);

                return ServiceResponse<bool>.Success(true, "Institution, address, and tenant deleted successfully");
            }
            catch
            {
                await unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting Institution {Id}", id);
            return ServiceResponse<bool>.Failure("Failed to delete Institution");
        }
    }

  
    // ================= GET BY TENANT =================

    public async Task<ServiceResponse<InstitutionDto>> GetByTenantIdAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenant = await unitOfWork.Tenants.GetTenantByIdAsync(tenantId);

            if (tenant == null)
                return ServiceResponse<InstitutionDto>.Failure("Tenant not found");

            if (!tenant.InstitutionId.HasValue)
                return ServiceResponse<InstitutionDto>.Failure("No institution associated with this tenant");

            return await GetByIdAsync(tenant.InstitutionId.Value, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving Institution for Tenant {TenantId}", tenantId);
            return ServiceResponse<InstitutionDto>.Failure("Failed to retrieve Institution");
        }
    }
}