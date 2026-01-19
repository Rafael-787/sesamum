# Quick Reference: Feature-Based Structure

## 🚀 Quick Start

### Path Aliases

```typescript
@/features/*     // Feature modules (dashboard, projects, events, etc.)
@/shared/*       // Shared infrastructure (components, hooks, utils)
```

### Import Rules

```typescript
// ✅ Same feature → Relative
import { ProjectForm } from "../components/ProjectForm";

// ✅ Shared → Absolute
import { PageLayout } from "@/shared/components/layout/PageLayout";

// ✅ Cross-feature → Absolute
import { Company } from "@/features/companies/types";
```

## 📁 Feature Structure Template

When creating a new feature, follow this structure:

```
features/[feature-name]/
├── pages/
│   ├── [FeatureName]-page.tsx        # List view
│   └── [FeatureName]-details-page.tsx # Detail view
├── components/
│   ├── [FeatureName]Form.tsx         # Create/Edit form
│   └── tabs/                         # Detail page tabs (optional)
│       └── OverviewTab.tsx
├── api/
│   └── [featureName].service.ts      # API service
├── schemas/
│   └── [featureName]Schema.ts        # Zod validation
├── types/
│   └── index.ts                      # Feature-specific types
└── index.ts                          # Barrel exports (optional)
```

## 🔍 Where to Find Things

| Looking for...         | Location                         |
| ---------------------- | -------------------------------- |
| **Page components**    | `features/[name]/pages/`         |
| **Forms**              | `features/[name]/components/`    |
| **API services**       | `features/[name]/api/`           |
| **Validation schemas** | `features/[name]/schemas/`       |
| **Type definitions**   | `features/[name]/types/`         |
| **Layout components**  | `shared/components/layout/`      |
| **UI primitives**      | `shared/components/ui/`          |
| **Reusable lists**     | `shared/components/list/`        |
| **Auth logic**         | `shared/context/AuthContext.tsx` |
| **Date utilities**     | `shared/lib/dateUtils.ts`        |
| **API client config**  | `shared/api/client.ts`           |

## 📋 Common Tasks

### Adding a New Feature Page

1. Create page in `features/[name]/pages/`
2. Import shared components: `@/shared/components/layout/PageLayout`
3. Import feature service: `../api/[name].service`
4. Import feature types: `../types`
5. Add route in `App.tsx`

### Adding a New Form

1. Create schema in `features/[name]/schemas/`
2. Create form component in `features/[name]/components/`
3. Import schema: `../schemas/[name]Schema`
4. Import service: `../api/[name].service`
5. Import shared utilities: `@/shared/lib/dateUtils`

### Adding Cross-Feature Logic

```typescript
// Example: ProjectForm needs companies
import { companiesService } from "@/features/companies/api/companies.service";
import type { Company } from "@/features/companies/types";
```

### Adding a Shared Component

1. Determine category: layout, ui, list, or tabs
2. Create in `shared/components/[category]/`
3. Export in `shared/index.ts` (optional)
4. Use via `@/shared/components/[category]/[ComponentName]`

## 🎯 Feature Domains

| Feature       | Description                       | Key Files                                 |
| ------------- | --------------------------------- | ----------------------------------------- |
| **dashboard** | Home page with metrics & calendar | MetricCard, EventCalendar, RecentActivity |
| **projects**  | Project lifecycle management      | ProjectForm, OverviewTab                  |
| **events**    | Event creation & management       | EventForm, CompaniesTab, StaffTab         |
| **companies** | Company/org management            | CompanyForm                               |
| **staffs**    | Staff credentialing               | StaffForm                                 |
| **users**     | System user management            | UserForm                                  |

## 🔗 Key Dependencies

```
projects → companies (dropdown in ProjectForm)
users → companies (dropdown in UserForm)
staffs → AuthContext (auto-assign company)
events → companies (EventCompaniesTab)
events → staffs (EventStaffTab)

All features → shared (layout, UI, utils)
```

## 🛠️ Development Commands

```bash
# Run dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## 📝 Code Patterns

### Service Pattern

```typescript
// features/[name]/api/[name].service.ts
export const [name]Service = {
  getAll: () => apiClient.get(endpoints.[name].list),
  getById: (id) => apiClient.get(endpoints.[name].detail(id)),
  create: (data) => apiClient.post(endpoints.[name].list, data),
  update: (id, data) => apiClient.put(endpoints.[name].detail(id), data),
  delete: (id) => apiClient.delete(endpoints.[name].detail(id)),
};
```

### Form Pattern

```typescript
// features/[name]/components/[Name]Form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { [name]Schema } from "../schemas/[name]Schema";
import { [name]Service } from "../api/[name].service";

export function [Name]Form({ mode, [name], onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { errors } } =
    useForm({ resolver: zodResolver([name]Schema) });

  const onSubmit = async (data) => {
    if (mode === "create") {
      await [name]Service.create(data);
    } else {
      await [name]Service.update([name].id, data);
    }
    onSuccess();
  };

  // ... form UI
}
```

### Page Pattern

```typescript
// features/[name]/pages/[Name]-page.tsx
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { ListToolbar, ListCard } from "@/shared/components/list";
import { [name]Service } from "../api/[name].service";

export default function [Name]Page() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    [name]Service.getAll().then(res => setItems(res.data));
  }, []);

  return (
    <PageLayout>
      <ListToolbar onAdd={...} />
      {items.map(item => <ListCard key={item.id} {...item} />)}
    </PageLayout>
  );
}
```

## 🚨 Common Issues

### Import Not Found

- ✅ Check if path alias is correct (`@/features/*` or `@/shared/*`)
- ✅ Verify file exists at the expected location
- ✅ Check if using relative vs absolute paths correctly

### Type Errors

- ✅ Import types from `../types` within feature
- ✅ Import cross-feature types: `@/features/[name]/types`
- ✅ Check if types are exported in `types/index.ts`

### Circular Dependencies

- ✅ Avoid feature A importing from feature B that imports from feature A
- ✅ Consider extracting shared types to a common location
- ✅ Use barrel exports carefully

## 📚 Documentation Files

- **FEATURE-STRUCTURE.md** - Detailed structure documentation
- **ARCHITECTURE.md** - Visual overview and patterns
- **QUICK-REFERENCE.md** - This file (cheat sheet)
- **.github/copilot-instructions.md** - AI agent coding guide

## 🎓 Learning Path

1. Read **ARCHITECTURE.md** for visual overview
2. Explore one feature (`features/projects/`) to understand structure
3. Check `shared/` to see available components
4. Review `App.tsx` to see routing
5. Read this **QUICK-REFERENCE.md** as needed

---

**Remember:** When in doubt, look at existing features for patterns! 🎯
