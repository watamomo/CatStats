const express = require("express");
const router = express.Router({ mergeParams: true });
const { Message, User } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware"); 

// Crear mensaje
router.post("/", authenticateToken, async (req, res) => {
  const { groupId } = req.params; // ID del grupo desde los parámetros de la URL
  const { content } = req.body;   // Contenido del mensaje desde el cuerpo de la solicitud

  try {
    // Crear el nuevo mensaje en la base de datos
    const newMessage = await Message.create({
      content,
      sender_id: req.user.id, // ID del usuario que envía el mensaje, usando el token
      group_id: groupId,      // ID del grupo
    });

    // Buscar el mensaje recién creado y poblarlo con la información del usuario (emisor)
    const populatedMessage = await Message.findOne({
      where: { id: newMessage.id },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
    });

    // Emitir el mensaje a través de Socket.IO para que los miembros del grupo lo reciban en tiempo real
    req.app.get("io").to(groupId).emit("newMessage", populatedMessage);

    // Responder con el mensaje recién creado
    res.status(201).json(populatedMessage);
  } catch (error) {
    // Manejo de errores
    console.error("Error al crear el mensaje:", error);  // Para ayudar a depurar
    res.status(500).json({ error: error.message });  // Responder con el error en formato JSON
  }
});

// Obtener mensajes de un grupo
router.get("/", authenticateToken, async (req, res) => {
  const { groupId } = req.params; // ID del grupo desde los parámetros de la URL

  try {
    // Buscar todos los mensajes del grupo ordenados por fecha
    const messages = await Message.findAll({
      where: { group_id: groupId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
      order: [["createdAt", "ASC"]], // Ordenar los mensajes por la fecha de creación
    });

    // Responder con los mensajes obtenidos
    res.status(200).json(messages);
  } catch (error) {
    // Manejo de errores
    console.error("Error al obtener los mensajes:", error);  // Para ayudar a depurar
    res.status(500).json({ error: error.message });  // Responder con el error en formato JSON
  }
});

module.exports = router;
