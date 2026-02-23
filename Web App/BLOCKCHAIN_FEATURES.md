# New Blockchain Features Implementation

This document outlines the new pages and features added to implement all smart contract functions.

## Overview

Three new pages have been created to provide complete blockchain functionality:

1. **Institution Management** (Admin) - `/admin/institutions`
2. **Certificate Verification** (Public) - `/verify`
3. **Certificate Revocation** (Institution) - `/certificates/revoke`

---

## 1. Institution Management Page

**Location:** `src/app/features/admin/institution-management/`

**Route:** `/admin/institutions` (authenticated, admin only)

**Purpose:** Allows contract administrators to manage institutions authorized to issue certificates on the blockchain.

### Features

- **Connect Admin Wallet** - Connect with the contract admin wallet (MetaMask)
- **View Institutions** - Display all authorized institutions with their ID, name, address, and status
- **Authorize New Institution** - Register a new institution on the blockchain
- **Deauthorize Institution** - Deactivate an institution (prevents certificate issuance)
- **Reauthorize Institution** - Reactivate a previously deactivated institution
- **Update Institution Address** - Change the wallet address for an institution
- **Transfer Admin Rights** - Transfer contract admin role to a new address

### Smart Contract Functions Used

- `getInstitutions()` - Get list of institution IDs
- `getInstitution(id)` - Get institution details
- `authorizeInstitution(id, address, name)` - Register new institution
- `deauthorizeInstitution(id)` - Deactivate institution
- `reauthorizeInstitution(id)` - Reactivate institution
- `updateInstitutionAddress(id, oldAddress, newAddress)` - Update wallet
- `transferAdmin(newAddress)` - Transfer admin role

### Usage

1. Navigate to `/admin/institutions`
2. Click "Connect Wallet" with the contract admin wallet
3. View all registered institutions in the table
4. Use action buttons to manage institutions:
   - **Authorize** - Register a new institution (requires ID, wallet address, and name)
   - **Deauthorize** - Deactivate an active institution
   - **Reauthorize** - Reactivate an inactive institution
   - **Update Address** - Rotate institution's signing wallet
   - **Transfer Admin** - Transfer admin rights (⚠️ Warning: Irreversible!)

### Security Notes

- Only the contract admin can access this page
- Admin wallet must be connected to Sepolia testnet
- All operations require MetaMask transaction confirmation
- Gas fees apply for all blockchain operations
- Transfer Admin is irreversible - use with extreme caution

---

## 2. Certificate Verification Page

**Location:** `src/app/features/public/certificate-verification/`

**Route:** `/verify` (public, no authentication required)

**Purpose:** Allows anyone to verify the authenticity of academic certificates on the blockchain.

### Features

- **Public Access** - No login required, accessible to anyone
- **Instant Verification** - Real-time blockchain verification
- **Detailed Results** - Display certificate details, status, and metadata
- **Copy to Clipboard** - Easy copying of certificate hash and IPFS CID
- **Status Indication** - Clear visual indication of certificate status:
  - ✅ **Valid** (Green) - Active and valid certificate
  - ⚠️ **Revoked** (Orange) - Certificate has been revoked
  - ❌ **Invalid** (Red) - Certificate not found or never issued

### Smart Contract Functions Used

- `verifyCertificate(certHash)` - Check if certificate exists and is valid
- `getCertificateDetails(certHash)` - Get full certificate information

### Usage

1. Navigate to `/verify` (or share this link publicly)
2. Enter the 66-character certificate hash (starts with `0x`)
3. Click "Verify"
4. View results:
   - **Certificate Status** - Valid, Revoked, or Invalid
   - **Student ID** - Decoded from bytes16 format
   - **Institution ID** - Issuing institution
   - **Issue Date** - When certificate was issued
   - **Certificate Hash** - Unique identifier
   - **IPFS CID** - Document storage identifier
   - **Blockchain Info** - Network and verification details

### Certificate Hash Format

- **Length:** 66 characters
- **Format:** `0x` followed by 64 hexadecimal characters
- **Example:** `0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b`

---

## 3. Certificate Revocation Page

**Location:** `src/app/features/certificates/certificate-revocation/`

**Route:** `/certificates/revoke` (authenticated, institution users only)

**Purpose:** Allows institutions to revoke certificates they have issued on the blockchain.

### Features

- **Institution Wallet Connection** - Connect with the institution's authorized wallet
- **Certificate Lookup** - Check certificate status before revoking
- **Revocation Reason** - Optional internal note (not stored on blockchain)
- **Confirmation Dialog** - Prevents accidental revocation
- **Permanent Action** - Clear warnings about irreversibility

### Smart Contract Functions Used

- `revokeCertificate(certHash)` - Mark certificate as revoked
- `getCertificateDetails(certHash)` - Check certificate before revoking

### Usage

1. Navigate to `/certificates/revoke`
2. Click "Connect Wallet" with the institution's authorized wallet
3. Enter the certificate hash to revoke
4. (Optional) Click "Check" to verify certificate details
5. (Optional) Enter reason for revocation (internal record only)
6. Click "Revoke Certificate"
7. Review confirmation dialog with warnings
8. Confirm revocation - transaction sent to blockchain

### Important Notes

- **Authorization Required** - Only the institution that issued the certificate can revoke it
- **Irreversible Action** - Revocation cannot be undone
- **Immediate Effect** - Verification checks will instantly show certificate as revoked
- **Gas Fees Apply** - Blockchain transaction requires testnet ETH
- **Reason Not Stored** - Revocation reason is for internal records only, not stored on blockchain

### Error Handling

- **Not Authorized** - "Only the issuing institution can revoke this certificate"
- **Already Revoked** - "This certificate is already revoked"
- **Not Found** - "This certificate does not exist on the blockchain"
- **Insufficient Funds** - "Insufficient funds for gas fee"

