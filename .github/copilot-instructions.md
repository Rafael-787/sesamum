# Sesamum Project - AI Coding Agent Instructions

## Project Overview

**Sesamum** is a staff credentialing application for event management. Core features:

- **User Roles**: Admin (full platform control), Company (production/service company staff), Control (check-in/out operators)
- **Core Workflow**: Event/project management → Staff assignment → Check-in/out tracking → Reporting
- **Architecture**: Django REST Framework backend (`backend/`) + React 19 SPA frontend (`dashboard/`)
- **Authentication**: JWT tokens (15min access, 7day refresh) with sessionStorage (default) + localStorage (remember me)

## Application Data Schema

### 1. Entidades Principais

#### `Company`

- **id** (PK)
- **name** (CharField)
- **cnpj** (CharField, UNIQUE)

#### `User`

- **id** (PK)
- **name** (CharField)
- **email** (EmailField, UNIQUE)
- **password** (hashed)
- **role** (CharField: `admin`, `company`, `control`)
- **company_id** (FK → Company, nullable for admin users)
- **created_at**, **updated_at** (timestamps)

#### `Staff`

- **id** (PK)
- **name** (CharField)
- **cpf** (CharField, UNIQUE)
- **company_id** (FK → Company)
- **created_at**, **updated_at** (timestamps)

### 2. Gestão de Projetos e Eventos

#### `Project`

- **id** (PK)
- **name** (CharField)
- **status** (CharField: `aberto`, `finalizado`)
- **company_id** (FK → Company, the project owner)
- **created_at**, **updated_at** (timestamps)

#### `Event`

- **id** (PK)
- **name** (CharField)
- **date_begin** (DateTimeField)
- **date_end** (DateTimeField)
- **status** (CharField: `open`, `close`)
- **project_id** (FK → Project)
- **created_at**, **updated_at** (timestamps)

### 3. Tabelas de Ligação (Relacionamentos)

#### `EventCompany`

- **id** (PK)
- **role** (CharField: `production`, `service` - company's role in this specific event)
- **event_id** (FK → Event)
- **company_id** (FK → Company)
- **created_at**, **updated_at** (timestamps)

#### `EventUser`

- **id** (PK)
- **user_id** (FK → User)
- **event_id** (FK → Event)
- **created_at**, **updated_at** (timestamps)

#### `EventStaff`

- **id** (PK)
- **event_id** (FK → Event)
- **staff_id** (FK → Staff)
- **created_at**, **updated_at** (timestamps)

### 4. Operacional

#### `Check`

- **id** (PK)
- **action** (CharField: `check-in`, `check-out`)
- **timestamp** (DateTimeField, auto-set to now)
- **event_staff_id** (FK → EventStaff)
- **user_control_id** (FK → User, the operator performing the check)

## Backend Structure (`backend/`)

### Django Setup

- **Project name**: `api` (root config)
- **App**: `v1` (versioned API endpoints - use v2+ for breaking changes)
- **Database**: MySQL (credentials via `.env`)
- **Settings**: `api/settings.py` (requires env variables: SECRET*KEY, ALLOWED_HOSTS, DEBUG, DB*\*)

### Models Implementation (`v1/models.py`)

Define 8 models as per schema above:

1. **Company** - UNIQUE constraint on cnpj
2. **User** - Custom user model or extend Django User; UNIQUE email
3. **Staff** - UNIQUE constraint on cpf; FK to Company
4. **Project** - status choices (aberto/finalizado); FK to Company
5. **Event** - status choices (open/close); FK to Project
6. **EventCompany** - role choices (production/service); FKs to Event + Company
7. **EventStaff** - FKs to Event + Staff
8. **Check** - action choices (check-in/check-out); FKs to EventStaff + User

**Manager Methods**:

- `User.objects.by_role(role)` - filter users by role
- `Event.objects.for_user(user)` - get events visible to user (all if admin, filtered by company/EventCompany if company/control)
- `Staff.objects.by_company(company)` - get staffs of a company
- `EventStaff.objects.for_event(event)` - get all event staffs

### Serializers (`v1/serializers.py`)

Create serializers for each model:

- **CompanySerializer** - Full: id, name, cnpj
- **UserSerializer** - Full: id, name, email, role, company_id; Nested company (CompanySerializer)
- **StaffSerializer** - Full: id, name, cpf, company_id
- **StaffMinimalSerializer** - Minimal: id only (used for production company visibility to service staff)
- **ProjectSerializer** - Full: id, name, status, company_id, event_count
- **EventSerializer** - Full: id, name, date_begin, date_end, status, project_id; Nested companies (EventCompanySerializer)
- **EventCompanySerializer** - Full: id, role, event_id, company_id
- **EventStaffSerializer** - Full: id, event_id, staff_id, check_status (computed from latest Check)
- **CheckSerializer** - Full: id, action, timestamp, event_staff_id, user_control_id

### Views/Viewsets (`v1/views.py`)

- **TokenObtainPairView** (POST `/v1/token/`) - Email + password → JWT tokens + user role + company_id
- **TokenRefreshView** (POST `/v1/token/refresh/`) - Refresh token → new access token
- **CompanyViewSet** (GET, POST, PATCH, DELETE) - Admin only; search by name/cnpj
- **UserViewSet** (GET, POST, PATCH, DELETE) - Admin only; search by email/name
- **StaffViewSet** (GET, POST, PATCH, DELETE) - Admin views all; company users see own; search by cpf/name
- **ProjectViewSet** (GET, POST, PATCH, DELETE) - Admin only
- **EventViewSet** (GET, POST, PATCH, DELETE) - Admin full access; company/control see filtered by user role
- **EventCompanyViewSet** (GET, POST, PATCH, DELETE) - Admin/company manage assignments
- **EventStaffViewSet** (GET, POST, DELETE) - Service companies insert; admin/control view all
- **CheckViewSet** (GET, POST) - Control users register checks; filtered by event/user

**Permission Classes**:

- `IsAdmin` - user.role == 'admin'
- `IsCompany` - user.role == 'company'
- `IsControl` - user.role == 'control'
- `CanViewStaff` - Admin sees all; company sees only own company staffs; control sees all
- `CanRegisterCheck` - Control role only

### URL Routing (`api/urls.py`)

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('v1/', include(v1_urls)),  # v1_urls defined in v1/urls.py
]

