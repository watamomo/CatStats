import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const statusOptions = ["pendiente", "en progreso", "completado"];

function CreateTaskModal({
  open,
  onClose,
  onTaskCreated,
}: {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: (task: any) => void;
}) {
  const { token } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pendiente");
  const [progress, setProgress] = useState(0);
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<any[]>([]);

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
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch (err) {
        console.error("Error al obtener grupos:", err);
      }
    };

    if (token) fetchGroups();
  }, [token]);

  // Ajustar progreso automáticamente al cambiar el estado
  useEffect(() => {
    if (status === "pendiente") setProgress(0);
    if (status === "completado") setProgress(100);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/tasks",
        {
          title,
          description,
          content,
          due_date: dueDate || null,
          progress,
          status,
          group_id: groupId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.dispatchEvent(new Event("taskCreated"));
      window.dispatchEvent(new Event("notificationCreated"));

      if (onTaskCreated) onTaskCreated(res.data.task);

      setTitle("");
      setDescription("");
      setContent("");
      setDueDate("");
      setStatus("pendiente");
      setProgress(0);
      setGroupId("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Error al crear la tarea");
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
            className="bg-[#1c1c1c] text-white w-full max-w-lg p-6 rounded-xl shadow-xl relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <Icons.X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Crear nueva tarea</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 placeholder-gray-400"
                  placeholder="Ej: Maquetar la vista de tareas"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 placeholder-gray-400"
                  placeholder="Resumen breve de la tarea (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300">Contenido</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 placeholder-gray-400"
                  placeholder="Detalles completos o instrucciones"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-300">Fecha límite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-300">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-2 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {status === "en progreso" && (
                <div>
                  <label className="block text-sm text-gray-300">Progreso: {progress}%</label>
                  <input
                    type="range"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full"
                  />
                </div>
              )}

              {status === "pendiente" && (
                <div>
                  <label className="block text-sm text-gray-300">Progreso</label>
                  <input
                    type="range"
                    value={0}
                    disabled
                    className="w-full opacity-50 cursor-not-allowed"
                  />
                </div>
              )}

              {status === "completado" && (
                <div>
                  <label className="block text-sm text-gray-300">Progreso</label>
                  <input
                    type="range"
                    value={100}
                    disabled
                    className="w-full opacity-50 cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-300">Asignar a grupo</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-2 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
                >
                  <option value="">Sin grupo</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-semibold"
              >
                {loading ? "Creando..." : "Crear tarea"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateTaskModal;