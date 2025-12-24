import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { type CalendarViewProps, type CalendarEvent } from "../../types";
import { SkeletonCalendar } from "./SkeletonLoader";

// Configure moment.js with Portuguese locale
moment.locale("pt-br");
const localizer = momentLocalizer(moment);

// Portuguese messages for calendar
const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Horário",
  event: "Evento",
  noEventsInRange: "Não há eventos neste período.",
  showMore: (total: number) => `+ ${total} mais`,
};

export const EventCalendar: React.FC<CalendarViewProps> = ({
  events,
  loading = false,
  onEventClick,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <SkeletonCalendar />;
  }

  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event.id,
    title: event.name,
    start: new Date(event.date_begin),
    end: new Date(event.date_end),
    resource: event,
    status: event.status,
    color:
      event.status === "open"
        ? "var(--color-success)"
        : "var(--color-secondary)",
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event.resource);
    } else {
      // Default behavior: navigate to event page
      navigate(`/events/${event.resource.id}`);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor:
          event.status === "open"
            ? "var(--color-success)"
            : "var(--color-secondary)",
        borderRadius: "var(--input-radius, 0.5rem)",
        opacity: event.status === "open" ? 0.9 : 0.6,
        color: "white",
        border: "none",
        fontSize: "0.75rem",
        fontWeight: "500",
      },
    };
  };

  return (
    <div className="event-calendar-container">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        style={{ height: 500 }}
        className="sesamum-calendar"
        views={["month"]} // Only month view as requested
        defaultView="month"
        popup
        showMultiDayTimes
        step={60}
        showAllEvents
      />
    </div>
  );
};
