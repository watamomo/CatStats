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
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [assignedTo, setAssignedTo] = useState(task.assignedUser?.id || "");
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/groups/${task.group_id}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMembers(res.data);
      } catch (err) {
        console.error("Error al obtener miembros del grupo", err);
      }
    };

    if (task.group_id) {
      fetchMembers();
    }
  }, [task.group_id, token]);


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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/tasks/${task.id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error("Error al cargar comentarios", err);
      }
    };
    fetchComments();
  }, [task.id, token]);

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
          assigned_to: assignedTo || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignedUserObj = members.find((m) => m.id === assignedTo) || null;
      task.assignedUser = assignedUserObj;

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

  const handleAddComment = async () => {
    setCommentError("");
    if (!newComment.trim()) {
      setCommentError("El comentario no puede estar vacío");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/api/tasks/${task.id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      setCommentError("Error al enviar el comentario");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente": return "text-yellow-400 bg-yellow-400/10";
      case "en progreso": return "text-blue-400 bg-blue-400/10";
      case "completado": return "text-green-400 bg-green-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-orange-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <AnimatePresence>
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
                <Icons.Edit3 size={24} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard de Tarea</h1>
                <p className="text-gray-400 text-sm">ID: {task.id}</p>
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
                          Asignar a usuario
                        </label>
                        <select
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="">Sin asignar</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name || member.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Calendar className="text-purple-400" size={18} />
                        <span className="text-gray-300 text-sm font-medium">Creada</span>
                      </div>
                      <p className="text-white font-semibold">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-zinc-800 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.User className="text-green-400" size={18} />
                        <span className="text-gray-300 text-sm font-medium">Asignada a</span>
                      </div>
                      <p className="text-white font-semibold">
                        {task.assignedUser
                          ? task.assignedUser.name || task.assignedUser.email
                          : "No asignada"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-zinc-800 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icons.Activity className="text-green-400" size={20} />
                      <h3 className="text-lg font-semibold text-white">Estado y Progreso</h3>
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
                            Cambiar estado
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
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
                          />
                        </div>

                        {status === "en progreso" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Ajustar progreso manualmente
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
                            const today = new Date();
                            const due = new Date(dueDate);
                            const diffTime = due.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays < 0) return `Vencida hace ${Math.abs(diffDays)} días`;
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
                  <div className="bg-zinc-800 rounded-xl border border-white/10 p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <Icons.MessageCircle className="text-purple-400" size={20} />
                      <h3 className="text-lg font-semibold text-white">
                        Comentarios ({comments.length})
                      </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-64">
                      {comments.length === 0 ? (
                        <div className="text-center py-8">
                          <Icons.MessageCircle size={48} className="mx-auto text-gray-600 mb-3" />
                          <p className="text-gray-400">No hay comentarios</p>
                          <p className="text-gray-500 text-sm">Sé el primero en comentar</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-zinc-700/50 rounded-lg p-3 border border-zinc-600/50 hover:bg-zinc-700/70 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <div className={`w-full h-full flex items-center justify-center rounded-full text-white font-bold ${getColorFromName(comment.author)}`}>
                                  {comment.author[0].toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm leading-relaxed">{comment.content}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                  <span className="font-medium text-white/50">{comment.author}</span>
                                  <span>•</span>
                                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3 border-t border-zinc-700 pt-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                      />
                      {commentError && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                          <Icons.AlertCircle size={16} />
                          {commentError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleAddComment}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Icons.Send size={16} />
                        Enviar comentario
                      </button>
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
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Icons.Save size={16} />
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditTaskModal;