using System.Numerics;
using CertifyChain.Infrastructure.Blockchain.Dtos;
using Microsoft.Extensions.Configuration;
using Nethereum.Web3;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Web3.Accounts;

namespace CertifyChain.Infrastructure.Blockchain;

// Infrastructure/Blockchain/IBlockchainService.cs
public interface IBlockchainService
{
    // ================= ADMIN =================

    Task<TransactionResult> AuthorizeInstitution(
        ushort institutionId,
        string institutionAddress,
        string adminPrivateKey);

    Task<TransactionResult> DeauthorizeInstitution(
        ushort institutionId,
        string adminPrivateKey);

    Task<TransactionResult> TransferAdmin(
        string newAdminAddress,
        string currentAdminPrivateKey);

    Task<string> GetAdmin();

    // ================= CERTIFICATE ISSUANCE =================

    Task<TransactionResult> IssueCertificate(
        IssueCertificateRequest request);

    Task<TransactionResult> BatchIssueCertificates(
        BatchIssueCertificateRequest request);

    Task<TransactionResult> RevokeCertificate(
        RevokeCertificateRequest request);

    // ================= VERIFICATION (READ-ONLY) =================

    Task<CertificateVerificationResult> VerifyCertificate(
        string certHash);

    Task<bool> CertificateExists(
        string certHash);

    // ================= STATS =================

    Task<uint> GetCertificateCount();

    Task<uint> GetStats();
}



    
