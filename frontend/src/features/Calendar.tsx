import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import TaskModal from '../components/modals/TaskModal';

// Definición del tipo Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  content?: string;
  progress?: number;
  assigned_to?: {
    id: string;
    name: string;
  } | null;
  due_date?: string;
  status: 'pendiente' | 'en progreso' | 'completado'; // Restringido a esos tres valores
}

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface ContinuousCalendarProps {
  onClick?: (_day: number, _month: number, _year: number) => void;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = () => {
  const today = new Date();
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [_selectedDate, setSelectedDate] = useState<Date>(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);

  const monthOptions = monthNames.map((month, index) => ({ name: month, value: `${index}` }));

  // Fetch tasks from the API for the user
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setTasks(res.data);
      } catch (err) {
        console.error('Error al obtener tareas:', err);
      }
    };

    fetchTasks();
  }, []);

  // Function to generate calendar days
  const generateCalendar = useMemo(() => {
    const daysInMonth = (): { month: number; day: number }[] => {
      const daysInMonth = [];
      const startDayOfWeek = new Date(year, selectedMonth, 1).getDay();

      if (startDayOfWeek < 6) {
        for (let i = 0; i < startDayOfWeek; i++) {
          daysInMonth.push({ month: -1, day: 32 - startDayOfWeek + i });
        }
      }

      for (let day = 1; day <= new Date(year, selectedMonth + 1, 0).getDate(); day++) {
        daysInMonth.push({ month: selectedMonth, day });
      }

      const lastWeekDayCount = daysInMonth.length % 7;
      if (lastWeekDayCount > 0) {
        const extraDaysNeeded = 7 - lastWeekDayCount;
        for (let day = 1; day <= extraDaysNeeded; day++) {
          daysInMonth.push({ month: 0, day });
        }
      }

      return daysInMonth;
    };

    const calendarDays = daysInMonth();

    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const calendar = calendarWeeks.map((week, weekIndex) => (
      <div className="flex w-full" key={`week-${weekIndex}`}>
        {week.map(({ month, day }, dayIndex) => {
          const index = weekIndex * 7 + dayIndex;
          const isNewMonth = index === 0 || calendarDays[index - 1].month !== month;
          const isToday = today.getMonth() === month && today.getDate() === day && today.getFullYear() === year;

          // Filter tasks for the current day
          const tasksForDay = tasks.filter((task) => {
            const taskDate = task.due_date ? new Date(task.due_date) : null;
            if (!taskDate) return false;

            taskDate.setHours(0, 0, 0, 0);

            const selectedDate = new Date(year, month, day);
            selectedDate.setHours(0, 0, 0, 0);

            const taskFormattedDate = taskDate.toISOString().split('T')[0];
            const selectedFormattedDate = selectedDate.toISOString().split('T')[0];

            return taskFormattedDate === selectedFormattedDate;
          });

          const handleSeeMoreClick = () => {
            setSelectedDayTasks(tasksForDay);
            setModalVisible(true);
          };

          return (
            <div
              key={`${month}-${day}`}
              ref={(el) => { dayRefs.current[index] = el; }}
              data-month={month}
              data-day={day}
              onClick={() => handleDayClick(day, month, year)}
              className={`relative group aspect-square w-full grow cursor-pointer rounded-xl border border-blue-400/40 font-medium transition-all hover:z-20 hover:border-blue-200 sm:-m-px sm:size-20 sm:rounded-2xl sm:border-2 lg:size-36 lg:rounded-3xl 2xl:size-40`}
            >
              <span className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${isToday ? 'bg-blue-500 font-semibold text-white' : ''} ${month < 0 ? 'text-blue-500/20' : 'text-white/40'}`}>
                {day}
              </span>
              {isNewMonth && (
                <span className="text-white/20 absolute bottom-0.5 left-0 w-full truncate px-1.5 text-sm font-semibold text-slate-300 sm:bottom-0 sm:text-lg lg:bottom-2.5 lg:left-3.5 lg:-mb-1 lg:w-fit lg:px-0 lg:text-xl 2xl:mb-[-4px] 2xl:text-2xl">
                  {monthNames[month]}
                </span>
              )}

              {/* Show tasks for the day */}
              {tasksForDay.length > 0 && (
                <div onClick={handleSeeMoreClick} className="absolute bottom-2 left-2 right-2 bg-blue-500/30 p-1 rounded-md text-xs text-white">
                  {tasksForDay.slice(0, 2).map((task) => (
                    <div key={task.id} className="truncate bg-blue-600 text-white rounded-md p-1 m-1">
                      {task.title}
                    </div>
                  ))}
                  {tasksForDay.length > 2 && (
                    <button
                      onClick={handleSeeMoreClick}
                      className="text-blue-400 text-sm mt-2">
                      Ver más ({tasksForDay.length - 2})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));

    return calendar;
  }, [year, selectedMonth, tasks]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
  };

  const handleTodayClick = () => {
    setYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  return (
    <div className="no-scrollbar calendar-container max-h-full overflow-y-hidden bg-gradient-to-br from-[#1e1e1e] to-[#111] p-6 rounded-xl border border-white/10 shadow-xl S">
      <div className="sticky -top-px z-50 w-full rounded-t-2xl px-5 pt-7 sm:px-8 sm:pt-8">
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select value={`${selectedMonth}`} onChange={handleMonthChange} className="bg-gray-800 text-white p-2 rounded-md">
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.name}</option>
              ))}
            </select>
            <button onClick={handleTodayClick} type="button" className="flex items-center gap-2 px-5 py-2 outline outline-blue-500 text-white text-sm rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:scale-105">
              Hoy
            </button>
          </div>
          <div className="flex w-fit items-center justify-between">
            <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">{year}</h1>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-blue-300">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-full border-b border-blue-200 py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full gap-2 px-5 pt-4 sm:px-8 sm:pt-6">
        {generateCalendar}
      </div>

      {/* Task Modal */}
<TaskModal
  isVisible={modalVisible}
  onClose={() => setModalVisible(false)}
  tasks={selectedDayTasks}
  setTasks={setSelectedDayTasks}
/>



    </div>
  );
};

export default ContinuousCalendar;
