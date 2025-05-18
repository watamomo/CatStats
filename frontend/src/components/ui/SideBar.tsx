import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home, Calendar, BarChart3, Users, Settings, LogOut,
    Folder, ClipboardList, X
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
        <aside className="w-64 min-h-screen bg-gradient-to-br from-[#0c0c0d] to-[#111112] text-white flex flex-col justify-between p-5 border-r border-white/10 shadow-xl dark:bg-[#111112] dark:border-gray-700">
  <div>
    <h1 className="text-2xl font-bold mb-2 text-center text-blue-500 tracking-tight">
      CatStats
    </h1>


    {user && (
      <div className="text-sm text-center mb-6 text-gray-400">
        Bienvenido, <span className="font-semibold text-white">{user.name}</span>
      </div>
    )}

    <nav className="space-y-1 mb-6">
      <SidebarLink to="/dashboard" icon={Home} label="Dashboard" />
      <SidebarLink to="/calendar" icon={Calendar} label="Calendario" />
      <SidebarLink to="/stats" icon={BarChart3} label="Estadísticas" />
    </nav>

    <div className="mt-8">
      <h2 className="text-xs font-semibold text-gray-500 mb-2 px-1 uppercase tracking-wide">
        Tus equipos
      </h2>
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
                borderLeft: `4px solid ${group.color || "#3B82F6"}`,
              }}
            >
              <Link
                to={`/teams/${group.slug}`}
                className="flex items-center gap-2 text-sm text-white"
              >
                <IconComponent size={18} />
                {group.name}
              </Link>
              <button
                title="Salir del grupo"
                onClick={() => handleLeaveGroup(group.id)}
                className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </nav>

      <button
        onClick={() => setShowCreateModal(true)}
        className="mt-4 w-full text-sm bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-2 px-3 rounded-md"
      >
        + Crear equipo
      </button>
    </div>
  </div>

  <div className="mt-8 space-y-1">
    <SidebarLink to="/settings" icon={Settings} label="Configuración" />
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition px-3 py-2"
    >
      <LogOut size={18} />
      Cerrar sesión
    </button>
  </div>

  {showCreateModal && (
    <AnimatePresence>
      <CreateTeamModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={(newTeam) => setGroups((prev) => [...prev, newTeam])}
      />
    </AnimatePresence>
  )}
</aside>

    );
}

function SidebarLink({
    to,
    icon: Icon,
    label,
}: {
    to: string;
    icon: React.ElementType;
    label: string;
}) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${isActive ? "bg-white/10 text-blue-400" : "hover:bg-white/10"
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </Link>
    );
}

export default Sidebar;
