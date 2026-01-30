using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class BatchIssueCertificateRequest
{
    [Required]
    public List<string> CertHashes { get; set; }
        
    [Required]
    public List<string> IpfsCIDs { get; set; }
        
    [Required]
    public List<uint> StudentIds { get; set; }
        
    [Required]
    public List<ulong> IssueDates { get; set; }
        
    [Required]
    public string PrivateKey { get; set; }
}