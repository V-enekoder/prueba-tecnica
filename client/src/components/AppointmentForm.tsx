import { useEffect } from "react";
import {
  DollarSign,
  Phone,
  Plus,
  Scissors,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import "./AppointmentForm.css";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  suggestions: any[];
  onSearch: (q: string) => void;
  onSelectSuggestion: (client: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

// Mapa de precios sugeridos
const SUGGESTED_PRICES: Record<string, number> = {
  "Básico": 15,
  "Básico + Barba": 25,
  "Especial": 35,
};

export const AppointmentForm = ({
  formData,
  setFormData,
  suggestions,
  onSearch,
  onSelectSuggestion,
  onSubmit,
  onClose,
}: Props) => {
  // Efecto para actualizar precio automáticamente al cambiar servicio
  useEffect(() => {
    if (SUGGESTED_PRICES[formData.serviceType]) {
      setFormData((prev: any) => ({
        ...prev,
        price: SUGGESTED_PRICES[formData.serviceType],
      }));
    }
  }, [formData.serviceType, setFormData]);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-circle">
              <Plus size={20} />
            </div>
            <div>
              <h2>Agendar Cita</h2>
              <p>Completa los datos del servicio</p>
            </div>
          </div>
          <button className="btn-close-x" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Nombre del Cliente con Buscador mejorado */}
          <div className="input-group">
            <label>
              <User size={16} /> Nombre del Cliente
            </label>
            <div className="search-wrapper">
              <input
                type="text"
                className="main-input"
                placeholder="Ej: Juan Pérez..."
                value={formData.clientName}
                onChange={(e) => onSearch(e.target.value)}
              />
              {suggestions.length > 0 && (
                <ul className="floating-suggestions">
                  {suggestions.map((c) => (
                    <li
                      key={c.id}
                      onClick={() => onSelectSuggestion(c)}
                    >
                      <Search size={14} />
                      <div className="suggestion-info">
                        <span className="s-name">{c.name}</span>
                        <span className="s-phone">{c.phone}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="input-group">
            <label>
              <Phone size={16} /> Teléfono de contacto
            </label>
            <input
              type="tel"
              className="main-input"
              placeholder="Ej: 0412 1234567"
              value={formData.phoneNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="input-group flex-2">
              <label>
                <Scissors size={16} /> Tipo de Servicio
              </label>
              <select
                className="main-input"
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
              <div className="price-input-wrapper">
                <span className="currency">$</span>
                <input
                  type="number"
                  className="main-input price-input"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="checkbox-section">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={formData.saveAsFrequent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    saveAsFrequent: e.target.checked,
                  })}
              />
              <span className="checkmark">
                <Star
                  size={16}
                  fill={formData.saveAsFrequent ? "#f1c40f" : "none"}
                />
              </span>
              <div className="checkbox-text">
                <strong>Cliente Frecuente</strong>
                <span>Guardar datos para futuras citas</span>
              </div>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={onSubmit}>
            Confirmar Cita
          </button>
        </div>
      </div>
    </div>
  );
};
