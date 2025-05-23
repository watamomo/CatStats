const express = require("express");
const router = express.Router({ mergeParams: true });
const { Message, User } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware"); 

router.post("/", authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;

  try {
    const newMessage = await Message.create({
      content,
      sender_id: req.user.id,
      group_id: groupId, 
    });

    const populatedMessage = await Message.findOne({
      where: { id: newMessage.id },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
    });

    req.app.get("io").to(groupId).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error al crear el mensaje:", error);
    res.status(500).json({ error: error.message }); 
  }
});

router.get("/", authenticateToken, async (req, res) => {
  const { groupId } = req.params; 

  try {
    const messages = await Message.findAll({
      where: { group_id: groupId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
