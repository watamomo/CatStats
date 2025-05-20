import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Calendar, BarChart3, Users, Settings, LogOut,
  Folder, ClipboardList, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchUserGroups } from "../../services/GroupService";
import CreateTeamModal from "../modals/CreateTeamModal";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

interface Group {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  folder: Folder,
  tasks: ClipboardList,
};

function Sidebar() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserGroups(token)
        .then(setGroups)
        .catch((err) => console.error("Error al obtener grupos:", err));
    }
  }, [token]);

  const handleLeaveGroup = async (groupId: string) => {
    if (!token) return;
    const confirm = window.confirm("¿Estás seguro de que quieres salir del grupo?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:3000/api/groups/${groupId}/leave`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (error) {
      console.error("Error al salir del grupo:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`min-h-screen bg-gradient-to-br from-[#0c0c0d] to-[#111112] text-white flex flex-col justify-between border-r border-white/10 shadow-xl transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-2xl font-bold text-blue-500 tracking-tight">
              CatStats
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Usuario */}
        {user && (
          <div
            className={`flex items-center gap-3 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-medium">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}

        {/* Enlaces principales */}
        <nav className="space-y-1">
          <SidebarLink to="/dashboard" icon={Home} label="Dashboard" collapsed={collapsed} />
          <SidebarLink to="/calendar" icon={Calendar} label="Calendario" collapsed={collapsed} />
          <SidebarLink to="/stats" icon={BarChart3} label="Estadísticas" collapsed={collapsed} />
        </nav>

        {/* Equipos */}
        <div className="mt-6">
          {!collapsed && (
            <h2 className="text-xs font-semibold text-gray-500 mb-2 px-1 uppercase tracking-wide">
              Tus equipos
            </h2>
          )}
          <nav className="space-y-1">
            {groups.map((group) => {
              const isActive = location.pathname.includes(group.slug);
              const IconComponent = iconMap[group.icon?.toLowerCase()] || Users;

              return (
                <div
                  key={group.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-md transition ${
                    isActive ? "bg-blue-600/20" : "hover:bg-white/10"
                  }`}
                  style={{
                    borderLeft: collapsed ? "none" : `4px solid ${group.color || "#3B82F6"}`,
                  }}
                >
                  <Link
                    to={`/teams/${group.slug}`}
                    className="flex items-center gap-2 text-sm text-white truncate"
                  >
                    <IconComponent size={18} />
                    {!collapsed && group.name}
                  </Link>
                  {!collapsed && (
                    <button
                      title="Salir del grupo"
                      onClick={() => handleLeaveGroup(group.id)}
                      className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            onClick={() => setShowCreateModal(true)}
            className={`mt-4 text-sm transition rounded-md flex items-center justify-center gap-2 ${
              collapsed
                ? "w-10 h-10 mx-auto p-2 bg-blue-600 hover:bg-blue-700"
                : "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3"
            }`}
          >
            {!collapsed ? "+ Crear equipo" : "+"}
          </button>
        </div>
      </div>

      {/* Configuración y logout */}
      <div className="p-4 space-y-1">
        <SidebarLink to="/settings" icon={Settings} label="Configuración" collapsed={collapsed} />
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition px-3 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTeamModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onTeamCreated={(newTeam) => setGroups((prev) => [...prev, newTeam])}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
        isActive ? "bg-white/10 text-blue-400" : "hover:bg-white/10"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export default Sidebar;
