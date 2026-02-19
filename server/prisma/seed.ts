import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();

  const firstNames = [
    "Juan",
    "Pedro",
    "Luis",
    "Carlos",
    "Andres",
    "Miguel",
    "Jose",
    "Javier",
    "Ricardo",
    "Fernando",
    "Diego",
    "Alejandro",
    "Roberto",
    "Gabriel",
    "Victor",
    "Manuel",
    "Oscar",
    "Hugo",
    "Marcos",
    "Daniel",
  ];
  const lastNames = [
    "Perez",
    "Gonzalez",
    "Rodriguez",
    "Gomez",
    "Fernandez",
    "Lopez",
    "Diaz",
    "Martinez",
    "Sanchez",
    "Alvarez",
    "Torres",
    "Ruiz",
    "Ramirez",
    "Flores",
    "Acosta",
    "Medina",
    "Herrera",
    "Castro",
    "Vargas",
    "Rios",
  ];

  console.log("Generando 200 clientes con historial...");

  for (let i = 0; i < 200; i++) {
    const name = `${
      firstNames[Math.floor(Math.random() * firstNames.length)]
    } ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${i + 1}`;
    // Generar teléfono único
    const phone = `0412${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Intervalo base del cliente: Algunos vienen cada semana (7), otros cada mes (30)
    const baseInterval = Math.floor(Math.random() * 25) + 7;

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        isFrequent: true,
      },
    });

    // Empezar el historial hace 6 meses
    let historyDate = new Date();
    historyDate.setDate(historyDate.getDate() - 180);

    // Crear entre 5 y 15 citas por cliente
    const numAppointments = Math.floor(Math.random() * 10) + 5;

    for (let j = 0; j < numAppointments; j++) {
      const noise = Math.floor(Math.random() * 9) - 4;
      historyDate.setDate(historyDate.getDate() + baseInterval + noise);

      if (historyDate <= new Date()) {
        const services = ["Básico", "Básico + Barba", "Especial"];
        const service = services[Math.floor(Math.random() * services.length)];
        const price = service === "Básico"
          ? 15
          : service === "Especial"
          ? 35
          : 25;

        await prisma.appointment.create({
          data: {
            clientName: client.name,
            phoneNumber: client.phone,
            start: new Date(historyDate),
            end: new Date(
              new Date(historyDate).setHours(historyDate.getHours() + 1),
            ),
            serviceType: service,
            price: price,
            attended: true,
            clientId: client.id,
          },
        });
      }
    }

    if ((i + 1) % 50 === 0) console.log(`Creados ${i + 1} clientes...`);
  }

  console.log("✅ Seeding completado: 200 clientes y ~2000 citas creadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
