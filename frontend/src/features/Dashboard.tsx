import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import WeeklyProgressChart from "../components/ui/WeeklyProgressChart";
import MonthlyProgressChart from "../components/ui/MonthlyProgrerssCharts";
import Header from "../components/ui/Header";
import { useSearch } from "../context/SearchContext";
import NotificationDropdown from "../components/ui/NotificationDropdown"; // Ya lo tienes en el Header
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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
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
      {/* Header con notificaciones */}
      <div className="col-span-full flex items-center justify-between mb-4">
        <Header />
      </div>

      {/* Tarjeta de resumen */}
      {/* Tarjeta de resumen */}
      <div className="lg:col-span-2 bg-gradient-to-br from-[#1e1e1e] to-[#111] p-6 rounded-xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <BookmarkCheck className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Resumen general</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#2c2c2c] outline-2 outline-blue-400 rounded-lg p-4 shadow-inner border border-white/5">
            <p className="text-sm text-gray-400 mb-1">Total tareas</p>
            <p className="text-3xl font-extrabold text-blue-400">{total}</p>
          </div>
          <div className="bg-[#2c2c2c] outline-2 outline-green-400 rounded-lg p-4 shadow-inner border border-white/5">
            <p className="text-sm text-gray-400 mb-1">Completadas</p>
            <p className="text-3xl font-extrabold text-green-400">{completed}</p>
          </div>
          <div className="bg-[#2c2c2c] outline-2 outline-yellow-400 rounded-lg p-4 shadow-inner border border-white/5">
            <p className="text-sm text-gray-400 mb-1">En progreso</p>
            <p className="text-3xl font-extrabold text-yellow-400">{inProgress}</p>
          </div>
          <div className="bg-[#2c2c2c] outline-2 outline-red-400 rounded-lg p-4 shadow-inner border border-white/5">
            <p className="text-sm text-gray-400 mb-1">Pendientes</p>
            <p className="text-3xl font-extrabold text-red-400">{pending}</p>
          </div>
        </div>
      </div>



      {/* Gráfico de línea semanal */}
      <div className="lg:col-span-2">
        <WeeklyProgressChart />
      </div>

      {/* Gráfico radial mensual */}
      <div className="lg:col-span-2">
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
                className="bg-gradient-to-br from-[#232323] to-[#1a1a1a] p-5 rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between gap-2"
              >
                <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>

                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.status === "completado"
                      ? "bg-green-500/10 text-green-400 border border-green-400/20"
                      : task.status === "en progreso"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-400/20"
                        : "bg-red-500/10 text-red-400 border border-red-400/20"
                      }`}
                  >
                    {task.status}
                  </span>

                  <span className="text-gray-400 ml-auto text-xs">
                    {task.due_date?.split("T")[0] || "Sin fecha"}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div
                    className={`h-full rounded-full ${task.progress === 100
                      ? "bg-green-400"
                      : task.progress! >= 50
                        ? "bg-yellow-400"
                        : "bg-red-400"
                      }`}
                    style={{ width: `${task.progress !== undefined ? task.progress : 0}%`, }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400">Progreso: {task.progress}%</p>
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>

            ))}

            {/* Botón agregar tarea */}
            <div
              onClick={() => setOpen(true)}
              className=" hover:from-white/20 hover:to-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:bg-white/5 "
              style={{ minHeight: "150px" }}
            >
              <span className="text-white/80 text-sm font-medium">+ Agregar tarea</span>
            </div>

            {/* Modal para crear tarea */}
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
          </div>
        )}
      </div>



      {/* Dropdown de notificaciones */}
      <NotificationDropdown
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onStatusChange={setHasUnreadNotifications}
      />

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
