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
  ShieldUser,
  ChevronDown,
  ClipboardCheck,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { AvatarComponent } from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import logo from "@/assets/logo.svg";

const allMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    roles: ["admin", "company", "control"],
  },
  {
    id: "projects",
    label: "Projetos",
    icon: Briefcase,
    path: "/projects",
    roles: ["admin", "company", "control"],
  },
  {
    id: "events",
    label: "Eventos",
    icon: Calendar,
    path: "/events",
    roles: ["admin", "company", "control"],
  },
  {
    id: "companies",
    label: "Empresas",
    icon: Building2,
    path: "/companies",
    roles: ["admin", "control"],
  },
  {
    id: "staffs",
    label: "Staffs",
    icon: Users,
    path: "/staffs",
    roles: ["company"],
  },
  {
    id: "users",
    label: "Usuários",
    icon: ShieldUser,
    path: "/users",
    roles: ["admin"],
  },
  {
    id: "checkin",
    label: "Check-in",
    icon: ClipboardCheck,
    path: "/checkin",
    roles: ["admin", "control"],
  },
];

const viewsMode: Array<"admin" | "company" | "control" | "dev"> = [
  "dev",
  "admin",
  "company",
  "control",
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, devRole, isDevMode, setDevRole } = useAuth();

  // Filter menu items based on user role (or devRole in dev mode)
  const effectiveRole = devRole || user?.role;
  const menuItems = allMenuItems.filter(
    (item) =>
      effectiveRole &&
      (effectiveRole === "dev" || item.roles.includes(effectiveRole)),
  );

  const handleRoleChange = (role: "admin" | "company" | "control" | "dev") => {
    setDevRole(role);
  };

  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  const clearDevMode = () => {
    setDevRole(null);
  };

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
              <img src={logo} alt="Sesamum Logo" className="h-10" />
            </div>
            <button
              onClick={toggleSidebar}
              className="hover:cursor-pointer md:hidden text-sidebar-text-muted"
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
                    transition-all duration-200 hover:cursor-pointer
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
            {/* Dev Mode Indicator */}
            {isDevMode && (
              <>
                <div className="mb-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-500 font-medium">
                    🔧 Modo de Desenvolvimento
                  </p>
                  <button
                    onClick={clearDevMode}
                    className="hover:cursor-pointer text-xs text-yellow-500 underline hover:text-yellow-400 mt-1"
                  >
                    Voltar ao modo normal
                  </button>
                </div>

                {/* Role Selector */}
                <div className="mb-4">
                  <label className="text-xs text-sidebar-text-muted mb-1 block">
                    Testar como:
                  </label>
                  <Select.Root
                    value={devRole || user?.role || "admin"}
                    onValueChange={handleRoleChange}
                  >
                    <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar-hover-bg text-sidebar-text text-sm border border-sidebar-border hover:bg-opacity-80 transition-colors hover:cursor-pointer">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown
                          size={16}
                          className="text-sidebar-text-muted"
                        />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <Select.Viewport className="p-1">
                          {viewsMode.map((mode) => (
                            <Select.Item
                              key={mode}
                              value={mode}
                              className="relative flex items-center px-8 py-2 text-sm text-gray-900 rounded hover:cursor-pointer hover:bg-gray-100 outline-none data-highlighted:bg-gray-100"
                            >
                              <Select.ItemText>{mode}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <button
                className="hover:cursor-pointer"
                onClick={() => navigate(`/staffs/${user?.id}`)}
              >
                <AvatarComponent size={32} alt="Admin User" />
              </button>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-sidebar-text-muted">
                  admin@sesamum.com
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-500 transition-colors hover:cursor-pointer hover:bg-red-50"
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
