namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class ApiData
{
    public byte[] CertHash { get; set; }
    public byte[] IpfsCID { get; set; }
    public uint StudentId { get; set; }
    public ulong IssueDate { get; set; }
}