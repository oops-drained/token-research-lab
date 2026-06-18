"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import { TOKEN_FACTORY_ABI } from "@/lib/abis";
import { getFactoryAddressWithOverride, setFactoryAddress, saveToken } from "@/lib/deployments";
import type { SupportedChainId } from "@/lib/chains";
import { EXPLORER_URL } from "@/lib/chains";

const PRESETS = [
  { name: "Tether USD", symbol: "USDT", decimals: 6 },
  { name: "USD Coin", symbol: "USDC", decimals: 6 },
  { name: "Tether USD", symbol: "USDT", decimals: 18 },
  { name: "Test Token", symbol: "TEST", decimals: 18 },
];

interface Props {
  onCreated: () => void;
}

export function CreateTokenPanel({ onCreated }: Props) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId() as SupportedChainId;
  const [name, setName] = useState("Tether USD");
  const [symbol, setSymbol] = useState("USDT");
  const [decimals, setDecimals] = useState(6);
  const [factoryOverride, setFactoryOverride] = useState("");
  const [error, setError] = useState<string | null>(null);

  const factory = getFactoryAddressWithOverride(chainId);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSaveFactory = () => {
    if (factoryOverride) {
      setFactoryAddress(chainId, factoryOverride);
      setFactoryOverride("");
      window.location.reload();
    }
  };

  const handleCreate = () => {
    setError(null);
    if (!factory) {
      setError("Keine Factory-Adresse für dieses Netzwerk. Bitte deployen und eintragen.");
      return;
    }
    writeContract({
      address: factory,
      abi: TOKEN_FACTORY_ABI,
      functionName: "createToken",
      args: [name, symbol, decimals],
    });
  };

  return (
    <div className="card">
      <h2>Token erstellen</h2>
      <p className="hint">
        Deployt einen neuen ERC-20 auf dem Testnet. Nur für Security-Research.
      </p>

      {!factory && (
        <div className="status err" style={{ marginBottom: "1rem" }}>
          Factory nicht konfiguriert für Chain {chainId}. Deploye mit{" "}
          <code>npm run deploy:sepolia</code> und trage die Adresse ein.
        </div>
      )}

      <label>Factory-Adresse (Override)</label>
      <div className="row">
        <input
          placeholder={factory ?? "0x..."}
          value={factoryOverride}
          onChange={(e) => setFactoryOverride(e.target.value)}
        />
        <button className="secondary" onClick={handleSaveFactory}>
          Speichern
        </button>
      </div>
      {factory && (
        <p className="hint" style={{ marginTop: "-0.5rem" }}>
          Aktiv: <code>{factory}</code>
        </p>
      )}

      <label>Presets (Spoofing-Varianten)</label>
      <div className="preset-buttons">
        {PRESETS.map((p) => (
          <button
            key={`${p.symbol}-${p.decimals}`}
            className="secondary"
            type="button"
            onClick={() => {
              setName(p.name);
              setSymbol(p.symbol);
              setDecimals(p.decimals);
            }}
          >
            {p.symbol} ({p.decimals}d)
          </button>
        ))}
      </div>

      <label>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <label>Symbol</label>
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />

      <label>Decimals</label>
      <input
        type="number"
        min={0}
        max={18}
        value={decimals}
        onChange={(e) => setDecimals(Number(e.target.value))}
      />

      <button
        onClick={handleCreate}
        disabled={!isConnected || !factory || isPending || isConfirming}
      >
        {isPending || isConfirming ? "Transaktion läuft…" : "Token deployen"}
      </button>

      {(writeError || error) && (
        <div className="status err">{(writeError ?? new Error(error!)).message}</div>
      )}

      {isSuccess && txHash && (
        <SuccessHandler
          txHash={txHash}
          chainId={chainId}
          name={name}
          symbol={symbol}
          decimals={decimals}
          onDone={onCreated}
        />
      )}
    </div>
  );
}

function SuccessHandler({
  txHash,
  chainId,
  name,
  symbol,
  decimals,
  onDone,
}: {
  txHash: `0x${string}`;
  chainId: SupportedChainId;
  name: string;
  symbol: string;
  decimals: number;
  onDone: () => void;
}) {
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash });
  const [saved, setSaved] = useState(false);

  if (receipt && !saved) {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: TOKEN_FACTORY_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "TokenCreated") {
          const token = decoded.args.token as `0x${string}`;
          saveToken({
            address: token,
            name,
            symbol,
            decimals,
            chainId,
            createdAt: new Date().toISOString(),
            txHash,
          });
          setSaved(true);
          onDone();
          break;
        }
      } catch {
        // not our event
      }
    }
  }

  return (
    <div className="status ok">
      Token erstellt!{" "}
      <a href={`${EXPLORER_URL[chainId]}/tx/${txHash}`} target="_blank" rel="noreferrer">
        Tx ansehen
      </a>
    </div>
  );
}