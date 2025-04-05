import { motion } from "framer-motion";
import { FaTasks, FaCheck, FaEdit, FaTrash, FaClock, FaTag } from "react-icons/fa";
import { getTimeRemaining } from "../utils/time";

export default function PendingSection({
  darkMode,
  selectedDate,
  objectives,
  tasks,
  completedObjectives,
  completedTasks,
  setSelectedItem,
  undoCompleteItem,
}) {
  const filterItemsByDate = (items, dateField) => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selected);
    endOfDay.setHours(23, 59, 59, 999);

    return items.filter((item) => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= selected && itemDate <= endOfDay;
    });
  };

  const sortByPriorityAndDate = (items) => {
    return [...items].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  const activeObjectives = filterItemsByDate(objectives, "date");
  const activeTasks = filterItemsByDate(tasks, "date");
  const completedObjs = filterItemsByDate(completedObjectives, "completedDate");
  const completedTsks = filterItemsByDate(completedTasks, "completedDate");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-3xl ${darkMode ? "bg-gray-900" : "bg-white"} shadow-xl rounded-xl p-4 sm:p-6 mb-6 sm:mb-8`}
      id="pending-section"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Día - {selectedDate.toLocaleDateString()}
      </h2>

      {/* Objetivos Pendientes */}
      <h3 className="text-base sm:text-lg font-medium mb-2 flex items-center">
        <FaTasks className="mr-2" /> Objetivos Pendientes
      </h3>
      {sortByPriorityAndDate(activeObjectives).map((obj) => (
        <motion.div
          key={obj.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded-lg shadow-sm mb-2 border-l-4 ${
            obj.priority === "high" ? "border-black" : obj.priority === "medium" ? "border-gray-600" : "border-gray-400"
          } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
        >
          <div className="mb-2 sm:mb-0">
            <span className="text-base sm:text-lg font-medium">{obj.text}</span>
            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <div
                className={`h-full rounded-full ${darkMode ? "bg-white" : "bg-black"}`}
                style={{ width: `${obj.progress}%` }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm flex items-center mt-1">
              <FaClock className="mr-1" /> Tiempo restante: {getTimeRemaining(obj.date)}
            </span>
            <span className="block text-xs sm:text-sm flex items-center mt-1">
              <FaTag className="mr-1" /> {obj.tags.length > 0 ? obj.tags.join(", ") : "Sin etiquetas"}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedItem({ type: "objective", ...obj, completed: false })}
            className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <FaEdit />
            <span>Detalles</span>
          </motion.button>
        </motion.div>
      ))}

      {/* Tareas Pendientes */}
      <h3 className="text-base sm:text-lg font-medium mb-2 mt-4 flex items-center">
        <FaTasks className="mr-2" /> Tareas Pendientes
      </h3>
      {sortByPriorityAndDate(activeTasks).map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded-lg shadow-sm mb-2 border-l-4 ${
            task.priority === "high" ? "border-black" : task.priority === "medium" ? "border-gray-600" : "border-gray-400"
          } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
        >
          <div className="mb-2 sm:mb-0">
            <span className="text-base sm:text-lg font-medium">{task.text}</span>
            <span className="block text-xs sm:text-sm flex items-center mt-1">
              <FaClock className="mr-1" /> Tiempo restante: {getTimeRemaining(task.date)}
            </span>
            <span className="text-xs sm:text-sm">
              {task.objectiveId
                ? `Objetivo: ${objectives.find((o) => o.id === task.objectiveId)?.text || "Sin objetivo"}`
                : "Sin objetivo"}
            </span>
            <span className="block text-xs sm:text-sm flex items-center mt-1">
              <FaTag className="mr-1" /> {task.tags.length > 0 ? task.tags.join(", ") : "Sin etiquetas"}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedItem({ type: "task", ...task, completed: false })}
            className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <FaEdit />
            <span>Detalles</span>
          </motion.button>
        </motion.div>
      ))}

      {/* Objetivos Completados */}
      <h3 className="text-base sm:text-lg font-medium mb-2 mt-4 flex items-center">
        <FaCheck className="mr-2" /> Objetivos Completados
      </h3>
      {completedObjs.map((obj) => (
        <motion.div
          key={obj.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded-lg shadow-sm mb-2 border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
        >
          <div className="mb-2 sm:mb-0">
            <span className="text-base sm:text-lg font-medium">{obj.text}</span>
            <span className="block text-xs sm:text-sm">{new Date(obj.completedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedItem({ ...obj, type: "objective", completed: true })}
              className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <FaEdit />
              <span>Detalles</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => undoCompleteItem("objective", obj)}
              className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <FaTrash />
              <span>Deshacer</span>
            </motion.button>
          </div>
        </motion.div>
      ))}

      {/* Tareas Completadas */}
      <h3 className="text-base sm:text-lg font-medium mb-2 mt-4 flex items-center">
        <FaCheck className="mr-2" /> Tareas Completadas
      </h3>
      {completedTsks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded-lg shadow-sm mb-2 border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
        >
          <div className="mb-2 sm:mb-0">
            <span className="text-base sm:text-lg font-medium">{task.text}</span>
            <span className="block text-xs sm:text-sm">{new Date(task.completedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedItem({ ...task, type: "task", completed: true })}
              className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <FaEdit />
              <span>Detalles</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => undoCompleteItem("task", task)}
              className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <FaTrash />
              <span>Deshacer</span>
            </motion.button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}