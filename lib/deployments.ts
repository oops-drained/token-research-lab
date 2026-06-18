import deployments from "@/deployments/deployments.json";
import type { SupportedChainId } from "./chains";

type DeploymentEntry = {
  chainId: number;
  factory: string;
  note?: string;
};

function envFactory(chainId: SupportedChainId): string | undefined {
  if (chainId === 11155111) return process.env.NEXT_PUBLIC_FACTORY_SEPOLIA;
  if (chainId === 97) return process.env.NEXT_PUBLIC_FACTORY_BSC_TESTNET;
  return undefined;
}

export function getFactoryAddress(chainId: SupportedChainId): `0x${string}` | null {
  const fromEnv = envFactory(chainId);
  if (fromEnv) return fromEnv as `0x${string}`;

  const entry = (deployments as Record<string, DeploymentEntry>)[String(chainId)];
  if (!entry?.factory) return null;
  return entry.factory as `0x${string}`;
}

export function setFactoryAddress(chainId: SupportedChainId, address: string) {
  if (typeof window === "undefined") return;
  const key = `factory-override-${chainId}`;
  localStorage.setItem(key, address);
}

export function getFactoryAddressWithOverride(chainId: SupportedChainId): `0x${string}` | null {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem(`factory-override-${chainId}`);
    if (override) return override as `0x${string}`;
  }
  return getFactoryAddress(chainId);
}

export interface CreatedToken {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  chainId: SupportedChainId;
  createdAt: string;
  txHash?: string;
}

const STORAGE_KEY = "research-tokens";

export function loadTokens(): CreatedToken[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveToken(token: CreatedToken) {
  const existing = loadTokens();
  const updated = [token, ...existing.filter((t) => t.address !== token.address)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeToken(address: string) {
  const updated = loadTokens().filter((t) => t.address !== address);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
