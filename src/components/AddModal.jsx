import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaTasks, FaTag, FaClock, FaBell, FaRedo } from "react-icons/fa";

export default function AddModal({ darkMode, setShowAddModal, addItem, objectives }) {
  const predefinedTags = ["Trabajo", "Personal", "Urgente", "Estudio", "Hogar"];

  const [formData, setFormData] = useState({
    type: "objective",
    text: "",
    date: "",
    priority: "low",
    tags: [],
    reminder: "",
    alarm: "",
    objectiveId: "",
    percentage: 0,
    details: "",
    recurrence: "none", // Nuevo campo para la recurrencia
  });

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleSubmit = () => {
    if (!formData.text || !formData.date) {
      alert("Por favor, completa el nombre y la fecha.");
      return;
    }

    addItem(formData.type, {
      text: formData.text,
      date: new Date(formData.date).toISOString(),
      priority: formData.priority,
      tags: formData.tags,
      reminder: formData.reminder || null,
      alarm: formData.alarm || null,
      objectiveId: formData.type === "task" ? formData.objectiveId || null : undefined,
      percentage: formData.type === "task" ? Number(formData.percentage) : undefined,
      details: formData.details,
      recurrence: formData.recurrence, // Añadimos el campo de recurrencia
      completedItems: formData.type === "objective" ? [] : undefined,
      ideas: formData.type === "objective" ? [] : undefined,
    });

    setShowAddModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto add-modal"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
          <FaTasks className="mr-2" /> Añadir {formData.type === "objective" ? "Objetivo" : "Tarea"}
        </h3>

        {/* Tipo de Elemento */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Tipo:</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
          >
            <option value="objective">Objetivo</option>
            <option value="task">Tarea</option>
          </select>
        </div>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Nombre:</label>
          <input
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            placeholder="Escribe el nombre aquí"
            autoFocus={false}
          />
        </div>

        {/* Fecha */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Fecha:</label>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            autoFocus={false}
          />
        </div>

        {/* Detalles */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Detalles:</label>
          <textarea
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            rows="3"
            placeholder="Añade detalles adicionales"
            autoFocus={false}
          />
        </div>

        {/* Prioridad */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Prioridad:</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
          >
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {/* Etiquetas */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <FaTag className="mr-2" /> Etiquetas
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {predefinedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className={`px-2 py-1 rounded-lg text-xs ${
                  formData.tags.includes(tag)
                    ? darkMode
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input
            value={formData.tags.join(", ")}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(", ").filter((tag) => tag.trim()) })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            placeholder="Añade etiquetas personalizadas (separadas por comas)"
            autoFocus={false}
          />
        </div>

        {/* Recordatorio */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Recordatorio (hora):</label>
          <input
            type="time"
            value={formData.reminder}
            onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            autoFocus={false}
          />
        </div>

        {/* Alarma */}
        <div className="mb-4">
          <label className="block mb-2 text-sm">Alarma (hora):</label>
          <input
            type="time"
            value={formData.alarm}
            onChange={(e) => setFormData({ ...formData, alarm: e.target.value })}
            className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            autoFocus={false}
          />
        </div>

        {/* Recurrencia (solo para tareas) */}
        {formData.type === "task" && (
          <div className="mb-4">
            <label className="block mb-2 text-sm">Recurrencia:</label>
            <select
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
            >
              <option value="none">Ninguna</option>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        )}

        {/* Vinculación a Objetivo (solo para tareas) */}
        {formData.type === "task" && (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm">Vincular a un objetivo:</label>
              <select
                value={formData.objectiveId}
                onChange={(e) => setFormData({ ...formData, objectiveId: e.target.value })}
                className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
              >
                <option value="">Ninguno</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.text}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm">Porcentaje de contribución al objetivo (0-100):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                autoFocus={false}
              />
            </div>
          </>
        )}

        {/* Botones */}
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(false)}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <FaTimes />
            <span>Cancelar</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            <FaTasks />
            <span>Añadir</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}