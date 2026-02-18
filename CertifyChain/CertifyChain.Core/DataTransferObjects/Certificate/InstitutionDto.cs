namespace CertiChain.Application.DTOs.Certificate;

public class InstitutionDto
{
    public int Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? SealUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? WalletAddress { get; set; }
    public string? SmartContractAddress { get; set; }
    public string? IpfsGateway { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public AddressDto? Address { get; set; }
}