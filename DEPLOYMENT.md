# Attestify — Deployment Guide

> Step-by-step instructions for deploying the **Blockchain**, **Backend**, and **Frontend** components to production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Phase 1 — Smart Contract Deployment](#phase-1--smart-contract-deployment)
- [Phase 2 — Backend Deployment](#phase-2--backend-deployment)
  - [Option A: Railway](#option-a-railway)
  - [Option B: Render](#option-b-render)
  - [Option C: VPS / Self-Hosted](#option-c-vps--self-hosted)
- [Phase 3 — Frontend Deployment](#phase-3--frontend-deployment)
  - [Option A: Vercel](#option-a-vercel)
  - [Option B: Netlify](#option-b-netlify)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Environment Variable Reference](#environment-variable-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

| Requirement | Purpose |
|---|---|
| **Node.js ≥ 22.11** | Runtime for backend and build tools |
| **Git** | Source control |
| **MongoDB Atlas account** | Production database ([mongodb.com/atlas](https://www.mongodb.com/atlas)) |
| **Pinata account** | IPFS pinning for credential PDFs ([pinata.cloud](https://www.pinata.cloud)) |
| **Alchemy or Infura account** | Ethereum RPC endpoint ([alchemy.com](https://www.alchemy.com)) |
| **Ethereum wallet** | With Sepolia ETH for contract deployment (use a dedicated deployer wallet — **never your personal wallet**) |
| **Domain name** *(optional)* | Custom domain for frontend and API |

---

## Phase 1 — Smart Contract Deployment

> The smart contract **must** be deployed first because the backend and frontend both need the `CONTRACT_ADDRESS`.

### 1.1 Configure the environment

```bash
cd blockchain
cp .env.example .env   # or create .env manually
```

Populate `blockchain/.env`:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
PRIVATE_KEY=<YOUR_DEPLOYER_WALLET_PRIVATE_KEY>
ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_API_KEY>
```

> [!CAUTION]
> **Never commit your `PRIVATE_KEY` to version control.** The `.gitignore` already excludes `.env` files — verify this before pushing.

### 1.2 Compile the contract

```bash
npm install
npm run compile
```

A successful compilation creates the `artifacts/` directory with the contract ABI.

### 1.3 Deploy to Sepolia testnet

```bash
npm run deploy:sepolia
```

The script will:
1. Deploy the `Attestify` contract
2. Wait for **6 block confirmations**
3. Auto-verify on Etherscan (if `ETHERSCAN_API_KEY` is set)
4. Save deployment details to `deployment-info.json`

**Copy the contract address** from the output — you'll need it for both the backend and frontend.

```
Attestify deployed to: 0x42A657509Bbf3a0F470E77b7cdFF1C71Da2E7864
```

### 1.4 Verify on Etherscan (if auto-verify failed)

```bash
npm run verify
```

### 1.5 Deploying to Mainnet

When ready for production on Ethereum mainnet:

1. Update `hardhat.config.js` to add a `mainnet` network:
   ```js
   mainnet: {
     url: process.env.MAINNET_RPC_URL || "",
     accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
     chainId: 1
   }
   ```
2. Fund the deployer wallet with real ETH.
3. Run: `npx hardhat run scripts/deploy.js --network mainnet`

> [!WARNING]
> Mainnet deployments cost real ETH. Ensure the contract has been thoroughly tested on Sepolia before deploying.

---

## Phase 2 — Backend Deployment

The backend is a standard **Node.js / Express** server. It connects to MongoDB, Ethereum (via RPC), and IPFS (via Pinata).

### 2.0 Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. Create a database user with a strong password.
3. Whitelist your server's IP address (or use `0.0.0.0/0` for platforms like Railway/Render).
4. Get the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/attestify?retryWrites=true&w=majority
   ```

### 2.1 Environment Variables

Every deployment method below requires these environment variables:

```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/attestify?retryWrites=true&w=majority

# JWT
JWT_SECRET=<random-256-bit-hex-string>

# Blockchain
CONTRACT_ADDRESS=0x42A657509Bbf3a0F470E77b7cdFF1C71Da2E7864
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_KEY>
ADMIN_PRIVATE_KEY=<YOUR_DEPLOYER_PRIVATE_KEY>

# IPFS / Pinata
PINATA_API_KEY=<your-pinata-api-key>
PINATA_SECRET_KEY=<your-pinata-secret-key>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<your-google-client-id>

# Email (optional)
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
```

> [!TIP]
> Generate a strong `JWT_SECRET` with: `openssl rand -hex 32`

---

### Option A: Railway

[Railway](https://railway.app) is the fastest path to production.

1. **Connect your repo**
   - Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
   - Select the `attestify` repository

2. **Set the root directory** to `backend`

3. **Add environment variables**
   - Go to the **Variables** tab
   - Add all variables from section 2.1 above

4. **Set the start command** (if not auto-detected):
   ```
   npm start
   ```

5. **Add a custom domain** (optional)
   - Settings → Networking → Generate Domain or add your own

6. Railway auto-deploys on every push to your default branch.

---

### Option B: Render

[Render](https://render.com) offers a free tier for web services.

1. **Create a Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repo

2. **Configure the service**

   | Setting | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Node Version** | `22` (set via `NODE_VERSION` env var) |

   > [!WARNING]
   > The Build Command **must** be `npm install`, not just `npm`. Using bare `npm` prints help text and fails the build.

3. **Add environment variables**
   - Environment → Add all variables from section 2.1

4. **Deploy**
   - Render auto-deploys on push. Your API will be available at `https://your-service.onrender.com`

> [!NOTE]
> Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30s. Use a paid plan for production workloads.

---

### Option C: VPS / Self-Hosted

For full control, deploy on a VPS (DigitalOcean, AWS EC2, Hetzner, etc.).

#### 1. Server setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### 2. Clone and configure

```bash
git clone https://github.com/yourusername/attestify.git
cd attestify/backend
npm install --production
```

Create the `.env` file with all variables from section 2.1.

#### 3. Start with PM2

```bash
pm2 start src/server.js --name attestify-api
pm2 save
pm2 startup   # auto-start on reboot
```

#### 4. Configure Nginx reverse proxy

Create `/etc/nginx/sites-available/attestify-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Max upload size (for branding images, CSVs)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/attestify-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Enable HTTPS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Certbot auto-renews the certificate via a systemd timer.

#### 6. Persistent storage

The backend stores uploaded files (logos, seals, signatures) in `backend/uploads/`. Ensure this directory is:
- **Not inside a read-only filesystem** (common on some PaaS platforms)
- **Backed up** regularly
- On PaaS platforms (Railway/Render), consider using cloud storage (S3, Cloudflare R2) instead

---

## Phase 3 — Frontend Deployment

The frontend is a **React + Vite** SPA that builds to static files.

### 3.1 Environment Variables

The frontend uses `VITE_`-prefixed variables that are embedded **at build time**:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_CONTRACT_ADDRESS=0x42A657509Bbf3a0F470E77b7cdFF1C71Da2E7864
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_KEY>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

> [!IMPORTANT]
> `VITE_API_URL` must point to your **deployed backend**, not `localhost`. All `VITE_` variables are publicly visible in the built bundle — never put secrets here.

### 3.2 Build locally (optional verification)

```bash
cd frontend
npm install
npm run build
```

The output goes to `frontend/dist/`. You can preview it with:

```bash
npm run preview
```

---

### Option A: Vercel

[Vercel](https://vercel.com) is the recommended platform for Vite/React apps.

1. **Import project**
   - Go to [vercel.com](https://vercel.com) → Add New → Project
   - Import your GitHub repository

2. **Configure build settings**

   | Setting | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. **Add environment variables**
   - Settings → Environment Variables
   - Add all `VITE_` variables from section 3.1

4. **Configure SPA routing**

   Create `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   This ensures client-side routing works (e.g., `/verify`, `/dashboard`).

5. **Deploy** — Vercel auto-deploys on every push.

6. **Custom domain** — Settings → Domains → Add your domain.

---

### Option B: Netlify

1. **Import project**
   - [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git

2. **Configure build settings**

   | Setting | Value |
   |---|---|
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `frontend/dist` |

3. **Add environment variables**
   - Site settings → Environment variables
   - Add all `VITE_` variables from section 3.1

4. **Configure SPA routing**

   Create `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

5. **Deploy** — Netlify auto-deploys on push.

---

## Post-Deployment Checklist

Use this checklist to verify everything is working after deployment:

### Critical Checks

- [ ] **Backend health**: `curl https://api.yourdomain.com/health` returns `{"status":"OK"}`
- [ ] **Database connection**: Backend logs show `MongoDB Connected: ...`
- [ ] **Frontend loads**: Visit `https://yourdomain.com` and confirm the landing page renders
- [ ] **API connectivity**: Register/login works from the frontend
- [ ] **CORS**: No CORS errors in the browser console — ensure `FRONTEND_URL` in backend matches your frontend domain exactly (no trailing slash)
- [ ] **Blockchain**: Issue a test credential and verify the transaction appears on [Sepolia Etherscan](https://sepolia.etherscan.io)
- [ ] **IPFS**: Issued credential PDFs are accessible via the IPFS gateway

### Security Checks

- [ ] **HTTPS**: Both frontend and backend are served over HTTPS
- [ ] **ENV files**: Verify `.env` files are **not** committed to Git (`git status` shows them ignored)
- [ ] **JWT_SECRET**: Is a unique, randomly generated 256-bit string
- [ ] **ADMIN_PRIVATE_KEY**: The deployer wallet holds only the minimum required ETH
- [ ] **Rate limiting**: Verify rate limits work by sending rapid requests — backend should return `429`
- [ ] **Helmet headers**: Check response headers include `X-Content-Type-Options`, `X-Frame-Options`, etc.

### Google OAuth Setup

If using Google login in production:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add your production frontend URL to **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```
4. Add your production backend URL to **Authorized redirect URIs**:
   ```
   https://api.yourdomain.com/api/auth/google/callback
   ```

### Email Setup

If using Gmail for credential notification emails:

1. Enable 2-Factor Authentication on the Gmail account
2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the App Password as `EMAIL_PASS` (not your regular Gmail password)

---

## Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `PORT` | ✅ | Server port (default: `5000`) |
| `NODE_ENV` | ✅ | Set to `production` |
| `FRONTEND_URL` | ✅ | Full URL of the deployed frontend (for CORS) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Random 256-bit hex string for signing JWTs |
| `CONTRACT_ADDRESS` | ✅ | Deployed smart contract address |
| `SEPOLIA_RPC_URL` | ✅ | Alchemy/Infura Sepolia RPC endpoint |
| `ADMIN_PRIVATE_KEY` | ✅ | Deployer wallet private key (for issuing on-chain) |
| `PINATA_API_KEY` | ✅ | Pinata IPFS API key |
| `PINATA_SECRET_KEY` | ✅ | Pinata IPFS secret key |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID |
| `EMAIL_USER` | ❌ | SMTP email address |
| `EMAIL_PASS` | ❌ | SMTP App Password |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | ✅ | Backend API URL (e.g., `https://api.yourdomain.com/api`) |
| `VITE_CONTRACT_ADDRESS` | ✅ | Deployed smart contract address |
| `VITE_SEPOLIA_RPC_URL` | ✅ | Alchemy/Infura Sepolia RPC endpoint |
| `VITE_GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID |

### Blockchain (`blockchain/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `SEPOLIA_RPC_URL` | ✅ | Alchemy/Infura Sepolia RPC endpoint |
| `PRIVATE_KEY` | ✅ | Deployer wallet private key |
| `ETHERSCAN_API_KEY` | ❌ | For contract verification on Etherscan |

---

## Troubleshooting

### Backend won't start

| Symptom | Fix |
|---|---|
| `MongoDB Connection Error` | Check `MONGODB_URI` — ensure the Atlas user password has no special URL characters (or encode them). Verify IP whitelist includes your server. |
| `CONTRACT_ADDRESS is undefined` | Ensure `.env` is loaded — check that `dotenv.config()` runs before any config reads. |
| `CORS error` in browser | `FRONTEND_URL` must match the frontend origin exactly: same protocol, domain, and port. No trailing slash. |

### Frontend shows blank page

| Symptom | Fix |
|---|---|
| White screen, no errors | Ensure SPA routing is configured (`vercel.json` or `_redirects`). |
| `Network Error` on API calls | `VITE_API_URL` must point to the deployed backend, not `localhost`. Rebuild after changing. |
| `VITE_` vars are undefined | These are baked in at **build time**. You must rebuild and redeploy after changing them. |

### Blockchain issues

| Symptom | Fix |
|---|---|
| `insufficient funds` during deploy | Fund the deployer wallet with Sepolia ETH from a [faucet](https://www.alchemy.com/faucets/ethereum-sepolia). |
| Transaction stuck / pending | Check gas prices on [Sepolia Etherscan](https://sepolia.etherscan.io). Increase gas if needed. |
| Etherscan verification fails | Wait a few minutes after deployment, then retry `npm run verify`. |

---

**Built with ❤️ by the Attestify Team**
