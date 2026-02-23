export const environment = {
  production: false,
  apiUrl: 'https://localhost:7270/api',
  
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'current_user',

  // Blockchain Configuration
  blockchain: {
    network: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/4e2f8725145b45ce8c81b664d4e9d20e',
    contractAddress: '0xb64ef291b5aef2b40e291161053cb189662453c8',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io'
  }
};