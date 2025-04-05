import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaEdit, FaCheck, FaTrash, FaStickyNote, FaPlus } from "react-icons/fa";

export default function ItemDetailsModal({
  darkMode,
  selectedItem,
  setSelectedItem,
  objectives,
  tasks,
  completedTasks,
  updateItem,
  completeItem,
  deleteItem,
  deleteCompletedItem,
  notes,
  addNote,
  updateNote,
  deleteNote,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...selectedItem });
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [newTask, setNewTask] = useState({
    text: "",
    date: "",
    priority: "low",
    tags: [],
    reminder: "",
    alarm: "",
  });

  const itemNotes = notes.filter(
    (note) => note.linkedItemId === selectedItem.id && note.linkedItemType === selectedItem.type
  );

  const handleUpdate = () => {
    updateItem(selectedItem.type, selectedItem.id, editedItem);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (!newNote.title && !newNote.content) return;
    addNote(newNote, selectedItem.id, selectedItem.type);
    setNewNote({ title: "", content: "" });
  };

  const handleAddTask = () => {
    if (!newTask.text) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newTaskData = {
      type: "task",
      text: newTask.text,
      date: newTask.date || tomorrow.toISOString().split("T")[0] + "T12:00",
      priority: newTask.priority,
      tags: newTask.tags,
      reminder: newTask.reminder || null,
      alarm: newTask.alarm || null,
      objectiveId: selectedItem.type === "objective" ? selectedItem.id : null,
      percentage: 0,
    };
    updateItem("task", null, newTaskData);
    setNewTask({ text: "", date: "", priority: "low", tags: [], reminder: "", alarm: "" });
  };

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
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Detalles de {selectedItem.type === "objective" ? "Objetivo" : "Tarea"}
          </h2>
          <button
            onClick={() => setSelectedItem(null)}
            className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
          >
            <FaTimes />
          </button>
        </div>

        {/* Sección de Información General */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Información General</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Nombre:</label>
              {isEditing ? (
                <input
                  value={editedItem.text}
                  onChange={(e) => setEditedItem({ ...editedItem, text: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                />
              ) : (
                <p className="text-sm">{selectedItem.text}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha:</label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editedItem.date.split(".")[0]}
                  onChange={(e) => setEditedItem({ ...editedItem, date: new Date(e.target.value).toISOString() })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                />
              ) : (
                <p className="text-sm">{new Date(selectedItem.date).toLocaleString()}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Prioridad:</label>
              {isEditing ? (
                <select
                  value={editedItem.priority}
                  onChange={(e) => setEditedItem({ ...editedItem, priority: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              ) : (
                <p className="text-sm">{selectedItem.priority}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Etiquetas:</label>
              {isEditing ? (
                <input
                  value={editedItem.tags.join(", ")}
                  onChange={(e) => setEditedItem({ ...editedItem, tags: e.target.value.split(", ").filter((tag) => tag.trim()) })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                  placeholder="Separadas por comas"
                />
              ) : (
                <p className="text-sm">{selectedItem.tags.join(", ")}</p>
              )}
            </div>
            {selectedItem.reminder && (
              <div>
                <label className="block text-sm font-medium">Recordatorio:</label>
                <p className="text-sm">{selectedItem.reminder}</p>
              </div>
            )}
            {selectedItem.alarm && (
              <div>
                <label className="block text-sm font-medium">Alarma:</label>
                <p className="text-sm">{selectedItem.alarm}</p>
              </div>
            )}
            {selectedItem.type === "task" && selectedItem.objectiveId && (
              <div>
                <label className="block text-sm font-medium">Objetivo Vinculado:</label>
                <p className="text-sm">{objectives.find((obj) => obj.id === selectedItem.objectiveId)?.text || "Ninguno"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Tareas Asociadas (solo para objetivos) */}
        {selectedItem.type === "objective" && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tareas Asociadas</h3>
            {tasks
              .filter((task) => task.objectiveId === selectedItem.id)
              .map((task) => (
                <div key={task.id} className="p-2 border-b border-gray-300">
                  <p className="text-sm">{task.text} - {new Date(task.date).toLocaleDateString()}</p>
                </div>
              ))}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Añadir Tarea para Mañana</h4>
              <div className="space-y-2">
                <input
                  value={newTask.text}
                  onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                  placeholder="Nombre de la tarea"
                />
                <input
                  type="datetime-local"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                  placeholder="Fecha (por defecto: mañana)"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
                <button
                  onClick={handleAddTask}
                  className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white text-black" : "bg-black text-white"} flex items-center space-x-2`}
                >
                  <FaPlus />
                  <span>Añadir Tarea</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Notas */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Notas</h3>
          <div className="space-y-2 mb-4">
            {itemNotes.map((note) => (
              <div key={note.id} className="p-2 border-b border-gray-300">
                <p className="text-sm font-medium">{note.title}</p>
                <p className="text-sm">{note.content}</p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500 text-xs mt-1"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <input
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
              placeholder="Título de la nota"
            />
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"} border text-sm`}
              rows="3"
              placeholder="Contenido de la nota"
            />
            <button
              onClick={handleAddNote}
              className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white text-black" : "bg-black text-white"} flex items-center space-x-2`}
            >
              <FaStickyNote />
              <span>Añadir Nota</span>
            </button>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap gap-2 justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isEditing) {
                handleUpdate();
              } else {
                setIsEditing(true);
              }
            }}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            }`}
          >
            {isEditing ? <FaCheck /> : <FaEdit />}
            <span>{isEditing ? "Guardar" : "Editar"}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => completeItem(selectedItem.type, selectedItem)}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
            }`}
          >
            <FaCheck />
            <span>Completar</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (selectedItem.completedDate) {
                deleteCompletedItem(selectedItem.type, selectedItem.id);
              } else {
                deleteItem(selectedItem.type, selectedItem.id);
              }
              setSelectedItem(null);
            }}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 ${
              darkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
            }`}
          >
            <FaTrash />
            <span>Eliminar</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}