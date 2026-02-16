import React from "react";
import {
  DollarSign,
  Phone,
  Scissors,
  Search,
  Star,
  User,
  X,
} from "lucide-react";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  suggestions: any[];
  onSearch: (query: string) => void;
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
}: Props) => {
  return (
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
          {/* Nombre del Cliente */}
          <div className="input-group">
            <label>
              <User size={16} /> Nombre del Cliente
            </label>
            <div className="search-container">
              <input
                type="text"
                placeholder="Escribe para buscar o agregar..."
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

          {/* Teléfono */}
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
            {/* Servicio */}
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

            {/* Precio */}
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

          {/* Cliente Frecuente */}
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

      <style>
        {`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-card {
          background: #fff; width: 90%; max-width: 450px;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-header {
          background: #1a1a1a; color: white; padding: 16px 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-header h2 { margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 10px; }

        .modal-body { padding: 20px; }

        .input-group { margin-bottom: 16px; }
        .input-group label {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.875rem; font-weight: 600; color: #444; margin-bottom: 6px;
        }
        .input-group input, .input-group select {
          width: 100%; padding: 10px 12px; border: 1px solid #ddd;
          border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;
        }
        .input-group input:focus { outline: none; border-color: #3174ad; box-shadow: 0 0 0 3px rgba(49,116,173,0.1); }

        .row { display: flex; gap: 12px; }
        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

        .search-container { position: relative; }
        .suggestions-list {
          position: absolute; top: 100%; left: 0; width: 100%;
          background: white; border: 1px solid #ddd; border-radius: 8px;
          margin-top: 4px; padding: 0; list-style: none; z-index: 20;
          box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        }
        .suggestions-list li {
          padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .suggestions-list li:hover { background: #f8f9fa; }
        .suggestions-list li small { color: #888; }

        .checkbox-group {
          display: flex; align-items: center; gap: 10px; padding: 10px 0;
        }
        .checkbox-group label {
          display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; color: #444;
        }
        .star-active { color: #f1c40f; fill: #f1c40f; }

        .modal-footer {
          padding: 16px 20px; background: #f8f9fa;
          display: flex; justify-content: flex-end; gap: 12px;
        }
        .btn-cancel {
          background: transparent; border: 1px solid #ddd; padding: 10px 20px;
          border-radius: 8px; cursor: pointer; font-weight: 600; color: #666;
        }
        .btn-submit {
          background: #3174ad; color: white; border: none; padding: 10px 20px;
          border-radius: 8px; cursor: pointer; font-weight: 600;
        }
        .btn-submit:hover { background: #265a88; }
        .btn-icon { background: none; border: none; color: white; cursor: pointer; opacity: 0.8; }
        .btn-icon:hover { opacity: 1; }
      `}
      </style>
    </div>
  );
};

export default AppointmentForm;
