export const environment = {
  production: false,
  apiUrl: 'https://localhost:7270/api',
  
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'current_user',

  // AI Fraud Detection Feature Flag
  aiServiceEnabled: true,

  // Blockchain Configuration
  blockchain: {
    network: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/4e2f8725145b45ce8c81b664d4e9d20e',
    contractAddress: '0xA5c1648044e719f90218921ddC550e2E1fcEE5C5',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io'
  }
};