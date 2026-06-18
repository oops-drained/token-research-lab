"use client";

import { useCallback, useEffect, useState } from "react";
import { WalletBar } from "@/components/WalletBar";
import { CreateTokenPanel } from "@/components/CreateTokenPanel";
import { TokenManagerPanel } from "@/components/TokenManagerPanel";
import { TestMatrixPanel } from "@/components/TestMatrixPanel";
import { loadTokens, type CreatedToken } from "@/lib/deployments";

export default function HomePage() {
  const [tokens, setTokens] = useState<CreatedToken[]>([]);
  const [selected, setSelected] = useState<CreatedToken | null>(null);

  const refresh = useCallback(() => {
    const loaded = loadTokens();
    setTokens(loaded);
    if (selected && !loaded.find((t) => t.address === selected.address)) {
      setSelected(null);
    }
  }, [selected]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="container">
      <header>
        <h1>Token Research Lab</h1>
        <p>
          Testnet-Panel zum Nachstellen von Wallet-Anzeige-Problemen bei spoofed Stablecoins.
          Nur für Security Research — kein Mainnet.
        </p>
        <span className="badge">TESTNET ONLY</span>
      </header>

      <div className="grid" style={{ marginBottom: "1.25rem" }}>
        <WalletBar />
      </div>

      <div className="grid grid-2" style={{ marginBottom: "1.25rem" }}>
        <CreateTokenPanel onCreated={refresh} />
        <TokenManagerPanel
          tokens={tokens}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <TestMatrixPanel tokens={tokens} />
    </div>
  );
}
