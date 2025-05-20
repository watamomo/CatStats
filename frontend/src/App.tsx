import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./features/Login";
import Register from "./features/Register";
import Dashboard from "./features/Dashboard";
import TeamTasks from "./features/TeamTasks";
import AppLayout from "./AppLayout"; // Nuevo layout
import { ContinuousCalendar } from "./features/Calendar";
import ProfilePage from "./features/ProfilePage";


function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams/:slug" element={<TeamTasks />} />
          <Route path="/calendar" element={<ContinuousCalendar />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
