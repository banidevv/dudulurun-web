import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Helper function to upsert a setting
async function upsertSetting(key: string, value: string) {
  return prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(formattedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updates = Object.entries(body).map(([key, value]) =>
      upsertSetting(key, String(value))
    );

    await Promise.all(updates);

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 