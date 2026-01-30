using System.Text;
using CertifyChain.Infrastructure.Blockchain.Dtos;
using Microsoft.Extensions.Configuration;
using NBitcoin.DataEncoders;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.Util;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;

namespace CertifyChain.Infrastructure.Blockchain;

public class BlockchainService : IBlockchainService
    {
        private readonly string _rpcUrl;
        private readonly string _privateKey;
        private readonly string _contractAddress;
        private readonly string _explorerUrl;
        private readonly Web3 _web3;
        private readonly Contract _contract;

        // CONTRACT ABI - Replace with your actual ABI from Remix
        private const string CONTRACT_ABI = @"[
            {""inputs"":[],""stateMutability"":""nonpayable"",""type"":""constructor""},
            {""inputs"":[{""internalType"":""uint16"",""name"":""institutionId"",""type"":""uint16""},{""internalType"":""address"",""name"":""institutionAddress"",""type"":""address""}],""name"":""authorizeInstitution"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},
            {""inputs"":[{""internalType"":""bytes32[]"",""name"":""certHashes"",""type"":""bytes32[]""},{""internalType"":""bytes32[]"",""name"":""ipfsCIDs"",""type"":""bytes32[]""},{""internalType"":""uint32[]"",""name"":""studentIds"",""type"":""uint32[]""},{""internalType"":""uint64[]"",""name"":""issueDates"",""type"":""uint64[]""}],""name"":""batchIssueCertificates"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},
            {""inputs"":[{""internalType"":""bytes32"",""name"":""certHash"",""type"":""bytes32""}],""name"":""certificateExists"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""view"",""type"":""function""},
            {""inputs"":[{""internalType"":""uint16"",""name"":""institutionId"",""type"":""uint16""}],""name"":""deauthorizeInstitution"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},
            {""inputs"":[{""internalType"":""bytes32"",""name"":""certHash"",""type"":""bytes32""}],""name"":""getCertificateDetails"",""outputs"":[{""components"":[{""internalType"":""bytes32"",""name"":""certHash"",""type"":""bytes32""},{""internalType"":""bytes32"",""name"":""ipfsCID"",""type"":""bytes32""},{""internalType"":""uint64"",""name"":""issueDate"",""type"":""uint64""},{""internalType"":""uint32"",""name"":""studentId"",""type"":""uint32""},{""internalType"":""uint16"",""name"":""institutionId"",""type"":""uint16""},{""internalType"":""uint8"",""name"":""status"",""type"":""uint8""},{""internalType"":""bool"",""name"":""exists"",""type"":""bool""}],""internalType"":""struct CertificateVerification.Certificate"",""name"":"""",""type"":""tuple""}],""stateMutability"":""view"",""type"":""function""},
            {""inputs"":[],""name"":""getStats"",""outputs"":[{""internalType"":""uint32"",""name"":""totalCerts"",""type"":""uint32""}],""stateMutability"":""view"",""type"":""function""},
            {""inputs"":[{""internalType"":""bytes32"",""name"":""certHash"",""type"":""bytes32""},{""internalType"":""bytes32"",""name"":""ipfsCID"",""type"":""bytes32""},{""internalType"":""uint32"",""name"":""studentId"",""type"":""uint32""},{""internalType"":""uint64"",""name"":""issueDate"",""type"":""uint64""}],""name"":""issueCertificate"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},
            {""inputs"":[{""internalType"":""bytes32"",""name"":""certHash"",""type"":""bytes32""}],""name"":""revokeCertificate"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},
            {""inputs"":[{""internalType"":""address"",""name"":""newAdmin"",""type"":""address""}],""name"":""transferAdmin"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},
            {""inputs"":[{""internalType"":""bytes32"",""name"":""certHash"",""type"":""bytes32""}],""name"":""verifyCertificate"",""outputs"":[{""internalType"":""bool"",""name"":""isValid"",""type"":""bool""},{""internalType"":""uint32"",""name"":""studentId"",""type"":""uint32""},{""internalType"":""uint16"",""name"":""institutionId"",""type"":""uint16""},{""internalType"":""uint64"",""name"":""issueDate"",""type"":""uint64""},{""internalType"":""bytes32"",""name"":""ipfsCID"",""type"":""bytes32""}],""stateMutability"":""view"",""type"":""function""},
            {""inputs"":[],""name"":""admin"",""outputs"":[{""internalType"":""address"",""name"":"""",""type"":""address""}],""stateMutability"":""view"",""type"":""function""},
            {""inputs"":[],""name"":""certificateCount"",""outputs"":[{""internalType"":""uint32"",""name"":"""",""type"":""uint32""}],""stateMutability"":""view"",""type"":""function""}
        ]";

        public BlockchainService(IConfiguration configuration)
        {
            _rpcUrl = configuration["Blockchain:RpcUrl"];
            _contractAddress = configuration["Blockchain:ContractAddress"];
            _explorerUrl = configuration["Blockchain:ExplorerUrl"];
            _privateKey = configuration["Blockchain:PrivateKey"];
            
            _web3 = new Web3(_rpcUrl);
            _contract = _web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);
        }

        // ========== ADMIN FUNCTIONS ==========

        public async Task<TransactionResult> AuthorizeInstitution(
            ushort institutionId, 
            string institutionAddress, 
            string adminPrivateKey)
        {
            try
            {
                var account = new Account(adminPrivateKey);
                var web3 = new Web3(account, _rpcUrl);
                var contract = web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);
                
                var function = contract.GetFunction("authorizeInstitution");
                var txHash = await function.SendTransactionAsync(
                    account.Address,
                    new HexBigInteger(300000),
                    new HexBigInteger(0),
                    institutionId,
                    institutionAddress
                );

                return new TransactionResult
                {
                    Success = true,
                    TransactionHash = txHash,
                    Message = $"Institution {institutionId} authorized successfully",
                    ExplorerUrl = $"{_explorerUrl}/tx/{txHash}"
                };
            }
            catch (Exception ex)
            {
                return new TransactionResult
                {
                    Success = false,
                    Message = $"Failed to authorize institution: {ex.Message}"
                };
            }
        }

        public async Task<TransactionResult> DeauthorizeInstitution(
            ushort institutionId, 
            string adminPrivateKey)
        {
            try
            {
                var account = new Account(adminPrivateKey);
                var web3 = new Web3(account, _rpcUrl);
                var contract = web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);
                
                var function = contract.GetFunction("deauthorizeInstitution");
                var txHash = await function.SendTransactionAsync(
                    account.Address,
                    new HexBigInteger(200000),
                    new HexBigInteger(0),
                    institutionId
                );

                return new TransactionResult
                {
                    Success = true,
                    TransactionHash = txHash,
                    Message = $"Institution {institutionId} deauthorized successfully",
                    ExplorerUrl = $"{_explorerUrl}/tx/{txHash}"
                };
            }
            catch (Exception ex)
            {
                return new TransactionResult
                {
                    Success = false,
                    Message = $"Failed to deauthorize institution: {ex.Message}"
                };
            }
        }

        public async Task<TransactionResult> TransferAdmin(
            string newAdminAddress, 
            string currentAdminPrivateKey)
        {
            try
            {
                var account = new Account(currentAdminPrivateKey);
                var web3 = new Web3(account, _rpcUrl);
                var contract = web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);
                
                var function = contract.GetFunction("transferAdmin");
                var txHash = await function.SendTransactionAsync(
                    account.Address,
                    new HexBigInteger(200000),
                    new HexBigInteger(0),
                    newAdminAddress
                );

                return new TransactionResult
                {
                    Success = true,
                    TransactionHash = txHash,
                    Message = $"Admin transferred to {newAdminAddress}",
                    ExplorerUrl = $"{_explorerUrl}/tx/{txHash}"
                };
            }
            catch (Exception ex)
            {
                return new TransactionResult
                {
                    Success = false,
                    Message = $"Failed to transfer admin: {ex.Message}"
                };
            }
        }

        // ========== CERTIFICATE ISSUANCE ==========

        public async Task<TransactionResult> IssueCertificate(IssueCertificateRequest request)
        {
            try
            {
                var account = new Account(_privateKey);
                var web3 = new Web3(account, _rpcUrl);
                var contract = web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);

                var certHashBytes = HexToBytes(request.CertHash);
                var ipfsBytes = ToBytes32Keccak(request.IpfsCID);
                var issueDateUnix = ToUnixTimestamp(request.IssueDate);
                var function = contract.GetFunction("issueCertificate");
                var txHash = await function.SendTransactionAsync(
                    account.Address,
                    new HexBigInteger(500000),
                    new HexBigInteger(0),
                    certHashBytes,
                    ipfsBytes,
                    request.StudentId,
                    issueDateUnix
                );
                var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                while (receipt == null) {
                    await Task.Delay(2000); // Check every 2 seconds
                    receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                }

// Check actual status from blockchain
                var success = receipt.Status.Value == 1;

                return new TransactionResult
                {
                    Success = success,
                    TransactionHash = txHash,
                    Message = "Certificate issued successfully",
                    ExplorerUrl = $"{_explorerUrl}/tx/{txHash}"
                };
            }
            catch (Exception ex)
            {
                return new TransactionResult
                {
                    Success = false,
                    Message = $"Failed to issue certificate: {ex.Message}"
                };
            }
        }

        public async Task<TransactionResult> BatchIssueCertificates(BatchIssueCertificateRequest request)
        {
            try
            {
                var account = new Account(request.PrivateKey);
                var web3 = new Web3(account, _rpcUrl);
                var contract = web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);
                
                var certHashesBytes = request.CertHashes.Select(h => HexToBytes(h)).ToList();
                var ipfsCIDsBytes = request.IpfsCIDs.Select(c => HexToBytes(c)).ToList();
                
                var function = contract.GetFunction("batchIssueCertificates");
                var txHash = await function.SendTransactionAsync(
                    account.Address,
                    new HexBigInteger(3000000),
                    new HexBigInteger(0),
                    certHashesBytes,
                    ipfsCIDsBytes,
                    request.StudentIds,
                    request.IssueDates
                );

                return new TransactionResult
                {
                    Success = true,
                    TransactionHash = txHash,
                    Message = $"{request.CertHashes.Count} certificates issued successfully",
                    ExplorerUrl = $"{_explorerUrl}/tx/{txHash}"
                };
            }
            catch (Exception ex)
            {
                return new TransactionResult
                {
                    Success = false,
                    Message = $"Failed to batch issue certificates: {ex.Message}"
                };
            }
        }

        // ========== VERIFICATION (FREE - READ ONLY) ==========

        public async Task<CertificateVerificationResult> VerifyCertificate(string certHash)
        {
            try
            {
                var certHashBytes = HexToBytes(certHash);
                var function = _contract.GetFunction("verifyCertificate");
                
                var result = await function.CallDeserializingToObjectAsync<VerifyCertificateDTO>(
                    certHashBytes
                );

                var statusText = result.IsValid ? "Valid" : "Not Found";
                
                return new CertificateVerificationResult
                {
                    IsValid = result.IsValid,
                    StudentId = result.StudentId,
                    InstitutionId = result.InstitutionId,
                    IssueDate = DateTimeOffset.FromUnixTimeSeconds(result.IssueDate).DateTime,
                    IpfsCID = ByteArrayToHexString(result.IpfsCID),
                    Status = statusText
                };
            }
            catch (Exception ex)
            {
                return new CertificateVerificationResult
                {
                    IsValid = false,
                    Status = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<bool> CertificateExists(string certHash)
        {
            try
            {
                var certHashBytes = HexToBytes(certHash);
                var function = _contract.GetFunction("certificateExists");
                return await function.CallAsync<bool>(certHashBytes);
            }
            catch
            {
                return false;
            }
        }

        // ========== REVOCATION ==========

        public async Task<TransactionResult> RevokeCertificate(RevokeCertificateRequest request)
        {
            try
            {
                var account = new Account(_privateKey);
                var web3 = new Web3(account, _rpcUrl);
                var contract = web3.Eth.GetContract(CONTRACT_ABI, _contractAddress);
                
                var certHashBytes = HexToBytes(request.CertHash);
                
                var function = contract.GetFunction("revokeCertificate");
                var txHash = await function.SendTransactionAsync(
                    account.Address,
                    new HexBigInteger(200000),
                    new HexBigInteger(0),
                    certHashBytes
                );
                
                var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                while (receipt == null) {
                    await Task.Delay(2000); // Check every 2 seconds
                    receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                }

// Check actual status from blockchain
                var success = receipt.Status.Value == 1;

                return new TransactionResult
                {
                    Success = success,
                    TransactionHash = txHash,
                    Message = "Certificate revoked successfully",
                    ExplorerUrl = $"{_explorerUrl}/tx/{txHash}"
                };
            }
            catch (Exception ex)
            {
                return new TransactionResult
                {
                    Success = false,
                    Message = $"Failed to revoke certificate: {ex.Message}"
                };
            }
        }

        // ========== UTILITY FUNCTIONS ==========

        public async Task<string> GetAdmin()
        {
            var function = _contract.GetFunction("admin");
            return await function.CallAsync<string>();
        }

        public async Task<uint> GetCertificateCount()
        {
            var function = _contract.GetFunction("certificateCount");
            return await function.CallAsync<uint>();
        }

        public async Task<uint> GetStats()
        {
            var function = _contract.GetFunction("getStats");
            return await function.CallAsync<uint>();
        }

        // Helper methods
        private static byte[] HexToBytes(string hex)
        {
            if (hex.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
                hex = hex[2..];

            int len = hex.Length;
            byte[] bytes = new byte[len / 2];

            for (int i = 0; i < len; i += 2)
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);

            return bytes;
        }
        
        public static ulong ToUnixTimestamp(DateTime dateTime)
        {
            return (ulong)new DateTimeOffset(dateTime.ToUniversalTime())
                .ToUnixTimeSeconds();
        }
        
        public static byte[] ToBytes32Keccak(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Value cannot be null or empty");

            // keccak256(bytes(value)) — Solidity compatible
            var sha3 = new Sha3Keccack();
            return sha3.CalculateHash(Encoding.UTF8.GetBytes(value));
        }

        private string ByteArrayToHexString(byte[] bytes)
        {
            return "0x" + BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
        
        public static byte[] IpfsCidToBytes32(string cid)
        {
            var bytes = Encoders.Base58.DecodeData(cid);
    
            if (bytes.Length > 32)
                throw new ArgumentException("CID too long for bytes32");

            var result = new byte[32];
            Array.Copy(bytes, 0, result, 32 - bytes.Length, bytes.Length);
            return result;
        }
    }

public class VerifyCertificateDTO
{
    public byte[] IpfsCID;
    public bool IsValid { get; set; }
    public uint StudentId { get; set; }
    public ushort InstitutionId { get; set; }
    public long IssueDate { get; set; }
}