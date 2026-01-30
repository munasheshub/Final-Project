using System.Security.Cryptography;
using System.Text;
using CertifyChain.Infrastructure.Blockchain.Dtos;
using Microsoft.Extensions.Configuration;

namespace CertifyChain.Infrastructure.Blockchain;

public class CertificateDataGenerator
    {
        private readonly IConfiguration _configuration;

        public CertificateDataGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<GeneratedCertificateData> GenerateCertificateData(
            GenerateCertificateDataRequest request)
        {
            // Generate certificate hash
            string certHash;
            if (request.CertificateFile != null)
            {
                // Hash actual PDF file
                using var stream = request.CertificateFile.OpenReadStream();
                using var sha256 = SHA256.Create();
                var hashBytes = await sha256.ComputeHashAsync(stream);
                certHash = "0x" + BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
            else
            {
                // Generate pseudo-hash from metadata
                var certContent = $"{request.StudentName}-{request.StudentId}-{request.Qualification}-{request.IssueDate:yyyy-MM-dd}";
                var contentBytes = Encoding.UTF8.GetBytes(certContent);
                var hashBytes = SHA256.HashData(contentBytes);
                certHash = "0x" + BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }

            // Convert IPFS CID to bytes32
            string ipfsCID = request.IpfsCID ?? GeneratePlaceholderIPFS();
            string ipfsCIDBytes32 = ConvertIPFSToBytes32(ipfsCID);

            // Convert date to Unix timestamp
            var issueDateUnix = (ulong)new DateTimeOffset(request.IssueDate).ToUnixTimeSeconds();

            // Convert hex strings to byte arrays for API use
            var certHashBytes = HexStringToByteArray(certHash);
            var ipfsCIDBytes = HexStringToByteArray(ipfsCIDBytes32);

            return new GeneratedCertificateData
            {
                StudentName = request.StudentName,
                StudentId = request.StudentId,
                InstitutionId = request.InstitutionId,
                Qualification = request.Qualification,
                IssueDate = request.IssueDate,
                IssueDateUnix = issueDateUnix,
                CertHash = certHash,
                IpfsCID = ipfsCID,
                IpfsCIDBytes32 = ipfsCIDBytes32,
                RemixData = new RemixData
                {
                    CertHash = certHash,
                    IpfsCID = ipfsCIDBytes32,
                    StudentId = request.StudentId,
                    IssueDate = issueDateUnix
                },
                ApiData = new ApiData
                {
                    CertHash = certHashBytes,
                    IpfsCID = ipfsCIDBytes,
                    StudentId = request.StudentId,
                    IssueDate = issueDateUnix
                }
            };
        }

        private string ConvertIPFSToBytes32(string ipfsCID)
        {
            var hex = "0x";
            var bytes = Encoding.ASCII.GetBytes(ipfsCID);
            
            // Take first 32 bytes
            var length = Math.Min(32, bytes.Length);
            for (int i = 0; i < length; i++)
            {
                hex += bytes[i].ToString("x2");
            }
            
            // Pad to 32 bytes (64 hex chars)
            return hex.PadRight(66, '0');
        }

        private string GeneratePlaceholderIPFS()
        {
            return "Qm" + Guid.NewGuid().ToString("N").Substring(0, 44);
        }

        private byte[] HexStringToByteArray(string hex)
        {
            hex = hex.Replace("0x", "");
            var bytes = new byte[hex.Length / 2];
            for (int i = 0; i < bytes.Length; i++)
            {
                bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
            }
            return bytes;
        }
    }