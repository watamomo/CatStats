import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const statusOptions = [
  { value: "pendiente", label: "Pendiente", color: "bg-amber-500/20 text-amber-400", bgColor: "bg-amber-500/10" },
  { value: "en progreso", label: "En Progreso", color: "bg-blue-500/20 text-blue-400", bgColor: "bg-blue-500/10" },
  { value: "completado", label: "Completado", color: "bg-emerald-500/20 text-emerald-400", bgColor: "bg-emerald-500/10" }
];

const getStatusColor = (status: string) => {
  const statusObj = statusOptions.find(s => s.value === status);
  return statusObj?.color || "bg-zinc-500/20 text-zinc-400";
};

const getProgressColor = (progress: number) => {
  if (progress === 100) return "bg-emerald-500";
  if (progress >= 75) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-red-500";
};

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
  const [priority, setPriority] = useState("media");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priorityOptions = [
    { value: "baja", label: "Baja", color: "text-green-400", icon: Icons.ArrowDown },
    { value: "media", label: "Media", color: "text-yellow-400", icon: Icons.Minus },
    { value: "alta", label: "Alta", color: "text-red-400", icon: Icons.ArrowUp },
  ];

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
          priority,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
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
      setPriority("media");
      setTags("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Error al crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = () => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const currentPriority = priorityOptions.find(p => p.value === priority);
  const currentStatus = statusOptions.find(s => s.value === status);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="backdrop-blur-lg text-white border-white/10 w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-700/50 bg-zinc-800/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Icons.Plus size={24} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Nueva Tarea</h1>
                  <p className="text-gray-400 text-sm">Crea y configura una nueva tarea</p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white hover:bg-zinc-700 p-2 rounded-lg transition-all duration-200"
                onClick={onClose}
              >
                <Icons.X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <form onSubmit={handleSubmit} className="h-full">
                <div className="grid grid-cols-3 gap-6 p-6 h-full">
                  <div className="space-y-6">
                    <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Icons.FileText className="text-blue-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Información Principal</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Título *
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Título de la tarea"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            placeholder="Descripción breve..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contenido *
                          </label>
                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={6}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            placeholder="Contenido detallado..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Etiquetas
                          </label>
                          <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="frontend, urgente, revisión..."
                          />
                          <p className="text-xs text-gray-400 mt-1">Separa las etiquetas con comas</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800 rounded-xl border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.Flag className={`${currentPriority?.color} size-4`} />
                          <span className="text-gray-300 text-sm font-medium">Prioridad</span>
                        </div>
                        <p className={`font-semibold ${currentPriority?.color}`}>
                          {currentPriority?.label}
                        </p>
                      </div>
                      <div className="bg-zinc-800 rounded-xl border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.Target className="text-green-400 size-4" />
                          <span className="text-gray-300 text-sm font-medium">Estado</span>
                        </div>
                        <p className="text-white font-semibold">{currentStatus?.label}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Icons.Settings className="text-green-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Estado y Configuración</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 font-medium">Estado actual:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 font-medium">Progreso</span>
                            <span className="text-white font-bold text-xl">{progress}%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Estado inicial
                            </label>
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                              {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Prioridad
                            </label>
                            <select
                              value={priority}
                              onChange={(e) => setPriority(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                              {priorityOptions.map((p) => (
                                <option key={p.value} value={p.value}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Fecha límite
                            </label>
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              required
                            />
                          </div>

                          {status === "en progreso" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-3">
                                Progreso inicial
                              </label>
                              <input
                                type="range"
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                min={0}
                                max={100}
                                className="w-full h-2 rounded-lg bg-zinc-600 accent-blue-500 cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {dueDate && (
                      <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Icons.Clock className="text-orange-400" size={20} />
                          <h3 className="text-lg font-semibold text-white">Fecha Límite</h3>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white mb-1">
                            {new Date(dueDate).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                          <p className="text-gray-400">
                            {(() => {
                              const diffDays = getDaysUntilDue();
                              if (diffDays === null) return "";
                              if (diffDays < 0) return `Vencería hace ${Math.abs(diffDays)} días`;
                              if (diffDays === 0) return "Vence hoy";
                              if (diffDays === 1) return "Vence mañana";
                              return `Faltan ${diffDays} días`;
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Icons.Users className="text-purple-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Asignación</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Asignar a grupo
                          </label>
                          <select
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            <option value="">Sin grupo asignado</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {groupId && (
                          <div className="bg-zinc-700/50 rounded-lg p-3 border border-zinc-600/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Icons.Group className="text-blue-400" size={16} />
                              <span className="text-sm font-medium text-white">Grupo seleccionado</span>
                            </div>
                            <p className="text-zinc-300 text-sm">
                              {groups.find(g => g.id === groupId)?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {tags && (
                      <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Icons.Hash className="text-yellow-400" size={20} />
                          <h3 className="text-lg font-semibold text-white">Etiquetas</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tags.split(',').map((tag, index) => {
                            const trimmedTag = tag.trim();
                            return trimmedTag ? (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30"
                              >
                                #{trimmedTag}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Icons.Lightbulb className="text-yellow-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Consejos</h3>
                      </div>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-start gap-2">
                          <Icons.CheckCircle2 className="text-green-400 mt-0.5" size={14} />
                          <span>Usa títulos descriptivos y específicos</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Icons.CheckCircle2 className="text-green-400 mt-0.5" size={14} />
                          <span>Establece fechas límite realistas</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Icons.CheckCircle2 className="text-green-400 mt-0.5" size={14} />
                          <span>Usa etiquetas para organizar mejor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-700/50 bg-zinc-800/50 p-6">
                  {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <Icons.AlertCircle size={16} />
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-zinc-700 hover:text-white transition-all duration-200 font-medium"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Icons.Loader2 className="w-4 h-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Icons.Plus size={16} />
                          Crear Tarea
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateTaskModal;