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
}
