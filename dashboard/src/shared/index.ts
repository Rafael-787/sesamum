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

// UI Primitives
export { AvatarComponent } from "./components/ui/Avatar";
export { default as Badge } from "./components/ui/Badge";
export { default as Card } from "./components/ui/Card";
export { default as CardHeader } from "./components/ui/Card";
export { default as CardTitle } from "./components/ui/Card";
export { default as CardContent } from "./components/ui/Card";
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
