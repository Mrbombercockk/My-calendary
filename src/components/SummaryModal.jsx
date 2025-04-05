import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FaTimes, FaEdit } from "react-icons/fa";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SummaryModal({
  darkMode,
  showSummary,
  view,
  objectives,
  tasks,
  completedObjectives,
  completedTasks,
  history,
  setShowSummary,
  setSelectedItem,
}) {
  const filterItemsByPeriod = (type, date) => {
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
    }
    const filterByDate = (items, dateField) =>
      items.filter((item) => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= startOfPeriod && itemDate <= endOfPeriod;
      });
    return {
      activeObjectives: filterByDate(objectives, "date"),
      activeTasks: filterByDate(tasks, "date"),
      completedObjectives: filterByDate(completedObjectives, "completedDate"),
      completedTasks: filterByDate(completedTasks, "completedDate"),
    };
  };

  const getSummary = () => filterItemsByPeriod(showSummary, view.date);

  const chartData = () => {
    const summary = getSummary();
    return {
      labels: ["Objetivos Completados", "Tareas Completadas", "Objetivos Pendientes", "Tareas Pendientes"],
      datasets: [
        {
          label: `Resumen (${showSummary})`,
          data: [
            summary.completedObjectives.length,
            summary.completedTasks.length,
            summary.activeObjectives.length,
            summary.activeTasks.length,
          ],
          backgroundColor: ["#000000", "#555555", "#999999", "#CCCCCC"],
          borderColor: ["#000000", "#555555", "#999999", "#CCCCCC"],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: darkMode ? "#FFFFFF" : "#000000" } },
      title: { display: true, text: "Progreso", color: darkMode ? "#FFFFFF" : "#000000" },
    },
    scales: {
      x: { ticks: { color: darkMode ? "#FFFFFF" : "#000000" }, grid: { color: darkMode ? "#333333" : "#DDDDDD" } },
      y: { ticks: { color: darkMode ? "#FFFFFF" : "#000000" }, grid: { color: darkMode ? "#333333" : "#DDDDDD" } },
    },
  };

  const sortByPriorityAndDate = (items) => {
    return [...items].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  const summary = getSummary();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto`}
      >
        <h3
          className={`text-lg sm:text-2xl font-bold mb-6 text-center py-2 rounded-t-lg ${
            darkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          Resumen {showSummary.charAt(0).toUpperCase() + showSummary.slice(1)}
        </h3>
        <div className="mb-6">
          <Bar data={chartData()} options={chartOptions} />
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
              <span className="w-3 h-3 bg-black rounded-full mr-2"></span> Objetivos Completados (
              {summary.completedObjectives.length})
            </h4>
            <div className="max-h-60 overflow-y-auto">
              {summary.completedObjectives.map((obj) => (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"} rounded-lg mb-2 shadow-sm border ${
                    darkMode ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">{obj.text}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowSummary(null);
                        setSelectedItem({ ...obj, type: "objective", completed: true });
                      }}
                      className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      <FaEdit />
                      <span>Detalles</span>
                    </motion.button>
                  </div>
                  <span className="text-xs sm:text-sm block mt-1">
                    {new Date(obj.completedDate).toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm block mt-1">
                    Tags: {obj.tags.length > 0 ? obj.tags.join(", ") : "Sin etiquetas"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
              <span className="w-3 h-3 bg-gray-600 rounded-full mr-2"></span> Tareas Completadas (
              {summary.completedTasks.length})
            </h4>
            <div className="max-h-60 overflow-y-auto">
              {summary.completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"} rounded-lg mb-2 shadow-sm border ${
                    darkMode ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">{task.text}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowSummary(null);
                        setSelectedItem({ ...task, type: "task", completed: true });
                      }}
                      className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      <FaEdit />
                      <span>Detalles</span>
                    </motion.button>
                  </div>
                  <span className="text-xs sm:text-sm block mt-1">
                    {new Date(task.completedDate).toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm block mt-1">
                    Tags: {task.tags.length > 0 ? task.tags.join(", ") : "Sin etiquetas"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
              <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span> Objetivos Pendientes (
              {summary.activeObjectives.length})
            </h4>
            <div className="max-h-60 overflow-y-auto">
              {sortByPriorityAndDate(summary.activeObjectives).map((obj) => (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"} rounded-lg mb-2 shadow-sm border-l-4 ${
                    obj.priority === "high"
                      ? "border-black"
                      : obj.priority === "medium"
                      ? "border-gray-600"
                      : "border-gray-400"
                  } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">{obj.text}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowSummary(null);
                        setSelectedItem({ type: "objective", ...obj, completed: false });
                      }}
                      className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      <FaEdit />
                      <span>Detalles</span>
                    </motion.button>
                  </div>
                  <span className="text-xs sm:text-sm block mt-1">
                    {obj.progress}% - {new Date(obj.date).toLocaleDateString()}
                  </span>
                  <span className="text-xs sm:text-sm block mt-1">
                    Prioridad: {obj.priority.charAt(0).toUpperCase() + obj.priority.slice(1)}
                  </span>
                  <span className="text-xs sm:text-sm block mt-1">
                    Tags: {obj.tags.length > 0 ? obj.tags.join(", ") : "Sin etiquetas"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
              <span className="w-3 h-3 bg-gray-200 rounded-full mr-2"></span> Tareas Pendientes (
              {summary.activeTasks.length})
            </h4>
            <div className="max-h-60 overflow-y-auto">
              {sortByPriorityAndDate(summary.activeTasks).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"} rounded-lg mb-2 shadow-sm border-l-4 ${
                    task.priority === "high"
                      ? "border-black"
                      : task.priority === "medium"
                      ? "border-gray-600"
                      : "border-gray-400"
                  } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">{task.text}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowSummary(null);
                        setSelectedItem({ type: "task", ...task, completed: false });
                      }}
                      className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      <FaEdit />
                      <span>Detalles</span>
                    </motion.button>
                  </div>
                  <span className="text-xs sm:text-sm block mt-1">
                    {new Date(task.date).toLocaleDateString()}
                  </span>
                  <span className="text-xs sm:text-sm block mt-1">
                    Prioridad: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className="text-xs sm:text-sm block mt-1">
                    Tags: {task.tags.length > 0 ? task.tags.join(", ") : "Sin etiquetas"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSummary(null)}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <FaTimes />
            <span>Cerrar</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}