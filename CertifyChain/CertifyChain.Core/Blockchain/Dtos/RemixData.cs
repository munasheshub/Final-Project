namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class RemixData
{
    public string CertHash { get; set; }
    public string IpfsCID { get; set; }
    public uint StudentId { get; set; }
    public ulong IssueDate { get; set; }
}