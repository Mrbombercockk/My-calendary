import { motion } from "framer-motion";

export default function WelcomeModal({ darkMode, setShowWelcome, setShowTutorial }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg w-full max-w-md text-center`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido a Planify! 🎉</h2>
        <p className="text-sm sm:text-base mb-6">Organiza tus objetivos y tareas de manera sencilla y lleva un seguimiento de tu progreso. ¿Listo para empezar?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowWelcome(false)}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
          >
            Saltar
          </button>
          <button
            onClick={() => { setShowWelcome(false); setShowTutorial(true); }}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
          >
            Iniciar Tutorial
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}