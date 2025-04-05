import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarSection({
  darkMode,
  selectedDate,
  setSelectedDate,
  objectives,
  tasks,
  completedObjectives,
  completedTasks,
}) {
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const pendingObjectives = objectives.filter((obj) => {
      const objDate = new Date(obj.date);
      return objDate >= dayStart && objDate <= dayEnd;
    }).length;

    const pendingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate >= dayStart && taskDate <= dayEnd;
    }).length;

    const completedObjs = completedObjectives.filter((obj) => {
      const objDate = new Date(obj.completedDate);
      return objDate >= dayStart && objDate <= dayEnd;
    }).length;

    const completedTsks = completedTasks.filter((task) => {
      const taskDate = new Date(task.completedDate);
      return taskDate >= dayStart && taskDate <= dayEnd;
    }).length;

    const totalPending = pendingObjectives + pendingTasks;
    const totalCompleted = completedObjs + completedTsks;

    return (
      <div className="tile-indicators">
        {totalPending > 0 && <span className="pending">{totalPending}</span>}
        {totalCompleted > 0 && <span className="completed">{totalCompleted}</span>}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mb-6 sm:mb-8">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
        className={`w-full rounded-xl shadow-xl p-4 sm:p-6 ${darkMode ? "react-calendar--dark" : "react-calendar--light"}`}
      />
    </div>
  );
}