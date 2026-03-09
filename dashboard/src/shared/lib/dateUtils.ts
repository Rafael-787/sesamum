export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateShort = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calendar-specific utilities
export const toCalendarDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const formatCalendarTitle = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const isEventToday = (eventDateString: string): boolean => {
  const today = new Date();
  const eventDate = new Date(eventDateString);
  return today.toDateString() === eventDate.toDateString();
};

export const isEventThisWeek = (eventDateString: string): boolean => {
  const today = new Date();
  const eventDate = new Date(eventDateString);
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

  return eventDate >= weekStart && eventDate <= weekEnd;
};

export const getEventStatus = (event: {
  date_begin: string;
  date_end: string;
  status: string;
}) => {
  const now = new Date();
  const startDate = new Date(event.date_begin);
  const endDate = new Date(event.date_end);

  if (event.status === "close") return "Encerrado";
  if (now < startDate) return "Próximo";
  if (now >= startDate && now <= endDate) return "Em andamento";
  if (now > endDate) return "Finalizado";

  return "Aberto";
};

// Form date conversion utilities
export const formatDateToISO = (dateStr: string): string => {
  if (!dateStr) return "";

  const parts = dateStr.trim().split(" ");
  const datePart = parts[0];
  const timePart = parts[1] || "00:00";

  if (!datePart.includes("/")) {
    // Se for um formato reconhecido que não seja DD/MM/YYYY
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toISOString();
  }

  const [day, month, year] = datePart.split("/");
  const [hour, minute] = timePart.split(":");

  // Instancia a data no fuso local e exporta em ISO 8601 com 'Z' (UTC)
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
  );

  return date.toISOString();
};

export const formatDateToDDMMYYYY = (isoDate: string): string => {
  if (!isoDate) return "";

  if (isoDate.includes("/")) return isoDate.split(" ")[0]; // Fallback se já estiver formatada

  // Lê a data convertendo de volta para o horário local para exibir corretamente no input
  if (isoDate.includes("T")) {
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // Fallback para datas que venham apenas como "YYYY-MM-DD" sem horário e sem UTC
  const datePart = isoDate.split(/T|\s/)[0];
  if (!datePart.includes("-")) return isoDate;

  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
};

export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || dateStr.includes("_")) return false;

  const dateOnly = dateStr.trim().split(" ")[0];
  const [day, month, year] = dateOnly.split("/");

  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() === parseInt(month) - 1 &&
    date.getDate() === parseInt(day)
  );
};
