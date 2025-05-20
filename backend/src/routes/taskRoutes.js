const express = require("express");
const { Task, Notification, User } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware");
const taskController = require("../controllers/taskController");

const router = express.Router();
const { Op } = require("sequelize");

// 📌 Obtener resumen semanal de tareas completadas
router.get("/weekly-summary", authenticateToken, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

    const tasks = await Task.findAll({
      where: {
        assigned_to: req.user.id,
        status: "completado",
        updatedAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const summary = Array(7).fill(0);
    tasks.forEach((task) => {
      const dayDiff = Math.floor(
        (new Date(task.updatedAt) - oneWeekAgo) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff >= 0 && dayDiff < 7) summary[dayDiff]++;
    });

    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener el resumen semanal" });
  }
});

// 📌 Obtener resumen mensual completo: completadas y totales
router.get("/monthly-progress", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const tasks = await Task.findAll({
      where: {
        assigned_to: req.user.id,
        updatedAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completado").length;

    res.json({ total, completed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener el progreso mensual" });
  }
});

// 📌 Obtener tareas de un grupo por slug
router.get("/group/:slug", authenticateToken, taskController.getTasksByGroupSlug);

// 📌 Obtener todas las tareas del usuario autenticado
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        assigned_to: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener las tareas" });
  }
});

// 📌 Crear una nueva tarea
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      due_date,
      progress,
      status,
      group_id,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Título y contenido son obligatorios" });
    }

    const task = await Task.create({
      title,
      description,
      content,
      due_date,
      progress,
      status: status || "pendiente",
      group_id: group_id || null,
      assigned_to: req.user.id,
    });

    await Notification.create({
      user_id: req.user.id,
      message: `Has creado una nueva tarea: "${title}"`,
      type: "team_created",
    });

    res.status(201).json({ msg: "Tarea creada exitosamente", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
});

// 📌 Editar una tarea existente (con soporte para assigned_to)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      due_date,
      progress,
      status,
      assigned_to,
    } = req.body;

    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    task.title = title || task.title;
    task.description = description || task.description;
    task.content = content || task.content;
    task.due_date = due_date || task.due_date;
    task.progress = progress !== undefined ? progress : task.progress;
    task.status = status || task.status;
    task.assigned_to = assigned_to ?? task.assigned_to;

    await task.save();

    await Notification.create({
      user_id: req.user.id,
      message: `Has actualizado la tarea: "${task.title}"`,
      type: "team_created",
    });

    res.json({ msg: "Tarea actualizada exitosamente", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la tarea" });
  }
});

// 📌 Eliminar una tarea
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, assigned_to: req.user.id },
    });

    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    await Notification.create({
      user_id: req.user.id,
      message: `Has eliminado la tarea: "${task.title}"`,
      type: "team_created",
    });

    await task.destroy();
    res.json({ msg: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la tarea" });
  }
});

module.exports = router;
