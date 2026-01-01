import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptbrLocales from "@fullcalendar/core/locales/pt-br";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useNavigate } from "react-router-dom";
import { type CalendarViewProps } from "../../types";
import { SkeletonCalendar } from "./SkeletonLoader";

// Configure dayjs with Portuguese locale
dayjs.locale("pt-br");

export const EventCalendar: React.FC<CalendarViewProps> = ({
  events,
  loading = false,
  //onEventClick,
}) => {
  const navigate = useNavigate();
  const events_converted = events.map((event) => ({
    id: String(event.id),
    title: event.name,
    start: event.date_begin,
    end: event.date_end,
    extendedProps: {
      type: event.type,
    },
  }));

  if (loading) {
    return <SkeletonCalendar />;
  }
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      weekends={true}
      eventClassNames={(arg) => [
        "hover:cursor-pointer",
        arg.event.extendedProps.type === "project" ? "calendar-project" : "",
      ]}
      eventDisplay="auto"
      locale={ptbrLocales}
      events={events_converted}
      eventClick={(info) => {
        navigate(info.event.url || "/events/" + String(info.event.title));
      }}
    />
  );
};

export default EventCalendar;
