// Carga los datos base que la app necesita para funcionar (roles).
// Es idempotente: se puede correr las veces que quieras sin duplicar nada.
// Uso: npm run db:seed

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"] }),
});

const roles = [
  { name: "ADMIN", description: "Dueño o encargado de la barbería" },
  { name: "BARBER", description: "Barbero que atiende turnos" },
  { name: "CLIENT", description: "Cliente que reserva turnos" },
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log(`Roles cargados: ${roles.map((r) => r.name).join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
