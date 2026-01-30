using System.ComponentModel.DataAnnotations;

namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class IssueCertificateRequest
{
    [Required]
    public string CertHash { get; set; }
        
    [Required]
    public string IpfsCID { get; set; }
        
    [Required]
    public int StudentId { get; set; }
        
    [Required]
    public DateTime IssueDate { get; set; }
        

}