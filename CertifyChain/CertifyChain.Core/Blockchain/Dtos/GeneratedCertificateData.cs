namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class GeneratedCertificateData
{
    public string StudentName { get; set; }
    public uint StudentId { get; set; }
    public ushort InstitutionId { get; set; }
    public string Qualification { get; set; }
    public DateTime IssueDate { get; set; }
    public ulong IssueDateUnix { get; set; }
    public string CertHash { get; set; }
    public string IpfsCID { get; set; }
    public string IpfsCIDBytes32 { get; set; }
        
    // Ready-to-use data for Remix
    public RemixData RemixData { get; set; }
        
    // Ready-to-use data for API
    public ApiData ApiData { get; set; }
}