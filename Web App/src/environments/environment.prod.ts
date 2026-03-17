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
    contractAddress: '0x80f092C834cbc6B583DFBb93bf8FAA92E83DB831',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io'
  }
};