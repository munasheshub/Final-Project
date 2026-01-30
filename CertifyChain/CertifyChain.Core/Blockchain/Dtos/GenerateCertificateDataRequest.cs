using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class GenerateCertificateDataRequest
    {
        [Required]
        public string StudentName { get; set; }
        
        [Required]
        public uint StudentId { get; set; }
        
        [Required]
        public ushort InstitutionId { get; set; }
        
        [Required]
        public string Qualification { get; set; }
        
        [Required]
        public DateTime IssueDate { get; set; }
        
        public string? IpfsCID { get; set; }
        
        public IFormFile? CertificateFile { get; set; } 
    }



