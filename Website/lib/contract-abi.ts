// Auto-generated from the CertificateVerification Solidity contract.
// Only the read-only (view) functions used for verification are included
// to keep the client bundle small.

export const CertificateVerificationABI = [
  {
    inputs: [{ internalType: "bytes32", name: "certHash", type: "bytes32" }],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "isValid", type: "bool" },
      { internalType: "bytes16", name: "studentId", type: "bytes16" },
      { internalType: "uint16", name: "institutionId", type: "uint16" },
      { internalType: "uint64", name: "issueDate", type: "uint64" },
      { internalType: "bytes32", name: "ipfsCID", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "certHash", type: "bytes32" }],
    name: "certificateExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "certHash", type: "bytes32" }],
    name: "getCertificateDetails",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "certHash", type: "bytes32" },
          { internalType: "bytes32", name: "ipfsCID", type: "bytes32" },
          { internalType: "uint64", name: "issueDate", type: "uint64" },
          { internalType: "bytes16", name: "studentId", type: "bytes16" },
          { internalType: "uint16", name: "institutionId", type: "uint16" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "bool", name: "exists", type: "bool" },
        ],
        internalType: "struct CertificateVerification.Certificate",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStats",
    outputs: [
      { internalType: "uint32", name: "totalCerts", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllInstitutions",
    outputs: [
      {
        components: [
          { internalType: "uint16", name: "institutionId", type: "uint16" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "address", name: "walletAddress", type: "address" },
        ],
        internalType: "struct CertificateVerification.InstitutionView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint16", name: "institutionId", type: "uint16" },
    ],
    name: "getInstitution",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "certificateCount",
    outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
] as const
