import { useEffect, useState } from "react";
import {
  DollarSign,
  IdCard, // Nuevo icono para la cédula
  Phone,
  Plus,
  Scissors,
  Search,
  ShieldAlert,
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
  const [isBlockingMode, setIsBlockingMode] = useState(false);

  // Actualizar precio solo si no estamos en modo bloqueo
  useEffect(() => {
    if (!isBlockingMode && SUGGESTED_PRICES[formData.serviceType]) {
      setFormData((prev: any) => ({
        ...prev,
        price: SUGGESTED_PRICES[formData.serviceType],
      }));
    }
  }, [formData.serviceType, isBlockingMode, setFormData]);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-circle">
              {isBlockingMode ? <ShieldAlert size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2>{isBlockingMode ? "Bloquear Horario" : "Agendar Cita"}</h2>
              <p>
                {isBlockingMode
                  ? "El barbero no estará disponible"
                  : "Completa los datos del servicio"}
              </p>
            </div>
          </div>
          <button className="btn-close-x" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* SELECTOR DE MODO (Cita o Bloqueo) */}
        <div className="mode-selector-container">
          <div className="mode-selector">
            <button
              type="button"
              className={!isBlockingMode ? "active" : ""}
              onClick={() => {
                setIsBlockingMode(false);
                setFormData({ ...formData, isBlocked: false });
              }}
            >
              <User size={14} /> Cita
            </button>
            <button
              type="button"
              className={isBlockingMode ? "active" : ""}
              onClick={() => {
                setIsBlockingMode(true);
                setFormData({ ...formData, isBlocked: true, reason: "" });
              }}
            >
              <ShieldAlert size={14} /> Bloqueo
            </button>
          </div>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <div className="modal-body">
          {isBlockingMode
            ? (
              /* --- VISTA: BLOQUEO --- */
              <div className="input-group">
                <label>Motivo del bloqueo</label>
                <input
                  type="text"
                  className="main-input"
                  placeholder="Ej: Almuerzo, Salida médica, Día libre..."
                  value={formData.reason || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })}
                  autoFocus
                />
              </div>
            )
            : (
              /* --- VISTA: CITA NORMAL --- */
              <>
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
                              <span className="s-phone">📞 {c.phone}</span>
                              {c.dni && (
                                <span className="s-phone">🆔 {c.dni}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group flex-2">
                    <label>
                      <Phone size={16} /> Teléfono
                    </label>
                    <input
                      type="tel"
                      className="main-input"
                      placeholder="0412..."
                      value={formData.phoneNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })}
                    />
                  </div>
                  <div className="input-group flex-2">
                    <label>
                      <IdCard size={16} /> Cédula (Opcional)
                    </label>
                    <input
                      type="text"
                      className="main-input"
                      placeholder="V-..."
                      value={formData.dni || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, dni: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group flex-2">
                    <label>
                      <Scissors size={16} /> Tipo de Servicio
                    </label>
                    <select
                      className="main-input"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({
                        ...formData,
                        serviceType: e.target.value,
                      })}
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
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })}
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
              </>
            )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-confirm" onClick={onSubmit}>
            {isBlockingMode ? "Bloquear Horario" : "Confirmar Cita"}
          </button>
        </div>
      </div>
    </div>
  );
};
