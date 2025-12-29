import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Crear usuario admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@grupoRegia.com" },
    update: {},
    create: {
      email: "admin@grupoRegia.com",
      password: adminPassword,
      name: "Admin Regia",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Usuario admin creado:", admin.email);

  // Crear usuario vendedor
  const vendedorPassword = await bcrypt.hash("vendedor123", 10);
  const vendedor = await prisma.user.upsert({
    where: { email: "vendedor@grupoRegia.com" },
    update: {},
    create: {
      email: "vendedor@grupoRegia.com",
      password: vendedorPassword,
      name: "Vendedor Regia",
      role: "VENDEDOR",
      isActive: true,
    },
  });

  console.log("✅ Usuario vendedor creado:", vendedor.email);

  // Crear evento de ejemplo (Víctor Mendivil)
  const event = await prisma.event.create({
    data: {
      name: "Víctor Mendivil en Concierto",
      description: "Gran concierto de Víctor Mendivil en Arena Monterrey",
      artist: "Víctor Mendivil",
      tour: "Gira 2025",
      venue: "Arena Monterrey",
      address: "Av. Fundidora, Monterrey, NL",
      eventDate: new Date("2025-03-15T21:00:00"),
      eventTime: "21:00 hrs",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200",
      maxCapacity: 5000,
      salesStartDate: new Date(),
      salesEndDate: new Date("2025-03-15T18:00:00"),
      isActive: true,
      ticketTypes: {
        create: [
          {
            name: "VIP - Mesa 4 personas",
            description: "Mesa VIP con 4 asientos, acceso preferente",
            category: "VIP",
            price: 2500,
            maxQuantity: 30,
            isTable: true,
            seatsPerTable: 4,
          },
          {
            name: "Preferente",
            description: "Asientos numerados, excelente vista",
            category: "PREFERENTE",
            price: 1500,
            maxQuantity: 120,
          },
          {
            name: "General",
            description: "De pie, cerca del escenario",
            category: "GENERAL",
            price: 850,
            maxQuantity: 350,
          },
        ],
      },
    },
  });

  console.log("✅ Evento de ejemplo creado:", event.name);

  console.log("\n🎉 Seed completado!\n");
  console.log("📝 Credenciales de acceso:");
  console.log("   Admin:");
  console.log("   - Email: admin@grupoRegia.com");
  console.log("   - Password: admin123\n");
  console.log("   Vendedor:");
  console.log("   - Email: vendedor@grupoRegia.com");
  console.log("   - Password: vendedor123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
