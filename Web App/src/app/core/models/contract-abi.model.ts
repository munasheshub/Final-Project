export const ContractABI: any = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldAdmin",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "AdminTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"internalType": "address",
				"name": "institutionAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "authorizeInstitution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "certHashes",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "ipfsCIDs",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes16[]",
				"name": "studentIds",
				"type": "bytes16[]"
			},
			{
				"internalType": "uint64[]",
				"name": "issueDates",
				"type": "uint64[]"
			}
		],
		"name": "batchIssueCertificates",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes16",
				"name": "studentId",
				"type": "bytes16"
			},
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "issueDate",
				"type": "uint64"
			}
		],
		"name": "CertificateIssued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "revokeDate",
				"type": "uint64"
			}
		],
		"name": "CertificateRevoked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			}
		],
		"name": "deauthorizeInstitution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "oldAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			}
		],
		"name": "InstitutionAddressUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "institutionAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "InstitutionAuthorized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			}
		],
		"name": "InstitutionDeauthorized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			}
		],
		"name": "InstitutionReauthorized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "oldName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newName",
				"type": "string"
			}
		],
		"name": "InstitutionUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "ipfsCID",
				"type": "bytes32"
			},
			{
				"internalType": "bytes16",
				"name": "studentId",
				"type": "bytes16"
			},
			{
				"internalType": "uint64",
				"name": "issueDate",
				"type": "uint64"
			}
		],
		"name": "issueCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			}
		],
		"name": "reauthorizeInstitution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			}
		],
		"name": "revokeCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "transferAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"internalType": "string",
				"name": "newName",
				"type": "string"
			}
		],
		"name": "updateInstitution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"internalType": "address",
				"name": "oldAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			}
		],
		"name": "updateInstitutionAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "certificateCount",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			}
		],
		"name": "certificateExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllInstitutions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint16",
						"name": "institutionId",
						"type": "uint16"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "active",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "walletAddress",
						"type": "address"
					}
				],
				"internalType": "struct CertificateVerification.InstitutionView[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			}
		],
		"name": "getCertificateDetails",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "certHash",
						"type": "bytes32"
					},
					{
						"internalType": "bytes32",
						"name": "ipfsCID",
						"type": "bytes32"
					},
					{
						"internalType": "uint64",
						"name": "issueDate",
						"type": "uint64"
					},
					{
						"internalType": "bytes16",
						"name": "studentId",
						"type": "bytes16"
					},
					{
						"internalType": "uint16",
						"name": "institutionId",
						"type": "uint16"
					},
					{
						"internalType": "uint8",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "bool",
						"name": "exists",
						"type": "bool"
					}
				],
				"internalType": "struct CertificateVerification.Certificate",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			}
		],
		"name": "getInstitution",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getInstitutions",
		"outputs": [
			{
				"internalType": "uint16[]",
				"name": "",
				"type": "uint16[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getStats",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "totalCerts",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "institutionAddresses",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "certHash",
				"type": "bytes32"
			}
		],
		"name": "verifyCertificate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			},
			{
				"internalType": "bytes16",
				"name": "studentId",
				"type": "bytes16"
			},
			{
				"internalType": "uint16",
				"name": "institutionId",
				"type": "uint16"
			},
			{
				"internalType": "uint64",
				"name": "issueDate",
				"type": "uint64"
			},
			{
				"internalType": "bytes32",
				"name": "ipfsCID",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]