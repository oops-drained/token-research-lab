"use client";

import { useState } from "react";
import {
  WALLET_OPTIONS,
  TEST_CHECKLIST,
  exportReport,
  type TestMatrixEntry,
} from "@/lib/report";
import type { CreatedToken } from "@/lib/deployments";
import { CHAIN_LABELS, OFFICIAL_USDT } from "@/lib/chains";
import type { SupportedChainId } from "@/lib/chains";

interface Props {
  tokens: CreatedToken[];
}

const emptyEntry = (): TestMatrixEntry => ({
  wallet: "MetaMask",
  chain: "Sepolia",
  tokenAddress: "",
  tokenSymbol: "USDT",
  showsFiatValue: null,
  showsContractAddress: null,
  showsWarning: null,
  swapPossible: null,
  notes: "",
});

export function TestMatrixPanel({ tokens }: Props) {
  const [entries, setEntries] = useState<TestMatrixEntry[]>([emptyEntry()]);

  const update = (index: number, patch: Partial<TestMatrixEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const addRow = () => setEntries((prev) => [...prev, emptyEntry()]);
  const removeRow = (index: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== index));

  const fillFromToken = (index: number, token: CreatedToken) => {
    update(index, {
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      chain: CHAIN_LABELS[token.chainId as SupportedChainId],
    });
  };

  return (
    <div className="card">
      <h2>Test-Matrix (Reporting)</h2>
      <p className="hint">
        Dokumentiere pro Wallet, ob ein Fake-Stablecoin fälschlich einen Dollar-Wert anzeigt.
        Exportiere das Ergebnis als JSON für Security Reports.
      </p>

      {entries.map((entry, i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
            background: "var(--surface-2)",
          }}
        >
          <div className="row" style={{ marginBottom: "0.75rem", justifyContent: "space-between" }}>
            <strong>Test #{i + 1}</strong>
            {entries.length > 1 && (
              <button className="danger" onClick={() => removeRow(i)}>
                Entfernen
              </button>
            )}
          </div>

          <label>Wallet</label>
          <select
            value={entry.wallet}
            onChange={(e) => update(i, { wallet: e.target.value })}
          >
            {WALLET_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <label>Chain</label>
          <input value={entry.chain} onChange={(e) => update(i, { chain: e.target.value })} />

          <label>Token-Adresse (dein Research-Token)</label>
          <input
            value={entry.tokenAddress}
            onChange={(e) => update(i, { tokenAddress: e.target.value })}
            placeholder="0x..."
          />

          {tokens.length > 0 && (
            <div className="preset-buttons">
              {tokens.map((t) => (
                <button
                  key={t.address}
                  className="secondary"
                  type="button"
                  onClick={() => fillFromToken(i, t)}
                >
                  {t.symbol} ({t.address.slice(0, 8)}…)
                </button>
              ))}
            </div>
          )}

          <label>Symbol</label>
          <input
            value={entry.tokenSymbol}
            onChange={(e) => update(i, { tokenSymbol: e.target.value })}
          />

          {TEST_CHECKLIST.map(({ key, label }) => (
            <div key={key} className="checkbox-group">
              <span style={{ fontSize: "0.85rem", width: "100%", marginBottom: "0.25rem" }}>
                {label}
              </span>
              {(["yes", "no", "unknown"] as const).map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name={`${key}-${i}`}
                    checked={
                      entry[key] === true
                        ? v === "yes"
                        : entry[key] === false
                          ? v === "no"
                          : v === "unknown"
                    }
                    onChange={() =>
                      update(i, {
                        [key]: v === "yes" ? true : v === "no" ? false : null,
                      })
                    }
                  />
                  {v === "yes" ? "Ja" : v === "no" ? "Nein" : "Unbekannt"}
                </label>
              ))}
            </div>
          ))}

          <label>Notizen</label>
          <textarea
            rows={2}
            value={entry.notes}
            onChange={(e) => update(i, { notes: e.target.value })}
            placeholder="Wallet-Version, Screenshot-Referenz, etc."
          />
        </div>
      ))}

      <div className="row">
        <button className="secondary" onClick={addRow}>
          + Test hinzufügen
        </button>
        <button
          onClick={() =>
            exportReport(
              tokens.map((t) => ({
                address: t.address,
                symbol: t.symbol,
                chainId: t.chainId,
              })),
              entries
            )
          }
        >
          Report exportieren (JSON)
        </button>
      </div>

      <div className="status info" style={{ marginTop: "1rem" }}>
        <strong>Offizielle USDT-Adressen zum Vergleich:</strong>
        <br />
        Sepolia: <code>{OFFICIAL_USDT[11155111]}</code>
        <br />
        BSC Testnet: <code>{OFFICIAL_USDT[97]}</code>
      </div>
    </div>
  );
}
