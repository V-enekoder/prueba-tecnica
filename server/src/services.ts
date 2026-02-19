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
    return await prisma.appointment.findFirst({
      where: {
        AND: [
          { start: { lt: end } },
          { end: { gt: start } },
        ],
      },
    });
  },

  // Crea la cita final
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
      },
    });
  },
};