# v1/urls.py:
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'users', UserViewSet)
# ... register all viewsets
urlpatterns = [
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
] + router.urls
```

### Settings Configuration (`api/settings.py`)

- Add to INSTALLED_APPS: `'rest_framework'`, `'corsheaders'`, `'rest_framework_simplejwt'`, `'v1'`
- Configure REST_FRAMEWORK settings:
  ```python
  REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES': (
          'rest_framework_simplejwt.authentication.JWTAuthentication',
      ),
      'DEFAULT_PERMISSION_CLASSES': [
          'rest_framework.permissions.IsAuthenticated',
      ],
  }
  ```
- Configure JWT:
  ```python
  from datetime import timedelta
  SIMPLE_JWT = {
      'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
      'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
  }
  ```
- Add CORS_ALLOWED_ORIGINS from `.env` to allow React origin
- Load SECRET*KEY, DEBUG, ALLOWED_HOSTS, DB*\* from environment variables

### Environment Variables (`.env`)

```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=django.db.backends.mysql
DB_NAME=sesamum
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Requirements (Backend Dependencies)

```
Django==6.0
djangorestframework==3.14
djangorestframework-simplejwt==5.3
django-cors-headers==4.3
mysqlclient==2.2
python-decouple==3.8
```

## Frontend Structure (`dashboard/`)

### Tech Stack

- React 19 with TypeScript 5.9
- Vite 7 for bundling
- **Tailwind CSS** - Utility-first styling (no UI framework)
- Axios for API communication
- React Router for navigation

### Dependencies to Add

```json
{
  "axios": "^1.x",
  "react-router-dom": "^7.x",
  "tailwindcss": "^4.x",
  "lucide-react": "^latest"
}
```

### Folder Structure

