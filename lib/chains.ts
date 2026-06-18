import { sepolia, bscTestnet } from "wagmi/chains";

export const SUPPORTED_CHAINS = [sepolia, bscTestnet] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

export const CHAIN_LABELS: Record<SupportedChainId, string> = {
  [sepolia.id]: "Sepolia (Ethereum Testnet)",
  [bscTestnet.id]: "BSC Testnet",
};

export const EXPLORER_URL: Record<SupportedChainId, string> = {
  [sepolia.id]: "https://sepolia.etherscan.io",
  [bscTestnet.id]: "https://testnet.bscscan.com",
};

export const FAUCET_URL: Record<SupportedChainId, string> = {
  [sepolia.id]: "https://sepoliafaucet.com",
  [bscTestnet.id]: "https://testnet.bnbchain.org/faucet-smart",
};

export const OFFICIAL_USDT: Record<SupportedChainId, string> = {
  [sepolia.id]: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
  [bscTestnet.id]: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
};
