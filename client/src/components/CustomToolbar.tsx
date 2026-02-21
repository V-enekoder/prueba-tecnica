import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ToolbarProps } from "react-big-calendar";
import type { Appointment } from "../types";
import "./CustomToolbar.css";

export const CustomToolbar = (props: ToolbarProps<Appointment>) => {
  const { label, onNavigate, onView, view } = props;

  const goToBack = () => onNavigate("PREV");
  const goToNext = () => onNavigate("NEXT");
  const goToToday = () => onNavigate("TODAY");

  /*const handleViewChange = (newView: View) => {
    onView(newView);
  };*/

  return (
    <div className="custom-toolbar">
      <div className="toolbar-navigation">
        <button onClick={goToToday} className="btn-today">
          Hoy
        </button>
        <button onClick={goToBack} className="btn-nav">
          <ChevronLeft size={20} />
        </button>
        <button onClick={goToNext} className="btn-nav">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="toolbar-label">
        <CalendarIcon size={20} className="calendar-icon" />
        <h2>{label}</h2>
      </div>

      <div className="toolbar-views">
        <button
          onClick={() => onView("month")}
          className={view === "month" ? "active" : ""}
        >
          Mes
        </button>
        <button
          onClick={() => onView("week")}
          className={view === "week" ? "active" : ""}
        >
          Semana
        </button>
        <button
          onClick={() => onView("day")}
          className={view === "day" ? "active" : ""}
        >
          Día
        </button>
        <button
          onClick={() => onView("agenda")}
          className={view === "agenda" ? "active" : ""}
        >
          Agenda
        </button>
      </div>
    </div>
  );
};
