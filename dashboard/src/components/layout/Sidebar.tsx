import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Building2,
  LogOut,
  X,
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "projects", label: "Projetos", icon: Briefcase, path: "/projects" },
  { id: "events", label: "Eventos", icon: Calendar, path: "/events" },
  { id: "companies", label: "Empresas", icon: Building2, path: "/companies" },
  { id: "users", label: "Usuários", icon: Users, path: "/users" },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen w-64 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shrink-0
        `}
        style={{
          background: "var(--sidebar-bg)",
          color: "var(--sidebar-text)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div
            className="p-6 flex items-center justify-between"
            //style={{ borderBottom: "1px solid var(--sidebar-border)" }}
          >
            <div>
              <h1
                className="text-xl font-bold bg-clip-text text-transparent"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-primary), #6366f1)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Sesamum
              </h1>
              <p className="text-xs" style={{ color: "var(--sidebar-muted)" }}>
                Staff Credentialing
              </p>
            </div>
            <button
              onClick={toggleSidebar}
              className="md:hidden"
              style={{ color: "var(--sidebar-muted)" }}
            >
              <X size={24} />
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                style={{
                  background:
                    location.pathname === item.path
                      ? "var(--sidebar-active-bg)"
                      : "transparent",
                  color:
                    location.pathname === item.path
                      ? "#fff"
                      : "var(--sidebar-muted)",
                  boxShadow:
                    location.pathname === item.path
                      ? "var(--sidebar-shadow)"
                      : undefined,
                  transition: "background 0.2s, color 0.2s",
                  cursor: "pointer",
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium`}
                onMouseOver={(e) => {
                  if (location.pathname !== item.path) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--sidebar-hover-bg)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }
                }}
                onMouseOut={(e) => {
                  if (location.pathname !== item.path) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--sidebar-muted)";
                  }
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          {/* User Profile / Logout */}
          <div
            className="p-4"
            style={{ borderTop: "1px solid var(--sidebar-border)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold hover:cursor-pointer"
                style={{ background: "#6366f1", color: "#fff" }}
              >
                AD
              </button>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p
                  className="text-xs"
                  style={{ color: "var(--sidebar-muted)" }}
                >
                  admin@sesamum.com
                </p>
              </div>
            </div>
            <button
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors hover:cursor-pointer"
              style={{ color: "var(--color-error)" }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#fee2e2";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
