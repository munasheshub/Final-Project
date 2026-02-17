# Blockchain Certificate Issuance Integration

## Overview
This document describes the complete blockchain integration for issuing academic certificates on the Ethereum Sepolia testnet.

## Configuration

### Blockchain Settings
The blockchain configuration is stored in `src/environments/environment.ts`:

```typescript
blockchain: {
  network: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/xxxxxxxxxxx',
  contractAddress: 'xxxxxxxxxx',
  chainId: 11155111,
  explorerUrl: 'https://sepolia.etherscan.io'
}
```

### Smart Contract
The certificate issuance uses the `CertificateVerification` smart contract deployed at:
- **Contract Address**: `0xb64ef291b5aef2b40e291161053cb189662453c8`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111

## How It Works

### Certificate Issuance Flow

1. **Step 1: Student Information**
   - User enters student details (ID, name, DOB, email, phone)
   - Form validation ensures all required fields are filled

2. **Step 2: Certificate Details**
   - User selects qualification type, award class, program
   - Specifies graduation date and optional certificate number

3. **Step 3: Document Upload**
   - User uploads the certificate document (PDF)
   - System automatically generates SHA-256 hash of the document
   - Document is validated

4. **Step 4: Blockchain Registration**
   - User connects MetaMask wallet
   - System estimates gas fee for the transaction
   - On submission:
     - Certificate hash is generated from all certificate data
     - IPFS CID is generated (mock implementation, can be replaced with actual IPFS upload)
     - Transaction is submitted to the smart contract
     - After blockchain success, data is sent to backend API

### Technical Implementation

#### Frontend Components

**Certificate Issue Component** (`certificate-issue.ts`):
- Manages the 4-step wizard
- Handles wallet connection via MetaMask
- Submits certificate to blockchain
- Sends transaction data to backend

**Blockchain Service** (`blockchain.service.ts`):
- `issueCertificateToBlockchain()`: Submits certificate to smart contract
- `estimateIssuanceGas()`: Estimates transaction gas fee
- `generateCertificateHash()`: Creates keccak256 hash
- `stringToBytes32()`: Converts strings to bytes32 format

**Certificate Service** (`certificate.service.ts`):
- `issueCertificateWithBlockchain()`: Sends certificate data to backend after blockchain submission

#### Smart Contract Integration

The `issueCertificate` function is called with these parameters:
- `certHash` (bytes32): keccak256 hash of all certificate data
- `ipfsCID` (bytes32): IPFS content identifier of the document
- `studentId` (bytes16): Student ID as bytes16 (converted from string)
- `issueDate` (uint64): Unix timestamp of graduation date

#### Data Flow

```
Frontend Form → Generate Hashes → Submit to Blockchain → Send to Backend → Success
                                         ↓
                                  Transaction Hash
```

## Usage Instructions

### Prerequisites
1. **MetaMask Extension**: Install MetaMask browser extension
2. **Sepolia ETH**: Ensure wallet has sufficient Sepolia testnet ETH for gas fees
3. **Network Configuration**: MetaMask configured for Sepolia testnet

### Issuing a Certificate

1. Navigate to `/certificates/create`
2. Fill in student information and click "Next"
3. Fill in certificate details and click "Next"
4. Upload the certificate document and click "Next"
5. Click "Connect Wallet" to connect your MetaMask
6. Review the transaction summary and estimated gas fee
7. Click "Submit to Blockchain"
8. Approve the transaction in MetaMask
9. Wait for confirmation (system shows progress)
10. Certificate is registered on blockchain and saved to database

### Transaction Details

After successful submission, you will receive:
- **Transaction Hash**: Unique identifier for the blockchain transaction
- **Block Number**: Block where transaction was included
- **Gas Used**: Actual gas consumed
- **Explorer Link**: View transaction on Etherscan

## Error Handling

The system handles various error scenarios:

- **Wallet Not Connected**: Prompts user to connect MetaMask
- **Insufficient Funds**: Transaction will fail if wallet lacks gas fees
- **Network Mismatch**: Warns if MetaMask is on wrong network
- **Blockchain Failure**: Shows error message with details
- **Backend Failure**: Certificate is on blockchain but warns about database save failure

## Security Considerations

1. **Private Key Security**: Never expose or commit private keys
2. **Document Hashing**: SHA-256 ensures document integrity
3. **Wallet Signatures**: MetaMask signs all transactions
4. **Irreversible**: Blockchain transactions cannot be undone

## Development Notes

### Adding IPFS Support

Currently, the IPFS CID is mocked. To add real IPFS:

1. Install IPFS library: `npm install ipfs-http-client`
2. Update the `submitToBlockchain()` method:
```typescript
// Upload to IPFS
const ipfs = create({ url: 'YOUR_IPFS_NODE' });
const { cid } = await ipfs.add(documentFile);
const ipfsCID = this.blockchainService.stringToBytes32(cid.toString());
```

### Gas Optimization

The smart contract is optimized for gas efficiency:
- Typical gas usage: ~150,000 gas
- Current Sepolia gas price: ~1-5 Gwei
- Estimated cost: 0.0003 - 0.0007 ETH

### Testing

To test the integration:
1. Use Sepolia testnet faucet: https://sepoliafaucet.com/
2. Get test ETH for transactions
3. Issue test certificates
4. Verify on Etherscan: https://sepolia.etherscan.io

## Backend API Integration

The frontend sends certificate data to: `POST /api/certificates/issue`

**Request Format** (FormData):
```
studentId, fullName, dateOfBirth, email, phoneNumber
programName, specialization, qualificationType, awardClass
graduationDate, certificateNumber
documentFile (File), fileHash
transactionHash, certHash, ipfsCID, walletAddress
gasUsed, blockNumber
```

**Expected Response**:
```json
{
  "success": true,
  "certificateId": "...",
  "certificateNumber": "...",
  "transactionHash": "...",
  "message": "Certificate issued successfully"
}
```

## Troubleshooting

### Common Issues

**Issue**: MetaMask not detected
- **Solution**: Install MetaMask extension and refresh page

**Issue**: Transaction failing
- **Solution**: Ensure sufficient Sepolia ETH, correct network selected

**Issue**: Gas estimation fails
- **Solution**: Check RPC URL is accessible, network connection stable

**Issue**: Backend save fails
- **Solution**: Check API endpoint, authentication token, network connection

## Future Enhancements

1. **Batch Issuance**: Support for issuing multiple certificates at once
2. **IPFS Integration**: Actual decentralized storage of documents
3. **Certificate Verification**: Public verification page using blockchain data
4. **Revocation**: Implement certificate revocation on blockchain
5. **Multi-chain Support**: Add support for other EVM chains
6. **Gas Price Optimization**: Dynamic gas price based on network conditions

## Support

For issues or questions:
- Check browser console for error messages
- Verify MetaMask is properly configured
- Ensure backend API is running
- Check transaction on Etherscan for blockchain issues

## License

This integration is part of the CertifyChain academic certificate management system.
