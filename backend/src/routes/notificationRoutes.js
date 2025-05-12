const express = require("express");
const { Notification } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Obtener notificaciones del usuario
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al obtener las notificaciones" });
  }
});

// 📌 Marcar todas como leídas
router.put("/mark-read", authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { user_id: req.user.id } }
    );
    res.json({ msg: "Todas las notificaciones fueron marcadas como leídas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al marcar notificaciones" });
  }
});

module.exports = router;
