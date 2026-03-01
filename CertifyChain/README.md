# CertifyChain

> Blockchain-backed academic certificate issuance, verification and fraud detection platform for higher-education institutions.

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](#tech-stack)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular)](#tech-stack)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)](#blockchain)
[![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?logo=ipfs)](#ipfs-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Domain Model](#domain-model)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [API Endpoints](#api-endpoints)
- [Blockchain Integration](#blockchain)
- [IPFS Storage](#ipfs-storage)
- [Multi-Tenancy](#multi-tenancy)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
  - [Database Setup](#database-setup)
  - [Running the API](#running-the-api)
- [Frontend](#frontend)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CertifyChain solves the problem of **academic certificate fraud** by anchoring certificate hashes on the Ethereum blockchain and storing certificate documents on IPFS. Employers, government bodies, and other institutions can independently verify a certificate's authenticity in seconds — without contacting the issuing university.

### Key Capabilities

| Capability | Description |
|---|---|
| **Certificate Lifecycle** | Issue, update, revoke, and verify academic certificates with full audit trails |
| **Blockchain Anchoring** | SHA-256 certificate hashes stored on Ethereum (Sepolia testnet) via smart contract |
| **IPFS Document Storage** | Certificate PDFs pinned on IPFS through Pinata for tamper-proof, decentralised storage |
| **Multi-Tenant** | Each institution operates in an isolated tenant with its own data partition |
| **RBAC Permissions** | Six roles with granular, flags-based permission system (30+ permissions) |
| **AI Fraud Detection** | ML-powered certificate image analysis to detect fraudulent documents |
| **Real-Time Events** | SignalR hub for push notifications (certificate issued, verification alerts) |
| **Dashboard Analytics** | Metrics, activity charts, verification sources, and top-program analytics |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Angular Frontend                          │
│              (PrimeNG • hosted on Netlify)                        │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTPS / JWT Bearer
┌──────────────────────▼───────────────────────────────────────────┐
│                      CertifyChain.Api                             │
│  ┌─────────────┐  ┌───────────────┐  ┌────────────────────────┐  │
│  │ Controllers  │  │  Middleware    │  │  SignalR Hubs          │  │
│  │  (REST API)  │  │  JWT • Tenant │  │  (Notifications)       │  │
│  │              │  │  Permissions  │  │                        │  │
│  └──────┬───────┘  └───────┬───────┘  └────────────────────────┘  │
│         │                  │                                      │
│  ┌──────▼──────────────────▼──────────────────────────────────┐  │
│  │                  CertifyChain.Core                          │  │
│  │  Domain Entities • Services • CQRS Handlers • Enums        │  │
│  │  Interfaces • DTOs • AutoMapper • MediatR                  │  │
│  └──────┬─────────────────────────────────────────────────────┘  │
│         │                                                        │
│  ┌──────▼─────────────────────────────────────────────────────┐  │
│  │                  CertifyChain.Data                          │  │
│  │  EF Core DbContext • Repositories • Migrations             │  │
│  │  Configurations • Multi-Tenant Query Filters               │  │
│  └──────┬─────────────────────────────────────────────────────┘  │
└─────────┼────────────────────────────────────────────────────────┘
          │
    ┌─────▼─────┐    ┌──────────────┐    ┌──────────────┐
    │ SQL Server │    │  Ethereum    │    │  Pinata      │
    │ (EF Core)  │    │  (Sepolia)   │    │  (IPFS)      │
    └────────────┘    └──────────────┘    └──────────────┘
```

The solution follows **Clean Architecture** with three projects:

| Project | Responsibility |
|---|---|
| `CertifyChain.Api` | HTTP layer — controllers, middleware, Swagger, DI composition root |
| `CertifyChain.Core` | Domain & application layer — entities, services, interfaces, DTOs, enums, CQRS |
| `CertifyChain.Data` | Infrastructure — EF Core persistence, repository implementations, migrations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | .NET 10, C# 14 |
| **Web Framework** | ASP.NET Core 10, Minimal Hosting |
| **ORM** | Entity Framework Core 10 (SQL Server) |
| **Authentication** | JWT Bearer tokens (custom middleware) |
| **Authorisation** | Custom `[RequirePermission]` attribute with flags-based RBAC |
| **Blockchain** | Ethereum Sepolia via Nethereum / Infura RPC |
| **IPFS** | Pinata Cloud (pinning + dedicated gateway) |
| **CQRS / Mediator** | MediatR |
| **Mapping** | AutoMapper |
| **Email** | SMTP (Gmail) |
| **AI** | External ML service for fraud detection |
| **Real-time** | ASP.NET Core SignalR |
| **API Docs** | Swagger / OpenAPI |
| **Frontend** | Angular 18 + PrimeNG (separate repository / Netlify) |
| **Hosting** | API on site4now.net • Frontend on Netlify |

---

## Domain Model

```
Institution (Tenant)
 ├── Faculty
 │    └── Program
 │         └── StudentProgram ──► Student
 ├── User (with Role & Permissions)
 └── Certificate
      ├── Student (FK)
      ├── Program (FK)
      ├── BlockchainTxHash, IpfsCid, CertificateHash
      ├── Status (Draft → PendingVerification → Verified → Revoked)
      └── VerificationLog[]
```

### Core Entities

| Entity | Key Fields |
|---|---|
| `Institution` | Name, Code, WalletAddress, SmartContractAddress, IsBlockchainAuthorized |
| `Faculty` | Name, Code → belongs to Institution |
| `Program` | Name, Code, Description → belongs to Faculty |
| `Student` | StudentNumber, Name, Email, DateOfBirth → enrolled in Programs via `StudentProgram` |
| `Certificate` | CertificateNumber, QualificationType, AwardClass, GraduationDate, BlockchainTxHash, IpfsCid, CertificateHash, Status |
| `VerificationLog` | CertificateHash, VerifierType, IsSuccess, IpAddress, UserAgent |
| `User` | Email, Role, TenantId |
| `AuditLog` | System-wide audit trail |

### Enumerations

| Enum | Values |
|---|---|
| `UserRole` | SuperAdmin, InstitutionAdmin, Registrar, FacultyAdmin, VerificationOfficer, Auditor |
| `CertificateStatus` | Draft, PendingVerification, Verified, Revoked, Flagged, Expired |
| `QualificationType` | Certificate, Diploma, Degree, MastersDegree, Doctorate |
| `AwardClass` | Pass, LowerSecond, UpperSecond, FirstClass, Distinction |
| `VerifierType` | Employer, EducationalInstitution, Government, Other |

---

## Role-Based Access Control (RBAC)

The system uses a **flags-based `Permission` enum** (30+ permissions) mapped to roles at runtime. The `[RequirePermission(Permission.X)]` attribute on controller actions enforces access by checking the authenticated user's role against `RolePermissions.GetPermissions()`.

### Permission Matrix

| Permission | SuperAdmin | InstitutionAdmin | FacultyAdmin | Registrar | VerificationOfficer | Auditor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Certificates** (View) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Certificates** (Create/Update) | ✅ | ✅ | ✅ | ✅ | — | — |
| **Certificates** (Delete) | ✅ | ✅ | — | ✅ | — | — |
| **Certificates** (Revoke) | ✅ | ✅ | — | — | ✅ | — |
| **Certificates** (Batch Upload) | ✅ | ✅ | ✅ | ✅ | — | — |
| **Students** (View) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Students** (Manage) | ✅ | ✅ | ✅ | ✅ | — | — |
| **Students** (Bulk Upload) | ✅ | ✅ | ✅ | ✅ | — | — |
| **Programs** (View) | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Programs** (Manage) | ✅ | ✅ | ✅ | — | — | — |
| **Faculties** (View) | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Faculties** (Manage) | ✅ | ✅ | — | — | — | — |
| **Users** (CRUD) | ✅ | ✅ | — | — | — | — |
| **Verification** | ✅ | ✅ | — | — | ✅ | History |
| **Reports** | ✅ | ✅ | View | — | — | ✅ |
| **Audit Logs** | ✅ | ✅ | — | — | — | ✅ |
| **Settings** | ✅ | ✅ | — | — | — | — |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### How It Works

1. **Login** → `JwtUtils.GenerateAuthResponseAsync()` returns JWT + a `permissions[]` array of frontend-readable strings (e.g., `"certificate:view"`, `"student:manage"`)
2. **Backend enforcement** → `PermissionFilter` reads `User` from `HttpContext.Items["Account"]` (set by `JwtMiddleware`), resolves role permissions via `RolePermissions.GetPermissions()`, and checks `HasFlag()`
3. **Frontend enforcement** → Angular menu items use `visible: this.hasPermission(Permission.CERTIFICATE_VIEW)` to show/hide UI elements

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| `POST` | `/login` | Anonymous | — |
| `POST` | `/refresh` | Anonymous | — |
| `GET` | `/profile` | JWT | — |
| `POST` | `/logout` | JWT | — |
| `POST` | `/forgot-password` | Anonymous | — |
| `POST` | `/reset-password` | Anonymous | — |
| `POST` | `/create` | JWT | `CreateUsers` |
| `GET` | `/users` | JWT | `ViewUsers` |
| `GET` | `/users/{id}` | JWT | `ViewUsers` |
| `PUT` | `/users/{id}` | JWT | `UpdateUsers` |
| `DELETE` | `/users/{id}` | JWT | `DeleteUsers` |

### Certificates (`/api/certificates`)

| Method | Endpoint | Permission |
|---|---|---|
| `GET` | `/` | `ViewCertificates` |
| `GET` | `/{id}` | `ViewCertificates` |
| `GET` | `/by-number/{num}` | `ViewCertificates` |
| `GET` | `/by-hash/{hash}` | `ViewCertificates` |
| `GET` | `/student/{studentId}` | `ViewCertificates` |
| `GET` | `/{id}/qr` | `ViewCertificates` |
| `POST` | `/` | `CreateCertificates` |
| `PUT` | `/{id}` | `UpdateCertificates` |
| `DELETE` | `/{id}` | `DeleteCertificates` |

### Students (`/api/students`)

| Method | Endpoint | Permission |
|---|---|---|
| `GET` | `/` , `/{id}` , `/by-number/{num}` | `ViewStudents` |
| `POST` | `/` | `ManageStudents` |
| `PUT` | `/` | `ManageStudents` |
| `DELETE` | `/{id}` | `ManageStudents` |
| `POST` | `/bulk-upload` | `BulkUploadStudents` |

### Programs (`/api/program`), Faculties (`/api/faculties`), Institutions (`/api/institution`)

CRUD endpoints following the same pattern with `ViewPrograms` / `ManagePrograms`, `ViewFaculties` / `ManageFaculties`, and `ManageInstitution` permissions respectively.

### Verification Logs (`/api/verification-logs`)

| Method | Endpoint | Auth | Permission |
|---|---|---|---|
| `POST` | `/` | Anonymous | — |
| `GET` | `/` | JWT | `ViewVerificationHistory` |
| `GET` | `/mine` | JWT | `VerifyCertificate` |
| `GET` | `/by-hash/{hash}` | Anonymous | — |
| `GET` | `/by-certificate/{id}` | Anonymous | — |

### Dashboard (`/api/dashboard`)

All endpoints require `ViewDashboard`. Includes: `/metrics`, `/activity-chart`, `/verification-sources`, `/monthly-overview`, `/recent-activity`, `/recent-certificates`, `/verification-requests`, `/top-programs`.

### IPFS (`/api/ipfs`)

| Method | Endpoint | Permission |
|---|---|---|
| `POST` | `/upload` | `CreateCertificates` |
| `GET` | `/download/{cid}` | `ViewCertificates` |

---

## Blockchain

Certificates are anchored on the **Ethereum Sepolia testnet**:

1. Certificate data is hashed (SHA-256) on the server
2. The certificate PDF is uploaded to IPFS via Pinata, returning a CID
3. The hash + CID are submitted to a Solidity smart contract via Infura RPC
4. The transaction hash, gas used, and IPFS CID are stored on the `Certificate` entity
5. A QR code is generated with the verification URL: `certifychain://verify/{hash}`
6. Anyone can verify by submitting the hash — the contract returns the on-chain record

**Configuration** (`appsettings.json` → `Blockchain` section):

| Key | Purpose |
|---|---|
| `RpcUrl` | Infura endpoint for Sepolia |
| `ContractAddress` | Deployed smart contract address |
| `PrivateKey` | Wallet key for signing transactions |
| `ChainId` | `11155111` (Sepolia) |
| `ExplorerUrl` | Etherscan link for transaction lookups |

---

## IPFS Storage

Certificate documents are pinned on IPFS via **Pinata**:

- **Upload**: `POST /api/ipfs/upload` → pins file via Pinata API → returns IPFS CID
- **Download**: `GET /api/ipfs/download/{cid}` → retrieves file from the dedicated Pinata gateway with JWT authentication

**Configuration** (`appsettings.json` → `IPFS` section):

| Key | Purpose |
|---|---|
| `ApiUrl` | Pinata pinning endpoint |
| `GatewayUrl` | Dedicated gateway URL for retrieval |
| `ApiKey` / `ApiSecret` | Pinata API credentials |
| `ProjectJwtAccessToken` | JWT for authenticated gateway access |

---

## Multi-Tenancy

Each institution is a **tenant**. Tenant isolation is enforced at multiple levels:

1. **JWT**: The `tenant-id` claim is embedded in every token
2. **Middleware**: `TenantMiddleware` extracts and sets the tenant context per request
3. **EF Core**: Global query filters on entities implementing `ITenantEntity` ensure queries are automatically scoped to the current tenant
4. **Entities**: All tenant-scoped entities carry a `TenantId` property

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0+ |
| [SQL Server](https://www.microsoft.com/sql-server) or LocalDB | 2019+ |
| [Node.js](https://nodejs.org/) (for frontend) | 20+ |
| [Angular CLI](https://angular.dev/) (for frontend) | 18+ |

### Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/munasheshub/Final-Project.git
   cd Final-Project
   ```

2. Update `CertifyChain.Api/appsettings.json`:

   - **ConnectionStrings:DefaultConnection** — point to your SQL Server instance. For local development:
     ```json
     "DefaultConnection": "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=CertifyChain;Integrated Security=True;Encrypt=False;"
     ```
   - **Blockchain** — update `PrivateKey` with your Sepolia wallet key and `ContractAddress` with your deployed contract
   - **IPFS** — update Pinata credentials if using your own account
   - **AppSettings:Secret** — change the JWT signing key in production

   > ⚠️ **Never commit real secrets.** Use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) or environment variables in production.

### Database Setup

From the **Package Manager Console** in Visual Studio (Default Project: `CertifyChain.Data`):

```powershell
Update-Database
```

Or using the .NET CLI:

```bash
dotnet ef database update --project CertifyChain.Data --startup-project CertifyChain.Api
```

This will create the database and apply all migrations.

### Running the API

```bash
dotnet run --project CertifyChain.Api
```

The API starts at `https://localhost:5001` (or the configured port). Swagger UI is available at:

```
https://localhost:5001/swagger
```

### Health Check

```
GET /health
```

---

## Frontend

The Angular frontend is deployed on **Netlify** at [certifyonchain.netlify.app](https://certifyonchain.netlify.app) and communicates with the API via CORS-allowed origins.

**CORS configuration** allows:
- `http://localhost:4200` (local development)
- `https://certifyonchain.netlify.app` (production)

The frontend receives a `permissions[]` array on login and uses it to:
- Show/hide sidebar menu items
- Enable/disable action buttons (Issue, Revoke, Delete, etc.)
- Guard routes

---

## Project Structure

```
📦 Final-Project/
├── 📂 CertifyChain.Api/                  # Web API layer
│   ├── 📂 Controllers/                   # REST controllers
│   │   ├── AuthController.cs
│   │   ├── CertificatesController.cs
│   │   ├── StudentsController.cs
│   │   ├── ProgramController.cs
│   │   ├── FacultiesController.cs
│   │   ├── InstitutionController.cs
│   │   ├── DashboardController.cs
│   │   ├── VerificationLogsController.cs
│   │   └── IpfsController.cs
│   ├── 📂 Middleware/
│   │   ├── JwtMiddleware.cs              # JWT validation & User hydration
│   │   ├── RequirePermissionAttribute.cs # Permission-based authorisation
│   │   └── ExceptionHandlingMiddleware.cs
│   ├── Program.cs                        # Composition root
│   └── appsettings.json
│
├── 📂 CertifyChain.Core/                 # Domain & Application layer
│   ├── 📂 Entities/                      # Domain entities (DDD-style)
│   ├── 📂 Enums/                         # Permission, UserRole, CertificateStatus, etc.
│   ├── 📂 Services/                      # Application services
│   ├── 📂 Interfaces/                    # Service contracts
│   ├── 📂 IRepositories/                 # Repository contracts
│   ├── 📂 DataTransferObjects/           # Request/Response DTOs
│   ├── 📂 Helpers/                       # JWT, Permissions, Role mapping
│   ├── 📂 AI/                            # Fraud detection service
│   ├── 📂 IPFS/                          # Pinata IPFS service
│   ├── 📂 MultiTenancy/                  # Tenant service & middleware
│   ├── 📂 Features/                      # CQRS commands & queries (MediatR)
│   ├── 📂 AggregateRoots/               # Base entity classes
│   └── 📂 Mapping/                       # AutoMapper profiles
│
├── 📂 CertifyChain.Data/                 # Infrastructure / Persistence
│   ├── 📂 Persistence/
│   │   ├── ApplicationDbContext.cs       # EF Core DbContext with tenant filters
│   │   └── 📂 Configurations/           # Entity type configurations
│   ├── 📂 Repositories/                  # Repository implementations
│   └── 📂 Migrations/                    # EF Core migrations
│
└── README.md
```

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
  Built with ❤️ for academic integrity
</p>
