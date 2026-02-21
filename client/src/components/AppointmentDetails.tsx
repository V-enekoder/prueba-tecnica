import {
  Camera,
  CheckCircle,
  Image as ImageIcon,
  MessageCircle,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const AppointmentDetails = (
  { event, onClose, onDelete, onToggleAttended, onFetch }: any,
) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo antes de procesar (ej: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La foto es demasiado pesada. Intenta con una de menos de 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64String = reader.result as string;

      // OPCIONAL: Podrías usar un canvas para redimensionar la imagen aquí
      // Pero por ahora, con el cambio en el servidor debería funcionar.

      try {
        await axios.patch(`${API_URL}/appointments/${event.id}`, {
          referencePhoto: base64String,
        });
        alert("¡Foto guardada con éxito!");
        onFetch();
      } catch (err: any) {
        if (err.response?.status === 413) {
          alert("La foto sigue siendo demasiado grande para el servidor.");
        } else {
          alert("Error al subir la foto.");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Cita: {event.clientName}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          {/* Visualización de la foto si existe */}
          <div className="photo-container">
            {event.referencePhoto
              ? (
                <img
                  src={event.referencePhoto}
                  alt="Corte de referencia"
                  className="ref-photo"
                />
              )
              : (
                <div className="no-photo">
                  <ImageIcon size={40} opacity={0.2} />
                  <p>Sin foto de referencia</p>
                </div>
              )}
          </div>

          <div className="action-grid">
            {/* Botón para subir foto */}
            <label className="btn-photo">
              <Camera size={18} />{" "}
              {event.referencePhoto ? "Cambiar Foto" : "Subir Foto del Corte"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                hidden
              />
            </label>

            <button
              className="btn-wa"
              onClick={() =>
                window.open(
                  `https://wa.me/${event.phoneNumber?.replace(/\D/g, "")}`,
                  "_blank",
                )}
            >
              <MessageCircle size={18} /> WhatsApp
            </button>

            <button
              className="btn-check"
              onClick={() => onToggleAttended(event)}
            >
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
};
