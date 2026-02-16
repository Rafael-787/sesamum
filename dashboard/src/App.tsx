import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/shared/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { LoadingPage, PrivateRoute, Unauthorized, NotFound } from "./shared";
import { protectedRoutes } from "./shared/config/routes";
import { AvatarComponent } from "./shared";
import { useAuth } from "./shared";

// Lazy load auth pages
const LoginPage = lazy(() => import("@/features/auth/pages/Login"));
const SignUpPage = lazy(() => import("@/features/auth/pages/SignUp"));

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Layout wrapper component for protected routes
  const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div className="h-screen w-screen overflow-hidden flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-sidebar-bg">
        {/* Mobile Header */}
        <header className="md:hidden bg-card-primary border-b border-card-border p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-sidebar-bg"
            >
              <Menu size={24} />
            </button>
          </div>
          {/* User Avatar Placeholder */}
          <AvatarComponent alt={user?.name} size={30} />
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="bg-maind-bg flex-1 overflow-y-auto p-4 md:p-8 md:m-4 md:rounded-3xl shadow-sm">
            <div className="max-w-7xl mx-auto min-h-full">
              <Suspense fallback={<LoadingPage />}>{children}</Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes with layout */}
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <LayoutWrapper>
                  <PrivateRoute allowedRoles={route.allowedRoles}>
                    <route.component />
                  </PrivateRoute>
                </LayoutWrapper>
              }
            />
          ))}

          {/* 404 - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
