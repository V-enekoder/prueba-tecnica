import express from "express";
import cors from "cors";
import { appointmentService, clientService } from "./services";
import { prisma } from "./db";
const app = express();
app.use(cors());
app.use(express.json());

app.get("/appointments", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { start: "asc" },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas" });
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
