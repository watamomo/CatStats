import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const statusOptions = ["pendiente", "en progreso", "completado"];

function EditTaskModal({
  task,
  onClose,
  onTaskUpdated,
}: {
  task: any;
  onClose: () => void;
  onTaskUpdated?: () => void;
}) {
  const { token } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [content, setContent] = useState(task.content);
  const [dueDate, setDueDate] = useState(task.due_date?.split("T")[0] || "");
  const [status, setStatus] = useState(task.status);
  const [progress, setProgress] = useState(task.progress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (status === "pendiente") setProgress(0);
    if (status === "completado") setProgress(100);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (status === "completado" && progress < 100) {
      setError("Una tarea completada debe tener progreso al 100%");
      setLoading(false);
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/tasks/${task.id}`,
        {
          title,
          description,
          content,
          due_date: dueDate || null,
          progress,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.dispatchEvent(new Event("taskUpdated"));
      window.dispatchEvent(new Event("notificationCreated"));

      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Error al actualizar la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center px-4"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-zinc-900 text-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative border border-white/10"
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            onClick={onClose}
          >
            <Icons.X size={22} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center">✏️ Editar tarea</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Contenido</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-1">Fecha límite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-1">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {(status === "en progreso" || status === "pendiente" || status === "completado") && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Progreso: {status === "en progreso" ? `${progress}%` : status === "completado" ? "100%" : "0%"}
                </label>
                <input
                  type="range"
                  value={status === "en progreso" ? progress : status === "completado" ? 100 : 0}
                  onChange={(e) => status === "en progreso" && setProgress(Number(e.target.value))}
                  disabled={status !== "en progreso"}
                  min={0}
                  max={100}
                  className={`w-full h-2 rounded-lg bg-blue-500/20 accent-blue-500 ${status !== "en progreso" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-md font-semibold shadow-md"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

}

export default EditTaskModal;