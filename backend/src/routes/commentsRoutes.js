const express = require("express");
const router = express.Router();
const { Comment, User, Task } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Obtener comentarios de una tarea
router.get("/tasks/:taskId/comments", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const comments = await Comment.findAll({
      where: { TaskId: taskId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.User?.name || c.User?.email || "Usuario",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error al obtener comentarios:", err);
    res.status(500).json({ error: "No se pudieron obtener los comentarios" });
  }
});

// Crear nuevo comentario en una tarea
router.post("/tasks/:taskId/comments", authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    const comment = await Comment.create({
      content,
      TaskId: taskId,
      UserId: userId,
    });

    const user = await User.findByPk(userId);

    res.status(201).json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: user?.name || user?.email || "Usuario",
    });
  } catch (err) {
    console.error("Error al crear comentario:", err);
    res.status(500).json({ error: "Error al crear el comentario" });
  }
});

module.exports = router;
