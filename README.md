# Token Research Lab

Testnet-Webpanel für Security Research: ERC-20-Tokens mit beliebigem Namen/Symbol (z. B. `USDT`) deployen, minten und an Test-Wallets senden — um zu prüfen, ob Wallets fälschlich einen Dollar-Wert anzeigen.

**Nur Testnet. Nicht für Mainnet oder betrügerische Zwecke.**

## Unterstützte Netzwerke

- **Sepolia** (Ethereum Testnet)
- **BSC Testnet**

## Voraussetzungen

- [Node.js](https://nodejs.org/) 18+
- MetaMask (oder andere injizierte Wallet)
- Testnet-Gas (ETH auf Sepolia, BNB auf BSC Testnet)

## Setup

```bash
cd token-research-lab
npm install
cp .env.example .env
```

Trage in `.env` ein:

- `PRIVATE_KEY` — Wallet für Contract-Deploy (nur Research-Wallet, kein Mainnet-Geld)
- Optional: eigene RPC-URLs

## Contracts deployen

```bash
# Kompilieren
npm run compile

# Sepolia
npm run deploy:sepolia

# BSC Testnet
npm run deploy:bsc
```

Die Factory-Adresse wird in `deployments/<chainId>.json` gespeichert. Alternativ im Webpanel unter „Factory-Adresse“ eintragen.

## Webpanel starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## GitHub + Dokploy Deployment

Ausführliche Anleitung: **[DEPLOY.md](./DEPLOY.md)**

Kurzfassung:

1. Repo auf GitHub pushen
2. Contracts lokal auf Testnet deployen (`npm run deploy:sepolia`)
3. In Dokploy: GitHub-Repo verbinden, **Build Type: Dockerfile**, Port **3000**
4. Build Args setzen:
   - `NEXT_PUBLIC_FACTORY_SEPOLIA`
   - `NEXT_PUBLIC_FACTORY_BSC_TESTNET`

## Workflow

1. **Wallet verbinden** und Testnet wählen (Sepolia oder BSC Testnet)
2. **Token erstellen** — Preset `USDT (6d)` oder eigene Metadaten
3. **Mint / Transfer** — Tokens an deine Test-Wallets (MetaMask, Trust Wallet, …) senden
4. **In jeder Wallet prüfen:**
   - Wird ein Fiat-Wert (~$1) angezeigt?
   - Wird die Contract-Adresse gezeigt?
   - Gibt es eine Warnung?
   - Ist ein Swap möglich?
5. **Test-Matrix ausfüllen** und **JSON-Report exportieren** für Responsible Disclosure

## Architektur

```
contracts/
  ResearchToken.sol   — ERC-20 mit mint() (Owner only)
  TokenFactory.sol    — Deployt neue ResearchTokens
app/                  — Next.js UI
components/           — Wallet, Create, Manage, Test Matrix
lib/                  — ABIs, Chain config, Report export
```

## Offizielle USDT-Adressen (Vergleich)

| Chain       | Offizielle USDT-Adresse |
|-------------|-------------------------|
| Sepolia     | `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0` |
| BSC Testnet | `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd` |

Dein Research-Token hat eine **andere** Adresse — genau das ist der Punkt des Tests.

## Reporting

Exportiere die Test-Matrix als JSON und reiche sie ein bei:

- [MetaMask Security](https://metamask.io/security/)
- Trust Wallet Support
- Phantom Security
- OKX / Binance Web3 Security Teams

## Lizenz

MIT — nur für legitime Security-Forschung.
