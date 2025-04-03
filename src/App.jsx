import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : {
      yearly: [], monthly: [], weekly: [], daily: [], recurring: [],
    };
    Object.keys(parsedTasks).forEach(type => {
      parsedTasks[type] = parsedTasks[type].map(task => ({
        ...task,
        tags: task.tags || [],
        ideas: task.ideas || [],
        completedItems: task.completedItems || [],
        reminder: task.reminder || null,
        recurringDays: task.recurringDays || [],
        progress: task.completedItems ? task.completedItems.reduce((sum, item) => sum + (item.percentage || 0), 0) : task.progress || 0,
      }));
    });
    return parsedTasks;
  });
  const [completedTasks, setCompletedTasks] = useState(() => {
    const savedCompleted = localStorage.getItem("completedTasks");
    const parsedCompleted = savedCompleted ? JSON.parse(savedCompleted) : [];
    return parsedCompleted.map(task => ({
      ...task,
      tags: task.tags || [],
      ideas: task.ideas || [],
      completedItems: task.completedItems || [],
      reminder: task.reminder || null,
      progress: task.completedItems ? task.completedItems.reduce((sum, item) => sum + (item.percentage || 0), 0) : task.progress || 100,
    }));
  });
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    type: "daily", text: "", details: "", date: "", time: "", priority: "medium", tags: [], recurringDays: [], reminder: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummary, setShowSummary] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState({ type: "daily", date: new Date() });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("darkMode", darkMode);
  }, [tasks, completedTasks, history, darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
      generateRecurringTasks();
    }, 86400000);
    return () => clearInterval(interval);
  }, [tasks.recurring]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const addToHistory = (action, task) => {
    setHistory(prev => [...prev, { action, task: { ...task }, timestamp: new Date().toISOString() }]);
  };

  const generateRecurringTasks = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    tasks.recurring.forEach(task => {
      if (task.recurringDays.includes(dayOfWeek)) {
        const newRecurringTask = {
          ...task,
          id: Date.now() + Math.random(),
          type: "daily",
          date: today.toISOString(),
          createdAt: today.toISOString(),
        };
        if (!tasks.daily.some(t => t.text === task.text && new Date(t.date).toDateString() === today.toDateString())) {
          setTasks(prev => ({
            ...prev,
            daily: [...prev.daily, newRecurringTask],
          }));
          addToHistory("recurring_generated", newRecurringTask);
        }
      }
    });
  };

  const addTask = () => {
    const taskDate = newTask.date ? new Date(`${newTask.date}T${newTask.time || "00:00"}`) : new Date();
    const taskBase = {
      id: Date.now(),
      text: newTask.text,
      progress: 0,
      details: newTask.details,
      date: taskDate.toISOString(),
      priority: newTask.priority,
      tags: newTask.tags,
      ideas: [],
      completedItems: [],
      reminder: newTask.reminder || null,
      recurringDays: newTask.type === "recurring" ? newTask.recurringDays : [],
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => ({
      ...prev,
      [newTask.type]: [...prev[newTask.type], taskBase],
    }));
    addToHistory("created", taskBase);
    setNewTask({ type: "daily", text: "", details: "", date: "", time: "", priority: "medium", tags: [], recurringDays: [], reminder: "" });
    setShowAddModal(false);
  };

  const completeTask = (type, task) => {
    setTasks(prev => ({
      ...prev,
      [type]: prev[type].filter(t => t.id !== task.id),
    }));
    setCompletedTasks(prev => [...prev, { ...task, progress: 100, completedDate: new Date() }]);
    addToHistory("completed", task);
    setSelectedTask(null);
  };

  const undoCompleteTask = (task) => {
    setCompletedTasks(prev => prev.filter(t => t.id !== task.id));
    setTasks(prev => ({
      ...prev,
      [task.type || "daily"]: [...prev[task.type || "daily"], { ...task, progress: task.completedItems.reduce((sum, item) => sum + item.percentage, 0), completedDate: null }],
    }));
    addToHistory("undo_completed", task);
  };

  const deleteTask = (type, id) => {
    const task = tasks[type].find(t => t.id === id);
    setTasks(prev => ({
      ...prev,
      [type]: prev[type].filter(t => t.id !== id),
    }));
    addToHistory("deleted", task);
    setSelectedTask(null);
  };

  const deleteCompletedTask = (id) => {
    const task = completedTasks.find(t => t.id === id);
    setCompletedTasks(prev => prev.filter(t => t.id !== id));
    addToHistory("deleted_completed", task);
    setSelectedTask(null);
  };

  const updateTask = (type, id, updates) => {
    setTasks(prev => ({
      ...prev,
      [type]: prev[type].map(task => (task.id === id ? { ...task, ...updates, progress: updates.completedItems.reduce((sum, item) => sum + item.percentage, 0), lastUpdated: new Date().toISOString() } : task)),
    }));
    addToHistory("updated", { ...tasks[type].find(t => t.id === id), ...updates });
    setSelectedTask(null);
  };

  const updateCompletedTask = (id, updates) => {
    setCompletedTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updates, progress: 100, lastUpdated: new Date().toISOString() } : task)));
    addToHistory("updated_completed", { ...completedTasks.find(t => t.id === id), ...updates });
    setSelectedTask(null);
  };

  const filterTasksByPeriod = (type, date) => {
    const startOfPeriod = new Date(date);
    const endOfPeriod = new Date(date);

    if (type === "daily") {
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else if (type === "weekly") {
      startOfPeriod.setDate(date.getDate() - date.getDay());
      endOfPeriod.setDate(date.getDate() - date.getDay() + 6);
    } else if (type === "monthly") {
      startOfPeriod.setMonth(date.getMonth(), 1);
      endOfPeriod.setMonth(date.getMonth() + 1, 0);
    } else if (type === "yearly") {
      startOfPeriod.setFullYear(date.getFullYear(), 0, 1);
      endOfPeriod.setFullYear(date.getFullYear(), 11, 31);
    } else if (type === "all") {
      startOfPeriod.setFullYear(1970, 0, 1);
      endOfPeriod.setFullYear(9999, 11, 31);
    }

    return {
      active: Object.values(tasks).flat().filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startOfPeriod && taskDate <= endOfPeriod;
      }),
      completed: completedTasks.filter(task => {
        const completedDate = new Date(task.completedDate);
        return completedDate >= startOfPeriod && completedDate <= endOfPeriod;
      }),
    };
  };

  const getSummary = (type, date) => {
    const { active, completed } = filterTasksByPeriod(type, date);
    return { completed, pending: active.filter(task => task.progress < 100) };
  };

  const chartData = (type, date) => {
    const summary = getSummary(type, date);
    return {
      labels: ["Completados", "Pendientes"],
      datasets: [{
        label: `Tareas (${type})`,
        data: [summary.completed.length, summary.pending.length],
        backgroundColor: ["#10B981", "#F59E0B"],
        borderColor: ["#059669", "#D97706"],
        borderWidth: 1,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: true, text: "Progreso" } },
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-gray-100 text-gray-800"} flex flex-col items-center p-4 sm:p-6 transition-colors duration-300`}>
      <header className="w-full max-w-3xl flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <button onClick={() => setShowMenu(!showMenu)} className="text-2xl">☰</button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex-1 text-center sm:text-left">Mis Objetivos</h1>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={toggleDarkMode}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg hover:from-gray-600 hover:to-gray-700 text-sm sm:text-base"
          >
            {darkMode ? "Claro" : "Oscuro"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 text-sm sm:text-base"
          >
            + Nuevo
          </button>
        </div>
      </header>

      {showMenu && (
        <div className={`fixed top-0 left-0 h-full w-64 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl p-6 z-50`}>
          <button onClick={() => setShowMenu(false)} className="text-2xl mb-4">✕</button>
          <ul className="space-y-4">
            <li><button onClick={() => { setView({ type: "daily", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Diarios</button></li>
            <li><button onClick={() => { setView({ type: "weekly", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Semanales</button></li>
            <li><button onClick={() => { setView({ type: "monthly", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Mensuales</button></li>
            <li><button onClick={() => { setView({ type: "yearly", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Anuales</button></li>
            <li><button onClick={() => { setView({ type: "recurring", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Recurrentes</button></li>
            <li><button onClick={() => { setView({ type: "all", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Todos</button></li>
            <li><button onClick={() => { setView({ type: "completed", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Completados</button></li>
            <li><button onClick={() => { setView({ type: "objectives", date: new Date() }); setShowMenu(false); }} className="w-full text-left">Objetivos</button></li>
          </ul>
        </div>
      )}

      <div className={`w-full max-w-3xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl rounded-xl p-4 sm:p-6 mb-6 sm:mb-8`}>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {view.type === "daily" ? `Día - ${view.date.toLocaleDateString()}` :
           view.type === "weekly" ? `Semana del ${view.date.toLocaleDateString()}` :
           view.type === "monthly" ? `${view.date.toLocaleString("default", { month: "long", year: "numeric" })}` :
           view.type === "yearly" ? `Año ${view.date.getFullYear()}` :
           view.type === "recurring" ? "Tareas Recurrentes" :
           view.type === "all" ? "Todos los Pendientes" :
           view.type === "completed" ? "Tareas Completadas" : "Objetivos"}
        </h2>
        {view.type === "completed" ? (
          completedTasks.map(task => (
            <div key={task.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg shadow-sm mb-2`}>
              <div className="mb-2 sm:mb-0">
                <span className="text-base sm:text-lg font-medium">{task.text}</span>
                <span className="block text-xs sm:text-sm">{new Date(task.completedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedTask({ ...task, type: "completed" })}
                  className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                >
                  Detalles
                </button>
                <button
                  onClick={() => undoCompleteTask(task)}
                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm"
                >
                  Deshacer
                </button>
              </div>
            </div>
          ))
        ) : view.type === "objectives" ? (
          [...Object.values(tasks).flat(), ...completedTasks].map(task => (
            <div key={task.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg shadow-sm mb-2`}>
              <div className="mb-2 sm:mb-0">
                <span className="text-base sm:text-lg font-medium">{task.text}</span>
                <span className="block text-xs sm:text-sm">Creado: {new Date(task.createdAt).toLocaleDateString()}</span>
                <span className="block text-xs sm:text-sm">Última actualización: {task.lastUpdated ? new Date(task.lastUpdated).toLocaleDateString() : "N/A"}</span>
                <span className="block text-xs sm:text-sm">{task.completedDate ? "Completado" : "Pendiente"}</span>
              </div>
              <button
                onClick={() => setSelectedTask({ type: task.completedDate ? "completed" : Object.keys(tasks).find(key => tasks[key].includes(task)), ...task })}
                className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
              >
                Detalles
              </button>
            </div>
          ))
        ) : (
          filterTasksByPeriod(view.type, view.date).active.map(task => (
            <div key={task.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg shadow-sm mb-2 border-l-4 ${task.priority === "high" ? "border-red-500" : task.priority === "medium" ? "border-yellow-500" : "border-green-500"}`}>
              <div className="mb-2 sm:mb-0">
                <span className="text-base sm:text-lg font-medium">{task.text}</span>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${task.progress}%` }}></div>
                </div>
                <span className="text-xs sm:text-sm">{task.tags && task.tags.length > 0 ? task.tags.join(", ") : "Sin etiquetas"}</span>
              </div>
              <button
                onClick={() => setSelectedTask({ type: Object.keys(tasks).find(key => tasks[key].includes(task)), ...task })}
                className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
              >
                Detalles
              </button>
            </div>
          ))
        )}
      </div>

      <div className={`w-full max-w-3xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl rounded-xl p-4 sm:p-6 mb-6 sm:mb-8`}>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Calendario</h2>
        <Calendar
          value={view.date}
          onChange={date => setView({ type: "daily", date })}
          className={`w-full ${darkMode ? "dark-calendar" : ""}`}
        />
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setView({ type: "weekly", date: view.date })}
            className="flex-1 bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
          >
            Semana
          </button>
          <button
            onClick={() => setView({ type: "monthly", date: view.date })}
            className="flex-1 bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
          >
            Mes
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl flex flex-wrap gap-2 mb-6 sm:mb-8">
        {["daily", "weekly", "monthly", "yearly"].map(period => (
          <button
            key={period}
            onClick={() => setShowSummary(period)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 text-xs sm:text-sm min-w-[80px]"
          >
            {period === "daily" ? "Diario" : period === "weekly" ? "Semanal" : period === "monthly" ? "Mensual" : "Anual"}
          </button>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Nuevo Objetivo/Tarea</h3>
            <label className="block mb-2 text-sm sm:text-base">Tipo:</label>
            <select
              value={newTask.type}
              onChange={e => setNewTask({ ...newTask, type: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            >
              <option value="yearly">Anual</option>
              <option value="monthly">Mensual</option>
              <option value="weekly">Semanal</option>
              <option value="daily">Diario</option>
              <option value="recurring">Recurrente</option>
            </select>
            <label className="block mt-4 mb-2 text-sm sm:text-base">Título:</label>
            <input
              value={newTask.text}
              onChange={e => setNewTask({ ...newTask, text: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Fecha:</label>
            <input
              type="date"
              value={newTask.date}
              onChange={e => setNewTask({ ...newTask, date: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Hora:</label>
            <input
              type="time"
              value={newTask.time}
              onChange={e => setNewTask({ ...newTask, time: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Prioridad:</label>
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            >
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
            <label className="block mt-4 mb-2 text-sm sm:text-base">Etiquetas (separadas por comas):</label>
            <input
              value={newTask.tags.join(", ")}
              onChange={e => setNewTask({ ...newTask, tags: e.target.value.split(", ").filter(tag => tag.trim()) })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            />
            {newTask.type === "recurring" && (
              <>
                <label className="block mt-4 mb-2 text-sm sm:text-base">Días recurrentes:</label>
                <div className="flex flex-wrap gap-2">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, index) => (
                    <label key={index} className="flex items-center text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={newTask.recurringDays.includes(index)}
                        onChange={() => {
                          const updatedDays = newTask.recurringDays.includes(index)
                            ? newTask.recurringDays.filter(d => d !== index)
                            : [...newTask.recurringDays, index];
                          setNewTask({ ...newTask, recurringDays: updatedDays });
                        }}
                        className="mr-1"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </>
            )}
            <label className="block mt-4 mb-2 text-sm sm:text-base">Recordatorio (hora):</label>
            <input
              type="time"
              value={newTask.reminder}
              onChange={e => setNewTask({ ...newTask, reminder: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Detalles:</label>
            <textarea
              value={newTask.details}
              onChange={e => setNewTask({ ...newTask, details: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
              rows="4"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-xs sm:text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={addTask}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Detalles del Objetivo</h3>
            <label className="block mb-2 text-sm sm:text-base">Nombre:</label>
            <input
              value={selectedTask.text}
              onChange={e => setSelectedTask({ ...selectedTask, text: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
            />
            {selectedTask.type !== "completed" && (
              <>
                <label className="block mt-4 mb-2 text-sm sm:text-base">Progreso Total (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedTask.completedItems.reduce((sum, item) => sum + item.percentage, 0)}
                  disabled
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
                />
                <label className="block mt-4 mb-2 text-sm sm:text-base">Prioridad:</label>
                <select
                  value={selectedTask.priority}
                  onChange={e => setSelectedTask({ ...selectedTask, priority: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
                <label className="block mt-4 mb-2 text-sm sm:text-base">Etiquetas (separadas por comas):</label>
                <input
                  value={selectedTask.tags.join(", ")}
                  onChange={e => setSelectedTask({ ...selectedTask, tags: e.target.value.split(", ").filter(tag => tag.trim()) })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
                />
                <label className="block mt-4 mb-2 text-sm sm:text-base">Recordatorio (hora):</label>
                <input
                  type="time"
                  value={selectedTask.reminder || ""}
                  onChange={e => setSelectedTask({ ...selectedTask, reminder: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
                />
              </>
            )}
            <label className="block mt-4 mb-2 text-sm sm:text-base">Fecha:</label>
            <input
              type="datetime-local"
              value={new Date(selectedTask.date || selectedTask.completedDate).toISOString().slice(0, 16)}
              onChange={e => setSelectedTask({ ...selectedTask, date: new Date(e.target.value).toISOString() })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
              disabled={selectedTask.type === "completed"}
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Detalles:</label>
            <textarea
              value={selectedTask.details}
              onChange={e => setSelectedTask({ ...selectedTask, details: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
              rows="4"
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Ideas:</label>
            <textarea
              value={selectedTask.ideas.join("\n")}
              onChange={e => setSelectedTask({ ...selectedTask, ideas: e.target.value.split("\n").filter(idea => idea.trim()) })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
              rows="4"
              placeholder="Escribe una idea por línea"
            />
            <label className="block mt-4 mb-2 text-sm sm:text-base">Cosas Hechas:</label>
            <textarea
              value={selectedTask.completedItems.map(item => `${item.text} - ${item.percentage}%`).join("\n")}
              onChange={e => {
                const items = e.target.value.split("\n").map(line => {
                  const [text, percentage] = line.split(" - ");
                  return { text: text.trim(), percentage: Number(percentage?.replace("%", "") || 0) };
                }).filter(item => item.text);
                setSelectedTask({ ...selectedTask, completedItems: items });
              }}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"} border text-sm sm:text-base`}
              rows="4"
              placeholder="Escribe una tarea completada por línea (ej. 'Revisar plan - 20%')"
            />
            {selectedTask.type === "recurring" && (
              <>
                <label className="block mt-4 mb-2 text-sm sm:text-base">Días recurrentes:</label>
                <div className="flex flex-wrap gap-2">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, index) => (
                    <label key={index} className="flex items-center text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTask.recurringDays.includes(index)}
                        onChange={() => {
                          const updatedDays = selectedTask.recurringDays.includes(index)
                            ? selectedTask.recurringDays.filter(d => d !== index)
                            : [...selectedTask.recurringDays, index];
                          setSelectedTask({ ...selectedTask, recurringDays: updatedDays });
                        }}
                        className="mr-1"
                        disabled={selectedTask.type === "completed"}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-2 justify-end sticky bottom-0 bg-inherit py-2">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-xs sm:text-sm"
              >
                Cancelar
              </button>
              {selectedTask.type !== "completed" && (
                <>
                  <button
                    onClick={() => updateTask(selectedTask.type, selectedTask.id, {
                      text: selectedTask.text,
                      details: selectedTask.details,
                      date: selectedTask.date,
                      priority: selectedTask.priority,
                      tags: selectedTask.tags,
                      ideas: selectedTask.ideas,
                      completedItems: selectedTask.completedItems,
                      reminder: selectedTask.reminder,
                      recurringDays: selectedTask.recurringDays,
                    })}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => completeTask(selectedTask.type, selectedTask)}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => deleteTask(selectedTask.type, selectedTask.id)}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm"
                  >
                    Eliminar
                  </button>
                </>
              )}
              {selectedTask.type === "completed" && (
                <>
                  <button
                    onClick={() => updateCompletedTask(selectedTask.id, {
                      text: selectedTask.text,
                      details: selectedTask.details,
                      ideas: selectedTask.ideas,
                      completedItems: selectedTask.completedItems,
                    })}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => deleteCompletedTask(selectedTask.id)}
                    className="px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 overflow-y-auto">
          <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-lg sm:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-t-lg">
              Resumen {showSummary === "daily" ? "Diario" : showSummary === "weekly" ? "Semanal" : showSummary === "monthly" ? "Mensual" : showSummary === "yearly" ? "Anual" : "Historial"}
            </h3>
            {showSummary !== "history" ? (
              <>
                <div className="mb-6">
                  <Bar data={chartData(showSummary, view.date)} options={chartOptions} />
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Completados ({getSummary(showSummary, view.date).completed.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto">
                      {getSummary(showSummary, view.date).completed.map(task => (
                        <div key={task.id} className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg mb-2 shadow-sm`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm sm:text-base">{task.text}</span>
                            <button
                              onClick={() => { setShowSummary(null); setSelectedTask({ ...task, type: "completed" }); }}
                              className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                            >
                              Detalles
                            </button>
                          </div>
                          <span className="text-xs sm:text-sm block mt-1">{new Date(task.completedDate).toLocaleString()}</span>
                          <span className="text-xs sm:text-sm block mt-1">Tags: {task.tags && task.tags.length > 0 ? task.tags.join(", ") : "Sin etiquetas"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> Pendientes ({getSummary(showSummary, view.date).pending.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto">
                      {getSummary(showSummary, view.date).pending.map(task => (
                        <div key={task.id} className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg mb-2 shadow-sm border-l-4 ${task.priority === "high" ? "border-red-500" : task.priority === "medium" ? "border-yellow-500" : "border-green-500"}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm sm:text-base">{task.text}</span>
                            <button
                              onClick={() => { setShowSummary(null); setSelectedTask({ type: Object.keys(tasks).find(key => tasks[key].includes(task)), ...task }); }}
                              className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                            >
                              Detalles
                            </button>
                          </div>
                          <span className="text-xs sm:text-sm block mt-1">{task.progress}% - {new Date(task.date).toLocaleDateString()}</span>
                          <span className="text-xs sm:text-sm block mt-1">Prioridad: {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}</span>
                          <span className="text-xs sm:text-sm block mt-1">Tags: {task.tags && task.tags.length > 0 ? task.tags.join(", ") : "Sin etiquetas"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {history.map((entry, index) => (
                  <div key={index} className={`p-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg mb-2 shadow-sm`}>
                    <span className="font-medium text-sm sm:text-base">{entry.action === "created" ? "Creado" : entry.action === "completed" ? "Completado" : entry.action === "undo_completed" ? "Deshecho" : entry.action === "deleted" ? "Eliminado" : "Actualizado"}: {entry.task.text}</span>
                    <span className="text-xs sm:text-sm block mt-1">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              {showSummary !== "history" && (
                <button
                  onClick={() => setShowSummary("history")}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs sm:text-sm"
                >
                  Historial
                </button>
              )}
              <button
                onClick={() => setShowSummary(null)}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}