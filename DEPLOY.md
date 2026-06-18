# Deployment: GitHub + Dokploy

## 1. GitHub Repository erstellen

```bash
cd token-research-lab
git init
git add .
git commit -m "Initial commit: testnet token research panel"
```

Auf GitHub ein neues Repo anlegen (z. B. `token-research-lab`), dann:

```bash
git remote add origin https://github.com/DEIN_USER/token-research-lab.git
git branch -M main
git push -u origin main
```

Mit GitHub CLI:

```bash
gh repo create token-research-lab --public --source=. --push
```

## 2. Contracts auf Testnet deployen (lokal)

Das Webpanel braucht deployed Factory-Adressen. Das machst du **einmal lokal** — nicht auf Dokploy.

```bash
npm install
cp .env.example .env
# PRIVATE_KEY + RPC in .env eintragen

npm run compile
npm run deploy:sepolia
npm run deploy:bsc
```

Die Adressen stehen danach in:
- `deployments/11155111.json` (Sepolia)
- `deployments/97.json` (BSC Testnet)

Trage die Adresse ein via **eine** dieser Methoden:

| Methode | Wo | Rebuild nötig? |
|---------|-----|----------------|
| **Dokploy Runtime Env** | `FACTORY_SEPOLIA=0x...` | Nein — nur Container restart |
| **Im Webpanel** | Factory-Adresse eintragen → Speichern | Nein |
| **Build Arg** | `NEXT_PUBLIC_FACTORY_SEPOLIA=0x...` | Ja |

### Schnell: Adresse im Webpanel eintragen

1. Factory auf Sepolia deployen (siehe unten)
2. Im Panel unter **„Factory-Adresse“** die `0x...` Adresse einfügen
3. **Speichern** klicken — sofort nutzbar

### Schnell: Dokploy Env (ohne Rebuild)

In Dokploy → Environment → hinzufügen:

```
FACTORY_SEPOLIA=0xDeineFactoryAdresse
```

Container **neu starten** (nicht neu bauen).

## 3. Dokploy Deployment

### Option A: Dockerfile (empfohlen)

1. In Dokploy: **New Project** → **New Service** → **Application**
2. **Provider:** GitHub → Repo `token-research-lab` auswählen
3. **Build Type:** Dockerfile
4. **Dockerfile Path:** `Dockerfile`
5. **Port:** `3000`

**Build Arguments** (optional — alternativ Runtime Env nutzen):

| Variable | Beispiel |
|----------|----------|
| `NEXT_PUBLIC_FACTORY_SEPOLIA` | `0xYourFactoryOnSepolia` |
| `NEXT_PUBLIC_FACTORY_BSC_TESTNET` | `0xYourFactoryOnBscTestnet` |

**Runtime Environment** (empfohlen — kein Rebuild bei Adress-Änderung):

| Variable | Wert |
|----------|------|
| `FACTORY_SEPOLIA` | `0x...` (Sepolia TokenFactory) |
| `FACTORY_BSC_TESTNET` | `0x...` (BSC Testnet TokenFactory) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `HOSTNAME` | `0.0.0.0` |

> `FACTORY_*` Runtime-Variablen werden von `/api/config` geladen — **kein Rebuild** nötig.

6. Domain zuweisen (z. B. `research.deine-domain.de`)
7. Deploy starten

### Option B: Docker Compose

1. **Build Type:** Docker Compose
2. **Compose File:** `docker-compose.yml`
3. Env-Vars im Dokploy-Dashboard setzen (gleiche wie oben)
4. Port `3000` exposen

## 4. Nach dem Deploy prüfen

- [ ] Seite lädt unter deiner Domain
- [ ] MetaMask verbindet sich
- [ ] Sepolia / BSC Testnet umschaltbar
- [ ] Factory-Adresse wird angezeigt (nicht „nicht konfiguriert“)
- [ ] Token deployen funktioniert

Falls Factory leer: Build Args prüfen und **Rebuild** auslösen.

## 5. Updates pushen

```bash
git add .
git commit -m "Update ..."
git push
```

Dokploy kann Auto-Deploy bei Push aktivieren (Webhook in Repo-Settings).

## Hinweise

- **PRIVATE_KEY** gehört **nicht** auf Dokploy — nur lokal für Contract-Deploys
- Das Panel ist rein clientseitig (Wallet signiert Transaktionen im Browser)
- Factory-Override im UI (localStorage) funktioniert weiterhin als Fallback
- Für HTTPS: Dokploy/Let's Encrypt oder Reverse Proxy vor dem Container

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Build schlägt fehl | `npm run build` lokal testen |
| Factory leer in UI | `NEXT_PUBLIC_FACTORY_*` Build Args setzen + Rebuild |
| Wallet verbindet nicht | HTTPS verwenden (viele Wallets blockieren HTTP auf Prod-Domains) |
| Port nicht erreichbar | Container-Port `3000` in Dokploy mappen |
