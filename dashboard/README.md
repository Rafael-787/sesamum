# Sesamum Dashboard

Event staff credentialing platform dashboard built with React 19, TypeScript, Vite, and Tailwind CSS.

## 🏗️ Architecture

This project uses a **feature-based file organization** structure. Each business domain (Projects, Events, Companies, Staffs, Users, Dashboard) has its own self-contained module with pages, components, API services, schemas, and types.

📚 **Documentation:**

- [**QUICK-REFERENCE.md**](./QUICK-REFERENCE.md) - Quick start guide and cheat sheet
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Visual overview and design patterns
- [**FEATURE-STRUCTURE.md**](./FEATURE-STRUCTURE.md) - Detailed structure documentation
- [**README-MSW.md**](./README-MSW.md) - Mock Service Worker setup guide

## 📁 Project Structure

```
src/
├── features/              # Feature modules (business domains)
│   ├── dashboard/         # Dashboard & analytics
│   ├── projects/          # Project management
│   ├── events/            # Event management
│   ├── companies/         # Company management
│   ├── staffs/            # Staff credentialing
│   └── users/             # User management
│
├── shared/                # Shared infrastructure
│   ├── components/        # Layout, UI, List components
│   ├── context/           # Auth context
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities (dateUtils)
│   └── api/               # API client & endpoints
│
├── App.tsx                # Root app & routing
└── main.tsx               # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool & dev server
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible UI primitives
- **React Router v7** - Routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **MSW** - API mocking

## 📝 Development Guide

### Path Aliases

```typescript
@/features/*     // Feature modules
@/shared/*       // Shared infrastructure
```

### Adding a New Feature

1. Create feature folder: `src/features/[feature-name]/`
2. Add required subdirectories: `pages/`, `components/`, `api/`, `schemas/`, `types/`
3. Create barrel export: `index.ts`
4. Add route in `App.tsx`

See [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) for detailed patterns.

## 🧪 Testing

```bash
# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

Build output goes to `dist/` directory.

## 🔧 Configuration

- **TypeScript:** `tsconfig.json`, `tsconfig.app.json`
- **Vite:** `vite.config.ts`
- **Tailwind:** `tailwind.config.js`, `src/theme.css`
- **ESLint:** `eslint.config.js`

## 📚 Additional Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

## Original Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
