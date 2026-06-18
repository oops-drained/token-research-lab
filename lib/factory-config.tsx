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

function localOverride(chainId: SupportedChainId): `0x${string}` | null {
  const v = localStorage.getItem(`factory-override-${chainId}`);
  return v ? (v as `0x${string}`) : null;
}

export function FactoryConfigProvider({ children }: { children: ReactNode }) {
  const [serverFactories, setServerFactories] = useState<FactoryMap>({});
  const [loaded, setLoaded] = useState(false);
  const [overrideVersion, setOverrideVersion] = useState(0);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: { factories: FactoryMap }) => {
        setServerFactories(data.factories ?? {});
      })
      .catch(() => setServerFactories({}))
      .finally(() => setLoaded(true));
  }, []);

  const getFactory = (chainId: SupportedChainId): `0x${string}` | null => {
    void overrideVersion;

    const override = localOverride(chainId);
    if (override) return override;

    const fromServer = serverFactories[chainId];
    if (fromServer) return fromServer as `0x${string}`;

    return getFactoryAddress(chainId);
  };

  const saveOverride = (chainId: SupportedChainId, address: string) => {
    setFactoryAddress(chainId, address);
    setOverrideVersion((v) => v + 1);
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
