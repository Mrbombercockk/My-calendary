export const getTimeRemaining = (targetDate) => {
    if (!targetDate) return "Fecha no válida";
  
    const now = new Date();
    const target = new Date(targetDate);
  
    // Asegurar que ambas fechas estén en la misma zona horaria (UTC)
    const nowLocal = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const targetLocal = new Date(target.toLocaleString("en-US", { timeZone: "UTC" }));
  
    const diffMs = targetLocal - nowLocal;
  
    if (diffMs <= 0) return "¡Tiempo agotado!";
  
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
    if (days > 0) return `${days} día${days !== 1 ? "s" : ""} ${hours} hora${hours !== 1 ? "s" : ""}`;
    if (hours > 0) return `${hours} hora${hours !== 1 ? "s" : ""} ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
    if (minutes > 0) return `${minutes} minuto${minutes !== 1 ? "s" : ""} ${seconds} segundo${seconds !== 1 ? "s" : ""}`;
    return `${seconds} segundo${seconds !== 1 ? "s" : ""}`;
  };