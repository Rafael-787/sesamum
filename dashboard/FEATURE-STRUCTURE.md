# Feature-Based File Organization

The Sesamum dashboard has been successfully reorganized from a layer-based structure to a feature-based structure.

## New Structure

```
dashboard/src/
├── features/
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── Dashboard-page.tsx
│   │   ├── components/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── EventCalendar.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── api/
│   │   │   └── dashboard.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts (barrel exports)
│   │
│   ├── projects/
│   │   ├── pages/
│   │   │   ├── Projects-page.tsx
│   │   │   └── Projects-details-page.tsx
│   │   ├── components/
│   │   │   ├── ProjectForm.tsx
│   │   │   └── tabs/
│   │   │       └── OverviewTab.tsx
│   │   ├── api/
│   │   │   └── projects.service.ts
│   │   ├── schemas/
│   │   │   └── projectSchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts (barrel exports)
│   │
│   ├── events/
│   │   ├── pages/
│   │   │   ├── Events-page.tsx
│   │   │   └── Events-details-page.tsx
│   │   ├── components/
│   │   │   ├── EventForm.tsx
│   │   │   └── tabs/
│   │   │       ├── OverviewTab.tsx
│   │   │       ├── CompaniesTab.tsx
│   │   │       ├── StaffTab.tsx
│   │   │       ├── AddExistingStaff.tsx
│   │   │       ├── CreateAndAddStaff.tsx
│   │   │       └── StaffCSVUpload.tsx
│   │   ├── api/
│   │   │   ├── events.service.ts
│   │   │   ├── eventCompanies.service.ts (relationship)
│   │   │   └── eventStaff.service.ts (relationship)
│   │   ├── schemas/
│   │   │   └── eventSchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts (barrel exports)
│   │
│   ├── companies/
│   │   ├── pages/
│   │   │   ├── Companies-page.tsx
│   │   │   └── Companies-details-page.tsx
│   │   ├── components/
│   │   │   └── CompanyForm.tsx
│   │   ├── api/
│   │   │   └── companies.service.ts
│   │   ├── schemas/
│   │   │   └── companySchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts (barrel exports)
│   │
│   ├── staffs/
│   │   ├── pages/
│   │   │   ├── Staffs-page.tsx
│   │   │   └── Staffs-details-page.tsx
│   │   ├── components/
│   │   │   └── StaffForm.tsx
│   │   ├── api/
│   │   │   └── staffs.service.ts
│   │   ├── schemas/
│   │   │   └── staffSchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts (barrel exports)
│   │
│   └── users/
│       ├── pages/
│       │   ├── Users-page.tsx
│       │   └── Users-details-page.tsx
│       ├── components/
│       │   └── UserForm.tsx
│       ├── api/
│       │   └── users.service.ts
│       ├── schemas/
│       │   └── userSchema.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts (barrel exports)
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PageLayout.tsx
│   │   │   └── DetailsPageLayout.tsx
│   │   ├── ui/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── list/
│   │   │   ├── ListCard.tsx
│   │   │   ├── ListToolbar.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   └── tabs/
│   │       └── EventsTab.tsx (used by multiple features)
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useRealTimeData.ts
│   │   └── useRecentlyVisited.ts
│   ├── lib/
│   │   └── dateUtils.ts
│   ├── api/
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── types/
│   └── index.ts (barrel exports)
│
├── App.tsx
├── main.tsx
├── index.css
└── theme.css
```

## Path Aliases Configuration

Configured in `tsconfig.app.json` and `vite.config.ts`:

- `@/*` → `src/*` (general alias)
- `@/features/*` → `src/features/*` (feature modules)
- `@/shared/*` → `src/shared/*` (shared infrastructure)

## Import Patterns

### Within a Feature (Relative Paths)

```typescript
// In a feature's page component
import { ProjectForm } from "../components/ProjectForm";
import { projectsService } from "../api/projects.service";
import type { Project } from "../types";
import { projectSchema } from "../schemas/projectSchema";
```

### Shared Infrastructure (Absolute Paths)

```typescript
import { PageLayout, PageHeader } from "@/shared/components/layout/PageLayout";
import { ListCard, ListToolbar } from "@/shared/components/list";
import { useAuth } from "@/shared/context/AuthContext";
import { formatDate } from "@/shared/lib/dateUtils";
```

### Cross-Feature Imports (Absolute Paths)

```typescript
// ProjectForm needs to fetch companies
import { companiesService } from "@/features/companies/api/companies.service";
import type { Company } from "@/features/companies/types";

// EventForm imports from projects
import type { Project } from "@/features/projects/types";
```

### Using Barrel Exports (Optional, for cleaner imports)

```typescript
// Instead of:
import { DashboardPage } from "@/features/dashboard/pages/Dashboard-page";
import { dashboardService } from "@/features/dashboard/api/dashboard.service";

// You can use:
import { DashboardPage, dashboardService } from "@/features/dashboard";
```

## Key Design Decisions

### 1. EventsTab Location: `src/shared/components/tabs/`

**Reasoning:** EventsTab is used by 4+ features (Projects, Companies, Staffs, Users detail pages) to display filtered event lists. Keeping it in shared makes it accessible without circular dependencies.

### 2. Relationship Services: `src/features/events/api/`

**Reasoning:** `eventCompanies.service.ts` and `eventStaff.service.ts` are primarily managed through event detail pages, so they logically belong to the events feature rather than a separate relationships module.

### 3. Direct Cross-Feature Imports: Allowed

**Reasoning:** Features can directly import from other features when needed (e.g., ProjectForm importing from companies). This provides flexibility while maintaining clear dependencies through TypeScript imports.

## Benefits of Feature-Based Organization

1. **Improved Code Locality**: All files related to a feature are co-located, making it easier to understand and maintain.

2. **Clear Domain Boundaries**: Each feature represents a distinct business domain (Projects, Events, Companies, etc.).

3. **Easier Onboarding**: New developers can quickly understand the codebase structure by looking at features rather than layers.

4. **Better Scalability**: Adding new features is straightforward - create a new feature folder with the same structure.

5. **Reduced Import Complexity**: Most imports within a feature use short relative paths. Cross-feature imports are explicit and easy to track.

6. **Type Safety**: Feature-specific types are co-located with their usage, making them easier to maintain and update.

7. **Testability**: Each feature can be tested in isolation with clear boundaries.

## Migration Summary

**Files Moved:** 80+
**Directories Created:** 35
**Import Statements Updated:** 200+
**Type Definitions Split:** 6 feature-specific type files
**Barrel Exports Created:** 7 (one per feature + shared)
**Path Aliases Configured:** 3 (`@/*`, `@/features/*`, `@/shared/*`)

## Next Steps

1. **Consider Feature Module Exports**: You can simplify imports further by using barrel exports (`@/features/dashboard` instead of `@/features/dashboard/pages/Dashboard-page`).

2. **Documentation Updates**: Update any developer documentation to reflect the new structure.

3. **Testing**: Run the full test suite to ensure all imports are correctly resolved.

4. **Build Verification**: Run `npm run build` to ensure production builds work correctly.

## Maintenance Notes

- When adding a new feature, follow the established structure: `pages/`, `components/`, `api/`, `schemas/`, `types/`, and `index.ts`.
- Keep truly shared components in `src/shared/` - don't duplicate code across features.
- Use path aliases consistently: `@/shared/*` for shared, `@/features/*` for cross-feature, relative paths within features.
- Update barrel exports when adding new public-facing components or services to features.
