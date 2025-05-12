import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ClipboardList, Loader2, Plus, Search, Pencil } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import CreateTaskModal from "../components/modals/CreateTaskModal";
import EditTaskModal from "../components/modals/EditTaskModal";
import GroupChat from "../components/ui/GroupChat";
import InviteUserModal from "../components/modals/InviteUserModal";
import { Task } from "../models/Task";


interface Group {
  id: string;
  name: string;
  slug: string;
}

function TeamTasks() {
  const { slug } = useParams();
  const { token } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [openInviteModal, setOpenInviteModal] = useState(false);

  useEffect(() => {
    const fetchGroupAndTasks = async () => {
      try {
        setLoading(true);

        const resGroups = await axios.get("http://localhost:3000/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const foundGroup = resGroups.data.find((g: Group) => g.slug === slug);
        if (!foundGroup) {
          setError("Grupo no encontrado");
          return;
        }
        setGroup(foundGroup);

        const resTasks = await axios.get(
          `http://localhost:3000/api/groups/${foundGroup.id}/tasks`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTasks(resTasks.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos del grupo");
      } finally {
        setLoading(false);
      }
    };

    if (token && slug) fetchGroupAndTasks();
  }, [token, slug]);



  const filteredTasks = tasks.filter((task) => {
    const matchQuery = task.title.toLowerCase().includes(query.toLowerCase());
    const matchFilter =
      filter === "todos" ? true : task.status === filter;
    return matchQuery && matchFilter;
  });

  const completed = tasks.filter((t) => t.status === "completado").length;
  const inProgress = tasks.filter((t) => t.status === "en progreso").length;
  const pending = tasks.filter((t) => t.status === "pendiente").length;
  const total = tasks.length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radialData = [
    {
      name: "Completado",
      value: percentage,
      fill: "#22c55e",
    },
  ];

  if (loading)
    return (
      <div className="p-6 text-white flex items-center gap-2">
        <Loader2 className="animate-spin" /> Cargando tareas del equipo...
      </div>
    );

  if (error)
    return <div className="p-6 text-red-400 font-medium">{error}</div>;

  return (
    <div className="p-6 text-white grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-white flex items-center gap-2">
            <ClipboardList className="text-blue-400" size={24} />
            Tareas del equipo:
            <span className="text-blue-400">{group?.name}</span>
          </h1>

          <div className="flex gap-4">
            <button
              onClick={() => setOpenInviteModal(true)} 
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <Plus size={16} />
              Invitar usuario
            </button>

            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <Plus size={16} />
              Nueva tarea
            </button>
          </div>
        </div>




        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-[#2b2b2b] px-3 py-2 rounded-md border border-white/10 w-full md:w-1/2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent text-sm text-white outline-none w-full"
              placeholder="Buscar tareas..."
            />
          </div>

          <div className="flex gap-2 text-sm">
            {[{ key: "todos", label: "Todos" }, { key: "pendiente", label: "Pendientes" }, { key: "en progreso", label: "En progreso" }, { key: "completado", label: "Completados" }].map(
              ({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-full border text-white transition text-xs cursor-pointer ${filter === key
                    ? "bg-blue-600 border-blue-500"
                    : "bg-[#2b2b2b] border-white/10 hover:bg-white/10"
                    }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  onClick={() => setEditTask(task)}
                  className="text-xs text-blue-400 hover:text-blue-600 transition cursor-pointer"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>

          ))}

          {/* Aquí es donde aparece el botón para agregar tarea */}
          <div
            onClick={() => setCreateOpen(true)}
            className="h-full min-h-[160px] hover:from-white/20 hover:to-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:bg-white/5"

          >
            <span className="text-white/80 text-sm font-medium">+ Agregar tarea</span>
          </div>
        </div>
      </div>


      <div className="flex flex-col gap-6">
        <div className="bg-[#1b1b1d] border border-white/10 rounded-xl p-5 shadow-lg flex flex-col items-center">
          <h2 className="text-lg font-bold text-white mb-4">Resumen de progreso</h2>

          <div className="w-40 h-40 mb-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="100%"
                barSize={12}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white">
              {percentage}%
            </div>
          </div>

          <div className="space-y-2 text-sm w-full">
            <p className="text-gray-300">
              Total tareas: <span className="font-semibold text-white">{total}</span>
            </p>
            <p className="text-green-400">
              Completadas: <span className="font-semibold">{completed}</span>
            </p>
            <p className="text-yellow-400">
              En progreso: <span className="font-semibold">{inProgress}</span>
            </p>
            <p className="text-red-400">
              Pendientes: <span className="font-semibold">{pending}</span>
            </p>
          </div>
        </div>

        {group?.id && <GroupChat groupId={group.id} />}
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onTaskCreated={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("taskCreated"));
          }
        }}
      />

      {group?.id && (
        <InviteUserModal
          open={openInviteModal} // El estado que maneja si el modal está abierto o no
          onClose={() => setOpenInviteModal(false)} // Función para cerrar el modal
          groupId={group.id} // El ID del grupo en el que se va a invitar al usuario
        />
      )}


      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onTaskUpdated={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("taskUpdated"));
            }
          }}
        />
      )}
    </div>
  );
}

export default TeamTasks;
