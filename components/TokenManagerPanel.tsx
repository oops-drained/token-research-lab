"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, isAddress } from "viem";
import { RESEARCH_TOKEN_ABI } from "@/lib/abis";
import type { CreatedToken } from "@/lib/deployments";
import { EXPLORER_URL } from "@/lib/chains";
import type { SupportedChainId } from "@/lib/chains";

interface Props {
  tokens: CreatedToken[];
  selected: CreatedToken | null;
  onSelect: (t: CreatedToken | null) => void;
}

export function TokenManagerPanel({ tokens, selected, onSelect }: Props) {
  const { address, isConnected } = useAccount();
  const [mintAmount, setMintAmount] = useState("1000");
  const [mintTo, setMintTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("1000");
  const [transferTo, setTransferTo] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: balance } = useReadContract({
    address: selected?.address,
    abi: RESEARCH_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!selected && !!address },
  });

  const runMint = () => {
    if (!selected || !isAddress(mintTo || address || "0x")) return;
    const to = (mintTo || address) as `0x${string}`;
    writeContract({
      address: selected.address,
      abi: RESEARCH_TOKEN_ABI,
      functionName: "mint",
      args: [to, parseUnits(mintAmount, selected.decimals)],
    });
  };

  const runTransfer = () => {
    if (!selected || !isAddress(transferTo)) return;
    writeContract({
      address: selected.address,
      abi: RESEARCH_TOKEN_ABI,
      functionName: "transfer",
      args: [transferTo as `0x${string}`, parseUnits(transferAmount, selected.decimals)],
    });
  };

  return (
    <div className="card">
      <h2>Tokens verwalten</h2>
      <p className="hint">Minten oder an Test-Wallets senden, um Wallet-Anzeige zu prüfen.</p>

      {tokens.length === 0 ? (
        <p className="hint">Noch keine Tokens erstellt.</p>
      ) : (
        <ul className="token-list">
          {tokens.map((t) => (
            <li
              key={t.address}
              className={`token-item ${selected?.address === t.address ? "selected" : ""}`}
              onClick={() => onSelect(t)}
              style={{ cursor: "pointer" }}
            >
              <div className="title">
                {t.symbol} — {t.name}
              </div>
              <div className="meta">
                Chain {t.chainId} · {t.decimals} decimals
                <br />
                {t.address}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />
          <p className="hint">
            Ausgewählt: <strong>{selected.symbol}</strong>
            {balance !== undefined && (
              <> · Dein Balance: {Number(balance) / 10 ** selected.decimals}</>
            )}
          </p>

          <label>Mint — Betrag</label>
          <input value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />

          <label>Mint — Empfänger (leer = eigene Wallet)</label>
          <input
            placeholder={address ?? "0x..."}
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
          />

          <button
            onClick={runMint}
            disabled={!isConnected || isPending || isConfirming}
            style={{ marginBottom: "1rem" }}
          >
            Mint
          </button>

          <label>Transfer — Betrag</label>
          <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />

          <label>Transfer — Empfänger-Adresse</label>
          <input
            placeholder="0x..."
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />

          <button onClick={runTransfer} disabled={!isConnected || isPending || isConfirming}>
            Transfer senden
          </button>

          <p className="hint" style={{ marginTop: "0.75rem" }}>
            <a
              href={`${EXPLORER_URL[selected.chainId as SupportedChainId]}/token/${selected.address}`}
              target="_blank"
              rel="noreferrer"
            >
              Token im Explorer öffnen
            </a>
          </p>
        </>
      )}

      {isSuccess && txHash && (
        <div className="status ok" style={{ marginTop: "0.75rem" }}>
          Transaktion bestätigt!
        </div>
      )}
    </div>
  );
}
