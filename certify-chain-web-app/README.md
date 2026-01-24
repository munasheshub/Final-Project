# Academic Certificate Blockchain Verification System - Web Application

Enterprise-grade Angular application for managing and verifying academic certificates using blockchain technology and AI fraud detection.

## 🏗️ Architecture Overview

This application follows enterprise Angular design principles:

- **Component-Driven Architecture**: Smart/Dumb component separation
- **State Management**: NgRx for global state
- **Modular Design**: Feature-based modules with lazy loading
- **SOLID Principles**: Applied throughout the codebase
- **Type Safety**: Strict TypeScript with comprehensive interfaces
- **Performance Optimized**: OnPush change detection, lazy loading, caching
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first design with PrimeNG v19

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 20.x
npm >= 9.x
Angular CLI >= 21.1.x
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd academic-certificate-blockchain-web

# Install dependencies
npm install

# Start development server
npm start

# Navigate to
http://localhost:4200
```

## 📦 Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   ├── shared/                  # Reusable components, directives, pipes
│   ├── features/               # Feature modules (lazy-loaded)
│   │   ├── dashboard/
│   │   ├── certificates/
│   │   ├── verification/
│   │   ├── users/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── audit/
│   ├── layout/                  # Layout components
│   └── state/                   # NgRx state management
├── assets/                      # Static assets
├── environments/               # Environment configurations
└── styles/                     # Global styles and themes
```

## 🎨 Design System

### Color Palette

```scss
Primary:    #1976D2  (Trust Blue)
Secondary:  #7B1FA2  (Academic Purple)
Accent:     #FFA726  (Innovation Orange)
Success:    #66BB6A  (Verified Green)
Warning:    #FFA726  (Pending Orange)
Danger:     #EF5350  (Error Red)
Info:       #42A5F5  (Info Blue)
```

### Typography

- **Headings**: Poppins
- **Body**: Inter
- **Monospace**: Fira Code

### Spacing Scale

- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px
- 3XL: 64px

## 🔐 Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Two-factor authentication (2FA)
- ✅ Role-based access control (RBAC)
- ✅ Permission-based UI rendering
- ✅ Secure session management

### Certificate Management
- ✅ Issue single certificates
- ✅ Batch upload via CSV
- ✅ Certificate revocation
- ✅ Document preview
- ✅ QR code generation
- ✅ PDF download

### Blockchain Integration
- ✅ Ethereum smart contract integration
- ✅ IPFS document storage
- ✅ Transaction tracking
- ✅ Gas fee estimation
- ✅ Optimistic rollups support
- ✅ MetaMask wallet connection

### AI Fraud Detection
- ✅ ResNet50v2 deep learning model
- ✅ XGBoost classification
- ✅ Real-time fraud scoring
- ✅ Confidence thresholds
- ✅ Suspicious region highlighting

### Reporting & Analytics
- ✅ Interactive dashboards
- ✅ Certificate issuance trends
- ✅ Verification analytics
- ✅ Blockchain cost tracking
- ✅ Export to CSV/PDF

### User Management
- ✅ CRUD operations for users
- ✅ Role assignment
- ✅ Activity tracking
- ✅ Account activation/deactivation

### Audit & Compliance
- ✅ Comprehensive audit logs
- ✅ Blockchain transaction history
- ✅ User activity tracking
- ✅ Export for compliance

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 18
- **UI Library**: PrimeNG v19
- **State Management**: NgRx
- **Charts**: Chart.js via PrimeNG
- **Icons**: PrimeIcons
- **Styling**: SCSS with design tokens

### Blockchain
- **Library**: Ethers.js v6
- **Network**: Ethereum (Sepolia testnet / Mainnet)
- **Smart Contracts**: Solidity
- **Storage**: IPFS

### Development
- **Language**: TypeScript 5.4
- **Linting**: ESLint + Prettier
- **Testing**: Jasmine + Karma
- **CI/CD**: GitHub Actions

## 📋 Available Scripts

```bash
# Development
npm start                 # Start dev server
npm run watch            # Build and watch for changes

# Building
npm run build            # Development build
npm run build:prod       # Production build

# Testing
npm test                 # Run unit tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Lint TypeScript
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Analysis
npm run analyze          # Analyze bundle size
```

## 🔧 Configuration

### Environment Variables

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'YOUR_API_URL',
  blockchain: {
    contractAddress: 'YOUR_CONTRACT_ADDRESS',
    rpcUrl: 'YOUR_RPC_URL',
    chainId: 11155111
  },
  ipfs: {
    gateway: 'YOUR_IPFS_GATEWAY',
    apiKey: 'YOUR_API_KEY'
  }
};
```

### PrimeNG Theme

Customize theme in `angular.json`:

```json
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css",
  "src/styles.scss"
]
```

## 🎯 Key Components

### Dashboard
- **Path**: `/dashboard`
- **Features**: Stats cards, charts, recent activities, quick actions
- **Permissions**: All authenticated users

### Certificate List
- **Path**: `/certificates`
- **Features**: Table/grid view, filters, search, export, pagination
- **Permissions**: CERTIFICATE_VIEW

### Certificate Create
- **Path**: `/certificates/create`
- **Features**: Form validation, file upload, fraud detection
- **Permissions**: CERTIFICATE_CREATE

### Verification
- **Path**: `/verification/quick-verify`
- **Features**: QR scanner, manual entry, AI analysis
- **Permissions**: VERIFY_CERTIFICATE

## 🔒 Security Best Practices

1. **Authentication**: JWT with short expiry + refresh tokens
2. **Authorization**: Role-based + permission-based guards
3. **XSS Protection**: Angular's built-in sanitization
4. **CSRF Protection**: Token-based protection
5. **HTTPS Only**: Enforce secure connections
6. **Input Validation**: Client + server-side validation
7. **Secure Storage**: No sensitive data in localStorage

## 📱 Responsive Design

Breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are fully responsive with mobile-first approach.

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- ARIA labels and roles
- High contrast mode support
- Focus indicators

## 🧪 Testing

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests (if configured)
npm run e2e
```

## 📊 Performance Optimization

- **Lazy Loading**: Feature modules loaded on-demand
- **OnPush Strategy**: Optimized change detection
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Route-based chunks
- **Caching**: HTTP response caching
- **Compression**: Gzip/Brotli enabled

## 🌐 Internationalization (i18n)

Support for multiple languages (future enhancement):
```typescript
// Add to app.module.ts
import { TranslateModule } from '@ngx-translate/core';
```

## 🤝 Contributing

1. Create feature branch
2. Follow code style guidelines
3. Write tests
4. Submit pull request

## 📄 License

Copyright © 2025 National University of Science and Technology

## 👥 Authors

**Munashe Keith Gandari** - N02220242W  
National University of Science and Technology

**Supervisor**: Dr. S.S Dube

## 🆘 Support

For issues and questions:
- Email: support@certchain.edu.zw
- Documentation: https://docs.certchain.edu.zw

---

**Built with ❤️ using Angular + PrimeNG + Blockchain + AI**
