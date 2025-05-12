const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./models");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const groupRoutes = require("./routes/groupRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const groupChatRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

// Configuración Socket.IO con CORS
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Pasar instancia 'io' a las rutas usando app.set
app.set("io", io);

// Rutas
app.use("/api/groups/:groupId/messages", groupChatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("¡Bienvenido al backend del organizador de tareas!");
});

// Configuración básica de Socket.IO para conexiones entrantes
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);

  const groupId = socket.handshake.query.groupId;
  socket.join(groupId);

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado:", socket.id);
  });
});

// Sincronizar base de datos y levantar servidor
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ force: true }).then(() => {
  console.log("✅ Base de datos sincronizada correctamente.");
  server.listen(PORT, () => { // <-- Cambia aquí app.listen por server.listen
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("❌ Error al sincronizar la base de datos:", error);
});
