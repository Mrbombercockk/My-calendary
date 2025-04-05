import { motion } from "framer-motion";
import { FaTimes, FaChartBar, FaTrophy } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RightSidebar({
  darkMode,
  setShowRightMenu,
  objectives,
  tasks,
  completedObjectives,
  completedTasks,
  notes,
}) {
  // Estadísticas por etiquetas
  const tagStats = () => {
    const tags = {};
    [...completedObjectives, ...completedTasks].forEach((item) => {
      item.tags.forEach((tag) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    return {
      labels: Object.keys(tags),
      datasets: [
        {
          label: "Completados por Etiqueta",
          data: Object.values(tags),
          backgroundColor: "#000000",
          borderColor: "#000000",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: darkMode ? "#FFFFFF" : "#000000" } },
      title: { display: true, text: "Estadísticas por Etiqueta", color: darkMode ? "#FFFFFF" : "#000000" },
    },
    scales: {
      x: { ticks: { color: darkMode ? "#FFFFFF" : "#000000" }, grid: { color: darkMode ? "#333333" : "#DDDDDD" } },
      y: { ticks: { color: darkMode ? "#FFFFFF" : "#000000" }, grid: { color: darkMode ? "#333333" : "#DDDDDD" } },
    },
  };

  // Comparativas temporales (completados por mes)
  const monthlyStats = () => {
    const months = {};
    [...completedObjectives, ...completedTasks].forEach((item) => {
      const month = new Date(item.completedDate).toLocaleString("default", { month: "short", year: "numeric" });
      months[month] = (months[month] || 0) + 1;
    });

    return {
      labels: Object.keys(months),
      datasets: [
        {
          label: "Completados por Mes",
          data: Object.values(months),
          backgroundColor: "#555555",
          borderColor: "#555555",
          borderWidth: 1,
        },
      ],
    };
  };

  // Logros
  const achievements = [
    { name: "Primer Objetivo", achieved: completedObjectives.length >= 1 },
    { name: "5 Tareas Completadas", achieved: completedTasks.length >= 5 },
    { name: "10 Elementos Completados", achieved: completedObjectives.length + completedTasks.length >= 10 },
  ];

  return (
    <div className={`w-64 ${darkMode ? "bg-gray-800" : "bg-gray-200"} p-4 shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Estadísticas</h2>
        <button onClick={() => setShowRightMenu(false)} className="text-xl">
          <FaTimes />
        </button>
      </div>

      {/* Progreso de Completados */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <FaChartBar className="mr-2" /> Progreso
        </h3>
        <p>Total Completados: {completedObjectives.length + completedTasks.length}</p>
        <p>Objetivos Completados: {completedObjectives.length}</p>
        <p>Tareas Completadas: {completedTasks.length}</p>
      </div>

      {/* Estadísticas por Etiquetas */}
      <div className="mb-6">
        <Bar data={tagStats()} options={chartOptions} />
      </div>

      {/* Comparativas Temporales */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <FaChartBar className="mr-2" /> Completados por Mes
        </h3>
        <Bar data={monthlyStats()} options={chartOptions} />
      </div>

      {/* Logros */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <FaTrophy className="mr-2" /> Logros
        </h3>
        <ul className="space-y-2">
          {achievements.map((achievement, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className={`text-sm ${achievement.achieved ? "text-green-500" : "text-gray-500"}`}>
                {achievement.name}
              </span>
              {achievement.achieved && <FaTrophy className="text-yellow-500" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}