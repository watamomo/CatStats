const { Group, User } = require("../models");

exports.getGroupsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Group,
        through: { attributes: [] },
        attributes: ["id", "name", "slug", "description", "color", "icon"],
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(user.Groups);
  } catch (error) {
    console.error("❌ Error al obtener grupos del usuario:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
