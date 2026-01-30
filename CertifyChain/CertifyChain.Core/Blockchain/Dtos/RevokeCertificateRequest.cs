using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class RevokeCertificateRequest
{
    [Required]
    public string CertHash { get; set; }

    public string Reason { get; set; }
}