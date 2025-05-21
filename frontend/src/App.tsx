import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./features/Login";
import Register from "./features/Register";
import Dashboard from "./features/Dashboard";
import TeamTasks from "./features/TeamTasks";
import AppLayout from "./AppLayout";
import { ContinuousCalendar } from "./features/Calendar";
import ProfilePage from "./features/ProfilePage";
import StatisticsPage from "./features/StatisticsPage";
import ProtectedRoute from "./services/ProtectedRoute";


function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams/:slug" element={<TeamTasks />} />
          <Route path="/calendar" element={<ContinuousCalendar />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stats" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
