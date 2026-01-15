import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import { Menu } from "lucide-react";
import DashboardPage from "./pages/Dashboard-page";
import EventsPage from "./pages/Events-page";
import ProjectsPage from "./pages/Projects-page";
import CompaniesPage from "./pages/Companies-page";
import UsersPage from "./pages/Users-page";
import EventsDetailsPage from "./pages/Events-details-page";
import ProjectDetailsPage from "./pages/Projects-details-page";

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
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
              <h1 className="font-bold text-lg text-sidebar-bg">Sesamum</h1>
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
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route
                    path="/projects/:id"
                    element={<ProjectDetailsPage />}
                  />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventsDetailsPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/users" element={<UsersPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
