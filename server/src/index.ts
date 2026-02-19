import express from "express";
import cors from "cors";
import {
  appointmentService,
  clientService,
  predictionService,
} from "./services";
import { prisma } from "./db";
import { authService } from "./auth";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use(express.json());

// --- RUTAS PÚBLICAS ---

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = authService.generateToken(user.id);
    return res.json({ token });
  }
  res.status(401).json({ error: "Credenciales incorrectas" });
});

// Setup Inicial (Solo usar una vez)
app.post("/setup-admin", async (req, res) => {
  // Ahora toma los datos del cuerpo de la petición (JSON)
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Falta usuario o contraseña en el JSON");
  }

  const count = await prisma.user.count();
  if (count > 0) {
    return res.status(400).send("Ya existe un usuario en la base de datos");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  res.send(`Usuario ${username} creado con éxito.`);
});

// Ver citas (Lo dejamos público para que se vea el calendario, pero no se pueda editar)
app.get("/appointments", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany();
    const blocked = await prisma.blockedSlot.findMany();
    const allEvents = [
      ...appointments.map((a) => ({ ...a, type: "appointment" })),
      ...blocked.map((b) => ({
        ...b,
        type: "blocked",
        clientName: b.reason,
        serviceType: "BLOQUEADO",
      })),
    ];
    res.json(allEvents);
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- RUTAS PROTEGIDAS (Requieren Token) ---

app.get("/clients/search", authService.authenticateToken, async (req, res) => {
  const { q } = req.query;
  if (!q || String(q).length < 2) return res.json([]);
  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [{ name: { contains: String(q) } }, {
          phone: { contains: String(q) },
        }],
      },
      take: 5,
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

app.post("/appointments", authService.authenticateToken, async (req, res) => {
  const { isBlocked, reason, ...rest } = req.body;
  const isoStart = new Date(req.body.start);
  const isoEnd = new Date(req.body.end);

  try {
    const conflict = await appointmentService.checkCollision(isoStart, isoEnd);
    if (conflict) {
      return res.status(400).json({
        error: "COLLISION",
        message: `Choque con ${conflict.type}: ${conflict.name}`,
      });
    }

    if (isBlocked) {
      const blocked = await appointmentService.createBlockedSlot(
        isoStart,
        isoEnd,
        reason || "Bloqueado",
      );
      return res.json(blocked);
    } else {
      const clientId = await clientService.handleFrequentClient(
        rest.clientName,
        rest.phoneNumber,
        rest.saveAsFrequent,
      );
      const appointment = await appointmentService.createAppointment({
        ...rest,
        start: isoStart,
        end: isoEnd,
        clientId,
        price: Number(rest.price),
      });
      return res.json(appointment);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.patch(
  "/appointments/:id",
  authService.authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { attended, price, serviceType, referencePhoto } = req.body;
    try {
      const updated = await prisma.appointment.update({
        where: { id: Number(id) },
        data: {
          attended: attended !== undefined ? Boolean(attended) : undefined,
          price: price !== undefined ? Number(price) : undefined,
          serviceType: serviceType || undefined,
          referencePhoto: referencePhoto || undefined, // <--- SOPORTE PARA FOTO
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Error al actualizar" });
    }
  },
);

app.delete(
  "/appointments/:id",
  authService.authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.appointment.delete({ where: { id: Number(id) } });
      res.json({ message: "Cita eliminada" });
    } catch (error) {
      res.status(400).json({ error: "Error al eliminar" });
    }
  },
);

app.get(
  "/clients/:id/history",
  authService.authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    try {
      const history = await prisma.appointment.findMany({
        where: { clientId: Number(id) },
        orderBy: { start: "desc" },
      });
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: "Error al obtener historial" });
    }
  },
);

app.get("/predict", authService.authenticateToken, async (req, res) => {
  const predictions = await predictionService.predictNextVisits();
  res.json(predictions);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
