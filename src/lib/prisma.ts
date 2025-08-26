import { PrismaClient } from "@/generated/prisma";


export function getPrismaClient() {
  return new PrismaClient();
} 