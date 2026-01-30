namespace CertifyChain.Infrastructure.Blockchain.Dtos;

public class TransactionResult
{
    public bool Success { get; set; }
    public string TransactionHash { get; set; }
    public string Message { get; set; }
    public string? ExplorerUrl { get; set; }
}