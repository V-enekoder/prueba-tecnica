import { useState } from "react";
import { Clock, Search, User, X } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "../types";
import "./ClientSearch.css"; // <--- Su propio CSS

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const ClientSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<Appointment[] | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length > 2) {
      const res = await axios.get(`${API_URL}/clients/search?q=${q}`);
      setResults(res.data);
    } else {
      setResults([]);
    }
  };

  const viewHistory = async (client: any) => {
    const res = await axios.get(`${API_URL}/clients/${client.id}/history`);
    setHistory(res.data);
    setSelectedClient(client);
    setResults([]);
    setQuery("");
  };

  return (
    <div className="client-search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Buscar historial de cliente..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <ul className="search-results-dropdown">
          {results.map((c) => (
            <li key={c.id} onClick={() => viewHistory(c)}>
              <User size={14} /> <span>{c.name}</span> <small>{c.phone}</small>
            </li>
          ))}
        </ul>
      )}

      {history && (
        <div className="history-modal-overlay">
          <div className="history-card">
            <div className="history-header">
              <h3>Historial: {selectedClient.name}</h3>
              <button onClick={() => setHistory(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="history-list">
              {history.length > 0
                ? history.map((apt) => (
                  <div key={apt.id} className="history-item">
                    <Clock size={14} />
                    <div className="history-info">
                      <span className="history-date">
                        {format(new Date(apt.start as Date), "PPP p", {
                          locale: es,
                        })}
                      </span>
                      <span className="history-service">
                        {apt.serviceType} - ${apt.price}
                      </span>
                    </div>
                    <span
                      className={`status-pill ${
                        apt.attended ? "done" : "missed"
                      }`}
                    >
                      {apt.attended ? "Asistió" : "No asistió"}
                    </span>
                  </div>
                ))
                : <p>Este cliente no tiene citas registradas.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
