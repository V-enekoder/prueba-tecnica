# 💈 Barbería Pro - Sistema de Gestión Inteligente

**Barbería Pro** es una aplicación Full Stack diseñada para barberos independientes que buscan profesionalizar su agenda. No es solo un calendario; es una herramienta de inteligencia de negocio que permite predecir la demanda, gestionar clientes frecuentes y analizar el rendimiento financiero.

![Status](https://img.shields.io/badge/Status-Desarrollo-green)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20TypeScript-blue)

## 🚀 Características Principales

-   **📅 Agenda Interactiva:** Gestión de citas mediante un calendario intuitivo con vistas de Mes, Semana, Día y Agenda.
-   **🤖 Predicción de Demanda:** Algoritmo basado en frecuencia histórica que sugiere cuándo es probable que un cliente frecuente regrese.
-   **📊 Business Analytics:** Dashboard con métricas de ingresos mensuales, servicios más rentables y ranking de clientes VIP.
-   **⚠️ Detección de Colisiones:** Sistema de validación en tiempo real que evita el solapamiento de citas.
-   **🚫 Bloqueo de Horarios:** Permite marcar horas de almuerzo o días libres donde no se pueden agendar citas.
-   **📱 Integración con WhatsApp:** Envío de recordatorios con un solo clic.
-   **🔒 Seguridad JWT:** Panel administrativo protegido por autenticación basada en tokens.
-   **📸 Fotos de Referencia:** Almacenamiento de fotos de cortes anteriores (Base64) para recordar el estilo de cada cliente.
-   **🔎 Buscador Inteligente:** Filtrado de clientes por nombre, teléfono o cédula/DNI.

---

## 🛠️ Stack Tecnológico

**Frontend:**
- React + Vite
- TypeScript
- React Big Calendar
- Lucide React (Iconografía)
- Axios (Peticiones HTTP)

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite (Base de datos local)
- JWT (Autenticación)
- Bcrypt (Cifrado de contraseñas)

---

## 💻 Instalación en Local (Linux)

### 1. Clonar el repositorio
```bash
git clone https://github.com/V-enekoder/prueba-tecnica.git
cd barbero-app
```

### 2. Configurar el Servidor (Backend)
```bash
cd server
pnpm install
# Crear archivo de variables de entorno
touch .env
```
Añade lo siguiente al `.env` del servidor:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_clave_secreta_aqui"
```
Inicializa la base de datos:
```bash
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
```

### 3. Configurar el Cliente (Frontend)
Abre una nueva terminal:
```bash
cd client
pnpm install
touch .env
```
Añade lo siguiente al `.env` del cliente:
```env
VITE_API_URL="http://localhost:3001"
```

---

## 🧪 Datos de Prueba (Seeding)

Para probar la funcionalidad de **Analíticas** y **Predicción**, puedes generar 200 clientes y miles de citas automáticamente:
```bash
cd server
pnpm exec prisma db seed
```

---

## 🔑 Configuración del Administrador

Para poder entrar a la aplicación por primera vez, debes crear la cuenta del barbero:

1. Inicia el servidor (`pnpm dev`).
2. Ejecuta el siguiente comando `curl` en tu terminal:
```bash
curl -X POST http://localhost:3001/setup-admin \
     -H "Content-Type: application/json" \
     -d '{"username":"admin", "password":"123"}'
```
3. Ahora puedes loguearte en la web con esas credenciales.

---

## 📦 Despliegue en Render

1. **Base de Datos:** Para producción, cambia de SQLite a PostgreSQL (recomendado: [Neon.tech](https://neon.tech/)).
2. **Backend (Web Service):**
    - Build Command: `pnpm install && pnpm build && npx prisma migrate deploy`
    - Start Command: `node dist/index.js`
    - Envs: `DATABASE_URL`, `JWT_SECRET`.
3. **Frontend (Static Site):**
    - Build Command: `pnpm install && pnpm build`
    - Publish directory: `dist`
    - Envs: `VITE_API_URL` (URL de tu backend en Render).

---

## 📝 Estructura del Proyecto

```text
barbero-app/
├── client/             # React App
│   ├── src/
│   │   ├── components/ # AppointmentForm, Sidebar, Analytics, etc.
│   │   ├── types.ts    # Interfaces compartidas
│   │   └── App.tsx     # Lógica principal
├── server/             # Express API
│   ├── src/
│   │   ├── db.ts       # Cliente Prisma
│   │   ├── auth.ts     # Middleware JWT
│   │   ├── services.ts # Lógica de negocio y predicción
│   │   └── index.ts    # Rutas y servidor
│   └── prisma/         # Esquema y migraciones
```

## ✒️ Autor
**Victor Astudillo** - *Desarrollo Full Stack* 

---
*Desarrollado para Desarrollo Web - UNEG.*
