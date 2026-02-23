import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BlockchainConfig,
  WalletConnection,
  GasEstimate,
  BlockchainStats,
  BlockchainTransaction
} from '../models/blockchain.model';
import Web3 from 'web3';
import { ContractABI } from '../models/contract-abi.model';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private readonly API_URL = `${environment.apiUrl}/blockchain`;
  CONTRACT_ABI = ContractABI


  constructor(private http: HttpClient) {}

  getBlockchainConfig(): Observable<BlockchainConfig> {
    return this.http.get<BlockchainConfig>(`${this.API_URL}/config`);
  }

  updateBlockchainConfig(config: Partial<BlockchainConfig>): Observable<BlockchainConfig> {
    return this.http.put<BlockchainConfig>(`${this.API_URL}/config`, config);
  }

  getWalletConnection(): Observable<WalletConnection> {
    return this.http.get<WalletConnection>(`${this.API_URL}/wallet`);
  }

  connectWallet(): Observable<WalletConnection> {
    return from(this.connectMetaMask());
  }

  private async connectMetaMask(): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      return {
        address: accounts[0],
        balance: parseInt(balance, 16).toString(),
        chainId: parseInt(chainId, 16),
        isConnected: true
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  disconnectWallet(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/wallet/disconnect`, {});
  }

  testConnection(config: { rpcUrl: string; contractAddress: string; chainId: number }): Observable<any> {
    return this.http.post(`${this.API_URL}/test-connection`, config);
  }

  estimateGas(operation: string): Observable<GasEstimate> {
    return this.http.get<GasEstimate>(`${this.API_URL}/estimate-gas/${operation}`);
  }

  getBlockchainStats(): Observable<BlockchainStats> {
    return this.http.get<BlockchainStats>(`${this.API_URL}/stats`);
  }

  getTransactionHistory(page: number = 1, pageSize: number = 10): Observable<{
    data: BlockchainTransaction[];
    total: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/transactions`, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getTransactionById(txHash: string): Observable<BlockchainTransaction> {
    return this.http.get<BlockchainTransaction>(`${this.API_URL}/transactions/${txHash}`);
  }

  /**
   * Convert student ID string to bytes16 format for smart contract
   * @param studentId Student ID as string (e.g., "S202600145" or "12345678")
   * @returns bytes16 hex string (0x prefixed, 32 hex chars)
   */
  studentIdToBytes16(studentId: string): string {
    // Validate student ID length (bytes16 can hold max 16 characters)
    if (studentId.length > 16) {
      throw new Error('Student ID must be 16 characters or less');
    }
    
    // Convert string to hex by converting each character to its ASCII hex value
    let hex = '';
    for (let i = 0; i < studentId.length; i++) {
      const charCode = studentId.charCodeAt(i);
      hex += charCode.toString(16).padStart(2, '0');
    }
    
    // Pad to 32 hex characters (16 bytes) with zeros on the right
    hex = hex.padEnd(32, '0');
    
    return '0x' + hex;
  }

  /**
   * Convert bytes16 back to student ID string
   * @param bytes16 bytes16 hex string from blockchain
   * @returns Student ID as string
   */
  bytes16ToStudentId(bytes16: string): string {
    // Remove 0x prefix
    let hex = bytes16.replace('0x', '');
    
    // Convert hex pairs back to characters
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2);
      // Stop at padding zeros
      if (hexPair === '00') {
        break;
      }
      const charCode = parseInt(hexPair, 16);
      result += String.fromCharCode(charCode);
    }
    
    return result.trim();
  }

  /**
   * Issue certificate to blockchain
   * @param certificateData Certificate data to submit to blockchain
   * @returns Transaction hash and other details
   */
  async issueCertificateToBlockchain(certificateData: {
    certHash: string;
    ipfsCID: string;
    studentId: string;
    issueDate: number;
  }): Promise<{
    transactionHash: string;
    blockNumber?: number;
    gasUsed: string;
    success: boolean;
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Get Web3 provider
      const web3 = new Web3(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Verify we're on Sepolia testnet
      const chainId = await web3.eth.getChainId();
      const sepoliaChainId = BigInt(11155111);
      
      if (chainId !== sepoliaChainId) {
        throw new Error(`Wrong network. Please switch to Sepolia testnet in MetaMask. Current chain ID: ${chainId}`);
      }
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      // Convert student ID to bytes16
      const studentIdBytes16 = this.studentIdToBytes16(certificateData.studentId);
      
      console.log('Blockchain submission data:', {
        certHash: certificateData.certHash,
        ipfsCID: certificateData.ipfsCID,
        studentId: certificateData.studentId,
        studentIdBytes16,
        issueDate: certificateData.issueDate,
        fromAddress
      });

      // Try to estimate gas - this will fail if wallet is not authorized
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['issueCertificate'](
          certificateData.certHash,
          certificateData.ipfsCID,
          studentIdBytes16,
          certificateData.issueDate
        ).estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        // If estimation fails with "execution reverted", it's likely an authorization issue
        if (estimateError.message?.includes('execution reverted')) {
          throw new Error(
            `Transaction would fail: Your wallet address (${fromAddress}) is not authorized to issue certificates. ` +
            `Please contact the contract administrator to authorize your institution wallet using the 'authorizeInstitution' function.`
          );
        }
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      // Sepolia network gas limit cap
      const SEPOLIA_GAS_CAP = 16777216;

      console.log('Gas estimate:', gasEstimate.toString());
      console.log('Gas limit with buffer:', gasLimit);

      // Validate gas limit doesn't exceed network cap
      if (gasLimit > SEPOLIA_GAS_CAP) {
        throw new Error(`Gas limit (${gasLimit}) exceeds Sepolia network cap (${SEPOLIA_GAS_CAP}). Your wallet may not be authorized.`);
      }

      // Call the smart contract with proper gas limit
      const tx = await contract.methods['issueCertificate'](
        certificateData.certHash,
        certificateData.ipfsCID,
        studentIdBytes16,
        certificateData.issueDate
      ).send({ 
        from: fromAddress,
        gas: gasLimit.toString()
      });

      return {
        transactionHash: tx.transactionHash,
        blockNumber: Number(tx.blockNumber),
        gasUsed: tx.gasUsed.toString(),
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Blockchain transaction failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('not authorized')) {
        // Re-throw authorization errors as-is (they already have clear messages)
        throw error;
      } else if (error.message?.includes('execution reverted')) {
        throw new Error(
          'Smart contract rejected the transaction. Your wallet may not be authorized to issue certificates. ' +
          'Please contact the contract administrator.'
        );
      } else if (error.message?.includes('gas')) {
        throw new Error('Gas estimation failed. Your wallet may not be authorized or there may be insufficient funds.');
      } else if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else if (error.code === -32603) {
        throw new Error('Transaction failed. Please check your wallet balance and network connection.');
      }
      
      throw new Error(error.message || 'Failed to submit certificate to blockchain');
    }
  }

  /**
   * Estimate gas for certificate issuance
   */
  async estimateIssuanceGas(): Promise<GasEstimate> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice'
      });

      const gasPriceGwei = parseInt(gasPrice, 16) / 1e9;
      const estimatedGas = 150000; // Typical gas for issueCertificate
      const estimatedFeeEth = (estimatedGas * parseInt(gasPrice, 16)) / 1e18;

      return {
        estimatedGas: estimatedGas.toString(),
        estimatedFeeGwei: gasPriceGwei.toFixed(2),
        estimatedFeeEth: estimatedFeeEth.toFixed(6)
      };
    } catch (error) {
      throw new Error('Failed to estimate gas');
    }
  }

  /**
   * Convert string to bytes32 format for smart contract
   */
  stringToBytes32(text: string): string {
    // Ensure the string is exactly 32 bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const bytes32Array = new Uint8Array(32);
    bytes32Array.set(data.slice(0, 32));
    
    return '0x' + Array.from(bytes32Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate keccak256 hash for certificate
   */
  async generateCertificateHash(data: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const web3 = new Web3(window.ethereum);
    return web3.utils.keccak256(data);
  }

  /**
   * Verify certificate on blockchain
   * @param certHash Certificate hash (keccak256)
   * @returns Verification result with certificate details
   */
  async verifyCertificateOnChain(certHash: string): Promise<{
    isValid: boolean;
    studentId: string;
    institutionId: number;
    issueDate: number;
    ipfsCID: string;
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const result: any = await contract.methods['verifyCertificate'](certHash).call();

      console.log('Blockchain verification raw result:', result);

      return {
        isValid: Boolean(result[0] ?? result.isValid),
        studentId: this.bytes16ToStudentId(result[1] ?? result.studentId),
        institutionId: Number(result[2] ?? result.institutionId),
        issueDate: Number(result[3] ?? result.issueDate),
        ipfsCID: this.bytes32ToString(result[4]?.toString() ?? result.ipfsCID?.toString() ?? '')
      };
    } catch (error: any) {
      console.error('Verification failed:', error);
      throw new Error(error.message || 'Failed to verify certificate');
    }
  }

  /**
   * Convert bytes32 back to string
   */
  bytes32ToString(bytes32: string): string {
    // Remove 0x prefix
    let hex = bytes32.replace('0x', '');
    
    // Convert hex pairs back to characters
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2);
      // Stop at padding zeros
      if (hexPair === '00') {
        break;
      }
      const charCode = parseInt(hexPair, 16);
      result += String.fromCharCode(charCode);
    }
    
    return result.trim();
  }

  /**
   * Get certificate details from blockchain
   * @param certHash Certificate hash (keccak256)
   * @returns Certificate details including status (0=Active, 1=Revoked)
   */
  async getCertificateDetails(certHash: string): Promise<{
    certHash: string;
    ipfsCID: string;
    issueDate: number;
    studentId: string;
    institutionId: number;
    status: number; // 0 = Active, 1 = Revoked
    exists: boolean;
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const result: any = await contract.methods['getCertificateDetails'](certHash).call();

      console.log('Blockchain certificate details raw result:', result);

      return {
        certHash: result[0]?.toString() || result.certHash?.toString() || certHash,
        ipfsCID: this.bytes32ToString(result[1]?.toString() || result.ipfsCID?.toString() || ''),
        issueDate: Number(result[2] ?? result.issueDate),
        studentId: this.bytes16ToStudentId(result[3] ?? result.studentId),
        institutionId: Number(result[4] ?? result.institutionId),
        status: Number(result[5] ?? result.status),
        exists: Boolean(result[6] ?? result.exists)
      };
    } catch (error: any) {
      console.error('Failed to get certificate details:', error);
      throw new Error(error.message || 'Failed to get certificate details');
    }
  }

  /**
   * Check if certificate exists on blockchain
   */
  async certificateExists(certHash: string): Promise<boolean> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const exists = await contract.methods['certificateExists'](certHash).call();
      return Boolean(exists);
    } catch (error: any) {
      console.error('Failed to check certificate existence:', error);
      throw new Error(error.message || 'Failed to check certificate');
    }
  }

  /**
   * Get total certificate count from blockchain
   */
  async getCertificateCount(): Promise<number> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const count = await contract.methods['certificateCount']().call();
      return Number(count);
    } catch (error: any) {
      console.error('Failed to get certificate count:', error);
      throw new Error(error.message || 'Failed to get certificate count');
    }
  }

  // =========================================================================
  // Admin Functions
  // =========================================================================

  /**
   * Get list of all registered institution IDs
   */
  async getInstitutions(): Promise<number[]> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      // Verify network
      const chainId = await web3.eth.getChainId();
      if (Number(chainId) !== 11155111) {
        throw new Error(`Wrong network. Please switch to Sepolia testnet (Chain ID: 11155111). Current: ${chainId}`);
      }
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const ids: any = await contract.methods['getInstitutions']().call();
      return ids.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Failed to get institutions:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('execution reverted')) {
        throw new Error('Contract call failed. The contract may not have the getInstitutions() function or you may not have permission to call it.');
      } else if (error.message?.includes('Wrong network')) {
        throw error; // Re-throw network error as-is
      }
      
      throw new Error(error.message || 'Failed to get institutions from blockchain');
    }
  }

  /**
   * Get institution details by ID
   */
  async getInstitutionDetails(institutionId: number): Promise<{name: string; active: boolean; address?: string}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const result: any = await contract.methods['getInstitution'](institutionId).call();
      return {
        name: result[0] || result.name,
        active: Boolean(result[1] !== undefined ? result[1] : result.active)
      };
    } catch (error: any) {
      console.error('Failed to get institution details:', error);
      throw new Error(error.message || 'Failed to get institution details');
    }
  }

  /**
   * Get all institutions with full details (admin only)
   * Returns institutionId, name, active status, and wallet address for all registered institutions
   */
  async getAllInstitutions(): Promise<Array<{
    institutionId: number;
    name: string;
    active: boolean;
    walletAddress: string;
  }>> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const result: any = await contract.methods['getAllInstitutions']().call();
      
      // Map the tuple array to our interface
      return result.map((inst: any) => ({
        institutionId: Number(inst.institutionId || inst[0]),
        name: String(inst.name || inst[1]),
        active: Boolean(inst.active !== undefined ? inst.active : inst[2]),
        walletAddress: String(inst.walletAddress || inst[3])
      }));
    } catch (error: any) {
      console.error('Failed to get all institutions:', error);
      throw new Error(error.message || 'Failed to get all institutions from blockchain');
    }
  }

  /**
   * Update institution name (admin only)
   */
  async updateInstitutionName(
    institutionId: number,
    newName: string
  ): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Estimate gas and add 20% buffer
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['updateInstitution'](institutionId, newName)
          .estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      // Call the smart contract
      const tx = await contract.methods['updateInstitution'](institutionId, newName)
        .send({ 
          from: fromAddress,
          gas: gasLimit.toString()
        });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Update institution name failed:', error);
      throw new Error(error.message || 'Failed to update institution name on blockchain');
    }
  }

  /**
   * Authorize a new institution (admin only)
   */
  async authorizeInstitution(
    institutionId: number,
    institutionAddress: string,
    name: string
  ): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      // First check if institution already exists on blockchain
      // try {
      //   const existingInstitution = await this.getInstitutionDetails(institutionId);
      //   if (existingInstitution.name && existingInstitution.active) {
      //     throw new Error(
      //       `Institution ID ${institutionId} is already authorized on the blockchain with name "${existingInstitution.name}". ` +
      //       `To update it, please deauthorize it first or use a different institution ID.`
      //     );
      //   }
      // } catch (checkError: any) {
      //   // If error is not about institution not found, rethrow it
      //   if (!checkError.message?.includes('Failed to get institution details')) {
      //     throw checkError;
      //   }
      //   // Otherwise, institution doesn't exist yet, which is good - continue
      // }

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Check if wallet is the admin
      const contractAdmin = String(await contract.methods['admin']().call());
      const isAdmin = contractAdmin.toLowerCase() === fromAddress.toLowerCase();

      // Estimate gas and add 20% buffer
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['authorizeInstitution'](
          institutionId,
          institutionAddress,
          name
        ).estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        if (estimateError.message?.includes('execution reverted')) {
          if (!isAdmin) {
            throw new Error(
              `Authorization failed: Your wallet address (${fromAddress}) does not have admin permissions on the smart contract. ` +
              `Only the contract admin (${contractAdmin}) can authorize institutions.`
            );
          } else {
            // You are admin but still failed - likely institution already authorized or invalid params
            throw new Error(
              `Authorization failed: The transaction would fail. Possible reasons: ` +
              `1) Institution ID ${institutionId} is already authorized on the blockchain, ` +
              `2) Invalid institution address provided, ` +
              `3) Contract state issue. Check the blockchain explorer for more details.`
            );
          }
        }
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.methods['authorizeInstitution'](
        institutionId,
        institutionAddress,
        name
      ).send({ from: fromAddress, gas: gasLimit.toString() });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Failed to authorize institution:', error);
      throw new Error(error.message || 'Failed to authorize institution');
    }
  }

  /**
   * Deauthorize an institution (admin only)
   */
  async deauthorizeInstitution(institutionId: number): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      // First check if institution exists and is active
      try {
        const existingInstitution = await this.getInstitutionDetails(institutionId);
        if (!existingInstitution.name) {
          throw new Error(
            `Institution ID ${institutionId} does not exist on the blockchain. Cannot deauthorize a non-existent institution.`
          );
        }
        if (!existingInstitution.active) {
          throw new Error(
            `Institution ID ${institutionId} is already deauthorized on the blockchain.`
          );
        }
      } catch (checkError: any) {
        // If it's our custom error, rethrow it
        if (checkError.message?.includes('Institution ID')) {
          throw checkError;
        }
        // Otherwise continue - might be connection issue
      }

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Check if wallet is the admin
      const contractAdmin = String(await contract.methods['admin']().call());
      const isAdmin = contractAdmin.toLowerCase() === fromAddress.toLowerCase();

      // Estimate gas and add 20% buffer
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['deauthorizeInstitution'](institutionId)
          .estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        if (estimateError.message?.includes('execution reverted')) {
          if (!isAdmin) {
            throw new Error(
              `Deauthorization failed: Your wallet address (${fromAddress}) does not have admin permissions on the smart contract. ` +
              `Only the contract admin (${contractAdmin}) can deauthorize institutions.`
            );
          } else {
            throw new Error(
              `Deauthorization failed: The transaction would fail. Possible reasons: ` +
              `1) Institution ID ${institutionId} is not currently authorized or doesn't exist, ` +
              `2) Institution is already deauthorized. Check the blockchain explorer for more details.`
            );
          }
        }
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.methods['deauthorizeInstitution'](institutionId).send({ 
        from: fromAddress, 
        gas: gasLimit.toString() 
      });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Failed to deauthorize institution:', error);
      throw new Error(error.message || 'Failed to deauthorize institution');
    }
  }

  /**
   * Reauthorize an institution (admin only)
   */
  async reauthorizeInstitution(institutionId: number): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Estimate gas and add 20% buffer
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['reauthorizeInstitution'](institutionId)
          .estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        if (estimateError.message?.includes('execution reverted')) {
          throw new Error(
            `Reauthorization failed: Your wallet address (${fromAddress}) does not have admin permissions on the smart contract.`
          );
        }
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.methods['reauthorizeInstitution'](institutionId).send({ 
        from: fromAddress, 
        gas: gasLimit.toString() 
      });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Failed to reauthorize institution:', error);
      throw new Error(error.message || 'Failed to reauthorize institution');
    }
  }

  /**
   * Update institution address (admin only)
   */
  async updateInstitutionAddress(
    institutionId: number,
    oldAddress: string,
    newAddress: string
  ): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Estimate gas and add 20% buffer
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['updateInstitutionAddress'](
          institutionId,
          oldAddress,
          newAddress
        ).estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        if (estimateError.message?.includes('execution reverted')) {
          throw new Error(
            `Update failed: Your wallet address (${fromAddress}) does not have admin permissions on the smart contract.`
          );
        }
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.methods['updateInstitutionAddress'](
        institutionId,
        oldAddress,
        newAddress
      ).send({ from: fromAddress, gas: gasLimit.toString() });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Failed to update institution address:', error);
      throw new Error(error.message || 'Failed to update institution address');
    }
  }

  /**
   * Transfer admin role (admin only)
   */
  async transferAdmin(newAdminAddress: string): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Estimate gas and add 20% buffer
      let gasEstimate: bigint;
      try {
        gasEstimate = await contract.methods['transferAdmin'](newAdminAddress)
          .estimateGas({ from: fromAddress });
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        if (estimateError.message?.includes('execution reverted')) {
          throw new Error(
            `Transfer failed: Your wallet address (${fromAddress}) does not have admin permissions. Only the current admin can transfer the admin role.`
          );
        }
        throw new Error(`Gas estimation failed: ${estimateError.message || 'Unknown error'}`);
      }
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.methods['transferAdmin'](newAdminAddress).send({ 
        from: fromAddress, 
        gas: gasLimit.toString() 
      });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Failed to transfer admin:', error);
      throw new Error(error.message || 'Failed to transfer admin');
    }
  }

  /**
   * Revoke a certificate (institution only)
   */
  async revokeCertificate(certHash: string): Promise<{transactionHash: string; success: boolean}> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      // Estimate gas and add 20% buffer
      const gasEstimate = await contract.methods['revokeCertificate'](certHash)
        .estimateGas({ from: fromAddress });
      
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.methods['revokeCertificate'](certHash).send({ 
        from: fromAddress, 
        gas: gasLimit.toString() 
      });

      return {
        transactionHash: tx.transactionHash,
        success: Boolean(tx.status)
      };
    } catch (error: any) {
      console.error('Failed to revoke certificate:', error);
      throw new Error(error.message || 'Failed to revoke certificate');
    }
  }

  getNetworkName(): string {
    return environment.blockchain.network;
  }

  /**
   * Get the admin address from the smart contract
   */
  async getContractAdmin(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);

      const contract = new web3.eth.Contract(
        this.CONTRACT_ABI,
        environment.blockchain.contractAddress
      );

      const adminAddress = await contract.methods['admin']().call();
      return String(adminAddress);
    } catch (error: any) {
      console.error('Failed to get admin address:', error);
      throw new Error(error.message || 'Failed to get contract admin address');
    }
  }
}