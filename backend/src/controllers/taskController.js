const { Task } = require("../models");

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
