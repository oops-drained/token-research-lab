"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { SUPPORTED_CHAINS, CHAIN_LABELS, FAUCET_URL } from "@/lib/chains";
import type { SupportedChainId } from "@/lib/chains";

export function WalletBar() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  return (
    <div className="card">
      <h2>Wallet</h2>
      {!isConnected ? (
        <div>
          <p className="hint">Verbinde MetaMask oder eine andere injizierte Wallet.</p>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
          >
            {isPending ? "Verbinde…" : "Wallet verbinden"}
          </button>
        </div>
      ) : (
        <div>
          <p className="hint">
            <strong>{address?.slice(0, 6)}…{address?.slice(-4)}</strong>
            {chain && <> · {chain.name}</>}
          </p>
          <div className="row" style={{ marginTop: "0.75rem" }}>
            {SUPPORTED_CHAINS.map((c) => (
              <button
                key={c.id}
                className={chainId === c.id ? "" : "secondary"}
                onClick={() => switchChain({ chainId: c.id })}
              >
                {CHAIN_LABELS[c.id as SupportedChainId].split(" ")[0]}
              </button>
            ))}
            <button className="secondary" onClick={() => disconnect()}>
              Trennen
            </button>
          </div>
          {chainId && FAUCET_URL[chainId as SupportedChainId] && (
            <p className="faucet-links">
              Testnet-Gas:{" "}
              <a href={FAUCET_URL[chainId as SupportedChainId]} target="_blank" rel="noreferrer">
                Faucet öffnen
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
