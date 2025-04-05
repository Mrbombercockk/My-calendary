import React from "react";
import { FaPlus, FaSun, FaMoon, FaBars } from "react-icons/fa";

export default function Header({ darkMode, toggleDarkMode, setShowAddModal, setShowMenu }) {
  return (
    <header className="w-full flex justify-between items-center p-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"} menu-button`}
        >
          <FaBars />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">Planify</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowAddModal(true)}
          className={`p-2 rounded-full ${darkMode ? "bg-white text-black" : "bg-black text-white"} add-button`}
        >
          <FaPlus />
        </button>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </header>
  );
}