import { motion } from "framer-motion";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function AddItemModal({ darkMode, newItem, setNewItem, objectives, addItem, setShowAddModal }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center"><FaPlus className="mr-2" /> Nuevo {newItem.type === "objective" ? "Objetivo" : "Tarea"}</h3>
        <label className="block mb-2 text-sm sm:text-base">Tipo:</label>
        <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`}>
          <option value="objective">Objetivo</option>
          <option value="task">Tarea</option>
        </select>
        <label className="block mt-4 mb-2 text-sm sm:text-base">Título:</label>
        <input value={newItem.text} onChange={e => setNewItem({ ...newItem, text: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} />
        <label className="block mt-4 mb-2 text-sm sm:text-base">Fecha:</label>
        <input type="date" value={newItem.date} onChange={e => setNewItem({ ...newItem, date: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} />
        <label className="block mt-4 mb-2 text-sm sm:text-base">Hora:</label>
        <input type="time" value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} />
        <label className="block mt-4 mb-2 text-sm sm:text-base">Prioridad:</label>
        <select value={newItem.priority} onChange={e => setNewItem({ ...newItem, priority: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        {newItem.type === "task" && (
          <>
            <label className="block mt-4 mb-2 text-sm sm:text-base">Vincular a un objetivo:</label>
            <select value={newItem.objectiveId || ""} onChange={e => setNewItem({ ...newItem, objectiveId: e.target.value || null })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`}>
              <option value="">Ninguno</option>
              {objectives.map(obj => <option key={obj.id} value={obj.id}>{obj.text}</option>)}
            </select>
            <label className="block mt-4 mb-2 text-sm sm:text-base">Porcentaje de contribución al objetivo (0-100):</label>
            <input type="number" min="0" max="100" value={newItem.percentage} onChange={e => setNewItem({ ...newItem, percentage: Number(e.target.value) })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} />
          </>
        )}
        <label className="block mt-4 mb-2 text-sm sm:text-base">Etiquetas (separadas por comas):</label>
        <input value={newItem.tags.join(", ")} onChange={e => setNewItem({ ...newItem, tags: e.target.value.split(", ").filter(tag => tag.trim()) })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} />
        <label className="block mt-4 mb-2 text-sm sm:text-base">Recordatorio (hora):</label>
        <input type="time" value={newItem.reminder} onChange={e => setNewItem({ ...newItem, reminder: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} />
        <label className="block mt-4 mb-2 text-sm sm:text-base">Detalles:</label>
        <textarea value={newItem.details} onChange={e => setNewItem({ ...newItem, details: e.target.value })} className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm sm:text-base`} rows="4" />
        <div className="mt-4 flex justify-end space-x-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(false)} className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}>
            <FaTimes /><span>Cancelar</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addItem} className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}>
            <FaPlus /><span>Añadir</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}