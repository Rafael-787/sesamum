import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/shared/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { LoadingPage, PrivateRoute, Unauthorized } from "./shared";
import { protectedRoutes } from "./shared/config/routes";

// Lazy load auth pages
const LoginPage = lazy(() => import("@/features/auth/pages/Login"));
const SignUpPage = lazy(() => import("@/features/auth/pages/SignUp"));

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes with layout */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen flex font-sans">
                {/* Sidebar Navigation */}
                <Sidebar
                  isOpen={isSidebarOpen}
                  toggleSidebar={() => setIsSidebarOpen((v) => !v)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Mobile Header */}
                  <header className="md:hidden bg-card-primary border-b border-card-border p-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-sidebar-bg"
                      >
                        <Menu size={24} />
                      </button>
                      {/* Logo or Title */}
                      <h1 className="font-bold text-lg text-sidebar-bg">
                        Sesamum
                      </h1>
                    </div>
                    {/* User Avatar Placeholder */}
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      AD
                    </div>
                  </header>

                  {/* Scrollable Content */}
                  <div className="h-screen bg-sidebar-bg">
                    <main className="bg-maind-bg flex-1 p-4 md:p-8 md:m-4 md:rounded-3xl h-[calc(100vh-64.8px)] md:h-[calc(100vh-32px)] overflow-y-auto">
                      <div className="max-w-7xl mx-auto">
                        <Suspense fallback={<LoadingPage />}>
                          <Routes>
                            {protectedRoutes.map((route) => (
                              <Route
                                key={route.path}
                                path={route.path}
                                element={
                                  <PrivateRoute
                                    allowedRoles={route.allowedRoles}
                                  >
                                    <route.component />
                                  </PrivateRoute>
                                }
                              />
                            ))}
                          </Routes>
                        </Suspense>
                      </div>
                    </main>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
