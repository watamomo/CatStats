import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, UserPlus } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: "comment" | "team_created" | "user_added";
  read: boolean;
}

const iconMap = {
  comment: <MessageCircle size={16} className="text-blue-400" />,
  team_created: <Users size={16} className="text-green-400" />,
  user_added: <UserPlus size={16} className="text-yellow-400" />,
};

const NotificationDropdown = ({
  open,
  onClose,
  onStatusChange,
}: {
  open: boolean;
  onClose: () => void;
  onStatusChange: (hasUnread: boolean) => void;
}) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      const hasUnread = res.data.some((n: Notification) => !n.read);
      onStatusChange(hasUnread);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:3000/api/notifications/mark-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
      onStatusChange(false);
    } catch (err) {
      console.error("Error al marcar como leídas:", err);
    }
  };

  useEffect(() => {
    if (open && token) fetchNotifications();
  }, [open, token]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("notificationCreated", handleNotificationUpdate);

    return () => {
      window.removeEventListener("notificationCreated", handleNotificationUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[4.5vh] right-0 w-72 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-lg p-4 z-50"
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-white">Notificaciones</h4>
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-400 hover:underline"
            >
              Marcar todas como leídas
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay notificaciones nuevas.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-2 text-sm text-white">
                  {iconMap[n.type]}
                  <span className={n.read ? "text-gray-400" : "font-semibold"}>
                    {n.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
