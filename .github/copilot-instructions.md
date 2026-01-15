# Sesamum Project – AI Agent Coding Guide

## Overview

Sesamum is an event staff credentialing platform with a Django 6/DRF backend and a React 19/TypeScript dashboard. The system manages projects, events, companies, and staff check-in/out, with strict role-based access and clear separation of admin, company, and control workflows.

## Architecture & Data Flow

- **Backend (`backend/`)**: Django 6.0 + DRF 3.14, MySQL 8.0, JWT auth (simplejwt). All business logic and permissions are enforced server-side. Key models: Company, User, Staff, Project, Event, EventCompany, EventStaff, Check.

  - **API versioning**: All endpoints are under `api/v1/`.
  - **Permissions**: Custom roles (`admin`, `company`, `control`) enforced via DRF permissions. See `v1/views.py` for role logic.
  - **Serializers**: Use `Full` and `Minimal` variants. When exposing staff to a production company, always use `StaffMinimalSerializer`.
  - **Settings**: JWT access (15m), refresh (7d). CORS origins from `.env`.

- **Frontend (`dashboard/`)**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS v4, Radix UI. State via Context API, routing with React Router v7, API via Axios.
  - **Folder structure**: See `src/` for `api/`, `components/`, `context/`, `hooks/`, `pages/`, `types/`.
  - **Styling**: Layout with Tailwind, visuals tailwind tokens in `theme.css`.
  - **Component conventions**: Shared UI in `components/shared/`, layout in `components/layout/`.
  - **Types**: All API data shapes in `types/index.ts` (match backend schema).

## Developer Workflows

- **Backend**:

  - Run: `python manage.py runserver` (from `backend/`)
  - Migrate: `python manage.py makemigrations && python manage.py migrate`
  - Test: `python manage.py test`
  - Environment: Use `.env` for DB and CORS config

- **Frontend**:
  - Dev: `npm run dev` (from `dashboard/`)
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Type-check: `npm run type-check`

## Project-Specific Patterns & Conventions

- **Backend**:

  - All API endpoints are versioned under `/api/v1/`.
  - Use `Minimal` serializers for cross-company data exposure (see `v1/serializers.py`).
  - Permissions are role-based and enforced in `v1/views.py`.
  - Only `admin` can CRUD all; `company` can CRUD own staff; `control` can only check-in/out.

- **Frontend**:
  - API calls are abstracted in `src/api/`.
  - Auth state and logic in `src/context/AuthContext.tsx`.
  - Use Radix UI primitives for all interactive components.
  - All types/interfaces must be defined in `src/types/index.ts` and kept in sync with backend models.
  - Use Context API for global state, avoid Redux.

## Integration & Cross-Component Communication

- **Auth**: JWT tokens managed in frontend context, sent via Axios headers.
- **Event/Staff Assignment**: EventCompany and EventStaff models mediate company/event/staff relationships. See backend `v1/models.py` and frontend `src/types/index.ts`.
- **Check-in/out**: Only `control` users can POST to `CheckViewSet`.

## References

- Backend: `backend/v1/models.py`, `backend/v1/views.py`, `backend/v1/serializers.py`
- Frontend: `dashboard/src/api/`, `dashboard/src/types/index.ts`, `dashboard/src/context/AuthContext.tsx`

---

**For AI agents:**

- Always respect role-based access and serializer conventions.
- When in doubt, check referenced files for patterns.
- Keep backend and frontend types in sync.
- Use project scripts for builds/tests; do not assume defaults.

## Schema de Banco de Dados Simplificado

### 1. Entidades Principais

#### `company`

- **id** (PK)
- **name**
- **cnpj** (Unique)

#### `users`

- **id** (PK)
- **name**
- **email**
- **role** (`admin`, `company`, `control`)
- **company_id** (FK -> `company.id`)
- **created_at** (DateTime - data de credenciamento)

#### `staffs`

- **id** (PK)
- **name**
- **cpf** (Unique)
- **email**
- **company_id** (FK -> `company.id`)
- **created_at** (DateTime - data de credenciamento)

---

### 2. Gestão de Projetos e Eventos

#### `projects`

- **id** (PK)
- **name**
- **status** (`aberto`, `finalizado`)
- **company_id** (FK -> `company.id`)

#### `events`

- **id** (PK)
- **name**
- **date_begin** / **date_end**
- **status** (`open`, `close`)
- **project_id** (FK -> `projects.id`)

---

### 3. Tabelas de Ligação (Relacionamentos)

#### `events_company`

- **id** (PK)
- **role** (`production`, `service`)
- **event_id** (FK -> `events.id`)
- **company_id** (FK -> `company.id`)

#### `events_user`

- **id** (PK)
- **user_id** (FK -> `users.id`)
- **event_id** (FK -> `events.id`)

#### `events_staff`

- **id** (PK)
- **event_id** (FK -> `events.id`)
- **staff_cpf** (FK -> `staffs.cpf`)

---

### 4. Operacional

#### `checks`

- **id** (PK)
- **action** (`check-in`, `check-out`)
- **timestamp**
- **events_staff_id** (FK -> `events_staff.id`)
- **user_control_id** (FK -> `users.id`)
