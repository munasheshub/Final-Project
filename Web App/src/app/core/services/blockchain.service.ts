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
   * Issue certificate to blockchain
   * @param certificateData Certificate data to submit to blockchain
   * @returns Transaction hash and other details
   */
  async issueCertificateToBlockchain(certificateData: {
    certHash: string;
    ipfsCID: string;
    studentId: number;
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
      const provider = new (window as any).Web3(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the contract ABI (simplified for issueCertificate function)
      const contractABI = [
        {
          "inputs": [
            { "internalType": "bytes32", "name": "certHash", "type": "bytes32" },
            { "internalType": "bytes32", "name": "ipfsCID", "type": "bytes32" },
            { "internalType": "uint32", "name": "studentId", "type": "uint32" },
            { "internalType": "uint64", "name": "issueDate", "type": "uint64" }
          ],
          "name": "issueCertificate",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const contract = new provider.eth.Contract(
        contractABI,
        environment.blockchain.contractAddress
      );

      const accounts = await provider.eth.getAccounts();
      const fromAddress = accounts[0];

      // Call the smart contract
      const tx = await contract.methods
        .issueCertificate(
          certificateData.certHash,
          certificateData.ipfsCID,
          certificateData.studentId,
          certificateData.issueDate
        )
        .send({ from: fromAddress });

      return {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed.toString(),
        success: tx.status
      };
    } catch (error: any) {
      console.error('Blockchain transaction failed:', error);
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

    const provider = new (window as any).Web3(window.ethereum);
    return provider.utils.keccak256(data);
  }
}
