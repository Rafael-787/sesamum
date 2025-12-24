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