---

## Routes Summary

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Institution Management | `/admin/institutions` | Admin only | Manage authorized institutions |
| Certificate Verification | `/verify` | Public | Verify certificate authenticity |
| Certificate Revocation | `/certificates/revoke` | Institution users | Revoke issued certificates |
| Certificate List | `/certificates` | Authenticated | View all certificates and drafts |
| Issue Certificate | `/certificates/create` | Authenticated | Issue new certificates |

---

## Smart Contract Integration

All pages interact with the **CertificateVerification** smart contract deployed on Sepolia testnet:

- **Contract Address:** `0xb64ef291b5aef2b40e291161053cb189662453c8`
- **Network:** Sepolia (Chain ID: 11155111)
- **RPC URL:** `https://sepolia.infura.io/v3/4e2f8725145b45ce8c81b664d4e9d20e`

### Contract Functions Implemented

**Admin Operations (Institution Management):**
- ✅ `authorizeInstitution(uint16 id, address wallet, string name)`
- ✅ `deauthorizeInstitution(uint16 id)`
- ✅ `reauthorizeInstitution(uint16 id)`
- ✅ `updateInstitutionAddress(uint16 id, address oldAddress, address newAddress)`
- ✅ `transferAdmin(address newAdmin)`
- ✅ `getInstitutions()`
- ✅ `getInstitution(uint16 id)`

**Certificate Operations (Issue/Revoke):**
- ✅ `issueCertificate(bytes16 studentId, uint16 institutionId, string ipfsCID)`
- ✅ `revokeCertificate(bytes32 certHash)`

**Verification Operations (Public Verification):**
- ✅ `verifyCertificate(bytes32 certHash)`
- ✅ `getCertificateDetails(bytes32 certHash)`
- ✅ `certificateExists(bytes32 certHash)`

---

## Setup Requirements

### For Contract Admin (Institution Management)

1. MetaMask wallet installed
2. Admin wallet imported to MetaMask
3. Sepolia testnet configured
4. Testnet ETH for gas fees
5. Admin wallet must be the contract owner

### For Institutions (Certificate Issuance/Revocation)

1. MetaMask wallet installed
2. Institution wallet authorized on contract (by admin)
3. Sepolia testnet configured
4. Testnet ETH for gas fees
5. Wallet address must match authorized address on contract

### For Public Verification

1. Web browser (no wallet required)
2. Certificate hash to verify
3. Internet connection

---

## Testing Checklist

### Institution Management
- [ ] Connect admin wallet successfully
- [ ] View all institutions list
- [ ] Authorize new institution
- [ ] Deauthorize active institution
- [ ] Reauthorize inactive institution
- [ ] Update institution address
- [ ] Verify transaction confirmations
- [ ] Test error handling (insufficient funds, wrong wallet)

### Certificate Verification
- [ ] Access page without authentication
- [ ] Verify valid certificate (status: Valid)
- [ ] Verify revoked certificate (status: Revoked)
- [ ] Check invalid/non-existent certificate (status: Invalid)
- [ ] Copy certificate hash to clipboard
- [ ] Copy IPFS CID to clipboard
- [ ] Verify all certificate details display correctly
- [ ] Test with invalid hash format

### Certificate Revocation
- [ ] Connect institution wallet
- [ ] Check certificate status before revoking
- [ ] Revoke valid certificate
- [ ] Verify confirmation dialog appears
- [ ] Confirm revocation completes
- [ ] Verify certificate shows as revoked in verification page
- [ ] Test error: attempt to revoke other institution's certificate
- [ ] Test error: attempt to revoke already-revoked certificate

---

## File Structure

```
src/app/
├── features/
│   ├── admin/
│   │   └── institution-management/
│   │       ├── institution-management.component.ts
│   │       ├── institution-management.component.html
│   │       └── institution-management.component.scss
│   ├── public/
│   │   └── certificate-verification/
│   │       ├── certificate-verification.component.ts
│   │       ├── certificate-verification.component.html
│   │       └── certificate-verification.component.scss
│   └── certificates/
│       ├── certificate-revocation/
│       │   ├── certificate-revocation.component.ts
│       │   ├── certificate-revocation.component.html
│       │   └── certificate-revocation.component.scss
│       └── certificates.routes.ts (updated)
├── core/
│   └── services/
│       └── blockchain.service.ts (updated with all contract functions)
└── app.routes.ts (updated with new routes)
```

---

## Next Steps

1. **Backend Integration** - Implement POST `/api/certificates/issue` endpoint
2. **Authorization Setup** - Admin authorizes institution wallets on contract
3. **Testing** - Comprehensive testing of all features
4. **Documentation** - User guides for each role (admin, institution, public)
5. **Menu Items** - Add navigation links to app menu
6. **Access Control** - Implement role-based guards for admin pages
7. **Batch Operations** - Consider implementing `batchIssueCertificates()` for bulk issuance

---

## Support & Troubleshooting

### Common Issues

**"Execution reverted" error:**
- Institution wallet not authorized on contract
- Contact admin to authorize wallet via Institution Management page

**"Insufficient funds for gas" error:**
- Need Sepolia testnet ETH
- Get testnet ETH from Sepolia faucet

**"Wrong network" error:**
- Switch MetaMask to Sepolia testnet
- Chain ID should be 11155111

**Cannot connect wallet:**
- Install MetaMask browser extension
- Make sure MetaMask is unlocked
- Clear pending requests in MetaMask

### Getting Help

- Check browser console for detailed error messages
- Verify wallet is on Sepolia network
- Ensure wallet has sufficient testnet ETH
- Contact contract admin for authorization issues
