import { useState } from "react";
import axios from "axios";
import { Lock, User } from "lucide-react";
import "./Login.css";

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-overlay">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">💈</div>
        <h2>Barbería Pro Admin</h2>
        {error && <p className="login-error">{error}</p>}

        <div className="login-input">
          <User size={18} />
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="login-input">
          <Lock size={18} />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-login">Entrar</button>
      </form>
    </div>
  );
};
