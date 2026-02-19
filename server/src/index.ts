import express from "express";
import cors from "cors";
import { appointmentService, clientService } from "./services";
import { prisma } from "./db";
const app = express();
app.use(cors());
app.use(express.json());

app.get("/appointments", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany();
    const blocked = await prisma.blockedSlot.findMany();

    // Unimos ambos pero marcamos los bloqueos
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

// 2. BUSCADOR DE CLIENTES
app.get("/clients/search", async (req, res) => {
  const { q } = req.query;

  if (!q || String(q).length < 2) {
    return res.json([]);
  }

  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: String(q) } },
          { phone: { contains: String(q) } },
        ],
      },
      take: 5,
    });
    res.json(clients);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

app.post("/appointments", async (req, res) => {
  const { isBlocked, reason, ...rest } = req.body;
  const isoStart = new Date(req.body.start);
  const isoEnd = new Date(req.body.end);

  try {
    // Validar colisión (siempre)
    const conflict = await appointmentService.checkCollision(isoStart, isoEnd);
    if (conflict) {
      return res.status(400).json({
        error: "COLLISION",
        message: `Choque con ${conflict.type}: ${conflict.name}`,
      });
    }

    if (isBlocked) {
      // Es un bloqueo
      const blocked = await appointmentService.createBlockedSlot(
        isoStart,
        isoEnd,
        reason || "Bloqueado",
      );
      return res.json(blocked);
    } else {
      // Es una cita (lógica anterior)
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

/*
app.post("/appointments", async (req, res) => {
  const {
    clientName,
    phoneNumber,
    start,
    end,
    serviceType,
    price,
    saveAsFrequent,
  } = req.body;

  const isoStart = new Date(start);
  const isoEnd = new Date(end);
  const ahora = new Date();

  // 1. Validaciones previas
  if (isoStart < ahora) {
    return res.status(400).json({
      error: "PAST_DATE",
      message: "No puedes agendar en el pasado.",
    });
  }

  try {
    // 2. Comprobar colisiones
    const conflict = await appointmentService.checkCollision(isoStart, isoEnd);
    if (conflict) {
      return res.status(400).json({
        error: "COLLISION",
        message: `Horario ocupado por ${conflict.clientName}`,
      });
    }

    // 3. Procesar Cliente (Función externa)
    const clientId = await clientService.handleFrequentClient(
      clientName,
      phoneNumber,
      saveAsFrequent,
    );

    // 4. Crear Cita (Función externa)
    const appointment = await appointmentService.createAppointment({
      clientName,
      phoneNumber,
      start: isoStart,
      end: isoEnd,
      serviceType,
      price,
      clientId,
    });

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});
*/
// 4. ACTUALIZAR CITA
app.patch("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { attended, price, serviceType } = req.body;
  try {
    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        attended: attended !== undefined ? Boolean(attended) : undefined,
        price: price !== undefined ? Number(price) : undefined,
        serviceType: serviceType || undefined,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar" });
  }
});

// 5. ELIMINAR CITA
app.delete("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.delete({ where: { id: Number(id) } });
    res.json({ message: "Cita eliminada" });
  } catch (error) {
    res.status(400).json({ error: "Error al eliminar" });
  }
});

// 6. HISTORIAL DE CLIENTE
app.get("/clients/:id/history", async (req, res) => {
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
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
