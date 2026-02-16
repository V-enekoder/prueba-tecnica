import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import esES from "date-fns/locale/es";
import axios from "axios";
import {
  CheckCircle,
  DollarSign,
  MessageCircle,
  Phone,
  Scissors,
  Search,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { es: esES };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// --- Interfaces ---
interface Appointment extends Event {
  id?: number;
  clientName: string;
  phoneNumber?: string;
  serviceType: string;
  price: number;
  attended: boolean;
  clientId?: number;
}

// --- Componente: Formulario de Cita ---
interface FormProps {
  formData: any;
  setFormData: (data: any) => void;
  suggestions: any[];
  onSearch: (q: string) => void;
  onSelectSuggestion: (client: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const AppointmentForm = ({
  formData,
  setFormData,
  suggestions,
  onSearch,
  onSelectSuggestion,
  onSubmit,
  onClose,
}: FormProps) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <h2>
          <Scissors size={20} /> Agendar Cita
        </h2>
        <button className="btn-icon" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="modal-body">
        <div className="input-group">
          <label>
            <User size={16} /> Nombre del Cliente
          </label>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar o escribir nombre..."
              value={formData.clientName}
              onChange={(e) => onSearch(e.target.value)}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => onSelectSuggestion(c)}
                  >
                    <Search size={14} /> {c.name} <small>({c.phone})</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="input-group">
          <label>
            <Phone size={16} /> Teléfono
          </label>
          <input
            type="tel"
            placeholder="Ej: 04121234567"
            value={formData.phoneNumber || ""}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>

        <div className="row">
          <div className="input-group flex-2">
            <label>
              <Scissors size={16} /> Servicio
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({ ...formData, serviceType: e.target.value })}
            >
              <option value="Básico">Corte Básico</option>
              <option value="Básico + Barba">Básico + Barba</option>
              <option value="Especial">Corte Especial / VIP</option>
            </select>
          </div>

          <div className="input-group flex-1">
            <label>
              <DollarSign size={16} /> Precio
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="frequent"
            checked={formData.saveAsFrequent}
            onChange={(e) =>
              setFormData({ ...formData, saveAsFrequent: e.target.checked })}
          />
          <label htmlFor="frequent">
            <Star
              size={16}
              className={formData.saveAsFrequent ? "star-active" : ""}
            />
            Guardar como Cliente Frecuente
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
        <button className="btn-submit" onClick={onSubmit}>
          Confirmar Cita
        </button>
      </div>
    </div>
  </div>
);

