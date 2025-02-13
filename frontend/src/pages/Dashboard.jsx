import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:3000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks);
      setFilteredTasks(res.data.tasks);
    } catch (error) {
      toast.error("Error al cargar tareas");
    }
  };

  const handleAddOrUpdateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editingTask) {
        // Editar tarea
        await axios.put(
          `http://localhost:3000/api/tasks/${editingTask.id}`,
          { title, description, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Tarea actualizada exitosamente");
      } else {
        // Agregar nueva tarea
        await axios.post(
          "http://localhost:3000/api/tasks",
          { title, description, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Tarea creada exitosamente");
      }
      fetchTasks();
      resetForm();
    } catch (error) {
      toast.error("Error al guardar la tarea");
    }
  };

  const handleDeleteTask = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Tarea eliminada exitosamente");
      fetchTasks();
    } catch (error) {
      toast.error("Error al eliminar la tarea");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("pending");
    setEditingTask(null);
  };

  const getTaskCount = (status) => {
    return tasks.filter((task) => task.status === status).length;
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    if (status === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === status));
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-dark mb-4">Mis Tareas</h2>

      <div className="row text-center my-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white p-3 glass">
            <h4>Total</h4>
            <p className="fs-4">{tasks.length}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark p-3 glass">
            <h4>Pendientes</h4>
            <p className="fs-4">{getTaskCount("pending")}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white p-3 glass">
            <h4>En Progreso</h4>
            <p className="fs-4">{getTaskCount("in-progress")}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white p-3 glass">
            <h4>Completadas</h4>
            <p className="fs-4">{getTaskCount("completed")}</p>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center my-3">
        <button
          className={`btn mx-1 ${filter === "all" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => handleFilterChange("all")}
        >
          Todas
        </button>
        <button
          className={`btn mx-1 ${filter === "pending" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => handleFilterChange("pending")}
        >
          Pendientes
        </button>
        <button
          className={`btn mx-1 ${filter === "in-progress" ? "btn-info" : "btn-outline-info"}`}
          onClick={() => handleFilterChange("in-progress")}
        >
          En Progreso
        </button>
        <button
          className={`btn mx-1 ${filter === "completed" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => handleFilterChange("completed")}
        >
          Completadas
        </button>
      </div>

      <form onSubmit={handleAddOrUpdateTask} className="mb-4 glass">
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pendiente</option>
            <option value="in-progress">En Progreso</option>
            <option value="completed">Completada</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {editingTask ? "Actualizar Tarea" : "Agregar Tarea"}
        </button>
        {editingTask && (
          <button type="button" className="btn btn-secondary w-100 mt-2" onClick={resetForm}>
            Cancelar Edición
          </button>
        )}
      </form>

      <ul className="list-group">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center glass">
              <div>
                <strong>{task.title}</strong> - {task.description}{" "}
                <span className={`badge bg-${task.status === "pending" ? "warning" : task.status === "in-progress" ? "info" : "success"}`}>
                  {task.status}
                </span>
              </div>
              <div>
                <button className="btn btn-warning mx-1" onClick={() => setEditingTask(task)}>
                  Editar
                </button>
                <button className="btn btn-danger mx-1" onClick={() => handleDeleteTask(task.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item text-center">No hay tareas en esta categoría.</li>
        )}
      </ul>
    </div>
  );
}

export default Dashboard;
