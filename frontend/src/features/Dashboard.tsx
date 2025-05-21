import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import WeeklyProgressChart from "../components/ui/WeeklyProgressChart";
import MonthlyProgressChart from "../components/ui/MonthlyProgrerssCharts";
import Header from "../components/ui/Header";
import { useSearch } from "../context/SearchContext";
import NotificationDropdown from "../components/ui/NotificationDropdown";
import EditTaskModal from "../components/modals/EditTaskModal";
import { BookmarkCheck } from "lucide-react";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import { Task } from "../models/Task";

function Dashboard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { query } = useSearch();
  const [open, setOpen] = useState(false);
  const [_hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const openEditModal = (task: Task) => setEditTask(task);
  const closeEditModal = () => setEditTask(null);


  const filteredTasks = tasks.filter((task) => {
    const q = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      task.status.toLowerCase().includes(q)
    );
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  useEffect(() => {
    const handleTaskCreated = () => {
      fetchTasks();
      fetchNotifications();

    };
    window.addEventListener("taskCreated", handleTaskCreated);
    return () => window.removeEventListener("taskCreated", handleTaskCreated);
  }, []);

  useEffect(() => {
    const handleTaskUpdated = () => {
      fetchTasks();
      fetchNotifications();
    };

    window.addEventListener("taskUpdated", handleTaskUpdated);
    return () => window.removeEventListener("taskUpdated", handleTaskUpdated);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hasUnread = res.data.some((n: any) => !n.read);
      setHasUnreadNotifications(hasUnread);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completado").length;
  const inProgress = tasks.filter((t) => t.status === "en progreso").length;
  const pending = tasks.filter((t) => t.status === "pendiente").length;

  return (
    <motion.div
      className="p-6 text-white grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >

      
      {/* Header */}
      <div className="col-span-full flex items-center justify-between mb-4">
        <Header />
      </div>

      {/* Resumen general */}
      <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookmarkCheck className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Resumen general</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total tareas", value: total, color: "blue" },
            { label: "Completadas", value: completed, color: "green" },
            { label: "En progreso", value: inProgress, color: "yellow" },
            { label: "Pendientes", value: pending, color: "red" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`bg-zinc-800 border border-${color}-400/20 rounded-xl p-4 shadow-inner`}
            >
              <p className="text-sm text-gray-400 mb-1">{label}</p>
              <p className={`text-3xl font-extrabold text-${color}-400`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl p-4">
        <WeeklyProgressChart />
      </div>
      <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl p-4">
        <MonthlyProgressChart />
      </div>

      {/* Tareas activas */}
      <div className="lg:col-span-6">
        <h2 className="text-xl font-bold mb-4 mt-4 text-white">Tareas activas</h2>

        {loading ? (
          <p className="text-gray-400">Cargando tareas...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-zinc-900 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-300 p-5 flex flex-col gap-2"
              >
                <h3 className="text-lg font-bold text-white">{task.title}</h3>

                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.status === "completado"
                        ? "bg-green-400/10 text-green-400 border border-green-400/20"
                        : task.status === "en progreso"
                          ? "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                          : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                      }`}
                  >
                    {task.status}
                  </span>

                  <span className="text-gray-400 ml-auto text-xs">
                    {task.due_date?.split("T")[0] || "Sin fecha"}
                  </span>
                </div>

                <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${task.progress === 100
                        ? "bg-green-400"
                        : task.progress! >= 50
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    style={{
                      width: `${task.progress !== undefined ? task.progress : 0}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                  <p>Progreso: {task.progress}%</p>
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-blue-400 hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}

            {/* Botón agregar tarea */}
            <div
              onClick={() => setOpen(true)}
              className="min-h-[150px] bg-zinc-800/20 border border-dashed border-white/20 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-700/30 transition-all duration-200"
            >
              <span className="text-white/80 text-sm font-medium">+ Agregar tarea</span>
            </div>
          </div>
        )}
      </div>

      {/* Modales y notificaciones */}
      <NotificationDropdown
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onStatusChange={setHasUnreadNotifications}
      />

      {open && (
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
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={closeEditModal}
          onTaskUpdated={() => {
            fetchTasks();
            window.dispatchEvent(new Event("taskUpdated"));
          }}
        />
      )}
    </motion.div>

  );
}

export default Dashboard;
