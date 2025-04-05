import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CalendarSection from "./components/CalendarSection";
import PendingSection from "./components/PendingSection";
import ItemDetailsModal from "./components/ItemDetailsModal";
import SummaryModal from "./components/SummaryModal";
import AddModal from "./components/AddModal";
import Footer from "./components/Footer";
import RightSidebar from "./components/RightSidebar";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/localStorage";
import { FaStickyNote } from "react-icons/fa";

export default function App() {
  const [darkMode, setDarkMode] = useState(loadFromLocalStorage("darkMode", false));
  const [objectives, setObjectives] = useState(loadFromLocalStorage("objectives", []));
  const [tasks, setTasks] = useState(loadFromLocalStorage("tasks", []));
  const [completedObjectives, setCompletedObjectives] = useState(loadFromLocalStorage("completedObjectives", []));
  const [completedTasks, setCompletedTasks] = useState(loadFromLocalStorage("completedTasks", []));
  const [history, setHistory] = useState(loadFromLocalStorage("history", []));
  const [notes, setNotes] = useState(loadFromLocalStorage("notes", []));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummary, setShowSummary] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showRightMenu, setShowRightMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(loadFromLocalStorage("showWelcome", true));
  const [tutorialStep, setTutorialStep] = useState(0);
  const highlightedElementRef = useRef(null);

  const [updates, setUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const updatesCollection = collection(db, "updates");
        const updatesSnapshot = await getDocs(updatesCollection);
        console.log("Documentos obtenidos de Firestore:", updatesSnapshot.docs);
        const fetchedUpdates = updatesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            message: typeof data.message === "string" ? data.message.replace(/^"|"$/g, "") : data.message,
            title: typeof data.title === "string" ? data.title.replace(/^"|"$/g, "") : data.title,
            seen: data.seen === "false" ? false : data.seen === "true" ? true : data.seen,
            updateId: typeof data.id === "string" ? data.id.replace(/^"|"$/g, "") : data.id,
          };
        });
        console.log("Datos transformados (fetchedUpdates):", fetchedUpdates);

        const storedUpdates = loadFromLocalStorage("updates", []);
        console.log("Datos almacenados en localStorage:", storedUpdates);
        const mergedUpdates = fetchedUpdates.map((update) => {
          const storedUpdate = storedUpdates.find((u) => u.id === update.id);
          return storedUpdate ? { ...update, seen: storedUpdate.seen } : update;
        });
        console.log("Datos combinados (mergedUpdates):", mergedUpdates);

        setUpdates(mergedUpdates);
        setLoadingUpdates(false);
      } catch (error) {
        console.error("Error al obtener mensajes de actualización:", error);
        setLoadingUpdates(false);
      }
    };

    fetchUpdates();
  }, []);

  useEffect(() => {
    saveToLocalStorage("darkMode", darkMode);
    saveToLocalStorage("objectives", objectives);
    saveToLocalStorage("tasks", tasks);
    saveToLocalStorage("completedObjectives", completedObjectives);
    saveToLocalStorage("completedTasks", completedTasks);
    saveToLocalStorage("history", history);
    saveToLocalStorage("notes", notes);
    saveToLocalStorage("showWelcome", showWelcome);
    saveToLocalStorage("updates", updates);
  }, [darkMode, objectives, tasks, completedObjectives, completedTasks, history, notes, showWelcome, updates]);

  useEffect(() => {
    if (tutorialStep === 1 && showAddModal) {
      setTutorialStep(2);
    }
    if (tutorialStep === 2 && objectives.length > 0 && !showAddModal) {
      setTutorialStep(3);
    }
    if (tutorialStep === 3 && completedObjectives.length > 0) {
      setTutorialStep(4);
    }
    if (tutorialStep === 4 && showMenu) {
      setTutorialStep(5);
    }
  }, [showAddModal, objectives, completedObjectives, showMenu, tutorialStep]);

  useEffect(() => {
    if (tutorialStep > 0 && tutorialStep <= tutorialSteps.length) {
      const targetSelector = tutorialSteps[tutorialStep - 1].target;
      if (targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          highlightedElementRef.current = targetElement;
          targetElement.style.position = "relative";
          targetElement.style.zIndex = "60";
          targetElement.style.boxShadow = "0 0 0 3px rgba(255, 255, 255, 0.5)";
        }
      }
    }
    return () => {
      if (highlightedElementRef.current) {
        highlightedElementRef.current.style.position = "";
        highlightedElementRef.current.style.zIndex = "";
        highlightedElementRef.current.style.boxShadow = "";
        highlightedElementRef.current = null;
      }
    };
  }, [tutorialStep]);

  const addItem = (type, item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      progress: 0,
      completedItems: item.completedItems || [],
      ideas: item.ideas || [],
      tags: item.tags || [],
      tasks: type === "objective" ? [] : undefined,
      objectiveId: type === "task" ? item.objectiveId || null : undefined,
      percentage: type === "task" ? item.percentage || 0 : undefined,
      reminder: item.reminder || null,
      alarm: item.alarm || null,
      priority: item.priority || "low",
      notes: [],
    };
    if (type === "objective") {
      setObjectives([...objectives, newItem]);
    } else {
      setTasks([...tasks, newItem]);
      if (newItem.objectiveId) {
        const updatedObjectives = objectives.map((obj) =>
          obj.id === newItem.objectiveId ? { ...obj, tasks: [...(obj.tasks || []), newItem.id] } : obj
        );
        setObjectives(updatedObjectives);
      }
    }
    setHistory([...history, { action: `Added ${type}`, item: newItem, timestamp: new Date().toISOString() }]);
  };

  const updateItem = (type, id, updatedFields) => {
    if (type === "objective") {
      setObjectives(objectives.map((obj) => (obj.id === id ? { ...obj, ...updatedFields } : obj)));
    } else {
      const updatedTask = tasks.find((task) => task.id === id);
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updatedFields } : task)));
      if (updatedTask?.objectiveId !== updatedFields.objectiveId) {
        const updatedObjectives = objectives.map((obj) => {
          if (obj.id === updatedTask?.objectiveId) {
            return { ...obj, tasks: (obj.tasks || []).filter((taskId) => taskId !== id) };
          }
          if (obj.id === updatedFields.objectiveId) {
            return { ...obj, tasks: [...(obj.tasks || []), id] };
          }
          return obj;
        });
        setObjectives(updatedObjectives);
      }
    }
    setHistory([...history, { action: `Updated ${type}`, item: { id, ...updatedFields }, timestamp: new Date().toISOString() }]);
  };

  const completeItem = (type, item) => {
    if (type === "objective") {
      setObjectives(objectives.filter((obj) => obj.id !== item.id));
      setCompletedObjectives([...completedObjectives, { ...item, completedDate: new Date().toISOString() }]);
    } else {
      setTasks(tasks.filter((task) => task.id !== item.id));
      setCompletedTasks([...completedTasks, { ...item, completedDate: new Date().toISOString() }]);
      if (item.objectiveId) {
        const updatedObjectives = objectives.map((obj) =>
          obj.id === item.objectiveId ? { ...obj, tasks: (obj.tasks || []).filter((taskId) => taskId !== item.id) } : obj
        );
        setObjectives(updatedObjectives);
      }
    }
    setHistory([...history, { action: `Completed ${type}`, item, timestamp: new Date().toISOString() }]);
  };

  const undoCompleteItem = (type, item) => {
    if (type === "objective") {
      setCompletedObjectives(completedObjectives.filter((obj) => obj.id !== item.id));
      setObjectives([...objectives, { ...item, completedDate: undefined }]);
    } else {
      setCompletedTasks(completedTasks.filter((task) => task.id !== item.id));
      setTasks([...tasks, { ...item, completedDate: undefined }]);
      if (item.objectiveId) {
        const updatedObjectives = objectives.map((obj) =>
          obj.id === item.objectiveId ? { ...obj, tasks: [...(obj.tasks || []), item.id] } : obj
        );
        setObjectives(updatedObjectives);
      }
    }
    setHistory([...history, { action: `Undid completion of ${type}`, item, timestamp: new Date().toISOString() }]);
  };

  const deleteItem = (type, id) => {
    if (type === "objective") {
      setObjectives(objectives.filter((obj) => obj.id !== id));
      const relatedTasks = tasks.filter((task) => task.objectiveId === id);
      setTasks(tasks.filter((task) => task.objectiveId !== id));
      setCompletedTasks(completedTasks.filter((task) => task.objectiveId !== id));
      setHistory([
        ...history,
        { action: `Deleted ${type}`, item: { id }, timestamp: new Date().toISOString() },
        ...relatedTasks.map((task) => ({
          action: "Deleted related task",
          item: task,
          timestamp: new Date().toISOString(),
        })),
      ]);
    } else {
      setTasks(tasks.filter((task) => task.id !== id));
      const task = tasks.find((t) => t.id === id);
      if (task?.objectiveId) {
        const updatedObjectives = objectives.map((obj) =>
          obj.id === task.objectiveId ? { ...obj, tasks: (obj.tasks || []).filter((taskId) => taskId !== id) } : obj
        );
        setObjectives(updatedObjectives);
      }
      setHistory([...history, { action: `Deleted ${type}`, item: { id }, timestamp: new Date().toISOString() }]);
    }
  };

  const deleteCompletedItem = (type, id) => {
    if (type === "objective") {
      setCompletedObjectives(completedObjectives.filter((obj) => obj.id !== id));
      setCompletedTasks(completedTasks.filter((task) => task.objectiveId !== id));
    } else {
      setCompletedTasks(completedTasks.filter((task) => task.id !== id));
    }
    setHistory([...history, { action: `Deleted completed ${type}`, item: { id }, timestamp: new Date().toISOString() }]);
  };

  const addNote = (note, linkedItemId = null, linkedItemType = null) => {
    const newNote = {
      id: Date.now().toString(),
      title: note.title || "Nota sin título",
      content: note.content || "",
      createdAt: new Date().toISOString(),
      linkedItemId,
      linkedItemType,
    };
    setNotes([...notes, newNote]);
    if (linkedItemId && linkedItemType) {
      if (linkedItemType === "objective") {
        setObjectives(
          objectives.map((obj) =>
            obj.id === linkedItemId ? { ...obj, notes: [...(obj.notes || []), newNote.id] } : obj
          )
        );
      } else if (linkedItemType === "task") {
        setTasks(
          tasks.map((task) =>
            task.id === linkedItemId ? { ...task, notes: [...(task.notes || []), newNote.id] } : task
          )
        );
      }
    }
  };

  const updateNote = (id, updatedFields) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, ...updatedFields } : note)));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    setObjectives(
      objectives.map((obj) => ({
        ...obj,
        notes: (obj.notes || []).filter((noteId) => noteId !== id),
      }))
    );
    setTasks(
      tasks.map((task) => ({
        ...task,
        notes: (task.notes || []).filter((noteId) => noteId !== id),
      }))
    );
  };

  const markUpdateAsSeen = (id) => {
    const updatedUpdates = updates.map((update) =>
      update.id === id ? { ...update, seen: true } : update
    );
    setUpdates(updatedUpdates);
    saveToLocalStorage("updates", updatedUpdates);
  };

  const tutorialSteps = [
    {
      message: "¡Bienvenido a Planify! Vamos a añadir un nuevo objetivo. Haz clic en el botón '+' en la parte superior derecha.",
      target: ".add-button",
      position: "bottom",
    },
    {
      message: "¡Perfecto! Ahora completa los campos y añade un objetivo. Luego, haz clic en 'Añadir'.",
      target: ".add-modal",
      position: "center",
    },
    {
      message: "¡Buen trabajo! Tu objetivo ha sido añadido. Ahora, complétalo haciendo clic en 'Detalles' y luego en 'Completar'.",
      target: "#pending-section",
      position: "top",
    },
    {
      message: "¡Excelente! Ahora veamos tus estadísticas. Haz clic en el botón de menú a la izquierda y selecciona 'Estadísticas'.",
      target: ".menu-button",
      position: "bottom",
    },
    {
      message: "¡Eso es todo! Ahora sabes cómo usar Planify. ¡Explora y organiza tus objetivos!",
      target: null,
      position: "center",
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col items-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Mensaje de Bienvenida */}
      {showWelcome && tutorialStep === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg max-w-md text-center`}>
            <h2 className="text-xl font-bold mb-4">¡Bienvenido a Planify!</h2>
            <p className="mb-4">Organiza tus objetivos y tareas de manera sencilla. ¿Quieres un tutorial rápido?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setTutorialStep(1)}
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
              >
                Sí, mostrar tutorial
              </button>
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setTutorialStep(0);
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
              >
                Saltar
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tutorial Overlay */}
      {tutorialStep > 0 && tutorialStep <= tutorialSteps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <div
            className={`${
              tutorialSteps[tutorialStep - 1].position === "center"
                ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                : tutorialSteps[tutorialStep - 1].position === "top"
                ? "absolute bottom-full mb-2"
                : "absolute top-full mt-2"
            } ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-4 rounded-lg shadow-lg max-w-sm text-center z-60`}
            style={
              tutorialSteps[tutorialStep - 1].target
                ? {
                    position: "absolute",
                    [tutorialSteps[tutorialStep - 1].position === "top" ? "bottom" : "top"]: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }
                : {}
            }
          >
            <p className="mb-4">{tutorialSteps[tutorialStep - 1].message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  if (tutorialStep === tutorialSteps.length) {
                    setTutorialStep(0);
                    setShowWelcome(false);
                  } else {
                    setTutorialStep(tutorialStep + 1);
                  }
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
              >
                {tutorialStep === tutorialSteps.length ? "Finalizar" : "Siguiente"}
              </button>
              <button
                onClick={() => {
                  setTutorialStep(0);
                  setShowWelcome(false);
                }}
                className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
              >
                Saltar
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mensajes de Actualización Dinámicos */}
      {!loadingUpdates &&
        updates
          .filter((update) => !update.seen)
          .map((update, index) => {
            console.log("Condiciones para mostrar mensaje:", {
              index,
              showWelcome,
              tutorialStep,
              update,
            });
            return (
              <AnimatePresence key={update.id}>
                {index === 0 && !showWelcome && tutorialStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  >
                    <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg max-w-md text-center`}>
                      <h2 className="text-xl font-bold mb-4">{update.title}</h2>
                      <p className="mb-4">{update.message}</p>
                      <button
                        onClick={() => markUpdateAsSeen(update.id)}
                        className={`px-4 py-2 rounded-lg ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}
                      >
                        Entendido
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}

      <div className="flex w-full max-w-7xl">
        {/* Sidebar Izquierdo */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-40 sm:static sm:flex"
            >
              <Sidebar
                darkMode={darkMode}
                setShowMenu={setShowMenu}
                setShowSummary={setShowSummary}
                setShowRightMenu={setShowRightMenu}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col items-center p-4 sm:p-6">
          <Header
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
            setShowAddModal={setShowAddModal}
            setShowMenu={setShowMenu}
          />
          <CalendarSection
            darkMode={darkMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            objectives={objectives}
            tasks={tasks}
            completedObjectives={completedObjectives}
            completedTasks={completedTasks}
          />
          <PendingSection
            darkMode={darkMode}
            selectedDate={selectedDate}
            objectives={objectives}
            tasks={tasks}
            completedObjectives={completedObjectives}
            completedTasks={completedTasks}
            setSelectedItem={setSelectedItem}
            undoCompleteItem={undoCompleteItem}
          />
          <Footer darkMode={darkMode}>
            {/* Botón para abrir la barra lateral derecha */}
            <button
              onClick={() => setShowRightMenu((prev) => !prev)}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"} flex items-center space-x-2`}
            >
              <FaStickyNote />
              <span>Notas</span>
            </button>
          </Footer>
        </div>

        {/* Sidebar Derecho */}
        <AnimatePresence>
          {showRightMenu && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed inset-y-0 right-0 z-40 sm:static sm:flex"
            >
              <RightSidebar
                darkMode={darkMode}
                setShowRightMenu={setShowRightMenu}
                objectives={objectives}
                tasks={tasks}
                completedObjectives={completedObjectives}
                completedTasks={completedTasks}
                notes={notes}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailsModal
            darkMode={darkMode}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            objectives={objectives}
            tasks={tasks}
            completedTasks={completedTasks}
            updateItem={updateItem}
            completeItem={completeItem}
            deleteItem={deleteItem}
            deleteCompletedItem={deleteCompletedItem}
            notes={notes}
            addNote={addNote}
            updateNote={updateNote}
            deleteNote={deleteNote}
          />
        )}
        {showAddModal && (
          <AddModal
            darkMode={darkMode}
            setShowAddModal={setShowAddModal}
            addItem={addItem}
            objectives={objectives}
          />
        )}
        {showSummary && (
          <SummaryModal
            darkMode={darkMode}
            showSummary={showSummary}
            view={{ date: selectedDate, type: showSummary }}
            objectives={objectives}
            tasks={tasks}
            completedObjectives={completedObjectives}
            completedTasks={completedTasks}
            history={history}
            setShowSummary={setShowSummary}
            setSelectedItem={setSelectedItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}