import { Bell, Search, User, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CreateTaskModal from "../modals/CreateTaskModal";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "../../context/SearchContext";
import NotificationDropdown from "./NotificationDropdown";

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { query, setQuery } = useSearch();
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  return (
    <header className="flex justify-end items-center w-full px-4 py-3 bg-[#1b1b1b] rounded-xl shadow border border-white/10 relative">
      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onTaskCreated={() => {
          if (typeof window !== "undefined") {
            const event = new Event("taskCreated");
            window.dispatchEvent(event);
          }
        }}
      />

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-28 top-1/2 -translate-y-1/2 w-72 bg-[#2a2a2a] border border-white/10 px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg"
          >
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
              placeholder="Buscar tareas..."
            />
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Botón crear tarea */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          Crear
        </button>

        {/* Botón abrir búsqueda */}
        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition"
          title="Buscar tareas"
        >
          <Search size={20} />
        </button>

        {/* Botón notificaciones */}
        <div className="relative">
          <button
            className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition"
            title="Notificaciones"
            onClick={() => setNotifOpen((prev) => !prev)}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          <NotificationDropdown
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            onStatusChange={(unread) => setHasUnread(unread)}
          />
        </div>

        {/* Botón perfil */}
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition"
          title="Perfil"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