```
dashboard/src/
├── api/
│   ├── client.ts          // Axios instance with JWT interceptor
│   ├── auth.ts            // Login, refresh, logout endpoints
│   ├── events.ts          // Event CRUD operations
│   ├── staffs.ts          // Staff CRUD operations
│   ├── companies.ts       // Company operations (admin)
│   ├── projects.ts        // Project operations (admin)
│   ├── checks.ts          // Check-in/out operations
│   └── users.ts           // User management (admin)
├── components/
│   ├── layout/
│   │   ├── Sidebar-page.tsx       // Navigation sidebar (responsive)
│   │   ├── Header-page.tsx        // Top header with user profile
│   │   └── ProtectedRoute-page.tsx // Route guard for auth
│   ├── shared/
│   │   ├── StatCard-page.tsx      // Dashboard metric cards
│   │   ├── EventCard-page.tsx     // Event display card
│   │   ├── StaffCard-page.tsx     // Staff display card
│   │   └── Toast-page.tsx         // Notification component
│   └── *.tsx files follow naming: ComponentName-page.tsx
├── context/
│   └── AuthContext-page.tsx       // JWT token & user context
├── hooks/
│   ├── use-auth.ts                // useAuth() - access auth context
│   ├── use-api.ts                 // useApi() - common fetch logic
│   └── use-local-storage.ts       // useLocalStorage() - remember me
├── pages/
│   ├── Login-page.tsx             // Email/password + "remember me"
│   ├── Dashboard-page.tsx         // Role-based stats & overview
│   ├── Events-page.tsx            // Event list (filtered by role)
│   ├── Projects-page.tsx          // Project management (admin only)
│   ├── Companies-page.tsx         // Company registry (admin only)
│   ├── Staffs-page.tsx            // Staff management (role-filtered)
│   └── CheckIn-page.tsx           // Manual staff ID/CPF input for check-in/out
├── types/
│   └── index.ts                   // TypeScript interfaces matching backend
├── App.tsx                        // Main router & layout wrapper
├── main.tsx                       // Entry point
└── index.css                      // Tailwind imports

Naming Convention:
- React Components: ComponentName-page.tsx
- Utilities/Services: kebab-case.ts (e.g., auth-service.ts, api-client.ts)
- Hooks: use-feature-name.ts
```

### Types Definition (`src/types/index.ts`)

```typescript
export interface Company {
  id: number;
  name: string;
  cnpj: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "company" | "control";
  company_id?: number;
}

export interface Staff {
  id: number;
  name: string;
  cpf: string;
  company_id: number;
}

export interface Event {
  id: number;
  name: string;
  date_begin: string;
  date_end: string;
  status: "open" | "close";
  project_id: number;
  companies?: EventCompany[];
}

export interface EventCompany {
  id: number;
  role: "production" | "service";
  event_id: number;
  company_id: number;
}

export interface EventStaff {
  id: number;
  event_id: number;
  staff_id: number;
}

export interface Check {
  id: number;
  action: "check-in" | "check-out";
  timestamp: string;
  event_staff_id: number;
  user_control_id: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}
```

### Authentication Flow

**Login Page** (`Login-page.tsx`):

1. User enters email + password
2. Submit to `/v1/token/` endpoint
3. Receive access + refresh tokens + user role
4. Store access token in **sessionStorage** (cleared on browser close)
5. If "remember me" checked: store refresh token in **localStorage** (persists across sessions)
6. Redirect to Dashboard

**Auto Token Refresh** (`api/client.ts`):

1. Axios interceptor catches 401 responses
2. If refresh token in localStorage: request new access token from `/v1/token/refresh/`
3. Retry original request with new access token
4. If no refresh token or refresh fails: redirect to login

**Logout**:

- Clear sessionStorage (access token)
- Clear localStorage (refresh token)
- Redirect to Login page

### AuthContext (`context/AuthContext-page.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

### API Client (`api/client.ts`)

```typescript
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000/v1",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: add JWT token
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 & token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // Attempt refresh...
      } else {
        // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default client;
```

### Role-Based Pages Behavior

**Admin Dashboard**:

- Stats: total users, total companies, active events, total staffs
- Navigation: All items visible (Events, Projects, Companies, Users, Staffs, Check-in)
- Events: can create, edit, delete; assign companies; view all staffs with full details

**Company Dashboard**:

- Stats: assigned events, staffs from own company, total checks
- Navigation: Events, Staffs (own company), Check-in (if control role in EventCompany)
- Events: see only assigned events; view staffs of service companies (minimal view: id + status only if role=production)
- Staffs: see only own company staffs; can add staffs (if role=service in EventCompany)

**Control Dashboard**:

- Stats: assigned events, total checks today
- Navigation: Check-in only
- Check-in: input staff ID/CPF; toggle check-in/out; confirm timestamp

### Component Patterns

**Protected Route** (`ProtectedRoute-page.tsx`):

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

**useApi Hook** (`hooks/use-api.ts`):

```typescript
const { data, loading, error } = useApi("/events", "GET");
```

**Tailwind Usage**:

