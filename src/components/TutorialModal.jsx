import { motion } from "framer-motion";

const tutorialSteps = [
  { title: "¡Bienvenido a Planигfy!", description: "Aquí puedes organizar tus objetivos y tareas de forma sencilla. Vamos a guiarte por los primeros pasos.", target: null },
  { title: "Añade un objetivo o tarea", description: "Haz clic en el botón '+ Nuevo' para crear un nuevo objetivo o tarea.", target: "add-button" },
  { title: "Explora tus pendientes", description: "Aquí verás tus objetivos y tareas pendientes, ordenados por prioridad.", target: "pending-section" },
  { title: "Usa el calendario", description: "Selecciona un día para ver tus objetivos y tareas programadas.", target: "calendar-section" },
  { title: "Revisa tus resúmenes", description: "Consulta tu progreso diario, semanal, mensual o anual con los botones de resumen.", target: "summary-buttons" },
];

export default function TutorialModal({ darkMode, tutorialStep, setTutorialStep, setShowTutorial }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg w-full max-w-md text-center relative`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h2 className="text-xl font-bold mb-4">{tutorialSteps[tutorialStep].title}</h2>
        <p className="text-sm sm:text-base mb-6">{tutorialSteps[tutorialStep].description}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowTutorial(false)}
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Saltar tutorial
          </button>
          <div className="flex space-x-2">
            {tutorialStep > 0 && (
              <button
                onClick={() => setTutorialStep(prev => prev - 1)}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
              >
                Anterior
              </button>
            )}
            {tutorialStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setTutorialStep(prev => prev + 1)}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={() => setShowTutorial(false)}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === tutorialStep ? (darkMode ? "bg-white" : "bg-black") : (darkMode ? "bg-gray-700" : "bg-gray-300")}`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}