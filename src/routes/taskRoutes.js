const express = require("express");
const { Task } = require("../models"); // Asegúrate de importar el modelo correctamente
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Obtener todas las tareas del usuario autenticado
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// Crear una nueva tarea
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      userId: req.user.id,
    });
    res.status(201).json({ msg: "Tarea creada exitosamente", task });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la tarea" });
  }
});

// Editar una tarea existente
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    await task.save();

    res.json({ msg: "Tarea actualizada exitosamente", task });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la tarea" });
  }
});

// Eliminar una tarea
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    await task.destroy();
    res.json({ msg: "Tarea eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la tarea" });
  }
});

module.exports = router;
