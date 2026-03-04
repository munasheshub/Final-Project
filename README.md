<p align="center">
  <img src="https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet" alt=".NET 10" />
  <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular" alt="Angular 21" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Flutter-3.9-02569B?logo=flutter" alt="Flutter" />
  <img src="https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum" alt="Ethereum Sepolia" />
  <img src="https://img.shields.io/badge/IPFS-Pinata-65C2CB?logo=ipfs" alt="IPFS" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License" />
</p>

# CertifyChain — Blockchain & AI-Powered Academic Certificate Verification Platform

> A full-stack, multi-platform system that combats academic certificate fraud by anchoring certificate hashes on the Ethereum blockchain, storing documents on IPFS, and leveraging AI-powered fraud detection — enabling anyone to verify a certificate's authenticity in seconds.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [System Architecture](#system-architecture)
4. [Platform Components](#platform-components)
   - [Backend API — CertifyChain.Api (.NET 10)](#1-backend-api--certifychainapi-net-10)
   - [Admin Web App — Angular 21](#2-admin-web-app--angular-21)
   - [Public Website — Next.js 16](#3-public-website--nextjs-16)
   - [Mobile App — Flutter](#4-mobile-app--flutter)
   - [Smart Contract — Solidity](#5-smart-contract--solidity)
5. [How It Works End-to-End](#how-it-works-end-to-end)
   - [Certificate Issuance](#certificate-issuance)
   - [Certificate Verification](#certificate-verification)
   - [Certificate Revocation](#certificate-revocation)
6. [Blockchain Integration Deep Dive](#blockchain-integration-deep-dive)
7. [IPFS Decentralised Storage](#ipfs-decentralised-storage)
8. [AI Fraud Detection](#ai-fraud-detection)
9. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
10. [Multi-Tenancy](#multi-tenancy)
11. [Tech Stack Summary](#tech-stack-summary)
12. [Repository Structure](#repository-structure)
13. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend API Setup](#backend-api-setup)
    - [Admin Web App Setup](#admin-web-app-setup)
    - [Public Website Setup](#public-website-setup)
    - [Mobile App Setup](#mobile-app-setup)
14. [Deployment](#deployment)
15. [CI/CD Pipeline](#cicd-pipeline)
16. [Smart Contract Reference](#smart-contract-reference)
17. [API Endpoint Reference](#api-endpoint-reference)
18. [Contributing](#contributing)
19. [License](#license)

---

## The Problem

Academic certificate fraud is a pervasive global issue that undermines trust in educational credentials:

- **Forged certificates** are easily created with modern design tools, making manual verification unreliable.
- **Verification is slow and manual** — employers and institutions must contact the issuing university directly, a process that can take days or weeks and often produces no response.
- **No single source of truth** — certificate records are stored in isolated, centralised databases controlled by individual institutions, making them vulnerable to tampering, data loss, and insider manipulation.
- **Cross-border verification is nearly impossible** — international employers have no practical way to validate foreign academic credentials.
- **Deepfake and AI-generated documents** are an emerging threat that traditional visual inspection cannot detect.

The consequences are severe: unqualified professionals in critical fields (healthcare, engineering, law), eroded trust in higher education, financial losses for employers, and devaluation of legitimate graduates' credentials.

---

## The Solution

**CertifyChain** is an end-to-end platform that solves certificate fraud through a **three-layer verification model**:

### Layer 1: Blockchain Immutability
Every certificate is hashed (SHA-256 / keccak256) and anchored on the **Ethereum Sepolia testnet** via a purpose-built Solidity smart contract. Once written on-chain, the record is **immutable** — it cannot be altered, deleted, or forged. Anyone with the certificate hash can independently verify its existence and status (valid, revoked, or non-existent) without trusting any single party.

### Layer 2: Decentralised Document Storage (IPFS)
The full certificate PDF is uploaded to the **InterPlanetary File System (IPFS)** via Pinata, returning a content-addressed identifier (CID). Because IPFS uses content-based addressing, any modification to the document produces a different CID, making tampering immediately detectable. The CID is stored both on-chain and in the backend database.

### Layer 3: AI-Powered Fraud Detection
A machine learning service analyses certificate images to detect visual tampering, deepfake artefacts, and common forgery patterns. This adds a defence layer against sophisticated fraud that target the document visually rather than the data.

### The Result
- **Instant verification** — any employer, government body, or institution can verify a certificate in under 5 seconds by entering its hash.
- **Trustless** — verification does not require contacting or trusting the issuing institution.
- **Tamper-proof** — blockchain + IPFS make both the record and the document immutable.
- **AI-secured** — visual fraud is caught by neural network analysis.
- **Multi-platform** — accessible via admin web app, public website, and mobile app with QR code scanning.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT APPLICATIONS                                 │
│                                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────────────┐  │
│  │ Mobile App   │    │  Public Website  │    │        Admin Web App           │  │
│  │ (Flutter)    │    │  (Next.js 16)    │    │        (Angular 21)            │  │
│  │              │    │                  │    │                                │  │
│  │ • QR Scan    │    │ • Google OAuth   │    │ • Certificate CRUD             │  │
│  │ • Verify     │    │ • Verify hash    │    │ • Issue to blockchain          │  │
│  │ • History    │    │ • Dashboard      │    │ • Revoke on-chain              │  │
│  │ • Auth       │    │ • Verification   │    │ • User & role management       │  │
│  │              │    │   logs           │    │ • Institution management       │  │
│  │              │    │                  │    │ • Dashboard analytics          │  │
│  │              │    │                  │    │ • Settings & blockchain config │  │
│  └──────┬───────┘    └────────┬─────────┘    └──────────────┬─────────────────┘  │
│         │                     │                              │                    │
└─────────┼─────────────────────┼──────────────────────────────┼────────────────────┘
          │                     │                              │
          │    HTTPS / JWT      │    HTTPS / JWT               │    HTTPS / JWT
          │                     │                              │
┌─────────▼─────────────────────▼──────────────────────────────▼────────────────────┐
│                           BACKEND API (.NET 10)                                   │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  CertifyChain.Api — Controllers, JWT Middleware, Permission Attributes,    │  │
│  │                      SignalR Hubs, Swagger/OpenAPI, CORS                    │  │
│  ├─────────────────────────────────────────────────────────────────────────────┤  │
│  │  CertifyChain.Core — Domain Entities, Services, DTOs, CQRS (MediatR),     │  │
│  │                       AutoMapper, Enums, Interfaces, AI Service, IPFS      │  │
│  ├─────────────────────────────────────────────────────────────────────────────┤  │
│  │  CertifyChain.Data — EF Core DbContext, Repositories, Migrations,         │  │
│  │                       Multi-Tenant Query Filters, Entity Configurations    │  │
│  └──────┬────────────────────────┬───────────────────────────┬────────────────┘  │
│         │                        │                           │                    │
└─────────┼────────────────────────┼───────────────────────────┼────────────────────┘
          │                        │                           │
    ┌─────▼──────┐     ┌──────────▼───────────┐     ┌─────────▼───────┐
    │ SQL Server │     │ Ethereum Sepolia      │     │  Pinata (IPFS)  │
    │ (EF Core)  │     │ Smart Contract        │     │  Document       │
    │            │     │ CertificateVerify.sol │     │  Storage        │
    │ • Users    │     │                       │     │                 │
    │ • Certs    │     │ • Issue on-chain      │     │ • Pin PDFs      │
    │ • Students │     │ • Verify (free)       │     │ • Retrieve CID  │
    │ • Tenants  │     │ • Revoke              │     │ • Gateway access│
    │ • Logs     │     │ • Institution mgmt    │     │                 │
    └────────────┘     └───────────────────────┘     └─────────────────┘
```

---

## Platform Components

### 1. Backend API — CertifyChain.Api (.NET 10)

The central nervous system of the platform. A RESTful API built with **ASP.NET Core 10** and **C# 14** following **Clean Architecture** principles.

| Concern | Implementation |
|---|---|
| **Architecture** | Clean Architecture — Api (HTTP), Core (Domain + Application), Data (Infrastructure) |
| **ORM** | Entity Framework Core 10 with SQL Server |
| **Authentication** | JWT Bearer tokens with automatic refresh |
| **Authorisation** | Custom `[RequirePermission]` attribute with flags-based RBAC (30+ permissions, 6 roles) |
| **CQRS** | MediatR for command/query separation |
| **Mapping** | AutoMapper for DTO ↔ Entity mapping |
| **Blockchain** | Nethereum library for on-chain interactions via Infura RPC |
| **IPFS** | Pinata Cloud API for certificate PDF pinning and retrieval |
| **Real-time** | ASP.NET Core SignalR for push notifications |
| **AI** | External ML service integration for fraud detection |
| **Email** | SMTP (Gmail) for password resets and notifications |
| **API Docs** | Swagger / OpenAPI auto-generated documentation |
| **Multi-tenancy** | Tenant-scoped data partitioning via EF Core global query filters |

**Key API areas:**
- `/api/auth` — Login, registration, JWT refresh, user CRUD, Google sign-in token exchange
- `/api/certificates` — Full certificate lifecycle (create, read, update, revoke, search by hash/number/student)
- `/api/students` — Student management with bulk upload
- `/api/program`, `/api/faculties` — Academic structure management
- `/api/institution` — Multi-tenant institution management
- `/api/verification-logs` — Verification audit trail (public endpoints for anonymous verification)
- `/api/dashboard` — Analytics: metrics, activity charts, verification sources, top programmes
- `/api/ipfs` — Upload documents to IPFS, download by CID
- `/api/blockchain/config` — Blockchain configuration endpoint

> **See**: [CertifyChain/README.md](CertifyChain/README.md) for the complete API reference.

---

### 2. Admin Web App — Angular 21

A full-featured **single-page application** for institutional administrators, registrars, and verification officers to manage the entire certificate lifecycle.

| Feature | Description |
|---|---|
| **Certificate Management** | Issue (4-step wizard), view, search, filter, paginate, download PDF + QR, revoke, batch upload |
| **Blockchain Issuance** | Connect MetaMask wallet, estimate gas, submit to smart contract, record tx hash |
| **Blockchain Revocation** | Revoke certificates on-chain with irreversibility warnings |
| **Verification** | Verify any certificate against the blockchain — accessible without login |
| **Dashboard** | Real-time analytics: status counts, issuance charts, verification sources, top programmes |
| **User Management** | CRUD operations with role assignment across 6 roles |
| **Institution Settings** | Profile, blockchain configuration, signature management, certificate templates |
| **Draft System** | Client-side draft persistence (localStorage) with retry logic for failed API saves |
| **RBAC UI** | Menu items, buttons, and routes dynamically shown/hidden based on user permissions |
| **Dark Mode** | Built-in theme toggle via PrimeNG Aura theme |
| **SSR** | Server-side rendering support via Angular SSR + Express |

**Tech:** Angular 21 · PrimeNG 21 · Tailwind CSS 4 · Web3.js 4 · Chart.js · TypeScript 5.9 · Vitest

**Deployment:** Vercel (static SPA) — [certifyonchain.netlify.app](https://certifyonchain.netlify.app)

> **See**: [Web App/README.md](Web%20App/README.md) for the full feature breakdown and route table.

---

### 3. Public Website — Next.js 16

A consumer-facing website that allows **anyone** to verify a certificate — designed for employers, government agencies, and other institutions who receive academic credentials.

| Feature | Description |
|---|---|
| **Google OAuth** | Sign in with Google via NextAuth.js v5 (beta) — tokens exchanged with the backend |
| **Certificate Verification** | Enter a 64-char hex hash → simultaneous blockchain + backend lookup → instant result |
| **QR Code Scanning** | Certificates carry a QR code URL (`/verify/<hash>`) that auto-verifies when scanned |
| **Verification Dashboard** | Personal history of all verification attempts with stats (total, success rate, failures) |
| **Dual Verification** | Blockchain smart contract (read-only, zero gas) + backend API queried in parallel |
| **Landing Page** | Professional hero section, "How it works" explainer, QR scanner CTA |

**Verification flow:**
1. User enters certificate hash (or scans QR code)
2. Two parallel requests fire: `getCertificateDetails()` on-chain + `GET /api/certificates/by-hash/:hash` on the API
3. Results merge: blockchain confirms immutability; API provides rich metadata (student name, programme, institution, fraud score)
4. Verification log is recorded for audit trail
5. UI shows verified result with full details or a clear failure reason

**Tech:** Next.js 16 · React 19 · NextAuth.js v5 · ethers.js v6 · Tailwind CSS 4 · shadcn/ui · Radix UI · Recharts

**Deployment:** Netlify

> **See**: [Website/README.md](Website/README.md) for environment variables and detailed authentication flow.

---

### 4. Mobile App — Flutter

A cross-platform mobile application (iOS & Android) that puts certificate verification in the user's pocket with **QR code scanning**.

| Feature | Description |
|---|---|
| **QR Code Scanner** | Scan certificate QR codes with the device camera for instant verification |
| **Certificate Upload** | Upload a certificate image for verification |
| **Google Sign-In** | Firebase Authentication with Google OAuth |
| **Dashboard** | Personal statistics — total verified, fraudulent, pending, monthly activity |
| **Verification History** | Full log of past verifications with status badges |
| **Profile** | User profile management |
| **Dark Mode** | System-aware theme with custom light and dark themes |

**Certificate model attributes:** ID, certificate name, issuer, recipient, issue date, blockchain hash, verification status (Verified / Fraudulent / Pending / Not Found), confidence score, and optional image URL.

**Tech:** Flutter (Dart 3.9) · Firebase Auth · Google Sign-In · QR Code Scanner · HTTP · flutter_dotenv

**Platforms:** Android, iOS, Web, Windows, macOS, Linux

> **See**: [Mobile App/certificate_verifier/](Mobile%20App/certificate_verifier/) for the source code.

---

### 5. Smart Contract — Solidity

A purpose-built **CertificateVerification** smart contract deployed on the **Ethereum Sepolia testnet**. It serves as the immutable, trustless layer of the platform.

**Contract address:** `0x29baF19FF34fcf90a8980AD34C3389E8BE3A501E`

**Design principles:**
- **Gas-efficient** — Student IDs stored as `bytes16` (fixed-size) instead of `string`; unchecked increments; calldata arrays
- **Role-based** — Admin manages institutions; authorised institution wallets issue and revoke their own certificates; anyone can verify (zero gas)
- **Uniqueness** — Composite key (`studentId + institutionId`) prevents duplicate certification per institution
- **Batch support** — Up to 50 certificates in a single transaction

**Three roles:**

| Role | Who | Capabilities |
|---|---|---|
| **Admin** | Contract deployer (transferable) | Authorise/deauthorise/reauthorise institutions, rotate wallet addresses, transfer admin role |
| **Institution** | Authorised wallet | Issue certificates (single + batch), revoke own certificates |
| **Public** | Anyone | Verify certificates, check existence, read institution details, get stats — all at zero gas cost |

**On-chain certificate record:**

| Field | Type | Description |
|---|---|---|
| `certHash` | `bytes32` | keccak256 hash of the certificate document |
| `ipfsCID` | `bytes32` | IPFS content identifier of the full PDF |
| `issueDate` | `uint64` | Unix timestamp of issuance |
| `studentId` | `bytes16` | Alphanumeric student ID (max 15 chars, left-aligned) |
| `institutionId` | `uint16` | Numeric identifier of the issuing institution |
| `status` | `uint8` | `0` = Invalid, `1` = Valid, `2` = Revoked |
| `exists` | `bool` | Guard flag (false = empty slot) |

> **See**: [Blockchain/CertificateVerification.sol](Blockchain/CertificateVerification.sol) for the full 658-line contract with NatSpec documentation.

---

## How It Works End-to-End

### Certificate Issuance

```
Institution Admin / Registrar (Angular Web App)
        │
        ▼
Step 1: Enter student information
        (Student ID, name, DOB, email, phone)
        │
        ▼
Step 2: Enter certificate details
        (Qualification type, award class, programme, graduation date)
        │
        ▼
Step 3: Upload certificate PDF
        → SHA-256 file hash computed client-side for integrity
        → PDF uploaded to IPFS via Pinata → returns CID
        │
        ▼
Step 4: Blockchain registration
        → Connect MetaMask wallet (must be authorised institution wallet)
        → Review estimated gas fee
        → Sign & submit issueCertificate(certHash, ipfsCID, studentId, issueDate)
        → Transaction confirmed on Sepolia
        │
        ▼
Step 5: Backend persistence
        → POST /api/certificates with:
          student info + certificate details + blockchain tx hash +
          IPFS CID + certificate hash + gas used + block number
        → QR code generated with verification URL
        → Certificate status: Verified ✅
        │
        ▼
Result: Certificate is now verifiable by anyone, anywhere, forever.
```

### Certificate Verification

```
Verifier (Employer / Government / Anyone)
        │
        ├─── Via Public Website: Enter 64-char hex hash
        ├─── Via Mobile App: Scan QR code on certificate
        └─── Via Admin Web App: Navigate to verification page
        │
        ▼
Two parallel verification paths execute simultaneously:
        │
        ├──► Blockchain Verification (trustless, zero gas)
        │      ethers.js / Web3.js → getCertificateDetails(hash)
        │      → Returns: hash, IPFS CID, issue date, student ID,
        │        institution ID, status (Valid/Revoked/Invalid)
        │
        └──► Backend API Verification (rich metadata)
               GET /api/certificates/by-hash/{hash}
               → Returns: student name, programme, institution details,
                 graduation date, fraud confidence score, QR code
        │
        ▼
Results are merged and displayed:
        │
        ├── ✅ VERIFIED: Full certificate details + blockchain proof
        │     Student name, programme, institution, graduation date,
        │     blockchain tx hash (linked to Etherscan), IPFS document link,
        │     fraud confidence score from AI analysis
        │
        ├── ❌ NOT FOUND: Certificate hash not registered on blockchain
        │     or in the system database
        │
        └── ⚠️ REVOKED: Certificate was valid but has been revoked
              by the issuing institution
        │
        ▼
Verification log recorded for audit trail
        POST /api/verification-logs
        (certificate hash, success/failure, verifier type, IP, timestamp)
```

### Certificate Revocation

```
Institution Admin / Verification Officer (Angular Web App)
        │
        ▼
1. Navigate to /certificates/revoke
2. Connect the issuing institution's MetaMask wallet
3. Enter the certificate hash
4. Optionally check current on-chain status
5. Confirm revocation (irreversibility warning displayed)
        │
        ▼
6. Transaction submitted: revokeCertificate(certHash)
   → Smart contract verifies caller is the issuing institution
   → Status updated from 1 (Valid) → 2 (Revoked)
   → CertificateRevoked event emitted
        │
        ▼
7. Backend updated with revocation status
8. Certificate now shows as REVOKED on all platforms
```

---

## Blockchain Integration Deep Dive

### Network Configuration

| Property | Value |
|---|---|
| **Network** | Ethereum Sepolia Testnet |
| **Chain ID** | `11155111` |
| **RPC Provider** | Infura (`https://sepolia.infura.io/v3/<projectId>`) |
| **Contract Address** | `0x29baF19FF34fcf90a8980AD34C3389E8BE3A501E` |
| **Block Explorer** | [sepolia.etherscan.io](https://sepolia.etherscan.io) |

### Client Libraries

| Platform | Library | Interaction Type |
|---|---|---|
| Angular Web App | **Web3.js 4.16** | Read + Write (MetaMask signing) |
| Next.js Website | **ethers.js 6.16** | Read-only (JSON-RPC, no wallet) |
| .NET Backend | **Nethereum** | Read + Write (private key signing) |

### Gas Costs

- **Write operations** (issue, revoke, authorise institution) require Sepolia ETH for gas.
- **Read operations** (verify, check existence, get details, get stats) are free `view` calls.
- **Batch issuance** of up to 50 certificates in a single transaction reduces per-certificate gas cost.

### Getting Sepolia Test ETH

- [sepoliafaucet.com](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

---

## IPFS Decentralised Storage

Certificate PDFs are stored on IPFS through **Pinata Cloud**:

1. **Upload**: `POST /api/ipfs/upload` → Pinata pins the file → returns an IPFS CID
2. **On-chain anchor**: The CID (as `bytes32`) is stored in the smart contract alongside the certificate hash
3. **Retrieval**: `GET /api/ipfs/download/{cid}` → fetches from the dedicated Pinata gateway with JWT authentication

**Why IPFS?**
- **Content-addressed**: The CID is derived from the file content — any alteration produces a different CID, making tampering detectable.
- **Decentralised**: No single point of failure for document storage.
- **Permanent**: Pinned files persist as long as the pinning service is maintained.

---

## AI Fraud Detection

The platform integrates an external **machine learning service** for certificate fraud detection:

- **Visual tampering detection** — analyses certificate images for signs of editing, splicing, or overlay manipulation
- **Deepfake artefact detection** — identifies AI-generated documents
- **Confidence scoring** — returns a fraud confidence score (0–100%) associated with each certificate
- **Integration point** — called during verification to add a visual authenticity layer on top of blockchain and database checks

---

## Role-Based Access Control (RBAC)

The system implements a **flags-based permission model** with 6 roles and 30+ granular permissions:

### Roles

| Role | Description |
|---|---|
| **Super Admin** | Full platform access — manages all institutions, users, and system settings |
| **Institution Admin** | Manages their institution's settings, users, certificates, and blockchain configuration |
| **Registrar** | Issues, views, and manages certificates and students |
| **Faculty Admin** | Views certificates and manages academic programmes within their faculty |
| **Verification Officer** | Verifies and revokes certificates, views verification history |
| **Auditor** | Read-only access to audit logs, reports, verification history, and dashboards |

### Permission Categories

| Category | Permissions |
|---|---|
| **Certificates** | `create`, `view`, `update`, `delete`, `revoke`, `batch-upload` |
| **Students** | `view`, `manage`, `bulk-upload` |
| **Programmes & Faculties** | `view`, `manage` for each |
| **Users** | `create`, `view`, `update`, `delete` |
| **Verification** | `verify:certificate`, `verify:history`, `verify:fraud-detection` |
| **Reports & Audits** | `reports:view`, `reports:export`, `audit:view`, `audit:export` |
| **Settings** | `settings:institution`, `settings:blockchain`, `settings:signatures`, `settings:templates` |
| **Dashboard** | `dashboard:view` |

### Enforcement

- **Backend**: Custom `[RequirePermission(Permission.X)]` attribute on controller actions; `PermissionFilter` checks `User.Role` against `RolePermissions.GetPermissions()` using `HasFlag()`
- **Frontend**: Angular uses `hasPermission()` checks to show/hide menu items, buttons, and routes; `permissionGuard` and `roleGuard` protect routes
- **JWT**: On login, a `permissions[]` array is returned alongside tokens for frontend consumption

---

## Multi-Tenancy

Each institution operates as an **isolated tenant**:

1. **JWT**: Every token contains a `tenant-id` claim
2. **Middleware**: `TenantMiddleware` extracts and sets the tenant context per HTTP request
3. **EF Core**: Global query filters on entities implementing `ITenantEntity` automatically scope all database queries to the current tenant
4. **Data partitioning**: Students, certificates, faculties, programmes, users, and logs are all tenant-scoped

This architecture allows the single API to serve multiple institutions simultaneously while maintaining complete data isolation.

---

## Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| **Backend API** | ASP.NET Core (.NET 10, C# 14) | 10.0 |
| **ORM** | Entity Framework Core | 10.0 |
| **Database** | SQL Server | 2019+ |
| **Admin Web App** | Angular + PrimeNG + Tailwind CSS | 21 / 21 / 4 |
| **Public Website** | Next.js + React + shadcn/ui + Tailwind CSS | 16 / 19 / — / 4 |
| **Mobile App** | Flutter (Dart) | SDK ^3.9.0 |
| **Smart Contract** | Solidity | ^0.8.20 |
| **Blockchain** | Ethereum Sepolia Testnet | — |
| **Blockchain (backend)** | Nethereum | — |
| **Blockchain (Angular)** | Web3.js | 4.16.0 |
| **Blockchain (Next.js)** | ethers.js | 6.16.0 |
| **IPFS** | Pinata Cloud | — |
| **Auth (Website)** | NextAuth.js v5 + Google OAuth | 5.0.0-beta |
| **Auth (Mobile)** | Firebase Auth + Google Sign-In | — |
| **Auth (API)** | JWT Bearer (custom) | — |
| **CQRS** | MediatR | — |
| **Real-time** | ASP.NET Core SignalR | — |
| **PDF Generation** | pdf-lib (Angular) | 1.17.1 |
| **QR Codes** | jsqr (Angular), QR Code Scanner (Flutter) | — |
| **Charts** | Chart.js (Angular), Recharts (Next.js) | — |
| **CI/CD** | Azure Pipelines | — |
| **Containerisation** | Docker (.NET multi-stage build) | — |

---

## Repository Structure

```
📦 Final Project/
│
├── 📄 README.md                          ← You are here
├── 📄 azure-pipelines.yml                # CI/CD pipeline (Angular build)
├── 📄 Dockerfile                         # .NET API multi-stage Docker build
├── 📄 .gitignore
│
├── 📂 Blockchain/
│   └── CertificateVerification.sol       # Solidity smart contract (658 lines)
│
├── 📂 CertifyChain/                      # .NET Backend API
│   ├── 📂 CertifyChain.Api/             # HTTP layer — controllers, middleware, DI
│   │   ├── Controllers/                  # REST controllers (Auth, Certificates, etc.)
│   │   ├── Middleware/                   # JWT, Permissions, Exception handling
│   │   ├── Program.cs                    # Composition root
│   │   └── appsettings.json              # Configuration
│   ├── 📂 CertifyChain.Core/            # Domain & Application layer
│   │   ├── Entities/                     # Domain entities (Certificate, Student, etc.)
│   │   ├── Services/                     # Application services
│   │   ├── Features/                     # CQRS commands & queries (MediatR)
│   │   ├── AI/                           # Fraud detection service
│   │   ├── IPFS/                         # Pinata IPFS service
│   │   ├── MultiTenancy/                # Tenant isolation
│   │   ├── Enums/                        # Permission, UserRole, CertificateStatus
│   │   ├── DataTransferObjects/          # Request/Response DTOs
│   │   └── Mapping/                      # AutoMapper profiles
│   └── 📂 CertifyChain.Data/            # Infrastructure layer (not in workspace)
│       ├── Persistence/                  # EF Core DbContext + configurations
│       ├── Repositories/                 # Repository implementations
│       └── Migrations/                   # EF Core database migrations
│
├── 📂 Web App/                           # Angular Admin Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                     # Guards, interceptors, models, services
│   │   │   ├── features/                 # Lazy-loaded feature modules
│   │   │   │   ├── auth/                # Login, register, password reset
│   │   │   │   ├── certificates/        # Issue, list, revoke, verify, history
│   │   │   │   ├── dashboard/           # Analytics & charts
│   │   │   │   ├── settings/            # Institution & blockchain config
│   │   │   │   ├── users/               # User management
│   │   │   │   └── admin/               # Super admin pages
│   │   │   └── layout/                  # App shell (sidebar, topbar, footer)
│   │   └── environments/                # Dev & prod configs
│   ├── angular.json
│   ├── package.json
│   └── vercel.json                       # Vercel SPA deployment config
│
├── 📂 Website/                           # Next.js Public Website
│   ├── app/                              # Next.js App Router pages
│   │   ├── page.tsx                      # Landing page
│   │   ├── login/                        # Google OAuth login
│   │   ├── signup/                       # Google OAuth signup
│   │   ├── dashboard/                    # Verification dashboard
│   │   ├── verify/                       # Certificate verification
│   │   └── api/auth/[...nextauth]/       # NextAuth.js route handler
│   ├── components/                       # React components
│   ├── lib/                              # API client, auth config, blockchain utils
│   └── netlify.toml                      # Netlify deployment config
│
├── 📂 Mobile App/
│   └── certificate_verifier/             # Flutter mobile application
│       ├── lib/
│       │   ├── main.dart                 # App entry point
│       │   ├── api/                      # Google Sign-In service
│       │   ├── models/                   # Certificate model
│       │   ├── screens/
│       │   │   ├── auth/                # Login & signup screens
│       │   │   └── home/               # Home with tabs: Dashboard, History, Profile
│       │   └── theme/                   # App theme & colours
│       ├── pubspec.yaml
│       └── android/ ios/ web/ windows/ macos/ linux/
│
└── 📂 Documentation/                     # Project documentation
```

---

## Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0+ | Backend API |
| [SQL Server](https://www.microsoft.com/sql-server) or LocalDB | 2019+ | Database |
| [Node.js](https://nodejs.org/) | 20+ | Angular & Next.js apps |
| [Angular CLI](https://angular.dev/) | 21+ | `npm install -g @angular/cli` |
| [Flutter SDK](https://flutter.dev/docs/get-started/install) | 3.9+ | Mobile app |
| [MetaMask](https://metamask.io/) | Latest | Browser wallet for blockchain ops |
| Sepolia ETH | > 0.01 | Gas for blockchain transactions |
| Google Cloud OAuth credentials | — | For website Google sign-in |
| Infura project | — | Ethereum Sepolia RPC endpoint |
| Pinata account | — | IPFS document storage |

---

### Backend API Setup

```bash
# 1. Navigate to the backend
cd CertifyChain

# 2. Update appsettings.json:
#    - ConnectionStrings:DefaultConnection → your SQL Server
#    - Blockchain:PrivateKey → your Sepolia wallet private key
#    - Blockchain:ContractAddress → deployed contract address
#    - IPFS → your Pinata credentials
#    - AppSettings:Secret → JWT signing key

# 3. Apply database migrations
dotnet ef database update --project CertifyChain.Data --startup-project CertifyChain.Api

# 4. Run the API
dotnet run --project CertifyChain.Api

# API available at https://localhost:5001
# Swagger UI at https://localhost:5001/swagger
```

---

### Admin Web App Setup

```bash
# 1. Navigate to the Angular app
cd "Web App"

# 2. Install dependencies
npm install

# 3. Configure environment
#    Edit src/environments/environment.ts:
#    - apiUrl → your backend URL (e.g., https://localhost:7270/api)
#    - blockchain.rpcUrl → your Infura Sepolia endpoint
#    - blockchain.contractAddress → deployed contract address

# 4. Start development server
ng serve

# App available at http://localhost:4200
```

---

### Public Website Setup

```bash
# 1. Navigate to the Next.js website
cd Website

# 2. Install dependencies
npm install

# 3. Create .env.local with:
#    GOOGLE_CLIENT_ID=<your-google-client-id>
#    GOOGLE_CLIENT_SECRET=<your-google-client-secret>
#    AUTH_SECRET=<random-secret>
#    NEXTAUTH_URL=http://localhost:3000
#    BACKEND_API_URL=https://localhost:7270
#    NEXT_PUBLIC_BACKEND_API_URL=https://localhost:7270
#    NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/<key>
#    NEXT_PUBLIC_CONTRACT_ADDRESS=0x<address>
#    NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID=11155111
#    NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL=https://sepolia.etherscan.io

# 4. Start development server
npm run dev

# Website available at http://localhost:3000
```

---

### Mobile App Setup

```bash
# 1. Navigate to the Flutter app
cd "Mobile App/certificate_verifier"

# 2. Install dependencies
flutter pub get

# 3. Create .env file with backend and Firebase configs

# 4. Run on device/emulator
flutter run
```

---

## Deployment

| Component | Platform | Config File |
|---|---|---|
| **Backend API** | Docker / AWS Elastic Beanstalk / site4now.net | `Dockerfile`, `CertifyChain/Dockerfile`, `aws-beanstalk-tools-defaults.json` |
| **Admin Web App** | Vercel (static SPA) | `vercel.json` |
| **Public Website** | Netlify | `netlify.toml` |
| **Mobile App** | Google Play Store / Apple App Store | Flutter build configs |
| **Smart Contract** | Ethereum Sepolia Testnet | Deployed via Remix / Hardhat |

---

## CI/CD Pipeline

The project uses **Azure Pipelines** (`azure-pipelines.yml`) for continuous integration:

```yaml
trigger: main

steps:
  1. Install Node.js 20.x
  2. Install Angular dependencies (npm install)
  3. Build Angular app (production configuration)
  4. Publish build artifacts
```

The backend also includes a **multi-stage Docker build** for containerised deployment:

```dockerfile
Build stage:  .NET SDK 10.0 → dotnet restore → dotnet publish
Runtime stage: .NET ASP.NET 10.0 → ENTRYPOINT ["dotnet", "CertifyChain.Api.dll"]
```

---

## Smart Contract Reference

### Admin Functions

| Function | Description |
|---|---|
| `authorizeInstitution(id, address, name)` | Register and activate a new institution |
| `deauthorizeInstitution(id)` | Soft-deactivate an institution |
| `reauthorizeInstitution(id)` | Re-activate a deactivated institution |
| `updateInstitutionAddress(id, oldAddr, newAddr)` | Rotate an institution's signing wallet |
| `updateInstitution(id, newName)` | Update an institution's display name |
| `transferAdmin(newAddress)` | Transfer admin role (**irreversible**) |

### Certificate Functions

| Function | Access | Description |
|---|---|---|
| `issueCertificate(certHash, ipfsCID, studentId, issueDate)` | Authorised Institution | Issue single certificate |
| `batchIssueCertificates(hashes[], cids[], studentIds[], dates[])` | Authorised Institution | Issue up to 50 certificates |
| `revokeCertificate(certHash)` | Issuing Institution | Revoke (status → 2, **irreversible**) |

### Public Verification Functions (Zero Gas)

| Function | Returns | Description |
|---|---|---|
| `verifyCertificate(certHash)` | `(isValid, studentId, institutionId, issueDate, ipfsCID)` | Lightweight validity check |
| `getCertificateDetails(certHash)` | Full `Certificate` struct | Complete on-chain record |
| `certificateExists(certHash)` | `bool` | Existence check |
| `getInstitution(id)` | `(name, active)` | Single institution lookup |
| `getAllInstitutions()` | `InstitutionView[]` | All institutions with wallet addresses |
| `getStats()` | `uint32 totalCerts` | Total certificates ever issued |

### On-Chain Status Codes

| Code | Status | Meaning |
|---|---|---|
| `0` | Invalid | Never issued or does not exist |
| `1` | Valid | Active, verified certificate |
| `2` | Revoked | Irreversibly revoked by issuing institution |

---

## API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | Public | Authenticate user → JWT + refresh token |
| `POST` | `/google-signin` | Public | Exchange Google profile for backend tokens |
| `POST` | `/refresh` | Public | Refresh expired access token |
| `GET` | `/profile` | JWT | Get authenticated user's profile |
| `POST` | `/forgot-password` | Public | Request password reset email |
| `POST` | `/reset-password` | Public | Set new password via token |
| `POST` | `/create` | JWT + `CreateUsers` | Create new user |
| `GET` | `/users` | JWT + `ViewUsers` | List users (paginated) |

### Certificates (`/api/certificates`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/` | `ViewCertificates` | Paginated list with filters |
| `GET` | `/by-hash/{hash}` | `ViewCertificates` | Lookup by blockchain hash |
| `POST` | `/` | `CreateCertificates` | Issue certificate (FormData) |
| `POST` | `/revoke` | `RevokeCertificates` | Revoke certificate |
| `GET` | `/{id}/qr-code` | `ViewCertificates` | Generate QR code image |
| `GET` | `/{id}/pdf` | `ViewCertificates` | Download PDF with QR overlay |

### Verification Logs (`/api/verification-logs`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Public | Record verification attempt |
| `GET` | `/mine` | JWT | User's verification history |
| `GET` | `/by-hash/{hash}` | Public | Logs for a specific hash |

### Other Endpoints
- `/api/students` — Student CRUD + bulk upload
- `/api/program` — Academic programme management
- `/api/faculties` — Faculty management
- `/api/institution` — Institution management
- `/api/dashboard` — Analytics (metrics, charts, sources, top programmes)
- `/api/ipfs` — Upload to / download from IPFS

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>CertifyChain</strong> — Built for academic integrity. Powered by blockchain. Verified by AI.
</p>
