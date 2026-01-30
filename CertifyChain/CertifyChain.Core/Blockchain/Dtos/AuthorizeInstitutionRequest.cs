using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class AuthorizeInstitutionRequest
{
    [Required]
    public ushort InstitutionId { get; set; }
        
    [Required]
    public string InstitutionAddress { get; set; }
        
    [Required]
    public string AdminPrivateKey { get; set; }
}