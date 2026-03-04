# Certify Chain — Blockchain & AI Certificate Verification

Certify Chain is a **Next.js 16** web application that verifies academic certificates using a dual-layer security model: **Ethereum blockchain immutability** and **AI-powered fraud detection**. Users authenticate via Google OAuth, paste (or scan) a certificate hash, and the app simultaneously queries a Solidity smart contract on the **Sepolia test network** and a .NET backend API to confirm the certificate's authenticity.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Variables](#environment-variables)
6. [Getting Started](#getting-started)
7. [Available Scripts](#available-scripts)
8. [How It Works](#how-it-works)
   - [Authentication Flow](#authentication-flow)
   - [Certificate Verification Flow](#certificate-verification-flow)
   - [Dashboard & Verification Logs](#dashboard--verification-logs)
   - [Blockchain Integration](#blockchain-integration)
   - [Backend API Integration](#backend-api-integration)
9. [Pages & Routes](#pages--routes)
10. [Deployment](#deployment)
11. [Key Libraries](#key-libraries)

---

## Architecture Overview

```
┌──────────────┐      Google OAuth       ┌──────────────────┐
│   Browser    │ ◄─────────────────────► │  Google Cloud    │
│  (Next.js)   │                         │  Identity        │
└──────┬───────┘                         └──────────────────┘
       │
       │  HTTPS (JWT Bearer)
       ▼
┌──────────────────┐    REST API     ┌──────────────────────┐
│  Next.js Server  │ ◄────────────► │  .NET Backend API     │
│  (App Router)    │                │  (Auth, Certificates, │
│                  │                │   Institutions, Logs)  │
└──────┬───────────┘                └──────────────────────┘
       │
       │  JSON-RPC (read-only)
       ▼
┌──────────────────────────────────┐
│  Ethereum Sepolia Testnet        │
│  Smart Contract:                 │
│  CertificateVerification.sol     │
│  (via Infura RPC)                │
└──────────────────────────────────┘
```

**Three-tier verification:**

1. **Backend API** — Stores certificate metadata, student details, institution info, and verification logs in a relational database.
2. **Blockchain** — The certificate hash is anchored on-chain. The smart contract stores the hash, student ID, institution ID, issue date, IPFS CID, and a validity status. Read-only calls (`view` functions) verify existence and authenticity without gas fees.
3. **AI Detection** — Neural-network-based tampering and deepfake analysis validates visual authenticity (referenced in the UI as a capability of the broader platform).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19, TypeScript) |
| **Styling** | Tailwind CSS 4 with `tw-animate-css` |
| **UI Components** | shadcn/ui (New York style) with Radix UI primitives |
| **Authentication** | NextAuth.js v5 (beta) with Google OAuth provider |
| **Blockchain** | ethers.js v6 — JSON-RPC calls to Sepolia via Infura |
| **Smart Contract** | Solidity `CertificateVerification` (read-only ABI) |
| **Backend** | .NET Web API (external — not part of this repo) |
| **Forms & Validation** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | Lucide React + Google Material Symbols |
| **Fonts** | Space Grotesk (sans) + Space Mono (mono) |
| **Deployment** | Netlify |

---

## Project Structure

```
Website/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, AuthProvider, metadata)
│   ├── page.tsx                  # Landing / home page
│   ├── globals.css               # Global Tailwind + CSS custom properties
│   ├── api/auth/[...nextauth]/   # NextAuth.js route handler
│   │   └── route.ts
│   ├── dashboard/page.tsx        # Authenticated dashboard (stats, logs)
│   ├── login/page.tsx            # Google sign-in page
│   ├── signup/page.tsx           # Google sign-up page
│   ├── verify/
│   │   ├── page.tsx              # Certificate verification page
│   │   └── [hash]/page.tsx       # Dynamic route — redirects to /verify?hash=…
│
├── components/                   # React components
│   ├── app-header.tsx            # Global navigation header
│   ├── auth-provider.tsx         # NextAuth SessionProvider wrapper
│   ├── dashboard-content.tsx     # Dashboard main content (stats cards, log table)
│   ├── dashboard-sidebar.tsx     # Dashboard sidebar navigation
│   ├── footer.tsx                # Landing page footer
│   ├── hero-section.tsx          # Landing page hero
│   ├── scanner-section.tsx       # QR code scanner CTA section
│   ├── verification-engine.tsx   # "How it works" feature section
│   └── ui/                       # shadcn/ui primitives (button, card, dialog, etc.)
│
├── lib/                          # Shared utilities & configuration
│   ├── api.ts                    # Backend REST API client (fetch helpers)
│   ├── auth.ts                   # NextAuth.js configuration (Google + backend token exchange)
│   ├── blockchain.ts             # Ethers.js blockchain read-only functions
│   ├── blockchain-config.ts      # Network config (RPC URL, contract address, chain ID)
│   ├── contract-abi.ts           # Solidity ABI for CertificateVerification contract
│   ├── types.ts                  # TypeScript interfaces (User, Certificate, Institution, etc.)
│   └── utils.ts                  # Tailwind cn() merge helper
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Responsive breakpoint hook
│   └── use-toast.ts              # Toast notification hook
│
├── public/                       # Static assets (favicon, icons)
├── styles/                       # Additional global styles
│
├── components.json               # shadcn/ui configuration
├── netlify.toml                  # Netlify build & deploy settings
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies & scripts
├── postcss.config.mjs            # PostCSS (Tailwind plugin)
└── tsconfig.json                 # TypeScript compiler options
```

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** (or yarn / pnpm)
- A **Google Cloud OAuth 2.0** client (Client ID + Client Secret) — [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
- The **.NET backend API** running (handles user auth, certificate storage, verification logs)
- An **Infura** (or other) Ethereum RPC endpoint for the **Sepolia** testnet

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ─── Google OAuth ───────────────────────────────────────────────
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# ─── NextAuth.js ────────────────────────────────────────────────
AUTH_SECRET=<random-secret-string>          # Used to encrypt JWTs & cookies
NEXTAUTH_URL=http://localhost:3000          # Canonical URL of this Next.js app

# ─── Backend API ────────────────────────────────────────────────
BACKEND_API_URL=https://localhost:7270      # Server-side only (used in auth callbacks)
NEXT_PUBLIC_BACKEND_API_URL=https://localhost:7270  # Client-side (browser fetch)

# ─── Blockchain / Ethereum ──────────────────────────────────────
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=Sepolia
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/<your-infura-project-id>
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<deployed-contract-address>
NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID=11155111
NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL=https://sepolia.etherscan.io

# ─── Misc ───────────────────────────────────────────────────────
NODE_TLS_REJECT_UNAUTHORIZED=0              # Only for local dev with self-signed certs
```

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Corresponding client secret |
| `AUTH_SECRET` | A random string used by NextAuth.js to sign/encrypt session tokens |
| `NEXTAUTH_URL` | The base URL where this app is hosted (e.g., `http://localhost:3000`) |
| `BACKEND_API_URL` | The .NET backend URL, accessible from the server only |
| `NEXT_PUBLIC_BACKEND_API_URL` | The .NET backend URL, accessible from the browser |
| `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL` | Ethereum JSON-RPC endpoint (e.g., Infura, Alchemy) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed `CertificateVerification` smart contract address |
| `NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID` | Chain ID (`11155111` for Sepolia) |
| `NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL` | Block explorer base URL for generating tx/address links |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the template above into a `.env.local` file and fill in your credentials.

### 4. Start the backend API

Make sure the .NET backend is running at the URL specified by `BACKEND_API_URL` (e.g., `https://localhost:7270`). The backend handles:

- Google sign-in token exchange (`POST /api/auth/google-signin`)
- Token refresh (`POST /api/auth/refresh`)
- User profile (`GET /api/auth/profile`)
- Certificate lookup (`GET /api/certificates/by-hash/:hash`)
- Institution lookup (`GET /api/institution/:id`)
- Verification logs CRUD (`GET/POST /api/verification-logs/…`)

### 5. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 6. Build for production

```bash
npm run build
npm start
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server with hot-reload |
| `npm run build` | Create an optimised production build |
| `npm start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## How It Works

### Authentication Flow

```
User clicks "Sign in with Google"
        │
        ▼
NextAuth.js redirects to Google consent screen
        │
        ▼
Google returns OAuth code → NextAuth exchanges for tokens
        │
        ▼
signIn callback fires:
  → POST /api/auth/google-signin to .NET backend
  → Backend creates/updates user, returns { accessToken, refreshToken, expiration }
  → Tokens are stored in the NextAuth JWT
        │
        ▼
jwt callback:
  → On every request, checks if accessToken has expired
  → If expired, calls POST /api/auth/refresh to get new tokens
  → Updated tokens are written back into the JWT
        │
        ▼
session callback:
  → Exposes accessToken, refreshToken, tokenExpiration to the client session
        │
        ▼
Client components use useSession() to get the session and make
authenticated API calls with the Bearer accessToken
```

**Key file:** `lib/auth.ts`

- Uses NextAuth.js v5 with the Google provider.
- The `signIn` callback exchanges the Google profile with the .NET backend to obtain backend-specific JWT tokens.
- The `jwt` callback automatically refreshes expired access tokens using the refresh token.
- The `session` callback exposes the backend tokens to client components via `useSession()`.

**Auth provider:** `components/auth-provider.tsx` wraps the entire app in NextAuth's `SessionProvider`.

**Route handler:** `app/api/auth/[...nextauth]/route.ts` exposes the NextAuth GET and POST handlers.

---

### Certificate Verification Flow

This is the core feature. It runs on the `/verify` page.

```
User enters certificate hash (64-char hex, with or without 0x prefix)
        │
        ▼
normalizeHash() validates and normalises to 0x-prefixed bytes32
        │
        ▼
Two parallel requests fire simultaneously:
        │
        ├──► getCertificateByHash(accessToken, hash)
        │      → Backend REST API: GET /api/certificates/by-hash/:hash
        │      → Returns full Certificate object (student, institution,
        │        blockchain tx hash, fraud score, QR code, etc.)
        │
        └──► getCertificateDetailsOnChain(hash)
               → ethers.js: contract.getCertificateDetails(hash)
               → Read-only call to Sepolia smart contract (no gas)
               → Returns: certHash, ipfsCID, issueDate, studentId,
                 institutionId, status (0=invalid, 1=valid, 2=revoked), exists
        │
        ▼
Results are merged:
  • If backend returns a Certificate → show full details (student name,
    programme, institution logo, graduation date, fraud confidence score)
  • If blockchain returns exists=true & status≠0 → confirmed on-chain
  • If both fail → certificate is NOT verified
        │
        ▼
Institution is resolved:
  • From embedded cert.institution (if backend provided it)
  • Or fetched separately via GET /api/institution/:id
        │
        ▼
A VerificationLog is created (POST /api/verification-logs) recording:
  • certificateHash, isSuccess, failureReason (if any)
        │
        ▼
UI displays:
  • ✅ Success: certificate details, institution info, blockchain proof
  • ❌ Failed: "Not found on blockchain or in records"
  • ⚠️ Error: specific error message
```

**QR Code shortcut:** Certificates carry a QR code that encodes a URL like `/verify/<hash>`. The dynamic route `app/verify/[hash]/page.tsx` catches this and redirects to `/verify?hash=<hash>`, which auto-fills and auto-verifies.

---

### Dashboard & Verification Logs

**Route:** `/dashboard` (protected — redirects to `/login` if unauthenticated)

On mount, the dashboard fetches two things in parallel:

1. **User profile** — `GET /api/auth/profile` → displays name, email, photo, role, and user ID.
2. **Verification logs** — `GET /api/verification-logs/mine` → the user's personal history of verification attempts.

**Stats computed client-side** (from `lib/types.ts → computeStats()`):

| Stat | Calculation |
|---|---|
| Total Scans | `logs.length` |
| Success Count | Logs where `isSuccess === true` |
| Failure Count | `total - successCount` |
| Success Rate | `(successCount / total) * 100` (rounded to 1 decimal) |

The dashboard renders:
- **Stat cards** — Total scans, success rate, verified count, failed count
- **Verification log table** — Each row shows: certificate hash (truncated), status badge (Verified/Failed), date/time, and failure reason (if any)
- **Sidebar navigation** — Links to Dashboard, Verify Certificate, and Profile Settings

---

### Blockchain Integration

**Smart contract:** `CertificateVerification` deployed on the Ethereum Sepolia testnet.

**Read-only interaction** — The frontend uses `ethers.js` v6 with a `JsonRpcProvider` (no wallet connection required). All on-chain calls are `view` functions and cost zero gas.

**Contract functions available (from ABI):**

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `verifyCertificate` | `bytes32 certHash` | `(bool isValid, bytes16 studentId, uint16 institutionId, uint64 issueDate, bytes32 ipfsCID)` | Quick validity check |
| `certificateExists` | `bytes32 certHash` | `bool` | Check if a hash is registered |
| `getCertificateDetails` | `bytes32 certHash` | `Certificate struct` | Full on-chain certificate record |
| `certificateCount` | — | `uint32` | Total certificates registered |
| `getStats` | — | `uint32 totalCerts` | Contract-level statistics |
| `getAllInstitutions` | — | `InstitutionView[]` | All registered institutions |
| `getInstitution` | `uint16 institutionId` | `(string name, bool active)` | Single institution lookup |

**Configuration** (`lib/blockchain-config.ts`):
- `rpcUrl` — Infura Sepolia endpoint
- `contractAddress` — Deployed contract address
- `chainId` — `11155111` (Sepolia)
- `explorerUrl` — Etherscan Sepolia for generating transaction and contract links

**Helper functions** (`lib/blockchain.ts`):
- `normalizeHash(input)` — Validates and 0x-prefixes a 64-char hex string
- `verifyCertificateOnChain(hash)` — Calls `verifyCertificate` and returns a typed result
- `getCertificateDetailsOnChain(hash)` — Calls `getCertificateDetails` and returns a typed result
- `certificateExists(hash)` — Boolean check
- `getCertificateCount()` — Returns total on-chain certificate count

---

### Backend API Integration

The backend is a .NET Web API (not included in this repo). The Next.js frontend communicates with it through `lib/api.ts`.

**API client pattern:**
- All requests go through an `apiFetch<T>()` helper that attaches the `Authorization: Bearer <accessToken>` header.
- Backend responses are wrapped in an envelope: `{ data, message, isSuccess, timeStamp }`. The helper automatically unwraps the envelope and throws on `isSuccess === false`.

**Endpoints used:**

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/google-signin` | Exchange Google profile for backend JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh an expired access token |
| `GET` | `/api/auth/profile` | Get authenticated user's profile |
| `GET` | `/api/verification-logs/mine` | Current user's verification logs |
| `GET` | `/api/verification-logs` | All logs (admin) |
| `GET` | `/api/verification-logs/by-hash/:hash` | Logs for a specific certificate hash |
| `GET` | `/api/verification-logs/by-certificate/:id` | Logs for a specific certificate ID |
| `POST` | `/api/verification-logs` | Create a new verification log entry |
| `GET` | `/api/certificates/by-hash/:hash` | Fetch certificate details by blockchain hash |
| `GET` | `/api/institution/:id` | Fetch institution details by ID |

---

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page — hero, verification engine explainer, QR scanner CTA, footer |
| `/login` | Public | Google OAuth sign-in page with branded UI |
| `/signup` | Public | Google OAuth sign-up page (separate branding) |
| `/dashboard` | Authenticated | User dashboard with stats cards and verification log history |
| `/verify` | Authenticated | Certificate verification page — hash input, blockchain + API lookup |
| `/verify/[hash]` | Authenticated | Dynamic route that redirects to `/verify?hash=<hash>` (for QR codes) |
| `/api/auth/[...nextauth]` | Internal | NextAuth.js API route handler (GET + POST) |

---

## Deployment

The project is configured for **Netlify** deployment via `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

### Deploy to Netlify

1. Connect your repository to Netlify.
2. Set all environment variables from the [Environment Variables](#environment-variables) section in the Netlify dashboard (Site settings → Environment variables).
3. Netlify will automatically run `npm run build` and deploy the `.next` output.

### Deploy elsewhere

The app is a standard Next.js project and can be deployed to any platform that supports Next.js:

- **Vercel** — `npx vercel`
- **Docker** — Use the official Next.js Dockerfile
- **Self-hosted** — `npm run build && npm start`

> **Note:** The `next.config.mjs` sets `images.unoptimized: true` and `typescript.ignoreBuildErrors: true`. If deploying to Vercel, you may want to re-enable image optimisation.

---

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| `next` | 16.1.6 | React framework with App Router |
| `react` / `react-dom` | 19.2.4 | UI rendering |
| `next-auth` | 5.0.0-beta.30 | Authentication (Google OAuth) |
| `ethers` | 6.16.0 | Ethereum blockchain interaction |
| `tailwindcss` | 4.2.0 | Utility-first CSS |
| `@radix-ui/*` | Various | Accessible UI primitives (via shadcn/ui) |
| `react-hook-form` | 7.54.1 | Form state management |
| `zod` | 3.24.1 | Schema validation |
| `recharts` | 2.15.0 | Dashboard charts |
| `lucide-react` | 0.564.0 | Icon library |
| `next-themes` | 0.4.6 | Dark/light theme switching |
| `sonner` | 1.7.1 | Toast notifications |
| `date-fns` | 4.1.0 | Date formatting utilities |

---

## License

This project was developed as a final-year academic project.
