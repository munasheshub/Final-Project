export const environment = {
  production: true,
  apiUrl: 'https://certfiychain.onrender.com/api',
  
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'current_user',

  // Blockchain Configuration
  blockchain: {
    network: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/4e2f8725145b45ce8c81b664d4e9d20e',
    contractAddress: '0x29baF19FF34fcf90a8980AD34C3389E8BE3A501E',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io'
  }
};