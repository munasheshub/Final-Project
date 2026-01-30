using CertiChain.Application.DTOs.Certificate;
using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Infrastructure.Interfaces;


public interface IInstitutionService
{
    Task<ServiceResponse<InstitutionDto>> CreateAsync(
        CreateInstitutionRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<InstitutionDto>> UpdateAsync(
        UpdateInstitutionRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<InstitutionDto>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<List<InstitutionDto>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResponse<bool>> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public class UpdateInstitutionRequest : CreateInstitutionRequest
{
   
}

public class CreateInstitutionRequest
{
    public int Id { get; set; }
    public string TenantId { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public string? LogoUrl { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
}