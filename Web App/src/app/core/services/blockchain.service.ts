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
      
      // Complete contract ABI (updated with bytes16 studentId)
      const contractABI: any = [
        {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldAdmin","type":"address"},{"indexed":true,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminTransferred","type":"event"},
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"address","name":"institutionAddress","type":"address"},{"internalType":"string","name":"name","type":"string"}],"name":"authorizeInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32[]","name":"certHashes","type":"bytes32[]"},{"internalType":"bytes32[]","name":"ipfsCIDs","type":"bytes32[]"},{"internalType":"bytes16[]","name":"studentIds","type":"bytes16[]"},{"internalType":"uint64[]","name":"issueDates","type":"uint64[]"}],"name":"batchIssueCertificates","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"certHash","type":"bytes32"},{"indexed":true,"internalType":"bytes16","name":"studentId","type":"bytes16"},{"indexed":true,"internalType":"uint16","name":"institutionId","type":"uint16"},{"indexed":false,"internalType":"uint64","name":"issueDate","type":"uint64"}],"name":"CertificateIssued","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"certHash","type":"bytes32"},{"indexed":true,"internalType":"uint16","name":"institutionId","type":"uint16"},{"indexed":false,"internalType":"uint64","name":"revokeDate","type":"uint64"}],"name":"CertificateRevoked","type":"event"},
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"}],"name":"deauthorizeInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"},{"internalType":"bytes32","name":"ipfsCID","type":"bytes32"},{"internalType":"bytes16","name":"studentId","type":"bytes16"},{"internalType":"uint64","name":"issueDate","type":"uint64"}],"name":"issueCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"revokeCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"certificateExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"getCertificateDetails","outputs":[{"components":[{"internalType":"bytes32","name":"certHash","type":"bytes32"},{"internalType":"bytes32","name":"ipfsCID","type":"bytes32"},{"internalType":"uint64","name":"issueDate","type":"uint64"},{"internalType":"bytes16","name":"studentId","type":"bytes16"},{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct CertificateVerification.Certificate","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"getStats","outputs":[{"internalType":"uint32","name":"totalCerts","type":"uint32"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"verifyCertificate","outputs":[{"internalType":"bool","name":"isValid","type":"bool"},{"internalType":"bytes16","name":"studentId","type":"bytes16"},{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"uint64","name":"issueDate","type":"uint64"},{"internalType":"bytes32","name":"ipfsCID","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"certificateCount","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
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
      
      const contractABI: any = [
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"verifyCertificate","outputs":[{"internalType":"bool","name":"isValid","type":"bool"},{"internalType":"bytes16","name":"studentId","type":"bytes16"},{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"uint64","name":"issueDate","type":"uint64"},{"internalType":"bytes32","name":"ipfsCID","type":"bytes32"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const result: any = await contract.methods['verifyCertificate'](certHash).call();

      return {
        isValid: Boolean(result[0]),
        studentId: this.bytes16ToStudentId(result[1]),
        institutionId: Number(result[2]),
        issueDate: Number(result[3]),
        ipfsCID: result[4].toString()
      };
    } catch (error: any) {
      console.error('Verification failed:', error);
      throw new Error(error.message || 'Failed to verify certificate');
    }
  }

  /**
   * Get certificate details from blockchain
   */
  async getCertificateDetails(certHash: string): Promise<{
    certHash: string;
    ipfsCID: string;
    issueDate: number;
    studentId: string;
    institutionId: number;
    status: number;
    exists: boolean;
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const web3 = new Web3(window.ethereum);
      
      const contractABI: any = [
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"getCertificateDetails","outputs":[{"components":[{"internalType":"bytes32","name":"certHash","type":"bytes32"},{"internalType":"bytes32","name":"ipfsCID","type":"bytes32"},{"internalType":"uint64","name":"issueDate","type":"uint64"},{"internalType":"bytes16","name":"studentId","type":"bytes16"},{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct CertificateVerification.Certificate","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const result: any = await contract.methods['getCertificateDetails'](certHash).call();

      return {
        certHash: result[0].toString(),
        ipfsCID: result[1].toString(),
        issueDate: Number(result[2]),
        studentId: this.bytes16ToStudentId(result[3]),
        institutionId: Number(result[4]),
        status: Number(result[5]),
        exists: Boolean(result[6])
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
      
      const contractABI: any = [
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"certificateExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
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
      
      const contractABI: any = [
        {"inputs":[],"name":"certificateCount","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
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
      
      const contractABI: any = [
        {"inputs":[],"name":"getInstitutions","outputs":[{"internalType":"uint16[]","name":"","type":"uint16[]"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
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
      
      const contractABI: any = [
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"}],"name":"getInstitution","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"active","type":"bool"}],"stateMutability":"view","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
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

      const contractABI: any = [
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"address","name":"institutionAddress","type":"address"},{"internalType":"string","name":"name","type":"string"}],"name":"authorizeInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const tx = await contract.methods['authorizeInstitution'](
        institutionId,
        institutionAddress,
        name
      ).send({ from: fromAddress });

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

      const contractABI: any = [
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"}],"name":"deauthorizeInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const tx = await contract.methods['deauthorizeInstitution'](institutionId).send({ from: fromAddress });

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

      const contractABI: any = [
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"}],"name":"reauthorizeInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const tx = await contract.methods['reauthorizeInstitution'](institutionId).send({ from: fromAddress });

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

      const contractABI: any = [
        {"inputs":[{"internalType":"uint16","name":"institutionId","type":"uint16"},{"internalType":"address","name":"oldAddress","type":"address"},{"internalType":"address","name":"newAddress","type":"address"}],"name":"updateInstitutionAddress","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const tx = await contract.methods['updateInstitutionAddress'](
        institutionId,
        oldAddress,
        newAddress
      ).send({ from: fromAddress });

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

      const contractABI: any = [
        {"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"transferAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const tx = await contract.methods['transferAdmin'](newAdminAddress).send({ from: fromAddress });

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

      const contractABI: any = [
        {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"revokeCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];

      const contract = new web3.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const tx = await contract.methods['revokeCertificate'](certHash).send({ from: fromAddress });

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
}