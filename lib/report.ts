export interface TestMatrixEntry {
  wallet: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  showsFiatValue: boolean | null;
  showsContractAddress: boolean | null;
  showsWarning: boolean | null;
  swapPossible: boolean | null;
  notes: string;
}

export const WALLET_OPTIONS = [
  "MetaMask",
  "Trust Wallet",
  "OKX Wallet",
  "Binance Web3",
  "Phantom",
  "Coinbase Wallet",
  "Other",
] as const;

export const TEST_CHECKLIST = [
  { key: "showsFiatValue", label: "Shows fiat value (~$1 per token)?" },
  { key: "showsContractAddress", label: "Shows contract address prominently?" },
  { key: "showsWarning", label: "Shows unverified/scam warning?" },
  { key: "swapPossible", label: "Swap to real USDT possible?" },
] as const;

export function exportReport(
  tokens: { address: string; symbol: string; chainId: number }[],
  matrix: TestMatrixEntry[]
) {
  const report = {
    generatedAt: new Date().toISOString(),
    purpose: "Wallet token display security research — TESTNET ONLY",
    tokens,
    testMatrix: matrix,
    recommendations: [
      "Price feeds should match by contract address, not symbol alone",
      "Unknown tokens should not display fiat values",
      "Contract address should be visible before any interaction",
      "Warn when token address differs from official USDT/USDC",
    ],
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wallet-token-research-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
