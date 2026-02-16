import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, getDay, isToday, parse, startOfWeek } from "date-fns";
import esES from "date-fns/locale/es";
import axios from "axios";
import {
  CheckCircle,
  Clock,
  DollarSign,
  MessageCircle,
  Phone,
  Scissors,
  Search,
  Star,
  Trash2,
  TrendingUp,
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
const AppointmentForm = (
  {
    formData,
    setFormData,
    suggestions,
    onSearch,
    onSelectSuggestion,
    onSubmit,
    onClose,
  }: any,
) => (
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
              placeholder="Buscar..."
              value={formData.clientName}
              onChange={(e) => onSearch(e.target.value)}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((c: any) => (
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
                setFormData({ ...formData, price: Number(e.target.value) })}
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
            />{" "}
            Cliente Frecuente
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
        <button className="btn-submit" onClick={onSubmit}>Confirmar</button>
      </div>
    </div>
  </div>
);

function App() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<
    { start: Date; end: Date } | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientName: "",
    phoneNumber: "",
    serviceType: "Básico",
    price: 15,
    saveAsFrequent: false,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await axios.get(`${API_URL}/appointments`);
    setEvents(
      res.data.map((evt: any) => ({
        ...evt,
        title: `${evt.clientName}`,
        start: new Date(evt.start),
        end: new Date(evt.end),
      })),
    );
  };

  const appointmentsToday = events.filter((e) =>
    isToday(new Date(e.start as Date))
  );
  const revenueToday = appointmentsToday.filter((e) => e.attended).reduce(
    (acc, curr) => acc + curr.price,
    0,
  );
  const pendingNext = appointmentsToday
    .filter((e) => !e.attended && new Date(e.start as Date) > new Date())
    .sort((a, b) =>
      new Date(a.start as Date).getTime() - new Date(b.start as Date).getTime()
    );

  const handleClientSearch = async (query: string) => {
    setFormData({ ...formData, clientName: query });
    if (query.length > 2) {
      const res = await axios.get(`${API_URL}/clients/search?q=${query}`);
      setClientSuggestions(res.data);
    } else setClientSuggestions([]);
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
    setFormData({
      clientName: "",
      phoneNumber: "",
      serviceType: "Básico",
      price: 15,
      saveAsFrequent: false,
    });
    fetchAppointments();
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo">
          <h1>
            Barberia <span>Pro</span>
          </h1>
        </div>
        <div className="legend">
          <span className="dot gold"></span> Especial{" "}
          <span className="dot green"></span> Barba{" "}
          <span className="dot red"></span> Pendiente
        </div>
      </header>

      <div className="dashboard-layout">
        {/* LADO IZQUIERDO: CALENDARIO */}
        <div className="calendar-container">
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
            eventPropGetter={(event: any) => {
              let bg = "#3174ad";
              if (event.serviceType === "Especial") bg = "#D4AF37";
              if (event.serviceType === "Básico + Barba") bg = "#2E8B57";
              if (!event.attended && new Date(event.start) < new Date()) {bg =
                  "#C0392B";}
              if (event.attended) bg = "#7F8C8D";
              return {
                style: {
                  backgroundColor: bg,
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                },
              };
            }}
            culture="es"
          />
        </div>

        {/* LADO DERECHO: SIDEBAR */}
        <aside className="sidebar">
          <div className="stat-card">
            <h3>
              <TrendingUp size={18} /> Hoy
            </h3>
            <div className="big-stat">
              <span>Recaudado</span>
              <strong>${revenueToday}</strong>
            </div>
            <div className="mini-stat">
              <span>Citas</span>
              <strong>{appointmentsToday.length}</strong>
            </div>
          </div>

          <div className="next-clients-card">
            <h3>
              <Clock size={18} /> Próximos
            </h3>
            <div className="client-list">
              {pendingNext.length > 0
                ? pendingNext.map((cita) => (
                  <div
                    key={cita.id}
                    className="client-row"
                    onClick={() => setSelectedEvent(cita)}
                  >
                    <div className="client-time">
                      {format(new Date(cita.start as Date), "HH:mm")}
                    </div>
                    <div className="client-name">{cita.clientName}</div>
                  </div>
                ))
                : <p className="empty">Sin citas pendientes</p>}
            </div>
          </div>
        </aside>
      </div>

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
          <div className="modal-card">
            <div className="modal-header">
              <h3>Cita: {selectedEvent.clientName}</h3>
              <button
                className="btn-icon"
                onClick={() => setSelectedEvent(null)}
              >
                <X />
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Servicio:</strong> {selectedEvent.serviceType}
              </p>
              <p>
                <strong>Precio:</strong> ${selectedEvent.price}
              </p>
              <div className="action-grid">
                <button
                  className="btn-wa"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${
                        selectedEvent.phoneNumber?.replace(/\D/g, "")
                      }`,
                      "_blank",
                    )}
                >
                  <MessageCircle /> WhatsApp
                </button>
                <button
                  className="btn-check"
                  onClick={async () => {
                    await axios.patch(
                      `${API_URL}/appointments/${selectedEvent.id}`,
                      { attended: !selectedEvent.attended },
                    );
                    setSelectedEvent(null);
                    fetchAppointments();
                  }}
                >
                  <CheckCircle />{" "}
                  {selectedEvent.attended ? "Reabrir" : "Atendido"}
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    if (confirm("¿Borrar?")) {
                      await axios.delete(
                        `${API_URL}/appointments/${selectedEvent.id}`,
                      );
                      setSelectedEvent(null);
                      fetchAppointments();
                    }
                  }}
                >
                  <Trash2 /> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        :root { --bg: #f4f7f6; --dark: #1a1a1a; --primary: #3174ad; }

        /* Layout Full Width */
        .app-container {
          width: 100vw;
          height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          padding: 20px;
          box-sizing: border-box;
          margin: 0;
        }

        .main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; width: 100%; }
        .logo h1 { margin: 0; font-size: 1.5rem; }
        .logo h1 span { color: var(--primary); }
        .legend { display: flex; gap: 15px; font-size: 0.8rem; font-weight: bold; }
        .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .dot.gold { background: #D4AF37; } .dot.green { background: #2E8B57; } .dot.red { background: #C0392B; }

        .dashboard-layout {
          display: flex;
          gap: 20px;
          flex: 1;
          width: 100%;
          min-height: 0; /* Importante para que el scroll funcione bien */
        }

        .calendar-container {
          flex: 3;
          background: white;
          border-radius: 15px;
          padding: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          height: 100%;
        }

        .sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 300px;
        }

        .stat-card { background: var(--dark); color: white; padding: 20px; border-radius: 15px; }
        .stat-card h3 { margin: 0 0 15px 0; color: #888; display: flex; align-items: center; gap: 8px; }
        .big-stat { display: flex; flex-direction: column; margin-bottom: 15px; }
        .big-stat strong { font-size: 2.2rem; color: #2ecc71; }
        .mini-stat { border-top: 1px solid #333; padding-top: 10px; display: flex; justify-content: space-between; }

        .next-clients-card {
          background: white;
          flex: 1;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .client-list { overflow-y: auto; flex: 1; margin-top: 10px; }
        .client-row { padding: 12px; background: #f9f9f9; border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; gap: 15px; align-items: center; }
        .client-row:hover { background: #f0f7ff; }
        .client-time { font-weight: bold; color: var(--primary); }

        /* Modales */
        .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:2000; backdrop-filter: blur(4px); }
        .modal-card { background:white; padding:25px; border-radius:15px; width:400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .input-group { margin-bottom: 15px; position: relative; }
        .input-group label { display: flex; align-items: center; gap: 5px; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; }
        .input-group input, .input-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        .suggestions-list { position: absolute; background: white; width: 100%; border: 1px solid #ddd; z-index: 10; list-style: none; padding: 0; margin: 0; border-radius: 8px; }
        .suggestions-list li { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; }
        .row { display: flex; gap: 10px; }
        .flex-2 { flex: 2; } .flex-1 { flex: 1; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-submit { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .btn-cancel { background: #eee; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }

        .action-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .btn-wa { background: #25D366; color: white; border: none; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: bold; }
        .btn-check { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: bold; }
        .btn-danger { background: #ffebee; color: #c0392b; border: none; padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-weight: bold; }
      `}
      </style>
    </div>
  );
}

export default App;
