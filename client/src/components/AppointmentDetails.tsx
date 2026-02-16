import { CheckCircle, MessageCircle, Trash2, X } from "lucide-react";
import type { Appointment } from "../types"; // <--- Agregado 'type'

interface Props {
  event: Appointment;
  onClose: () => void;
  onDelete: (id: number) => void;
  onToggleAttended: (event: Appointment) => void;
  onSendWhatsApp: (event: Appointment) => void;
}

export const AppointmentDetails = (
  { event, onClose, onDelete, onToggleAttended, onSendWhatsApp }: Props,
) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h3>Detalles de la Cita</h3>
        <button className="btn-icon" onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="modal-body">
        <p>
          <strong>Cliente:</strong> {event.clientName}
        </p>
        <p>
          <strong>Servicio:</strong> {event.serviceType}
        </p>
        <p>
          <strong>Precio:</strong> ${event.price}
        </p>
        <div className="action-grid">
          <button className="btn-wa" onClick={() => onSendWhatsApp(event)}>
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button className="btn-check" onClick={() => onToggleAttended(event)}>
            <CheckCircle size={18} />{" "}
            {event.attended ? "Reabrir Cita" : "Marcar como Atendido"}
          </button>
          <button className="btn-danger" onClick={() => onDelete(event.id!)}>
            <Trash2 size={18} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
);
