import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import { Menu } from "lucide-react";
import EventsPage from "./pages/Events-page";
import ProjectsPage from "./pages/Projects-page";
import CompaniesPage from "./pages/Companies-page";

// Placeholder pages for now
const DashboardPage = () => (
  <div className="p-4">Dashboard (conteúdo em breve)</div>
);

const UsersPage = () => <div className="p-4">Usuários (conteúdo em breve)</div>;

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-600"
              >
                <Menu size={24} />
              </button>
              <h1 className="font-bold text-lg text-slate-800">Sesamum</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </header>

          {/* Scrollable Content */}
          <div
            className="h-screen"
            style={{
              background: "var(--sidebar-bg)",
            }}
          >
            <main
              className="flex-1 p-4 md:p-8 md:m-4 md:rounded-3xl h-[calc(100vh-64.8px)] md:h-[calc(100vh-32px)] overflow-y-auto"
              style={{
                background: "var(--color-main-bg)",
              }}
            >
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/events" element={<EventsPage />} />
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
