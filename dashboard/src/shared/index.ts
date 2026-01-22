// Shared Components Exports

// Layout
export { default as Sidebar } from "./components/layout/Sidebar";
export { PageContainer, PageHeader } from "./components/layout/PageLayout";
export {
  DetailsPageHeader,
  DetailsPageContainer,
  DetailsInfoSection,
  DetailsTabsContainer,
} from "./components/layout/DetailsPageLayout";

// Routing
export { PrivateRoute } from "./components/routing/PrivateRoute";

// Pages
export { default as Unauthorized } from "./components/layout/Unauthorized";
export { default as NotFound } from "./components/layout/NotFound";

// UI Primitives
export { AvatarComponent } from "./components/ui/Avatar";
export { default as Badge } from "./components/ui/Badge";
export { default as Card } from "./components/ui/Card";
export { default as CardHeader } from "./components/ui/Card";
export { default as CardTitle } from "./components/ui/Card";
export { default as CardContent } from "./components/ui/Card";
export { default as Input } from "./components/ui/Input";
export { default as Autocomplete } from "./components/ui/Autocomplete";
export { default as LoadingPage } from "./components/layout/LoadingPage";
export { Modal } from "./components/ui/Modal";
export { Toast } from "./components/ui/Toast";

// List Components
export { default as ListCard } from "./components/list/ListCard";
export { default as ListToolbar } from "./components/list/ListToolbar";
export { SkeletonLoader } from "./components/list/SkeletonLoader";

// Tabs
export { default as EventsTab } from "./components/tabs/EventsTab";

// Context
export { AuthProvider, useAuth } from "./context/AuthContext";

// Hooks
export { useRealTimeData } from "./hooks/useRealTimeData";
export { useRecentlyVisited } from "./hooks/useRecentlyVisited";
export { useDebounce } from "./hooks/useDebounce";

// Lib
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateToDDMMYYYY,
  formatDateToISO,
  isValidDate,
} from "./lib/dateUtils";

// API
export { apiClient } from "./api/client";
export { ENDPOINTS } from "./api/endpoints";
