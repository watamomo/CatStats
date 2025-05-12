import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CalendarCheck2 } from "lucide-react";

function WeeklyProgressChart() {
  const { token } = useAuth();
  const [data, setData] = useState<{ day: string; completed: number }[]>([]);


  

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/tasks/weekly-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const madridDate = new Date(new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" }));
        const madridDayIndex = madridDate.getDay(); 
        const todayIndex = madridDayIndex === 0 ? 6 : madridDayIndex - 1;
        
        const orderedDays = [...days.slice(todayIndex + 2), ...days.slice(0, todayIndex + 2)];
        
        const formatted = res.data.summary.map((val: number, i: number) => ({
          day: orderedDays[i],
          completed: val,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error al cargar gráfico:", err);
      }
    };

    if (token) fetchSummary();
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-[#1e1e1e] to-[#151515] rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center gap-2 mb-4">
      <CalendarCheck2 className="text-blue-400 w-6 h-6" />
        <h3 className="text-xl font-bold text-white">Progreso semanal</h3>
      </div>
  
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
          <XAxis dataKey="day" stroke="#bbb" />
          <YAxis stroke="#bbb" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.85rem",
            }}
            labelStyle={{ color: "#aaa" }}
            formatter={(value: number) => [`${value} completadas`, "Tareas"]}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{
              r: 5,
              stroke: "#3B82F6",
              strokeWidth: 2,
              fill: "#1e40af",
            }}
            activeDot={{
              r: 8,
              style: { filter: "drop-shadow(0 0 4px #3B82F6)" },
            }}
          />
        </LineChart>
      </ResponsiveContainer>
  
      <p className="text-sm text-gray-400 text-center mt-4 italic">
        Tareas completadas por día (últimos 7 días)
      </p>
    </div>
  );
}  

export default WeeklyProgressChart;
