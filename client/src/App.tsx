import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, getDay, isToday, parse, startOfWeek } from "date-fns";
import esES from "date-fns/locale/es";
import axios from "axios";
import { useMemo } from "react";

import type { Appointment } from "./types";
import { AppointmentForm } from "./components/AppointmentForm";
import { AppointmentDetails } from "./components/AppointmentDetails";
import { Sidebar } from "./components/Sidebar";
import { CustomToolbar } from "./components/CustomToolbar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

const locales = { es: esES };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
        title: evt.clientName,
        start: new Date(evt.start),
        end: new Date(evt.end),
      })),
    );
  };

  const { revenueToday, totalCitasHoy, pendingNext } = useMemo(() => {
    const ahora = new Date();

    const citasDeHoy = events.filter((e) => isToday(e.start as Date));

    const revenue = citasDeHoy
      .filter((e) => e.attended)
      .reduce((acc, curr) => acc + curr.price, 0);

    const proximos = citasDeHoy
      .filter((e) => !e.attended)
      .sort((a, b) =>
        new Date(a.start as Date).getTime() -
        new Date(b.start as Date).getTime()
      );

    return {
      revenueToday: revenue,
      totalCitasHoy: citasDeHoy.length,
      pendingNext: proximos,
    };
  }, [events]);

  const handleClientSearch = async (query: string) => {
    setFormData({ ...formData, clientName: query });
    if (query.length > 2) {
      try {
        const res = await axios.get(`${API_URL}/clients/search?q=${query}`);
        setClientSuggestions(res.data);
      } catch (e) {
        setClientSuggestions([]);
      }
    } else setClientSuggestions([]);
  };

  const handleSaveAppointment = async () => {
    if (!selectedSlot) return;

    try {
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
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.error === "PAST_DATE") {
        alert(`🚫 ${errorData.message}`);
      } else if (errorData?.error === "COLLISION") {
        alert(`⚠️ ¡Conflicto! \n${errorData.message}`);
      } else {
        alert("Ocurrió un error inesperado.");
      }
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

  const [view, setView] = useState<View>("month");

  const [date, setDate] = useState(new Date());

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
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            view={view}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={(slot) => {
              const ahora = new Date();

              if (slot.start < ahora) {
                alert("❌ No puedes agendar citas en el pasado.");
                return;
              }

              setSelectedSlot(slot);
              setShowForm(true);
            }}
            slotPropGetter={(date) => {
              if (date < new Date()) {
                return {
                  style: {
                    backgroundColor: "#f0f0f0",
                    cursor: "not-allowed",
                    opacity: 0.6,
                  },
                };
              }
              return {};
            }}
            onSelectEvent={(event) => setSelectedEvent(event as Appointment)}
            culture="es"
            components={{
              toolbar: CustomToolbar,
            }}
            messages={{
              allDay: "Todo el día",
              previous: "Anterior",
              next: "Siguiente",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay citas en este rango",
              showMore: (total) => `+ Ver más (${total})`,
            }}
            style={{ height: "100%" }}
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
          />
        </div>

        <Sidebar
          revenue={revenueToday}
          totalCitas={totalCitasHoy}
          pendingNext={pendingNext}
          onSelectEvent={(e) => setSelectedEvent(e)}
          onSendWhatsApp={sendWhatsApp}
        />
      </div>

      {showForm && (
        <AppointmentForm
          formData={formData}
          setFormData={setFormData}
          suggestions={clientSuggestions}
          onSearch={handleClientSearch}
          onSelectSuggestion={(c: any) => {
            setFormData({
              ...formData,
              clientName: c.name,
              phoneNumber: c.phone,
              saveAsFrequent: true,
            });
            setClientSuggestions([]);
          }}
          onSubmit={handleSaveAppointment}
          onClose={() => setShowForm(false)}
        />
      )}

      {selectedEvent && (
        <AppointmentDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSendWhatsApp={sendWhatsApp}
          onDelete={async (id) => {
            if (confirm("¿Borrar cita?")) {
              await axios.delete(`${API_URL}/appointments/${id}`);
              setSelectedEvent(null);
              fetchAppointments();
            }
          }}
          onToggleAttended={async (event) => {
            await axios.patch(`${API_URL}/appointments/${event.id}`, {
              attended: !event.attended,
            });
            setSelectedEvent(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}

export default App;
