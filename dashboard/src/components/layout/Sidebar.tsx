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
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen w-64 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shrink-0 bg-sidebar-bg text-sidebar-text
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-white">
                LOGO
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-sidebar-text-muted"
            >
              <X size={24} />
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "bg-transparent text-sidebar-text-muted hover:bg-sidebar-hover-bg hover:text-white"
                    }
                  `}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          {/* User Profile / Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold hover:cursor-pointer">
                AD
              </button>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-sidebar-text-muted">
                  admin@sesamum.com
                </p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-500 transition-colors hover:cursor-pointer hover:bg-red-50">
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
