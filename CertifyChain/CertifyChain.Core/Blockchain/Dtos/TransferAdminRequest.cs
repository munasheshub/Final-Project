using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class TransferAdminRequest
{
    [Required]
    public string NewAdminAddress { get; set; }
        
    [Required]
    public string CurrentAdminPrivateKey { get; set; }
}