- Always use Tailwind classes for styling (no inline styles)
- Mobile-first: design for mobile, use `md:`, `lg:` for larger screens
- Example: `className="p-4 md:p-6 lg:p-8"`

**CSS Variables for All Visual Properties**:

- All shared/layout components (e.g., Sidebar, PageHeader, PageContainer, ListToolbar, buttons, inputs) **must use CSS variables** for all visual properties (colors, backgrounds, borders, radii, spacing, shadows, font sizes, etc).
- Define all variables in `src/index.css` under `:root` (and optionally for themes/dark mode).
- Example in `index.css`:
  ```css
  :root {
    --color-primary: #2563eb;
    --color-secondary: #64748b;
    --sidebar-bg: #0f172a;
    --toolbar-bg: #fff;
    --input-bg: #f8fafc;
    --button-bg: var(--color-primary);
    --header-title-size: 2rem;
    --container-radius: 1.5rem;
    /* ...see file for full list... */
  }
  ```
- **Never hardcode colors, radii, or spacing in component styles**—always use a CSS variable, and add a new one if needed.
- Use inline `style={{ ... }}` or Tailwind classes for layout only (flex, grid, gap, etc), but all visual tokens must be variables.
- This enables instant theming, dark mode, and brand customization by overriding variables only.
- Example usage in a component:
  ```tsx
  <div
    style={{
      background: "var(--toolbar-bg)",
      borderRadius: "var(--toolbar-radius)",
      color: "var(--header-title-color)",
    }}
  >
    ...
  </div>
  ```
- **When creating a new component or visual element, always add a variable for any new visual property.**
- Document new variables in `index.css` with comments for clarity.

**Responsive Design - Mobile First**:

- **All components MUST be fully responsive and optimized for mobile devices**
- Design approach: Mobile-first (start with mobile layout, then add styles for larger screens)
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Common responsive patterns:
  - **Navigation**: Hide desktop menu on mobile, use hamburger/collapsible sidebar
  - **Grids**: `grid-cols-1` on mobile → `md:grid-cols-2` → `lg:grid-cols-4` on desktop
  - **Spacing**: `p-4` on mobile → `md:p-6` → `lg:p-8` on desktop
  - **Font sizes**: `text-sm` on mobile → `md:text-base` on desktop
  - **Buttons/Forms**: Full width on mobile → `w-full md:w-auto` on desktop
- Examples:

  ```typescript
  // Grid responsive layout
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

  // Padding responsive
  className = "p-4 sm:p-5 md:p-6 lg:p-8";

  // Hidden on mobile, visible on larger screens
  className = "hidden md:block";

  // Full width on mobile, constrained on desktop
  className = "w-full md:max-w-2xl mx-auto";
  ```

- **Testing requirements**: Verify all pages on mobile devices (320px, 375px, 425px widths) before deployment
- **Touch targets**: Ensure clickable elements have minimum 44px height for mobile users
- **Avoid**: Horizontal scrolling, fixed widths, pixel-perfect designs that break on different screen sizes

### Development Commands

