import {
  Clock,
  DollarSign,
  MessageCircle,
  Search,
  Sparkles, // <--- Añadido
  TrendingUp,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import type { Appointment } from "../types";
import { ClientSearch } from "./ClientSearch";
import "./Sidebar.css";

interface Props {
  revenue: number;
  totalCitas: number;
  pendingNext: Appointment[];
  showPredictions: boolean;
  onPredict: () => void;
  onSelectEvent: (event: Appointment) => void;
  onSendWhatsApp: (event: Appointment) => void;
}

export const Sidebar = ({
  revenue,
  totalCitas,
  pendingNext,
  showPredictions,
  onPredict,
  onSelectEvent,
  onSendWhatsApp,
}: Props) => {
  return (
    <aside className="sidebar-container">
      {/* Buscador Superior */}
      <div className="search-section">
        <ClientSearch />
      </div>

      {/* Tarjeta de Estadísticas Principal */}
      <div className="stats-dashboard">
        <div className="stats-header">
          <TrendingUp size={16} />
          <span>RESUMEN DE HOY</span>
        </div>

        <div className="main-stat">
          <div className="stat-icon-bg">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p>Recaudado</p>
            <span className="revenue-text">${revenue}</span>
          </div>
        </div>

        <div className="secondary-stats">
          <div className="sec-stat-item">
            <Users size={16} />
            <div>
              <strong>{totalCitas}</strong>
              <p>Citas hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Predicción Mejorado */}
      <button
        className={`btn-predict ${showPredictions ? "active" : ""}`}
        onClick={onPredict}
      >
        <Sparkles size={18} />
        <span>
          {showPredictions ? "Ocultar Predicciones" : "Predecir Demanda"}
        </span>
      </button>

      {/* Lista de Próximos Clientes */}
      <div className="agenda-section">
        <div className="section-title">
          <Clock size={18} />
          <h3>Próximos Clientes</h3>
        </div>

        <div className="scroll-area">
          {pendingNext.length > 0
            ? (
              pendingNext.map((cita) => (
                <div
                  key={cita.id}
                  className="appointment-card-mini"
                  onClick={() => onSelectEvent(cita)}
                >
                  <div className="time-badge">
                    {format(new Date(cita.start as Date), "HH:mm")}
                  </div>

                  <div className="client-details">
                    <span className="name">{cita.clientName}</span>
                    <span className="service">{cita.serviceType}</span>
                  </div>

                  <button
                    className="whatsapp-quick-btn"
                    title="Enviar recordatorio"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendWhatsApp(cita);
                    }}
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              ))
            )
            : (
              <div className="empty-state">
                <p>No hay más citas pendientes</p>
              </div>
            )}
        </div>
      </div>
    </aside>
  );
};
