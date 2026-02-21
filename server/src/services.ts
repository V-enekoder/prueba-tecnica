import { prisma } from "./db";

export const clientService = {
  async handleFrequentClient(
    name: string,
    phone: string | undefined,
    saveAsFrequent: boolean,
  ) {
    if (!saveAsFrequent || !phone) return null;

    try {
      const client = await prisma.client.upsert({
        where: { phone: phone },
        update: { name: name },
        create: {
          name: name,
          phone: phone,
          isFrequent: true,
        },
      });
      console.log("Cliente procesado ID:", client.id);
      return client.id;
    } catch (error) {
      console.error("Error en handleFrequentClient:", error);
      return null;
    }
  },
};

export const appointmentService = {
  async checkCollision(start: Date, end: Date) {
    // 1. Revisar si choca con otra cita
    const appointmentConflict = await prisma.appointment.findFirst({
      where: { AND: [{ start: { lt: end } }, { end: { gt: start } }] },
    });
    if (appointmentConflict) {
      return { type: "CITA", name: appointmentConflict.clientName };
    }

    // 2. Revisar si choca con un horario bloqueado
    const blockedConflict = await prisma.blockedSlot.findFirst({
      where: { AND: [{ start: { lt: end } }, { end: { gt: start } }] },
    });
    if (blockedConflict) {
      return {
        type: "BLOQUEO",
        name: blockedConflict.reason || "Horario bloqueado",
      };
    }

    return null;
  },

  async createAppointment(data: any) {
    return await prisma.appointment.create({
      data: {
        clientName: data.clientName,
        phoneNumber: data.phoneNumber,
        start: data.start,
        end: data.end,
        serviceType: data.serviceType,
        price: Number(data.price),
        attended: false,
        clientId: data.clientId,
        referencePhoto: data.referencePhoto || null,
      },
    });
  },

  // Nuevo: Crear bloqueo
  async createBlockedSlot(start: Date, end: Date, reason: string) {
    return await prisma.blockedSlot.create({
      data: { start, end, reason },
    });
  },
  async updatePhoto(id: number, photoBase64: string) {
    return await prisma.appointment.update({
      where: { id },
      data: { referencePhoto: photoBase64 },
    });
  },
};

export const predictionService = {
  async predictNextVisits() {
    const clients = await prisma.client.findMany({
      include: {
        appointments: { where: { attended: true }, orderBy: { start: "asc" } },
      },
    });

    const predictions: any[] = [];

    clients.forEach((client) => {
      const apts = client.appointments;
      if (apts.length < 2) return;

      const intervals: number[] = [];
      for (let i = 1; i < apts.length; i++) {
        const diff = apts[i].start.getTime() - apts[i - 1].start.getTime();
        intervals.push(diff / (1000 * 60 * 60 * 24));
      }

      // 1. Calcular promedio de días entre citas
      const avgInterval = intervals.reduce((a, b) => a + b, 0) /
        intervals.length;

      // 2. Tomar la fecha de la última cita
      const lastApt = apts[apts.length - 1];
      const nextDate = new Date(lastApt.start);
      nextDate.setDate(nextDate.getDate() + Math.round(avgInterval));

      // 3. Solo predecir si la fecha cae en el futuro
      if (nextDate > new Date()) {
        predictions.push({
          id: `pred-${client.id}`,
          clientName: `💡 Predicción: ${client.name}`,
          start: nextDate,
          end: new Date(new Date(nextDate).setHours(nextDate.getHours() + 1)),
          serviceType: "PREDICCIÓN",
          attended: false,
          isPrediction: true,
          price: 0,
        });
      }
    });

    return predictions;
  },
};

export const analyticsService = {
  async getBusinessStats() {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    const allAppointments = await prisma.appointment.findMany({
      where: { attended: true },
    });

    // 1. Ganancias por tipo de servicio
    const statsByService = allAppointments.reduce((acc: any, curr) => {
      acc[curr.serviceType] = (acc[curr.serviceType] || 0) + curr.price;
      return acc;
    }, {});

    // 2. Ingresos de este mes
    const revenueThisMonth = allAppointments
      .filter((a) =>
        a.start.getMonth() === mesActual && a.start.getFullYear() === añoActual
      )
      .reduce((acc, curr) => acc + curr.price, 0);

    // 3. Clientes más fieles (Top 3)
    const clientCounts = allAppointments.reduce((acc: any, curr) => {
      if (curr.clientName) {
        acc[curr.clientName] = (acc[curr.clientName] || 0) + 1;
      }
      return acc;
    }, {});

    const topClients = Object.entries(clientCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3);

    return {
      statsByService,
      revenueThisMonth,
      topClients,
      totalAppointments: allAppointments.length,
    };
  },
};
