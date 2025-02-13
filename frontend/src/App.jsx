import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">Task Manager</Link>
          <div className="ml-auto">
            {isAuthenticated ? (
              <button className="btn btn-danger mx-1" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            ) : (
              <>
                <Link className="btn btn-outline-light mx-1" to="/login">Login</Link>
                <Link className="btn btn-outline-light mx-1" to="/register">Registro</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;



