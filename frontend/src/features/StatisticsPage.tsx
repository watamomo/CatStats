import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle, Clock, Users, Layout, Award, Calendar, Zap } from "lucide-react";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend
);

export default function StatisticsPage() {
  const mockData = {
    totalTasks: 120,
    completedTasks: 90,
    averagePerDay: 5,
    groupsCount: 4,
    taskStatus: { completed: 60, inProgress: 30, pending: 10 },
    tasksPerDay: [4, 8, 6, 7, 5, 3, 2],
    productivityPerWeek: [30, 45, 60, 75],
    groupRanking: [
      { name: "Diseño UX", tasks: 50 },
      { name: "Frontend", tasks: 35 },
      { name: "Marketing", tasks: 20 }
    ],
    contributions: [
      { group: "Diseño UX", percentage: 50 },
      { group: "Frontend", percentage: 30 },
      { group: "Marketing", percentage: 20 }
    ],
    activeStreak: 6,
    mostProductiveDay: "Martes",
    topGroup: "Diseño UX",
    teamAverage: 3.7
  };

  const barData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        label: "Tareas completadas",
        data: mockData.tasksPerDay,
        backgroundColor: "#71717a"
      }
    ]
  };

  const pieData = {
    labels: ["Completadas", "En progreso", "Pendientes"],
    datasets: [
      {
        label: "Tareas",
        data: [
          mockData.taskStatus.completed,
          mockData.taskStatus.inProgress,
          mockData.taskStatus.pending
        ],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"]
      }
    ]
  };

  const lineData = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    datasets: [
      {
        label: "Progreso",
        data: mockData.productivityPerWeek,
        borderColor: "#0ea5e9",
        tension: 0.3,
        fill: false
      }
    ]
  };

  // Configuración para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-zinc-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-2xl md:text-3xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Estadísticas
        </motion.h1>
        <div className="text-sm text-zinc-400">
          Mayo 2025
        </div>
      </div>

      {/* Panel resumen */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Tareas totales</p>
            <p className="text-lg md:text-xl font-bold">{mockData.totalTasks}</p>
          </div>
          <Layout className="text-zinc-500" size={24} />
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Completadas</p>
            <p className="text-lg md:text-xl font-bold">{mockData.completedTasks}</p>
          </div>
          <CheckCircle className="text-zinc-500" size={24} />
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Promedio diario</p>
            <p className="text-lg md:text-xl font-bold">{mockData.averagePerDay}</p>
          </div>
          <TrendingUp className="text-zinc-500" size={24} />
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Grupos</p>
            <p className="text-lg md:text-xl font-bold">{mockData.groupsCount}</p>
          </div>
          <Users className="text-zinc-500" size={24} />
        </motion.div>
      </motion.div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progreso semanal */}
        <motion.div 
          className="bg-zinc-800 p-4 rounded-lg shadow lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Progreso semanal
          </h2>
          <div className="h-64">
            <Line 
              data={lineData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Por estado */}
        <motion.div 
          className="bg-zinc-800 p-4 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} />
            Por estado
          </h2>
          <div className="h-64 flex items-center justify-center">
            <Pie 
              data={pieData} 
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Tareas por día */}
      <motion.div 
        className="bg-zinc-800 p-4 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={18} />
          Tareas por día
        </h2>
        <div className="h-64">
          <Bar 
            data={barData}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Datos adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rankings */}
        <motion.div 
          className="bg-zinc-800 p-4 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award size={18} />
            Grupos más activos
          </h2>
          <ul className="space-y-3">
            {mockData.groupRanking.map((g, i) => (
              <li key={i} className="flex items-center">
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-zinc-400 h-2 rounded-full" 
                    style={{ width: `${(g.tasks / mockData.groupRanking[0].tasks) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between w-full ml-3">
                  <span>{g.name}</span>
                  <span className="font-semibold">{g.tasks} tareas</span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Participación */}
        <motion.div 
          className="bg-zinc-800 p-4 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={18} />
            Tu participación
          </h2>
          <ul className="space-y-3">
            {mockData.contributions.map((c, i) => (
              <li key={i}>
                <div className="flex justify-between mb-1">
                  <span>{c.group}</span>
                  <span className="font-semibold">{c.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-zinc-400 h-2 rounded-full" 
                    style={{ width: `${c.percentage}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Datos destacados */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.7 }}
      >
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center gap-3">
          <Zap className="text-zinc-500" size={24} />
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Racha activa</p>
            <p className="text-lg font-bold">{mockData.activeStreak} días</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center gap-3">
          <Calendar className="text-zinc-500" size={24} />
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Día más productivo</p>
            <p className="text-lg font-bold">{mockData.mostProductiveDay}</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-zinc-800 p-4 rounded-lg shadow flex items-center gap-3">
          <Award className="text-zinc-500" size={24} />
          <div>
            <p className="text-xs md:text-sm text-zinc-400">Grupo destacado</p>
            <p className="text-lg font-bold">{mockData.topGroup}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Comparación */}
      <motion.div 
        className="bg-zinc-800 p-4 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} />
          Comparación con el equipo
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm mb-1 text-zinc-400">Tu promedio</p>
            <p className="text-2xl font-bold">{mockData.averagePerDay}</p>
            <p className="text-xs text-zinc-400">tareas/día</p>
          </div>
          <div className="text-center">
            <p className="text-sm mb-1 text-zinc-400">Promedio del equipo</p>
            <p className="text-2xl font-bold">{mockData.teamAverage}</p>
            <p className="text-xs text-zinc-400">tareas/día</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-zinc-400 h-2 rounded-full" 
              style={{ width: `${(mockData.averagePerDay / (Math.max(mockData.averagePerDay, mockData.teamAverage))) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-zinc-400">
            <span>0</span>
            <span>{Math.max(mockData.averagePerDay, mockData.teamAverage)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}