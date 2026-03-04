# CertifyChain — Blockchain-Powered Academic Certificate Management

<p align="center">
  <strong>A decentralized certificate issuance, verification & management platform built with Angular 21, PrimeNG 21, Ethereum (Sepolia), and Web3.</strong>
</p>

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Getting Started](#getting-started)
7. [Environment Configuration](#environment-configuration)
8. [Project Structure](#project-structure)
9. [Authentication & Authorization](#authentication--authorization)
10. [Blockchain Integration](#blockchain-integration)
11. [Smart Contract Functions](#smart-contract-functions)
12. [Application Pages & Routes](#application-pages--routes)
13. [Certificate Lifecycle](#certificate-lifecycle)
14. [API Integration](#api-integration)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)
17. [License](#license)

---

## Overview

**CertifyChain** is a full-stack web application that allows academic institutions to issue, manage, verify, and revoke academic certificates with immutable blockchain records on the Ethereum Sepolia testnet. Certificates are hashed and stored on-chain, while metadata and documents are persisted on a backend API with optional IPFS storage. The platform supports role-based access control (RBAC) with six distinct user roles and granular permissions.

---

## Key Features

| Category | Feature |
|---|---|
| **Certificate Management** | Issue, view, search, filter, paginate, download (PDF + QR), and revoke certificates |
| **Blockchain** | Issue & revoke certificates on-chain via MetaMask; real-time sync of blockchain status |
| **Verification** | Public (no-login) certificate verification against the smart contract |
| **Institution Management** | Authorize / deauthorize institutions, update wallet addresses, transfer admin rights |
| **RBAC** | Six roles (Super Admin → Auditor) with 25+ granular permissions |
| **Draft System** | Client-side draft persistence (localStorage) with retry logic for failed backend saves |
| **Dashboard** | Status counts, charts, and analytics |
| **User Management** | CRUD operations on users with role assignment and filtering |
| **Settings** | Institution profile, blockchain config, signature management, templates |
| **QR Codes** | Generate downloadable QR codes linking to certificate verification |
| **Dark Mode** | Built-in dark mode toggle via PrimeNG Aura theme |
| **SSR Ready** | Angular SSR / server-side rendering support |
| **Vercel Deploy** | Pre-configured for Vercel static hosting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Angular 21)                │
│  PrimeNG 21 · Tailwind CSS 4 · Web3.js · Chart.js          │
│                                                             │
│  ┌────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Auth  │  │ Certificates│  │  Dashboard │  │ Settings │  │
│  └───┬────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  │
│      │             │               │               │        │
│      └─────────────┴───────┬───────┴───────────────┘        │
│                            │                                │
│              ┌─────────────▼──────────────┐                 │
│              │   Core Services Layer      │                 │
│              │  Auth · Blockchain · IPFS  │                 │
│              │  Certificate · User · etc. │                 │
│              └──────┬──────────┬──────────┘                 │
└─────────────────────┼──────────┼────────────────────────────┘
                      │          │
         ┌────────────▼──┐  ┌───▼───────────────────┐
         │  Backend API  │  │  Ethereum Sepolia      │
         │  (ASP.NET)    │  │  Smart Contract        │
         │  REST / JWT   │  │  CertificateVerify.sol │
         └───────────────┘  └────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Angular | 21.1.1 |
| UI Library | PrimeNG | 21.0.4 |
| CSS | Tailwind CSS + tailwindcss-primeui | 4.1.18 |
| Blockchain | Web3.js | 4.16.0 |
| Charts | Chart.js | 4.5.1 |
| PDF | pdf-lib | 1.17.1 |
| QR Scanning | jsqr | 1.4.0 |
| Testing | Vitest | 4.0.8 |
| Language | TypeScript | 5.9.2 |
| Package Manager | npm | 10.9.3 |
| SSR | @angular/ssr + Express 5 | — |
| Linting | ESLint (flat config) | — |

---

## Prerequisites

Before running the project locally, ensure you have:

| Requirement | Minimum Version | Purpose |
|---|---|---|
| **Node.js** | 20.x or later | Runtime |
| **npm** | 10.x | Package management |
| **Angular CLI** | 21.x | `npm install -g @angular/cli` |
| **MetaMask** | Latest | Browser extension for blockchain operations |
| **Sepolia ETH** | > 0.01 ETH | Gas fees for blockchain transactions |
| **Backend API** | Running | .NET backend at configured `apiUrl` |

### Getting Sepolia Test ETH

- <https://sepoliafaucet.com/>
- <https://www.alchemy.com/faucets/ethereum-sepolia>

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Web App"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Edit the environment files to match your setup (see [Environment Configuration](#environment-configuration)):

- `src/environments/environment.ts` — development
- `src/environments/environment.prod.ts` — production

### 4. Start the Development Server

```bash
ng serve
```

The app will be available at **http://localhost:4200**. It auto-reloads on file changes.

### 5. Build for Production

```bash
ng build
```

Build output goes to `dist/certify-chain-web-app/`.

### 6. Run with SSR (Optional)

```bash
npm run serve:ssr:certify-chain-web-app
```

---

## Environment Configuration

Both `src/environments/environment.ts` (dev) and `src/environments/environment.prod.ts` (prod) share the same shape:

```typescript
export const environment = {
  production: false,                              // true for prod
  apiUrl: 'https://localhost:7270/api',           // Backend API base URL

  tokenKey: 'access_token',                       // localStorage key for JWT
  refreshTokenKey: 'refresh_token',               // localStorage key for refresh token
  userKey: 'current_user',                        // localStorage key for user object

  blockchain: {
    network: 'Sepolia',                           // Ethereum network name
    rpcUrl: 'https://sepolia.infura.io/v3/<KEY>', // Infura / Alchemy RPC endpoint
    contractAddress: '0x29baF19FF...501E',        // Deployed smart contract address
    chainId: 11155111,                            // Sepolia chain ID
    explorerUrl: 'https://sepolia.etherscan.io'   // Block explorer base URL
  }
};
```

### Key Configuration Values

| Variable | Description |
|---|---|
| `apiUrl` | Base URL for the .NET backend REST API. Development uses `https://localhost:7270/api`; production uses the deployed backend URL. |
| `blockchain.rpcUrl` | JSON-RPC endpoint for reading blockchain data (Infura/Alchemy). Replace the project ID with your own for production. |
| `blockchain.contractAddress` | Address of the deployed `CertificateVerification` smart contract on Sepolia. |
| `blockchain.chainId` | Must be `11155111` for Sepolia testnet. |

---

## Project Structure

```
src/
├── main.ts                          # Application bootstrap
├── app.config.ts                    # Providers: router, HTTP, PrimeNG theme, interceptors
├── app.routes.ts                    # Top-level route definitions
├── app.component.ts                 # Root component
├── index.html                       # HTML entry point
│
├── app/
│   ├── core/                        # Singleton services, guards, interceptors, models
│   │   ├── guards/
│   │   │   ├── auth.guard.ts        # Checks JWT / refresh token validity
│   │   │   ├── permission.guard.ts  # Checks granular permissions
│   │   │   └── role.guard.ts        # Checks user role
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts  # Attaches Bearer token to requests
│   │   │   ├── error.interceptor.ts # Global HTTP error handler
│   │   │   ├── handle401error.ts    # Auto-refresh on 401
│   │   │   └── loading.interceptor.ts
│   │   ├── models/
│   │   │   ├── api-response.model.ts      # Enums: CertificateStatus, QualificationType, AwardClass
│   │   │   ├── blockchain.model.ts        # Wallet, Gas, Config interfaces
│   │   │   ├── certificate.model.ts       # Frontend Certificate interface
│   │   │   ├── contract-abi.model.ts      # Smart contract ABI definition
│   │   │   ├── user.model.ts              # User, UserRole, Permission enums
│   │   │   └── ...
│   │   └── services/
│   │       ├── auth.service.ts            # Login, register, JWT, refresh, permissions
│   │       ├── blockchain.service.ts      # MetaMask, Web3, smart contract interaction
│   │       ├── certificate-draft.service.ts # localStorage draft persistence
│   │       ├── dashboard.service.ts
│   │       ├── ipfs.service.ts
│   │       ├── notification.service.ts
│   │       ├── theme.service.ts           # Dark mode toggle
│   │       └── ...
│   │
│   ├── features/                    # Lazy-loaded feature modules
│   │   ├── auth/                    # Login, register, forgot/reset password, error pages
│   │   ├── certificates/           # Certificate CRUD, issue, revoke, verify, history
│   │   │   ├── certificate-issue/         # 4-step wizard (student → details → upload → blockchain)
│   │   │   ├── certificate-list/          # Searchable, paginated certificate table
│   │   │   ├── certificate-revocation/    # Revoke certificate on-chain
│   │   │   ├── certificate-verification/  # Verify certificate against blockchain
│   │   │   ├── verification-history/      # Audit log of past verifications
│   │   │   └── services/                  # CertificateService, CertificatePdfService
│   │   ├── dashboard/              # Dashboard with analytics cards & charts
│   │   ├── settings/               # Institution, blockchain, signature settings
│   │   ├── users/                  # User management (CRUD, role assignment)
│   │   └── admin/                  # Admin-only pages (institution management)
│   │
│   ├── layout/                     # App shell: sidebar, topbar, footer
│   │   ├── component/
│   │   └── service/
│   │
│   └── pages/                      # Static / public pages
│       ├── landing/                # Public landing page
│       ├── documentation/
│       └── empty/
│
├── assets/
│   ├── styles.scss                 # Global SCSS entry
│   ├── tailwind.css                # Tailwind directives
│   └── layout/                     # Layout-specific SCSS partials
│
└── environments/
    ├── environment.ts              # Development config
    └── environment.prod.ts         # Production config
```

---

## Authentication & Authorization

### Authentication Flow

1. User navigates to any protected route.
2. `authGuard` checks `isAuthenticated$` (BehaviorSubject backed by JWT in localStorage).
3. If token is expired, the guard attempts a silent refresh via the refresh token.
4. If refresh fails, the user is redirected to `/auth/login` with a `returnUrl` query parameter.
5. On successful login, the backend returns `access_token` + `refresh_token`; both are stored in `localStorage`.
6. `auth.interceptor.ts` attaches `Authorization: Bearer <token>` to every outgoing HTTP request.
7. `error.interceptor.ts` catches HTTP errors globally and shows toast notifications.

### Role-Based Access Control

The system defines **six roles** with a hierarchical permission model:

| Role | Code | Typical Permissions |
|---|---|---|
| **Super Admin** | `0` | Full system access |
| **Institution Admin** | `1` | Manage institution settings, users, certificates |
| **Registrar** | `2` | Issue, view, revoke certificates |
| **Faculty Admin** | `3` | View certificates within faculty |
| **Verification Officer** | `4` | Verify certificates, view history |
| **Auditor** | `5` | Read-only audit & report access |

### Permissions

25+ granular permissions are defined in the `Permission` enum:

```
certificate:create · certificate:view · certificate:update · certificate:revoke · certificate:batch-upload
user:create · user:view · user:update · user:delete
verify:certificate · verify:history · verify:fraud-detection
settings:institution · settings:blockchain · settings:signatures · settings:templates
reports:view · reports:export · audit:view · audit:export
student:view · student:manage · student:bulk-upload
program:view · program:manage · faculty:view · faculty:manage
dashboard:view
```

Routes are protected by combining `authGuard` (authentication) + `permissionGuard` (authorization):

```typescript
{
  path: 'create',
  component: IssueCertificateComponent,
  canActivate: [permissionGuard],
  data: { permissions: [Permission.CERTIFICATE_CREATE] }
}
```

---

## Blockchain Integration

### Overview

CertifyChain uses a **CertificateVerification** Solidity smart contract deployed on the **Ethereum Sepolia testnet**. All blockchain interactions are performed client-side through **MetaMask** + **Web3.js**.

| Property | Value |
|---|---|
| Network | Sepolia Testnet |
| Chain ID | `11155111` |
| Contract Address | `0x29baF19FF34fcf90a8980AD34C3389E8BE3A501E` |
| Explorer | <https://sepolia.etherscan.io> |
| RPC Provider | Infura |

### How MetaMask Is Used

1. **Connect Wallet** — The app calls `window.ethereum.request({ method: 'eth_requestAccounts' })`.
2. **Network Validation** — Verifies MetaMask is on Sepolia (chain ID `11155111`).
3. **Transaction Signing** — All write operations (issue, revoke, authorize) are signed by MetaMask.
4. **Gas Estimation** — The app estimates gas before submission so users see the cost.

### BlockchainService Key Methods

| Method | Description |
|---|---|
| `connectWallet()` | Connects MetaMask and returns `WalletConnection` |
| `issueCertificateToBlockchain(...)` | Issues a certificate on-chain |
| `estimateIssuanceGas(...)` | Estimates gas for issuance |
| `generateCertificateHash(data)` | Creates `keccak256` hash |
| `getCertificateDetails(certHash)` | Reads certificate from blockchain |
| `verifyCertificate(certHash)` | Checks existence + validity |
| `revokeCertificate(certHash)` | Revokes certificate on-chain |
| `stringToBytes32(str)` | Converts string to `bytes32` |

---

## Smart Contract Functions

### Admin Operations (Institution Management)

| Function | Access | Description |
|---|---|---|
| `authorizeInstitution(id, address, name)` | Admin only | Register a new institution |
| `deauthorizeInstitution(id)` | Admin only | Deactivate an institution |
| `reauthorizeInstitution(id)` | Admin only | Reactivate an institution |
| `updateInstitutionAddress(id, oldAddr, newAddr)` | Admin only | Rotate institution wallet |
| `transferAdmin(newAddress)` | Admin only | Transfer admin role (**irreversible**) |
| `getInstitutions()` | Public | List all institution IDs |
| `getInstitution(id)` | Public | Get institution details |

### Certificate Operations

| Function | Access | Description |
|---|---|---|
| `issueCertificate(certHash, ipfsCID, studentId, issueDate)` | Authorized institutions | Issue certificate on-chain |
| `revokeCertificate(certHash)` | Issuing institution | Revoke certificate (**irreversible**) |

### Verification Operations

| Function | Access | Description |
|---|---|---|
| `verifyCertificate(certHash)` | Public | Check if certificate is valid |
| `getCertificateDetails(certHash)` | Public | Get full on-chain certificate data |
| `certificateExists(certHash)` | Public | Check existence |

### On-Chain Certificate Status Codes

| Code | Status | Meaning |
|---|---|---|
| `0` | Invalid | Certificate does not exist or was never issued |
| `1` | Valid | Active, verified certificate |
| `2` | Revoked | Certificate has been revoked |

---

## Application Pages & Routes

### Protected Routes (Require Authentication)

| Route | Component | Permission | Description |
|---|---|---|---|
| `/` | Dashboard | `dashboard:view` | Analytics & status overview |
| `/certificates` | CertificateList | `certificate:view` | Browse, search, filter all certificates |
| `/certificates/create` | IssueCertificate | `certificate:create` | 4-step certificate issuance wizard |
| `/certificates/revoke` | CertificateRevocation | `certificate:revoke` | Revoke a certificate on blockchain |
| `/certificates/verify` | CertificateVerification | `verify:certificate` | Verify certificate against blockchain |
| `/certificates/verification-history` | VerificationHistory | `verify:history` | Audit log of verifications |
| `/settings/*` | Settings modules | `settings:*` | Institution, blockchain, signature config |
| `/users/*` | User management | `user:*` | CRUD users with role assignment |

### Public Routes (No Authentication)

| Route | Component | Description |
|---|---|---|
| `/auth/login` | Login | User login with email + password |
| `/auth/forgot-password` | ForgotPassword | Request password reset email |
| `/auth/reset-password` | ResetPassword | Set new password via token |
| `/landing` | Landing | Public marketing / info page |
| `/notfound` | Error | 404 page |
| `/unauthorized` | Access | 403 page |

---

## Certificate Lifecycle

```
    ┌──────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────────────┐
    │  DRAFT   │───▶│   PENDING    │───▶│  VERIFIED  │───▶│  ON BLOCKCHAIN   │
    │(client)  │    │ VERIFICATION │    │  (Active)  │    │  (Issued on-chain)│
    └──────────┘    └──────────────┘    └─────┬──────┘    └────────┬─────────┘
                                              │                    │
                                              │    ┌───────────┐   │
                                              └───▶│  REVOKED  │◀──┘
                                                   └───────────┘
```

### Issuance Flow (4-Step Wizard)

1. **Step 1 — Student Information**: Enter student ID, full name, date of birth, email, phone.
2. **Step 2 — Certificate Details**: Select qualification type, award class, program, graduation date.
3. **Step 3 — Document Upload**: Upload certificate PDF. The system computes a SHA-256 file hash for integrity verification.
4. **Step 4 — Blockchain Registration**:
   - Connect MetaMask wallet.
   - Review estimated gas fee.
   - Submit to the smart contract (`issueCertificate`).
   - On blockchain success, send certificate data + transaction hash to the backend API.
   - If the backend save fails, the certificate is saved as a **Draft** in `localStorage` for retry.

### Verification Flow

1. Navigate to the verification page (public or in-app).
2. Enter the 66-character `0x`-prefixed certificate hash.
3. The app calls `getCertificateDetails(certHash)` on the smart contract.
4. Results display: student ID, institution ID, issue date, IPFS CID, and status (Valid / Revoked / Invalid).

### Revocation Flow

1. Navigate to `/certificates/revoke`.
2. Connect the **issuing institution's** wallet.
3. Enter the certificate hash and optionally check its current status.
4. Confirm the revocation (irreversible warning shown).
5. Transaction is submitted to blockchain; status updates immediately.

### Blockchain Sync

From the certificate list, users can sync individual certificate statuses from the blockchain. This reads the on-chain status and updates the UI if there's a mismatch (e.g., revoked on-chain but still showing Active locally).

---

## API Integration

The frontend communicates with a .NET backend API via REST. All requests include an `Authorization: Bearer <JWT>` header (added by `auth.interceptor.ts`).

### Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user, returns JWT + refresh token |
| `POST` | `/api/auth/refresh-token` | Refresh expired access token |
| `GET` | `/api/certificates` | Paginated certificate list with filters |
| `POST` | `/api/certificates/issue` | Issue certificate (FormData: student info + blockchain data) |
| `POST` | `/api/certificates/revoke` | Revoke certificate |
| `GET` | `/api/certificates/{id}/qr-code` | Generate QR code image |
| `GET` | `/api/certificates/{id}/pdf` | Download certificate PDF with QR overlay |
| `GET` | `/api/auth/users` | List users (paginated, filterable) |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/blockchain/config` | Blockchain configuration |

### Backend Request Format for Certificate Issuance

The issuance endpoint receives `FormData`:

```
studentId, fullName, dateOfBirth, email, phoneNumber
programName, specialization, qualificationType, awardClass
graduationDate, certificateNumber
documentFile (File), fileHash
transactionHash, certHash, ipfsCID, walletAddress
gasUsed, blockNumber
```

### Response Format

All API responses follow a standard `ServiceResponse<T>` wrapper:

```json
{
  "isSuccess": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Paginated endpoints return:

```json
{
  "items": [ ... ],
  "totalCount": 150,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 15,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

---

## Deployment

### Vercel (Static / SPA)

The project includes a `vercel.json` for single-page app hosting:

```json
{
  "rewrites": [{ "source": "/:path*", "destination": "/index.html" }],
  "trailingSlash": false
}
```

Deploy steps:

1. Build for production: `ng build --configuration production`
2. Deploy the `dist/certify-chain-web-app/browser/` folder to Vercel.

### Manual / Other Hosts

1. Run `ng build --configuration production`.
2. Serve the contents of `dist/certify-chain-web-app/browser/` from any static file server.
3. Ensure all routes fall back to `index.html` (SPA routing).

### SSR Deployment

1. Build: `ng build`
2. Run: `node dist/certify-chain-web-app/server/server.mjs`
3. The Express server handles both SSR and API proxying.

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---|---|
| **MetaMask not detected** | Install the MetaMask browser extension and refresh the page. |
| **"Execution reverted" on issuance** | Your wallet is not authorized on the smart contract. Ask the admin to call `authorizeInstitution()`. |
| **Wrong network in MetaMask** | Switch to Sepolia testnet (Chain ID: `11155111`). |
| **Insufficient funds for gas** | Get free Sepolia ETH from a faucet (see [Prerequisites](#prerequisites)). |
| **Backend API unreachable** | Ensure the .NET backend is running and `apiUrl` in the environment file is correct. |
| **401 Unauthorized** | Your JWT has expired and auto-refresh failed. Log in again. |
| **Certificate not found on blockchain** | The issuance transaction may have failed. Check the transaction hash on [Sepolia Etherscan](https://sepolia.etherscan.io). |
| **Gas estimation fails** | Check that the RPC URL is accessible and your internet connection is stable. |
| **Draft appearing in certificate list** | The backend save failed after blockchain success. Use "Retry Submit" from the actions menu. |

### Debug Tips

- Open the **browser console** (F12) for detailed error logs.
- Check `localStorage` for `certificate_drafts` to inspect pending drafts.
- Verify transactions on [Sepolia Etherscan](https://sepolia.etherscan.io).
- Ensure MetaMask shows the correct connected account and network.

---

## Development Commands

| Command | Description |
|---|---|
| `ng serve` | Start dev server at `http://localhost:4200` |
| `ng build` | Production build |
| `ng build --watch` | Build in watch mode |
| `ng test` | Run unit tests (Vitest) |
| `ng generate component <name>` | Scaffold a new component |
| `ng generate service <name>` | Scaffold a new service |
| `npm run serve:ssr:certify-chain-web-app` | Run SSR server |

---

## License

This project is part of the **CertifyChain** academic certificate management system — developed as a Final Year Project.
