import { FaGithub, FaHeart } from "react-icons/fa";

export default function Footer({ darkMode }) {
  return (
    <footer className={`w-full max-w-3xl text-center text-sm sm:text-base py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
      <p>
        Hecho con <FaHeart className="inline text-red-500 mx-1" /> por el equipo de Planify
      </p>
      <p className="mt-2">
        <a
          href="https://github.com/xAI-Planify"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center space-x-1 hover:underline ${darkMode ? "text-white" : "text-black"}`}
        >
          <FaGithub /> <span>GitHub</span>
        </a>
      </p>
      <p className="mt-2">© {new Date().getFullYear()} Planify. Todos los derechos reservados.</p>
    </footer>
  );
}