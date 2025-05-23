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
const commentRoutes = require("./routes/commentsRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.set("io", io);

app.use("/api/groups/:groupId/messages", groupChatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));


app.get("/", (req, res) => {
  res.send("Backend de CatStats");
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  const groupId = socket.handshake.query.groupId;
  socket.join(groupId);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

db.sequelize.sync({ force: true }).then(() => {
  console.log("Base de datos sincronizada correctamente.");
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("Error al sincronizar la base de datos:", error);
});
