import { Clock, MessageCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import type { Appointment } from "../types";
import { ClientSearch } from "./ClientSearch.tsx";

interface Props {
  revenue: number;
  totalCitas: number;
  pendingNext: Appointment[];
  onSelectEvent: (event: Appointment) => void;
  onSendWhatsApp: (event: Appointment) => void;
}

export const Sidebar = (
  { revenue, totalCitas, pendingNext, onSelectEvent, onSendWhatsApp }: Props,
) => (
  <aside className="sidebar">
    <div className="client-search-box">
      <ClientSearch />
    </div>
    <div className="stat-card">
      <h3>
        <TrendingUp size={18} /> Resumen de Hoy
      </h3>
      <div className="big-stat">
        <span>Recaudado</span>
        <strong>${revenue}</strong>
      </div>
      <div className="mini-stat">
        <span>Citas Totales</span>
        <strong>{totalCitas}</strong>
      </div>
    </div>
    <div className="next-clients-card">
      <h3>
        <Clock size={18} /> Próximos Clientes
      </h3>
      <div className="client-list">
        {pendingNext.length > 0
          ? pendingNext.map((cita) => (
            <div
              key={cita.id}
              className="client-row"
              onClick={() => onSelectEvent(cita)}
            >
              <div className="client-info">
                <span className="client-time">
                  {format(new Date(cita.start as Date), "HH:mm")}
                </span>
                <span className="client-name">{cita.clientName}</span>
              </div>
              <button
                className="btn-wa-mini"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendWhatsApp(cita);
                }}
              >
                <MessageCircle size={14} />
              </button>
            </div>
          ))
          : <p className="empty">Sin citas pendientes</p>}
      </div>
    </div>
  </aside>
);
