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
