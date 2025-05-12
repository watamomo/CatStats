const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // 📌 Habilitar CORS

// 📌 Rutas
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("¡Bienvenido al backend del organizador de tareas!");
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión con la base de datos establecida.");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
