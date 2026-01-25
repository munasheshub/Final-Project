using System.Diagnostics.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CertifyChain.Infrastructure.Blockchain.Ethereum;


public class EthereumBlockchainService : IBlockchainService
{
    private readonly Web3 _web3;
    private readonly string _contractAddress;
    private readonly Contract _contract;
    private readonly ILogger<EthereumBlockchainService> _logger;

    public EthereumBlockchainService(
        IConfiguration configuration,
        ILogger<EthereumBlockchainService> logger)
    {
        var rpcUrl = configuration["Blockchain:RpcUrl"];
        _contractAddress = configuration["Blockchain:ContractAddress"]
                           ?? throw new InvalidOperationException("Contract address not configured");

        _web3 = new Web3(rpcUrl);
        _contract = _web3.Eth.GetContract
            (GetContractAbi(), _contractAddress);
        _logger = logger;
    }
    
    public async Task<BlockchainTransactionResult> RegisterCertificateAsync(
        string certificateHash,
        string ipfsCid,
        string certificateNumber)
    {
        try
        {
            var registerFunction = _contract.GetFunction("registerCertificate");
        
            var gas = await registerFunction.EstimateGasAsync(
                certificateNumber,
                certificateHash,
                ipfsCid);
        
            var receipt = await registerFunction.SendTransactionAndWaitForReceiptAsync(
                from: _web3.TransactionManager.Account.Address,
                gas: gas,
                value: null,
                functionInput: new object[] { certificateNumber, certificateHash, ipfsCid });
        
            return new BlockchainTransactionResult
            {
                Success = receipt.Status.Value == 1,
                TransactionHash = receipt.TransactionHash,
                BlockNumber = receipt.BlockNumber.Value,
                GasUsed = receipt.GasUsed.Value,
                Timestamp = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register certificate on blockchain");
            throw new BlockchainException("Failed to register certificate", ex);
        }
    }

    public async Task<CertificateBlockchainData?> VerifyCertificateAsync(string certificateNumber)
    {
        var getCertificateFunction = _contract.GetFunction("getCertificate");
    
        var result = await getCertificateFunction.CallDeserializingToObjectAsync<CertificateBlockchainData>(
            certificateNumber);
    
        return result.IsRevoked ? null : result;
    }

// Implement other methods...

    private string GetContractAbi()
    {
        // Return your smart contract ABI
        return @"[...]";
    }