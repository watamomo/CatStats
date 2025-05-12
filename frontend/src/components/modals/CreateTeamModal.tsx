import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const iconOptions = ["users", "folder", "tasks", "calendar", "barChart3"];
const defaultColor = "#3B82F6";

function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

function CreateTeamModal({
  open,
  onClose,
  onTeamCreated,
}: {
  open: boolean;
  onClose: () => void;
  onTeamCreated: (group: any) => void;
}) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [icon, setIcon] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/groups",
        {
          name,
          slug: slugify(name),
          color,
          icon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onTeamCreated(response.data.group);
      onClose();
      setName("");
      setColor(defaultColor);
      setIcon("users");
    } catch (err: any) {
      console.error("Error al crear equipo:", err);
      setError(err.response?.data?.msg || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 backdrop-blur-sm"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1c1c1c] text-white w-full max-w-md p-6 rounded-xl shadow-xl relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <Icons.X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Crear nuevo equipo</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300">Nombre del equipo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 placeholder-gray-400"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-300">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded-md border-none"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-300">Icono</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-2 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-semibold"
              >
                {loading ? "Creando..." : "Crear equipo"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateTeamModal;