```bash
cd dashboard
npm install                  # Install dependencies
npm run dev                  # Start Vite server (http://localhost:5173)
npm run build                # Production build
npm run lint                 # Check ESLint
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

1. Backend infrastructure setup (requirements.txt, settings.py config, .env template)
2. Django models implementation
3. DRF serializers & viewsets with JWT auth
4. Frontend folder structure & TypeScript types
5. Authentication context & login page
6. Protected routes & layout components (Sidebar, Header)

### Phase 2: Core Features (Weeks 3-4)

1. Dashboard page (role-based stats)
2. Events page (filtered by role)
3. Projects page (admin only)
4. Companies page (admin only)
5. Staffs page (role-filtered visibility)
6. API client layer with interceptors

### Phase 3: Operational Features (Weeks 5-6)

1. Check-in/out page (manual staff ID input)
2. Form validation & error handling
3. Toast notifications for feedback
4. Basic UI refinement with Tailwind

### Phase 4: Polish & Testing (Weeks 7-8)

1. Responsive mobile testing
2. Edge case handling
3. Performance optimization
4. QA & bug fixes

**Deferred to Phase 2+**:

- QR code generation & scanning
- Report export (CSV/PDF)
- Real-time check-in dashboard (WebSocket)
- Advanced filtering & search

## Critical Patterns & Conventions

### File Naming

**Key UI/Frontend Decisions (2025-12-22/23):**

- **CSS Variables for All Visual Properties:**

  - All shared/layout components (Sidebar, PageHeader, PageContainer, ListToolbar, buttons, inputs, etc.) must use CSS variables for all visual properties (colors, backgrounds, borders, radii, spacing, shadows, font sizes, etc.).
  - Variables are defined in `src/index.css` under `:root` and must be used via inline `style={{ ... }}` for all visual tokens. Tailwind classes are used only for layout (flex, grid, gap, etc.).
  - When creating a new component or visual element, always add a variable for any new visual property and document it in `index.css`.
  - This enables instant theming, dark mode, and brand customization by overriding variables only.

- **Reusable Page Skeletons:**

  - All resource pages (Events, Staffs, Companies, Projects, Users) use a common skeleton: `PageHeader`, `ListToolbar` (search, filter, add), and a list/grid area. These are implemented as reusable components.

- **Scrollbar on Hover Only:**

  - The main scrollable content area (e.g., the main `<main>` in App.tsx) must hide the scrollbar by default and only show it on hover, for a cleaner UI. Use a CSS rule like:
    ```css
    .scrollbar-hide::-webkit-scrollbar {
      opacity: 0;
      width: 0;
    }
    .scrollbar-hover:hover::-webkit-scrollbar {
      opacity: 1;
      width: 8px;
    }
    /* Add for Firefox as well */
    ```
  - Apply these classes to the main scrollable container.

- **Theme Support:**

  - All visual tokens are themeable via CSS variables. To create a new theme (e.g., dark mode), override variables in a selector (e.g., `body.dark { ... }`).

- **No Hardcoded Visuals:**

  - Never hardcode colors, radii, or spacing in component styles—always use a CSS variable, and add a new one if needed.

- **Component/Variable Documentation:**
  - All new variables must be documented in `index.css` with comments for clarity.

**File Naming:**

- React Components: `ComponentName-page.tsx` (e.g., `Dashboard-page.tsx`, `CheckIn-page.tsx`)
- Services/Utilities: `kebab-case.ts` (e.g., `auth-service.ts`, `api-client.ts`)
- Hooks: `use-feature-name.ts` (e.g., `use-auth.ts`, `use-api.ts`)
- Types: `types/index.ts` or feature-specific `types/feature.ts`

### API Response Format

All endpoints return:

```json
{
  "id": 1,
  "field": "value",
  "nested_object": { ... },
  "created_at": "2024-12-22T10:00:00Z"
}
```

For lists: array of above objects

### Error Handling

- 400: Validation error - show form errors to user
- 401: Unauthorized - redirect to login, clear tokens
- 403: Forbidden - show "access denied" message
- 500: Server error - show generic error, log to console

### JWT Token Management

- **Access Token**: sessionStorage only (15min expiry)
- **Refresh Token**: localStorage optional (7day expiry, only if "remember me" checked)
- **Logout**: Clear both storage locations
- **Auto Refresh**: Triggered on 401 responses

### Permission Enforcement

- **Backend**: DRF permission classes check user.role
- **Frontend**: UI visibility based on user.role from AuthContext
- **Never trust frontend only** - backend must validate all requests

## Development Environment Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ (for React/Vite)
- MySQL 8.0+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Fill in credentials
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup

```bash
cd dashboard
npm install
npm run dev  # Starts at http://localhost:5173
```

### Database Initialization

MySQL must be running with credentials from `.env`. Create database:

```sql
CREATE DATABASE sesamum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Known Implementation Notes

1. **User Model**: Decide whether to extend Django's User model or use custom. Current plan assumes custom model with email as unique identifier (instead of username).

2. **EventUser Table**: Not heavily used in Phase 1; reserves capacity for future "event-specific users" feature.

3. **Staff Visibility for Production Users**: When company has `production` role in EventCompany, they see other companies' service staff as minimal data (id + check-in status only). Implement via `StaffMinimalSerializer` with filtered queryset in viewset.

4. **Report Generation**: Deferred to Phase 2. When implemented, use Django Q objects to filter checks by event/date range, serialize to CSV, and return as file download.

5. **QR Code Feature**: Deferred to Phase 2. Will require `qrcode` library on backend, `jsqr` or `react-qr-scanner` on frontend.

## File Examples & Reference

- **UI Mockup**: [.example](../.example) - Reference design with component examples
- **Django Settings Template**: [backend/api/settings.py](../backend/api/settings.py)
- **Frontend Config**: [dashboard/vite.config.ts](../dashboard/vite.config.ts)
