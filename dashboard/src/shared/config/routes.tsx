import { lazy } from "react";

/**
 * Route configuration with lazy-loaded components and RBAC
 * Roles correspond to the permissions defined in Sidebar.tsx
 *
 * Nested routes (detail pages) inherit parent route permissions
 */

// Lazy-loaded page components
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/Dashboard-page"),
);
const ProjectsPage = lazy(
  () => import("@/features/projects/pages/Projects-page"),
);
const ProjectDetailsPage = lazy(
  () => import("@/features/projects/pages/Projects-details-page"),
);
const EventsPage = lazy(() => import("@/features/events/pages/Events-page"));
const EventsDetailsPage = lazy(
  () => import("@/features/events/pages/Events-details-page"),
);
const CompaniesPage = lazy(
  () => import("@/features/companies/pages/Companies-page"),
);
const CompaniesDetailsPage = lazy(
  () => import("@/features/companies/pages/Companies-details-page"),
);
const StaffsPage = lazy(() => import("@/features/staffs/pages/Staffs-page"));
const StaffsDetailsPage = lazy(
  () => import("@/features/staffs/pages/Staffs-details-page"),
);
const UsersPage = lazy(() => import("@/features/users/pages/Users-page"));
const UsersDetailsPage = lazy(
  () => import("@/features/users/pages/Users-details-page"),
);
const CheckInPage = lazy(() => import("@/features/checkin/pages/CheckIn-page"));

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  allowedRoles: string[];
}

/**
 * Protected routes configuration
 * Matches the role permissions from allMenuItems in Sidebar.tsx
 */
export const protectedRoutes: RouteConfig[] = [
  {
    path: "/",
    component: DashboardPage,
    allowedRoles: ["admin", "company", "control"],
  },
  {
    path: "/projects",
    component: ProjectsPage,
    allowedRoles: ["admin", "company", "control"],
  },
  {
    path: "/projects/:id",
    component: ProjectDetailsPage,
    allowedRoles: ["admin", "company", "control"], // Inherits from parent /projects
  },
  {
    path: "/events",
    component: EventsPage,
    allowedRoles: ["admin", "company", "control"],
  },
  {
    path: "/events/:id",
    component: EventsDetailsPage,
    allowedRoles: ["admin", "company", "control"], // Inherits from parent /events
  },
  {
    path: "/companies",
    component: CompaniesPage,
    allowedRoles: ["admin", "control"],
  },
  {
    path: "/companies/:id",
    component: CompaniesDetailsPage,
    allowedRoles: ["admin", "control"], // Inherits from parent /companies
  },
  {
    path: "/staffs",
    component: StaffsPage,
    allowedRoles: ["company"],
  },
  {
    path: "/staffs/:id",
    component: StaffsDetailsPage,
    allowedRoles: ["company"], // Inherits from parent /staffs
  },
  {
    path: "/users",
    component: UsersPage,
    allowedRoles: ["admin"],
  },
  {
    path: "/users/:id",
    component: UsersDetailsPage,
    allowedRoles: ["admin"], // Inherits from parent /users
  },
  {
    path: "/checkin",
    component: CheckInPage,
    allowedRoles: ["admin", "control"],
  },
];
