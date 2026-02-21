import { useEffect, useState } from "react";
import { Award, BarChart3, Scissors, TrendingUp, X } from "lucide-react";
import axios from "axios";
import "./Analytics.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const Analytics = ({ onClose }: { onClose: () => void }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API_URL}/analytics`).then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="loader">Cargando estadísticas...</div>;

  return (
    <div className="modal-overlay">
      <div className="analytics-card">
        <div className="analytics-header">
          <h2>
            <BarChart3 /> Rendimiento del Negocio
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X />
          </button>
        </div>

        <div className="analytics-body">
          <div className="stat-grid">
            <div className="mini-stat-card">
              <TrendingUp className="text-green" />
              <p>Este Mes</p>
              <strong>${data.revenueThisMonth}</strong>
            </div>
            <div className="mini-stat-card">
              <Scissors className="text-blue" />
              <p>Total Cortes</p>
              <strong>{data.totalAppointments}</strong>
            </div>
          </div>

          <div className="chart-section">
            <h3>Distribución de Ingresos</h3>
            {Object.entries(data.statsByService).map(([name, value]: any) => (
              <div key={name} className="bar-row">
                <div className="bar-label">
                  <span>{name}</span>
                  <span>${value}</span>
                </div>
                <div className="bar-bg">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(value / data.revenueThisMonth) * 100}%`,
                    }}
                  >
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="top-clients-section">
            <h3>
              <Award size={18} /> Clientes VIP
            </h3>
            <div className="vip-list">
              {data.topClients.map(([name, count]: any, i: number) => (
                <div key={name} className="vip-item">
                  <span className="rank">#{i + 1}</span>
                  <span className="vip-name">{name}</span>
                  <span className="vip-count">{count} visitas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
