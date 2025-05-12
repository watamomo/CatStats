// src/components/Sidebar.jsx
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";  // Creamos un archivo de estilos

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>OpTask</h2>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/calendar">Calendar</Link>
          </li>
          <li>
            <Link to="/mytasks">My Tasks</Link>
          </li>
          <li>
            <Link to="/statistics">Statistics</Link>
          </li>
          <li>
            <Link to="/documents">Documents</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
