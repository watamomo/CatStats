const { Task, Group, User } = require("../models");


// 📌 Obtener todas las tareas
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener las tareas" });
  }
};

// 📌 Obtener tareas de un usuario
exports.getTasksByUser = async (req, res) => {
  const { userId } = req.params; // Asumimos que el `userId` se pasa como parámetro

  try {
    const tasks = await Task.findAll({
      where: {
        assigned_to: userId, // Filtra las tareas asignadas a este usuario
        due_date: { [Op.ne]: null }, // Asegúrate de que la fecha de vencimiento no sea null
      },
      order: [['due_date', 'ASC']], // Ordena las tareas por fecha de vencimiento
    });
    res.json(tasks); // Envía las tareas al frontend
  } catch (error) {
    console.error("Error al obtener tareas del usuario:", error);
    res.status(500).json({ msg: "Error al obtener las tareas del usuario" });
  }
};

// 📌 Crear una nueva tarea
exports.createTask = async (req, res) => {
  const { title, description, status } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "El título y la descripción son obligatorios" });
  }

  try {
    const task = await Task.create({ title, description, status });
    res.status(201).json({ msg: "Tarea creada exitosamente", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear la tarea" });
  }
};

// 📌 Actualizar tarea
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ msg: "Tarea no encontrada" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;

    await task.save();
    res.json({ msg: "Tarea actualizada", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar la tarea" });
  }
};

// 📌 Eliminar tarea
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ msg: "Tarea no encontrada" });
    }

    await task.destroy();
    res.json({ msg: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar la tarea" });
  }
};

// 📌 Obtener tareas por slug de grupo
exports.getTasksByGroupSlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const group = await Group.findOne({
      where: { slug },
      include: [{ model: Task }],
    });

    if (!group) {
      return res.status(404).json({ msg: "Grupo no encontrado" });
    }

    res.json(group.Tasks);
  } catch (error) {
    console.error("Error al obtener tareas por grupo:", error);
    res.status(500).json({ msg: "Error al obtener las tareas del grupo" });
  }
};
