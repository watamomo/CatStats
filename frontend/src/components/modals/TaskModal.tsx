import { useState, useEffect, useRef } from "react";
import { Task } from "../../models/Task";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import axios from "axios";

interface TaskModalProps {
    isVisible: boolean;
    onClose: () => void;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskModal: React.FC<TaskModalProps> = ({
    isVisible,
    onClose,
    tasks,
    setTasks,
}) => {
    const [openedTaskId, setOpenedTaskId] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const token = localStorage.getItem("token");

    const handleTaskToggle = (taskId: string) => {
        setOpenedTaskId(prev => (prev === taskId ? null : taskId));
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    const updateTask = async (id: string, data: Partial<Task>) => {
        try {
            await axios.put(`http://localhost:3000/api/tasks/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks((prev: Task[]) =>
                prev.map((t: Task) => (t.id === id ? { ...t, ...data } : t))
            );
        } catch (err) {
            console.error("Error actualizando tarea:", err);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    ref={modalRef}
                    className="bg-zinc-900 text-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                >
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                        onClick={onClose}
                    >
                        <Icons.X size={22} />
                    </button>

                    <h2 className="text-2xl font-bold mb-6 text-center">Tareas del Día</h2>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 transition-all hover:shadow-lg hover:border-blue-500"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => handleTaskToggle(task.id)}
                                >
                                    <h3 className="text-lg font-semibold">{task.title}</h3>
                                    {openedTaskId === task.id ? (
                                        <Icons.ChevronUp className="text-gray-400" />
                                    ) : (
                                        <Icons.ChevronDown className="text-gray-400" />
                                    )}
                                </div>

                                {openedTaskId === task.id && (
                                    <motion.div
                                        className="mt-4 space-y-4 text-sm text-gray-300"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="space-y-1">
                                            <p><strong className="text-white">Descripción:</strong> {task.description}</p>
                                            <p><strong className="text-white">Contenido:</strong> {task.content}</p>
                                            <p><strong className="text-white">Fecha límite:</strong> {task.due_date}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-300 mb-1">Estado</label>
                                            <select
                                                value={task.status}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value as Task['status'];

                                                    const updates: Partial<Task> = { status: newStatus };

                                                    if (newStatus === "completado" && (task.progress ?? 0) < 100) {
                                                        updates.progress = 100;
                                                    }

                                                    if (newStatus === "pendiente") {
                                                        updates.progress = 0;
                                                    }

                                                    updateTask(task.id, updates);
                                                }}
                                                className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="en progreso">En Progreso</option>
                                                <option value="completado">Completada</option>
                                            </select>

                                        </div>

                                        {task.status === "en progreso" && (
                                            <div>
                                                <label className="block mb-1 text-white">Progreso: {task.progress ?? 0}%</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={task.progress ?? 0}
                                                    onChange={(e) =>
                                                        updateTask(task.id, { progress: Number(e.target.value) })
                                                    }
                                                    className="w-full accent-blue-500 h-2 rounded-lg bg-blue-500/20"
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

};

export default TaskModal;
