using System.Numerics;

namespace CertifyChain.Infrastructure.Blockchain;

// Infrastructure/Blockchain/IBlockchainService.cs
public interface IBlockchainService
{
    Task<string> ConnectWalletAsync(string privateKey);
    Task<BlockchainTransactionResult> RegisterCertificateAsync(
        string certificateHash,
        string ipfsCid,
        string certificateNumber);
    Task<BlockchainTransactionResult> RevokeCertificateAsync(
        string certificateNumber,
        string reason);
    Task<CertificateBlockchainData?> VerifyCertificateAsync(string certificateNumber);
    Task<decimal> EstimateGasAsync(string operation);
    Task<string> GetTransactionStatusAsync(string txHash);
}

public class CertificateBlockchainData
{
    public bool IsRevoked { get; set; }
}

public class BlockchainTransactionResult
{
    public string TransactionHash { get; set; }
    public bool Success { get; set; }
    public BigInteger BlockNumber { get; set; }
    public BigInteger GasUsed { get; set; }
    public DateTime Timestamp { get; set; }
}
