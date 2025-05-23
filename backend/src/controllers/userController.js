const express = require("express");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { User, Group } = require("../models");
const router = express.Router();

// 📌 Obtener perfil del usuario
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "avatar", "createdAt"],
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

// 📌 Actualizar perfil
router.put("/me", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    user.name = req.body.name || user.name;

    if (req.file) {
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarPath;
    }

    await user.save();

    res.json({ msg: "Perfil actualizado correctamente", user });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ msg: "Error al actualizar el perfil del usuario" });
  }
});

module.exports = router;
