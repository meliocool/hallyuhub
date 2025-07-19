import { PrismaClient } from "@/lib/generated/prisma";
import sampleData from "./sample-data";

async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: sampleData.users,
  });

  for (const p of sampleData.products) {
    await prisma.product.create({
      data: p,
    });
  }
  console.log("Database Seeded Successfully");
}

main();
