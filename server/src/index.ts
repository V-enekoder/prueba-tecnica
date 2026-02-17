import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 1. OBTENER TODAS LAS CITAS
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
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

// 3. CREAR CITA (Con validación de choque y lógica de clientes)
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

  if (isoStart < ahora) {
    return res.status(400).json({
      error: "PAST_DATE",
      message: "No se pueden crear citas en fechas u horarios pasados.",
    });
  }

  try {
    // A. VALIDACIÓN DE CHOQUE
    const conflict = await prisma.appointment.findFirst({
      where: {
        AND: [
          { start: { lt: isoEnd } },
          { end: { gt: isoStart } },
        ],
      },
    });

    if (conflict) {
      return res.status(400).json({
        error: "COLLISION",
        message: `El horario ya está ocupado por ${conflict.clientName}`,
      });
    }

    // B. LÓGICA DE CLIENTE FRECUENTE
    let clientId: number | null = null;
    if (saveAsFrequent && phoneNumber) {
      const client = await prisma.client.upsert({
        where: { phone: phoneNumber },
        update: { name: clientName },
        create: { name: clientName, phone: phoneNumber, isFrequent: true },
      });
      clientId = client.id;
    }

    // C. CREAR CITA
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        phoneNumber,
        start: isoStart,
        end: isoEnd,
        serviceType,
        price: Number(price),
        attended: false,
        clientId: clientId, // <--- Esto es vital para el historial
      },
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
