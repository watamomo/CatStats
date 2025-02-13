const jwt = require("jsonwebtoken");

const JWT_SECRET = "secreto_super_seguro"; // Debería estar en variables de entorno

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "Acceso denegado. No hay token" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token no válido" });
  }
};
