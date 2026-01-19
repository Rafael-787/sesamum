# Feature-Based Architecture Overview

## Visual Structure

```
📦 dashboard/src/
│
├── 🎯 features/              # Feature modules (business domains)
│   │
│   ├── 📊 dashboard/         # Dashboard & analytics
│   │   ├── 📄 pages/
│   │   ├── 🧩 components/    # MetricCard, EventCalendar, RecentActivity
│   │   ├── 🔌 api/
│   │   ├── 📐 types/
│   │   └── 📤 index.ts
│   │
│   ├── 📁 projects/          # Project management
│   │   ├── 📄 pages/
│   │   ├── 🧩 components/    # ProjectForm, tabs
│   │   ├── 🔌 api/
│   │   ├── ✅ schemas/
│   │   ├── 📐 types/
│   │   └── 📤 index.ts
│   │
│   ├── 📅 events/            # Event management (core domain)
│   │   ├── 📄 pages/
│   │   ├── 🧩 components/    # EventForm, event detail tabs
│   │   ├── 🔌 api/           # events, eventCompanies, eventStaff services
│   │   ├── ✅ schemas/
│   │   ├── 📐 types/
│   │   └── 📤 index.ts
│   │
│   ├── 🏢 companies/         # Company/organization management
│   │   ├── 📄 pages/
│   │   ├── 🧩 components/    # CompanyForm
│   │   ├── 🔌 api/
│   │   ├── ✅ schemas/
│   │   ├── 📐 types/
│   │   └── 📤 index.ts
│   │
│   ├── 👥 staffs/            # Staff member management
│   │   ├── 📄 pages/
│   │   ├── 🧩 components/    # StaffForm
│   │   ├── 🔌 api/
│   │   ├── ✅ schemas/
│   │   ├── 📐 types/
│   │   └── 📤 index.ts
│   │
│   └── 👤 users/             # System user management
│       ├── 📄 pages/
│       ├── 🧩 components/    # UserForm
│       ├── 🔌 api/
│       ├── ✅ schemas/
│       ├── 📐 types/
│       └── 📤 index.ts
│
├── 🔗 shared/                # Shared infrastructure (cross-cutting)
│   │
│   ├── 🧩 components/
│   │   ├── layout/           # Sidebar, PageLayout, DetailsPageLayout
│   │   ├── ui/               # Avatar, Badge, Card, Modal, Toast
│   │   ├── list/             # ListCard, ListToolbar, SkeletonLoader
│   │   └── tabs/             # EventsTab (used by 4+ features)
│   │
│   ├── 🎭 context/           # AuthContext (global state)
│   ├── 🪝 hooks/             # useRealTimeData, useRecentlyVisited
│   ├── 🛠️ lib/               # dateUtils (utilities)
│   ├── 🌐 api/               # client, endpoints (API infrastructure)
│   ├── 📐 types/             # Shared type utilities (if any)
│   └── 📤 index.ts
│
├── 📱 App.tsx                # Root app & routing
├── 🚀 main.tsx               # App entry point
├── 🎨 theme.css              # Design tokens
└── 🎨 index.css              # Global styles
```

## Dependency Graph

```
┌─────────────┐
│  Dashboard  │ ──────┐
└─────────────┘       │
                      ├──→ Events
┌─────────────┐       │     (for calendar)
│  Projects   │ ──────┤
└─────────────┘       │
                      │
┌─────────────┐       │
│  Companies  │ ──────┤
└─────────────┘       │
                      ├──→ Shared
┌─────────────┐       │     (layout, UI, utils)
│   Staffs    │ ──────┤
└─────────────┘       │
                      │
┌─────────────┐       │
│    Users    │ ──────┘
└─────────────┘

Cross-feature dependencies:
• ProjectForm → Companies (dropdown selection)
• UserForm → Companies (dropdown selection)
• StaffForm → AuthContext (get user's company)
• EventsTab ← Projects, Companies, Staffs, Users (reusable component)
```

## Import Strategy Cheat Sheet

