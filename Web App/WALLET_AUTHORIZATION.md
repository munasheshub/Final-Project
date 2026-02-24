# Wallet Authorization Guide

## Problem: "Execution Reverted" Error

If you're seeing this error when trying to issue certificates:
```
execution reverted
```

This means **your wallet address is not authorized** on the smart contract.

## Solution: Authorize Your Wallet

The contract **administrator** must authorize your institution wallet before you can issue certificates.

### Contract Information
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Contract Address**: `0xb64ef291b5aef2b40e291161053cb189662453c8`
- **View on Etherscan**: https://sepolia.etherscan.io/address/0xb64ef291b5aef2b40e291161053cb189662453c8

### Steps for Administrator

1. **Connect to the Smart Contract** (as admin)
   - Use Remix, Hardhat, or your preferred tool
   - Connect to Sepolia testnet
   - Load the contract at address: `0xb64ef291b5aef2b40e291161053cb189662453c8`

2. **Call the `authorizeInstitution` function**
   ```solidity
   function authorizeInstitution(
       uint16 institutionId,
       address institutionAddress,
       string memory name
   )
   ```

   **Parameters:**
   - `institutionId`: Unique ID for the institution (e.g., 1, 2, 3...)
   - `institutionAddress`: The MetaMask wallet address that needs authorization
   - `name`: Institution name (e.g., "NUST", "University of Zimbabwe")

   **Example:**
   ```solidity
   authorizeInstitution(
       1,
       "0xYourWalletAddressHere",
       "National University of Science and Technology"
   )
   ```

3. **Confirm the transaction** in MetaMask

4. **Verify authorization** (optional)
   - After authorization, the wallet should be able to issue certificates
   - Test by attempting to issue a certificate through the frontend

### How to Get Your Wallet Address

1. Open the certificate issuance page
2. Click "Connect Wallet" on Step 4 (Blockchain Registration)
3. Copy the wallet address shown after connection
4. Send this address to the contract administrator

### Common Issues

**Q: I'm still getting "execution reverted" after authorization**
- Ensure you're connected to Sepolia testnet (Chain ID: 11155111)
- Verify the correct wallet address was authorized
- Clear browser cache and reconnect wallet
- Check you have enough Sepolia ETH for gas fees

**Q: Where can I get Sepolia testnet ETH?**
- Use a Sepolia faucet: https://sepoliafaucet.com/
- Or: https://www.alchemy.com/faucets/ethereum-sepolia

**Q: Who is the contract administrator?**
- The admin is the wallet address that deployed the smart contract
- Only the admin can authorize new institutions
- Check the `admin()` function on the contract to see the current admin address

### Contract ABI Reference

The contract has these key functions:
- `authorizeInstitution` - Add authorized institution (admin only)
- `deauthorizeInstitution` - Remove institution (admin only)
- `issueCertificate` - Issue new certificate (authorized institutions only)
- `revokeCertificate` - Revoke a certificate (authorized institutions only)
- `verifyCertificate` - Verify certificate authenticity (public, anyone can call)
- `getCertificateDetails` - Get full certificate data (public)
- `transferAdmin` - Transfer admin rights (current admin only)

### Need Help?

If you continue experiencing issues:
1. Check the browser console for detailed error messages
2. Verify your MetaMask is on Sepolia network
3. Ensure you have Sepolia ETH for gas fees
4. Contact the system administrator with your wallet address

---

**Important**: Never share your private key or seed phrase with anyone!
