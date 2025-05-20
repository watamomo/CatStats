const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { User, Group } = require("../models");

const router = express.Router();

// 📌 Obtener perfil del usuario autenticado
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "createdAt"],
      include: [
        {
          model: Group,
          as: "groups",
          attributes: ["id", "name", "slug", "color", "icon"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ msg: "Error al obtener el perfil del usuario" });
  }
});

// 📌 Actualizar solo el nombre del usuario
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    if (req.body.name) {
      user.name = req.body.name;
    }

    await user.save();
    res.json({ msg: "Perfil actualizado exitosamente", user });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ msg: "Error al actualizar el perfil" });
  }
});

module.exports = router;
