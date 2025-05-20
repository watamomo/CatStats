const express = require("express");
const { Group, User, Task } = require("../models"); // ✅ Asegúrate de incluir Task aquí
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Crear un nuevo grupo
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, color, icon } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ msg: "Nombre y slug son obligatorios." });
    }

    const group = await Group.create({ name, slug, description, color, icon });

    await group.addMember(req.user.id); 

    res.status(201).json({ msg: "Grupo creado con éxito", group });
  } catch (error) {
    console.error("❌ Error al crear el grupo:", error);
    res.status(500).json({ msg: "Error al crear el grupo", error: error.message });
  }
});

// 📌 Unirse a un grupo existente
router.post("/:groupId/join", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Grupo no encontrado" });
    }

    await group.addMember(req.user.id);
    res.json({ msg: "Te has unido al grupo", groupId });
  } catch (error) {
    console.error("❌ Error al unirse al grupo:", error);
    res.status(500).json({ msg: "Error al unirse al grupo" });
  }
});

// ✅ Obtener los grupos del usuario (con slug, icono y color)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Group,
        as: "groups",
        attributes: ["id", "name", "slug", "description", "color", "icon"],
        through: { attributes: [] },
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(user.groups);
  } catch (error) {
    console.error("❌ Error al obtener los grupos:", error);
    res.status(500).json({ msg: "Error al obtener los grupos" });
  }
});

// 📌 Crear invitaciones
router.post("/:groupId/invite", authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });

    const isMember = await group.hasMember(user);
    if (isMember) return res.status(400).json({ error: "Usuario ya está en el grupo" });

    await group.addMember(user);

    res.status(200).json({ message: "Usuario añadido al grupo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al añadir usuario" });
  }
});



// 📌 Obtener los miembros de un grupo
router.get("/:groupId/members", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId, {
      include: [{
        model: User,
        as: "members",
        attributes: ["id", "name", "email"],
        through: { attributes: [] },
      }],
    });

    if (!group) {
      return res.status(404).json({ msg: "Grupo no encontrado" });
    }

    res.json(group.members); 
  } catch (error) {
    console.error("❌ Error al obtener miembros del grupo:", error);
    res.status(500).json({ msg: "Error al obtener los miembros del grupo" });
  }
});


// 📌 Salir de un grupo
router.delete("/:groupId/leave", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ msg: "Grupo no encontrado" });

    await group.removeMember(userId);

    res.json({ msg: "Has salido del grupo correctamente" });
  } catch (error) {
    console.error("Error al salir del grupo:", error);
    res.status(500).json({ msg: "Error al salir del grupo" });
  }
});

// 📌 Obtener tareas de un grupo por ID
router.get("/:groupId/tasks", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log("📥 groupId recibido:", groupId);

    const group = await Group.findByPk(groupId);
    if (!group) {
      console.log("⚠️ Grupo no encontrado");
      return res.status(404).json({ msg: "Grupo no encontrado" });
    }

    const tasks = await Task.findAll({
      where: { group_id: groupId },
      order: [["createdAt", "DESC"]],
    });

    console.log("✅ Tareas encontradas:", tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error al obtener tareas del grupo:", error);
    res.status(500).json({ msg: "Error al obtener tareas del grupo" });
  }
});



module.exports = router;