| Scenario          | Pattern        | Example                                                              |
| ----------------- | -------------- | -------------------------------------------------------------------- |
| **Same feature**  | Relative paths | `import { ProjectForm } from "../components/ProjectForm"`            |
| **Shared infra**  | Absolute alias | `import { PageLayout } from "@/shared/components/layout/PageLayout"` |
| **Cross-feature** | Absolute alias | `import { Company } from "@/features/companies/types"`               |
| **Barrel export** | Feature alias  | `import { dashboardService } from "@/features/dashboard"`            |

## Feature Characteristics

### Self-Contained Features

✅ Each feature has its own:

- Pages (views)
- Components (UI specific to the feature)
- API services (backend communication)
- Schemas (validation)
- Types (domain models)
- Barrel exports (public API)

### Shared Infrastructure

✅ Truly reusable across ALL features:

- Layout components (consistent page structure)
- UI primitives (design system components)
- Auth context (global authentication state)
- Hooks (generic utilities)
- Date utilities (formatting, validation)
- API client (Axios configuration)

## When to Add to Features vs. Shared

### Add to `features/[feature-name]/` if:

- ✅ It's specific to one business domain
- ✅ It has domain-specific logic
- ✅ It contains feature-specific types
- ✅ It's a page, form, or detail view

### Add to `shared/` if:

- ✅ It's used by 3+ different features
- ✅ It's a generic UI component
- ✅ It's a utility function
- ✅ It's global state or context
- ✅ It's infrastructure (API client, routing)

## Real-World Usage Examples

### Example 1: Creating a New Project

```typescript
// In Projects-page.tsx (feature-specific)
import { ProjectForm } from "../components/ProjectForm";
import { projectsService } from "../api/projects.service";
import type { Project } from "../types";

// Shared components
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { Modal } from "@/shared/components/ui/Modal";
import { ListCard } from "@/shared/components/list/ListCard";

// Cross-feature (ProjectForm needs companies)
// Inside ProjectForm.tsx:
import { companiesService } from "@/features/companies/api/companies.service";
import type { Company } from "@/features/companies/types";
```

### Example 2: Viewing Event Details

```typescript
// In Events-details-page.tsx
import { EventForm } from "../components/EventForm";
import { eventsService } from "../api/events.service";
import type { Event } from "../types";

// Shared infrastructure
import { DetailsPageLayout } from "@/shared/components/layout/DetailsPageLayout";
import { Badge } from "@/shared/components/ui/Badge";
import { formatDate } from "@/shared/lib/dateUtils";

// Event-specific tabs (within same feature)
import { CompaniesTab } from "../components/tabs/CompaniesTab";
import { StaffTab } from "../components/tabs/StaffTab";
```

### Example 3: Company Detail Page Using EventsTab

```typescript
// In Companies-details-page.tsx
import { CompanyForm } from "../components/CompanyForm";
import { companiesService } from "../api/companies.service";
import type { Company } from "../types";

// Shared components
import { DetailsPageLayout } from "@/shared/components/layout/DetailsPageLayout";
import EventsTab from "@/shared/components/tabs/EventsTab"; // ← Shared across features

// Need events data (cross-feature)
import { eventsService } from "@/features/events/api/events.service";
import type { Event } from "@/features/events/types";
```

## Performance Considerations

### Code Splitting Benefits

- Each feature can be lazy-loaded independently
- Shared components are bundled once and reused
- Better tree-shaking due to clear module boundaries

### Future Optimizations

```typescript
// App.tsx - Potential lazy loading
const DashboardPage = lazy(() => import("@/features/dashboard"));
const ProjectsPage = lazy(() => import("@/features/projects"));
// ... etc
```

## Testing Strategy

### Unit Tests

- Feature-specific: `features/[name]/__tests__/`
- Shared components: `shared/components/__tests__/`

### Integration Tests

- Test cross-feature interactions
- Verify imports resolve correctly
- Ensure services communicate properly

## Conclusion

This feature-based architecture provides:

- 🎯 **Clear organization** by business domain
- 🔍 **Easy navigation** for developers
- 📦 **Better modularity** and encapsulation
- 🚀 **Scalability** for future features
- 🔧 **Maintainability** through separation of concerns
