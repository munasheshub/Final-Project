// ── Blockchain network configuration ──

export const blockchainConfig = {
  network: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK ?? "Sepolia",
  rpcUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL ?? "",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "",
  chainId: Number(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID ?? "11155111"),
  explorerUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL ?? "https://sepolia.etherscan.io",
}

/** Build an Etherscan link for a given transaction hash */
export function txUrl(txHash: string) {
  return `${blockchainConfig.explorerUrl}/tx/${txHash}`
}

/** Build an Etherscan link for the contract */
export function contractUrl() {
  return `${blockchainConfig.explorerUrl}/address/${blockchainConfig.contractAddress}`
}
