import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { CalendarCheck } from "lucide-react";

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const MonthlyProgressChart = () => {
  const { token } = useAuth();
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/tasks/monthly-progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompleted(res.data.completed);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el progreso mensual");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProgress();
  }, [token]);

  const now = new Date();
  const currentMonth = monthNames[now.getMonth()];
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const data = [
    {
      name: "Completado",
      value: percentage,
      fill: "#22c55e", // Tailwind green-500
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Cargando progreso mensual...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1e1e1e] to-[#121212] rounded-2xl shadow-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
      <CalendarCheck className="text-blue-400 w-6 h-6" />
        <p className="text-base text-white font-semibold">
          Progreso de <span className="capitalize text-blue-400">{currentMonth}</span>
        </p>
      </div>

      <div className="w-44 h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={14}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-extrabold text-white">
          {percentage}%
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-2 font-medium">
        {completed} de {total} tareas completadas
      </p>
    </div>
  );
};

export default MonthlyProgressChart;
