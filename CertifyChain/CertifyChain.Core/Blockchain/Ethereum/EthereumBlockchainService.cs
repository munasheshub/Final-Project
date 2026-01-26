
using CertifyChain.Infrastructure.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nethereum.Contracts;
using Nethereum.Web3;

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

	public Task<string> ConnectWalletAsync(string privateKey)
	{
		throw new NotImplementedException();
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

	public Task<BlockchainTransactionResult> RevokeCertificateAsync(string certificateNumber, string reason)
	{
		throw new NotImplementedException();
	}

	public async Task<CertificateBlockchainData?> VerifyCertificateAsync(string certificateNumber)
	{
		var getCertificateFunction = _contract.GetFunction("getCertificate");

		var result = await getCertificateFunction.CallDeserializingToObjectAsync<CertificateBlockchainData>(
			certificateNumber);

		return result.IsRevoked ? null : result;
	}

	public Task<decimal> EstimateGasAsync(string operation)
	{
		throw new NotImplementedException();
	}

	public Task<string> GetTransactionStatusAsync(string txHash)
	{
		throw new NotImplementedException();
	}


	private string GetContractAbi()
	{
		// Return your smart contract ABI
		return @"[
	{
		""inputs"": [
			{
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			},
			{
				""internalType"": ""address"",
				""name"": ""institutionAddress"",
				""type"": ""address""
			}
		],
		""name"": ""authorizeInstitution"",
		""outputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""bytes32[]"",
				""name"": ""certHashes"",
				""type"": ""bytes32[]""
			},
			{
				""internalType"": ""bytes32[]"",
				""name"": ""ipfsCIDs"",
				""type"": ""bytes32[]""
			},
			{
				""internalType"": ""uint32[]"",
				""name"": ""studentIds"",
				""type"": ""uint32[]""
			},
			{
				""internalType"": ""uint64[]"",
				""name"": ""issueDates"",
				""type"": ""uint64[]""
			}
		],
		""name"": ""batchIssueCertificates"",
		""outputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			}
		],
		""name"": ""deauthorizeInstitution"",
		""outputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""function""
	},
	{
		""inputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""constructor""
	},
	{
		""anonymous"": false,
		""inputs"": [
			{
				""indexed"": true,
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			},
			{
				""indexed"": true,
				""internalType"": ""uint32"",
				""name"": ""studentId"",
				""type"": ""uint32""
			},
			{
				""indexed"": true,
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			},
			{
				""indexed"": false,
				""internalType"": ""uint64"",
				""name"": ""issueDate"",
				""type"": ""uint64""
			}
		],
		""name"": ""CertificateIssued"",
		""type"": ""event""
	},
	{
		""anonymous"": false,
		""inputs"": [
			{
				""indexed"": true,
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			},
			{
				""indexed"": true,
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			},
			{
				""indexed"": false,
				""internalType"": ""uint64"",
				""name"": ""revokeDate"",
				""type"": ""uint64""
			}
		],
		""name"": ""CertificateRevoked"",
		""type"": ""event""
	},
	{
		""anonymous"": false,
		""inputs"": [
			{
				""indexed"": true,
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			},
			{
				""indexed"": false,
				""internalType"": ""address"",
				""name"": ""institutionAddress"",
				""type"": ""address""
			}
		],
		""name"": ""InstitutionAuthorized"",
		""type"": ""event""
	},
	{
		""anonymous"": false,
		""inputs"": [
			{
				""indexed"": true,
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			}
		],
		""name"": ""InstitutionDeauthorized"",
		""type"": ""event""
	},
	{
		""inputs"": [
			{
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			},
			{
				""internalType"": ""bytes32"",
				""name"": ""ipfsCID"",
				""type"": ""bytes32""
			},
			{
				""internalType"": ""uint32"",
				""name"": ""studentId"",
				""type"": ""uint32""
			},
			{
				""internalType"": ""uint64"",
				""name"": ""issueDate"",
				""type"": ""uint64""
			}
		],
		""name"": ""issueCertificate"",
		""outputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			}
		],
		""name"": ""revokeCertificate"",
		""outputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""address"",
				""name"": ""newAdmin"",
				""type"": ""address""
			}
		],
		""name"": ""transferAdmin"",
		""outputs"": [],
		""stateMutability"": ""nonpayable"",
		""type"": ""function""
	},
	{
		""inputs"": [],
		""name"": ""admin"",
		""outputs"": [
			{
				""internalType"": ""address"",
				""name"": """",
				""type"": ""address""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""uint16"",
				""name"": """",
				""type"": ""uint16""
			}
		],
		""name"": ""authorizedInstitutions"",
		""outputs"": [
			{
				""internalType"": ""bool"",
				""name"": """",
				""type"": ""bool""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [],
		""name"": ""certificateCount"",
		""outputs"": [
			{
				""internalType"": ""uint32"",
				""name"": """",
				""type"": ""uint32""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			}
		],
		""name"": ""certificateExists"",
		""outputs"": [
			{
				""internalType"": ""bool"",
				""name"": """",
				""type"": ""bool""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			}
		],
		""name"": ""getCertificateDetails"",
		""outputs"": [
			{
				""components"": [
					{
						""internalType"": ""bytes32"",
						""name"": ""certHash"",
						""type"": ""bytes32""
					},
					{
						""internalType"": ""bytes32"",
						""name"": ""ipfsCID"",
						""type"": ""bytes32""
					},
					{
						""internalType"": ""uint64"",
						""name"": ""issueDate"",
						""type"": ""uint64""
					},
					{
						""internalType"": ""uint32"",
						""name"": ""studentId"",
						""type"": ""uint32""
					},
					{
						""internalType"": ""uint16"",
						""name"": ""institutionId"",
						""type"": ""uint16""
					},
					{
						""internalType"": ""uint8"",
						""name"": ""status"",
						""type"": ""uint8""
					},
					{
						""internalType"": ""bool"",
						""name"": ""exists"",
						""type"": ""bool""
					}
				],
				""internalType"": ""struct CertificateVerification.Certificate"",
				""name"": """",
				""type"": ""tuple""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [],
		""name"": ""getStats"",
		""outputs"": [
			{
				""internalType"": ""uint32"",
				""name"": ""totalCerts"",
				""type"": ""uint32""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""address"",
				""name"": """",
				""type"": ""address""
			}
		],
		""name"": ""institutionAddresses"",
		""outputs"": [
			{
				""internalType"": ""uint16"",
				""name"": """",
				""type"": ""uint16""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	},
	{
		""inputs"": [
			{
				""internalType"": ""bytes32"",
				""name"": ""certHash"",
				""type"": ""bytes32""
			}
		],
		""name"": ""verifyCertificate"",
		""outputs"": [
			{
				""internalType"": ""bool"",
				""name"": ""isValid"",
				""type"": ""bool""
			},
			{
				""internalType"": ""uint32"",
				""name"": ""studentId"",
				""type"": ""uint32""
			},
			{
				""internalType"": ""uint16"",
				""name"": ""institutionId"",
				""type"": ""uint16""
			},
			{
				""internalType"": ""uint64"",
				""name"": ""issueDate"",
				""type"": ""uint64""
			},
			{
				""internalType"": ""bytes32"",
				""name"": ""ipfsCID"",
				""type"": ""bytes32""
			}
		],
		""stateMutability"": ""view"",
		""type"": ""function""
	}
]";
	}
}