// --- Componente Principal ---
function App() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<
    { start: Date; end: Date } | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    phoneNumber: "",
    serviceType: "Básico",
    price: 15,
    saveAsFrequent: false,
  });
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await axios.get(`${API_URL}/appointments`);
    const formatted = res.data.map((evt: any) => ({
      ...evt,
      title: `${evt.clientName} - ${evt.serviceType}`,
      start: new Date(evt.start),
      end: new Date(evt.end),
    }));
    setEvents(formatted);
  };

  const handleClientSearch = async (query: string) => {
    setFormData({ ...formData, clientName: query });
    if (query.length > 2) {
      const res = await axios.get(`${API_URL}/clients/search?q=${query}`);
      setClientSuggestions(res.data);
    } else {
      setClientSuggestions([]);
    }
  };

  const selectSuggestedClient = (client: any) => {
    setFormData({
      ...formData,
      clientName: client.name,
      phoneNumber: client.phone,
      saveAsFrequent: true,
    });
    setClientSuggestions([]);
  };

  const handleSaveAppointment = async () => {
    if (!selectedSlot) return;
    await axios.post(`${API_URL}/appointments`, {
      ...formData,
      start: selectedSlot.start,
      end: selectedSlot.end,
    });
    setShowForm(false);
    resetForm();
    fetchAppointments();
  };

  const toggleAttended = async (event: Appointment) => {
    await axios.patch(`${API_URL}/appointments/${event.id}`, {
      attended: !event.attended,
    });
    setSelectedEvent(null);
    fetchAppointments();
  };

  const deleteAppointment = async (id: number) => {
    if (confirm("¿Eliminar cita?")) {
      await axios.delete(`${API_URL}/appointments/${id}`);
      setSelectedEvent(null);
      fetchAppointments();
    }
  };

  const sendWhatsApp = (event: Appointment) => {
    if (!event.phoneNumber) return alert("No hay teléfono registrado");
    const hora = format(new Date(event.start as Date), "HH:mm");
    const msg =
      `Hola ${event.clientName}, te recuerdo tu cita hoy a las ${hora} en la barbería.`;
    window.open(
      `https://wa.me/${event.phoneNumber.replace(/\D/g, "")}?text=${
        encodeURIComponent(msg)
      }`,
      "_blank",
    );
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      phoneNumber: "",
      serviceType: "Básico",
      price: 15,
      saveAsFrequent: false,
    });
  };

  const eventStyleGetter = (event: Appointment) => {
    let backgroundColor = "#3174ad";
    if (event.serviceType === "Especial") backgroundColor = "#D4AF37";
    if (event.serviceType === "Básico + Barba") backgroundColor = "#2E8B57";
    if (!event.attended && new Date(event.start as Date) < new Date()) {
      backgroundColor = "#C0392B";
    }
    if (event.attended) backgroundColor = "#7F8C8D";
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        border: "none",
      },
    };
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo">
          <span className="icon">💈</span>
          <h1>
            Barberia <span>Pro</span>
          </h1>
        </div>
        <div className="legend">
          <span className="dot gold"></span> Especial
          <span className="dot green"></span> Barba
          <span className="dot red"></span> Pendiente
        </div>
      </header>

      <main className="calendar-card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={(slot) => {
            setSelectedSlot(slot);
            setShowForm(true);
          }}
          onSelectEvent={(event) => setSelectedEvent(event as Appointment)}
          eventPropGetter={eventStyleGetter}
          culture="es"
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Sem",
            day: "Día",
            agenda: "Agenda",
          }}
        />
      </main>

      {showForm && (
        <AppointmentForm
          formData={formData}
          setFormData={setFormData}
          suggestions={clientSuggestions}
          onSearch={handleClientSearch}
          onSelectSuggestion={selectSuggestedClient}
          onSubmit={handleSaveAppointment}
          onClose={() => setShowForm(false)}
        />
      )}

      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-card detail-card">
            <div className="modal-header">
              <h3>Detalles de la Cita</h3>
              <button
                className="btn-icon"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <User size={18} /> <span>{selectedEvent.clientName}</span>
              </div>
              <div className="detail-row">
                <Scissors size={18} /> <span>{selectedEvent.serviceType}</span>
              </div>
              <div className="detail-row">
                <CheckCircle size={18} />
                <span
                  className={selectedEvent.attended
                    ? "status-ok"
                    : "status-wait"}
                >
                  {selectedEvent.attended ? "Atendido" : "Pendiente de cobro"}
                </span>
              </div>

              <div className="action-grid">
                <button
                  onClick={() => sendWhatsApp(selectedEvent)}
                  className="btn-wa"
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <button
                  onClick={() => toggleAttended(selectedEvent)}
                  className="btn-check"
                >
                  <CheckCircle size={18} /> {selectedEvent.attended
                    ? "Reabrir Cita"
                    : "Marcar como Atendido"}
                </button>
                <button
                  onClick={() => deleteAppointment(selectedEvent.id!)}
                  className="btn-danger"
                >
                  <Trash2 size={18} /> Cancelar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        :root { --primary: #3174ad; --dark: #1a1a1a; --light-bg: #f4f7f6; }
        .app-container { padding: 20px; background: var(--light-bg); min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }

        .main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo h1 { margin: 0; font-size: 1.5rem; color: var(--dark); }
        .logo h1 span { color: var(--primary); font-weight: 800; }
        .legend { display: flex; gap: 15px; font-size: 0.85rem; font-weight: 600; color: #555; }
        .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .dot.gold { background: #D4AF37; } .dot.green { background: #2E8B57; } .dot.red { background: #C0392B; }

        .calendar-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); height: 80vh; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background: white; width: 90%; max-width: 420px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; animation: scaleIn 0.2s ease-out; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-header { background: var(--dark); color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2, .modal-header h3 { margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }

        .modal-body { padding: 24px; }
        .input-group { margin-bottom: 18px; }
        .input-group label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: #444; margin-bottom: 8px; }
        .input-group input, .input-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-size: 1rem; box-sizing: border-box; }

        .search-container { position: relative; }
        .suggestions-list { position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #ddd; border-radius: 10px; margin-top: 5px; list-style: none; padding: 0; z-index: 100; box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
        .suggestions-list li { padding: 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
        .suggestions-list li:hover { background: #f8f9fa; }

        .row { display: flex; gap: 15px; }
        .flex-2 { flex: 2; } .flex-1 { flex: 1; }

        .checkbox-group { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
        .checkbox-group label { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer; color: #555; font-weight: 500; }
        .star-active { color: #f1c40f; fill: #f1c40f; }

        .modal-footer { padding: 18px 24px; background: #f8f9fa; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel { background: white; border: 1px solid #ddd; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; color: #666; }
        .btn-submit { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; }

        .detail-row { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; font-size: 1.1rem; color: #333; font-weight: 500; }
        .status-ok { color: #2E8B57; font-weight: 700; }
        .status-wait { color: #C0392B; font-weight: 700; }

        .action-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 25px; }
        .btn-wa { background: #25D366; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; }
        .btn-check { background: #2E8B57; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; }
        .btn-danger { background: #f8d7da; color: #C0392B; border: none; padding: 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; }
        .btn-icon { background: none; border: none; color: white; cursor: pointer; padding: 5px; border-radius: 50%; display: flex; }
        .btn-icon:hover { background: rgba(255,255,255,0.1); }
      `}
      </style>
    </div>
  );
}

export default App;
