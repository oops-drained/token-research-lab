"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SupportedChainId } from "./chains";
import { getFactoryAddress, setFactoryAddress } from "./deployments";

type FactoryMap = Partial<Record<SupportedChainId, string>>;

interface FactoryConfigContextValue {
  loaded: boolean;
  getFactory: (chainId: SupportedChainId) => `0x${string}` | null;
  saveOverride: (chainId: SupportedChainId, address: string) => void;
}

const FactoryConfigContext = createContext<FactoryConfigContextValue | null>(null);

const CHAIN_IDS: SupportedChainId[] = [11155111, 97];

function readLocalOverrides(): FactoryMap {
  if (typeof window === "undefined") return {};
  const map: FactoryMap = {};
  for (const id of CHAIN_IDS) {
    const v = localStorage.getItem(`factory-override-${id}`);
    if (v) map[id] = v;
  }
  return map;
}

export function FactoryConfigProvider({ children }: { children: ReactNode }) {
  const [serverFactories, setServerFactories] = useState<FactoryMap>({});
  const [localOverrides, setLocalOverrides] = useState<FactoryMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLocalOverrides(readLocalOverrides());

    fetch("/api/config")
      .then((r) => r.json())
      .then((data: { factories: FactoryMap }) => {
        setServerFactories(data.factories ?? {});
      })
      .catch(() => setServerFactories({}))
      .finally(() => setLoaded(true));
  }, []);

  const getFactory = (chainId: SupportedChainId): `0x${string}` | null => {
    const override = localOverrides[chainId];
    if (override) return override as `0x${string}`;

    const fromServer = serverFactories[chainId];
    if (fromServer) return fromServer as `0x${string}`;

    return getFactoryAddress(chainId);
  };

  const saveOverride = (chainId: SupportedChainId, address: string) => {
    setFactoryAddress(chainId, address);
    setLocalOverrides(readLocalOverrides());
  };

  return (
    <FactoryConfigContext.Provider value={{ loaded, getFactory, saveOverride }}>
      {children}
    </FactoryConfigContext.Provider>
  );
}

export function useFactoryConfig() {
  const ctx = useContext(FactoryConfigContext);
  if (!ctx) throw new Error("useFactoryConfig must be used within FactoryConfigProvider");
  return ctx;
}
