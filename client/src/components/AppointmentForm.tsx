import {
  DollarSign,
  Phone,
  Scissors,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import type { Appointment } from "../types";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  suggestions: any[];
  onSearch: (q: string) => void;
  onSelectSuggestion: (client: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const AppointmentForm = (
  {
    formData,
    setFormData,
    suggestions,
    onSearch,
    onSelectSuggestion,
    onSubmit,
    onClose,
  }: Props,
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
