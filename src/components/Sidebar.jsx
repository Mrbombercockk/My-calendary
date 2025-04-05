import { motion } from "framer-motion";
import { FaTimes, FaChartBar } from "react-icons/fa";

export default function Sidebar({ darkMode, setShowMenu, setShowSummary, setShowRightMenu }) {
  return (
    <div className={`w-64 ${darkMode ? "bg-gray-800" : "bg-gray-200"} p-4 shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Menú</h2>
        <button onClick={() => setShowMenu(false)} className="text-xl sm:hidden">
          <FaTimes />
        </button>
      </div>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => {
              setShowSummary("daily");
              setShowMenu(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
          >
            Resumen Diario
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setShowSummary("weekly");
              setShowMenu(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
          >
            Resumen Semanal
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setShowSummary("monthly");
              setShowMenu(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
          >
            Resumen Mensual
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setShowSummary("yearly");
              setShowMenu(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
          >
            Resumen Anual
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setShowRightMenu(true);
              setShowMenu(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"} flex items-center space-x-2`}
          >
            <FaChartBar />
            <span>Estadísticas</span>
          </button>
        </li>
      </ul>
    </div>
  );
}