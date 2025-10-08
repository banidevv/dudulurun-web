import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: Request) {
  const prisma = getPrismaClient();

  try {
    const data = await request.json();

    if (!data || !data.id) {
      return NextResponse.json(
        { error: 'Invalid ticket data' },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: { id: data.id },
      include: {
        payment: true,
        race: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (registration.payment?.status !== 'paid') {
      return NextResponse.json(
        { error: 'Ticket payment not completed' },
        { status: 400 }
      );
    }
    // Check if ticket has been used
    if (registration.race) {

      if (!data.ktpChecked) {
        return NextResponse.json(
          { error: 'KTP not checked' },
          { status: 400 }
        );
      }

      await prisma.race.update({
        where: { id: registration.race.id },
        data: {
          checkedIn: true,
        },
      });

      const packageDetails = {
        type: registration.packageType || 'N/A',
        shirtSize: registration.shirtSize || 'N/A',
        familyDetails: registration.familyPackageData || null,
        racePackPhotoUrl: registration.race.racePackPhotoUrl,
      };

      return NextResponse.json({
        success: false,
        message: 'This ticket has already been used',
        data: {
          name: registration.name,
          category: registration.category,
          packageDetails,
          ticketUsed: true,
        },
      });
    }

    if (!data.bibChecked) {
      return NextResponse.json(
        { error: 'Bib not checked' },
        { status: 400 }
      );
    }


    if (!data.jerseyChecked) {
      return NextResponse.json(
        { error: 'Jersey not checked' },
        { status: 400 }
      );
    }

    // Upload racePack photo to /public/race-packs and set ticketData.racePackPhoto to the file path

    // Check if racePackPhoto is a base64 string
    if (!data.racePackPhoto || typeof data.racePackPhoto !== 'string' || !data.racePackPhoto.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Race pack photo is required and must be a valid base64 image' },
        { status: 400 }
      );
    }

    // Logic for allowed id ranges based on category
    // Ambil record terakhir dari tabel Race untuk mendapatkan lastRaceId
    const lastRace = await prisma.race.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
      where: {
        registration: {
          category: registration.category,
        },
      },
    });

    const lastRaceId = lastRace ? lastRace.id : null;
    var raceId = 0;


    if (lastRaceId) {
      if (registration.category === 'fun') {
        if (lastRaceId >= 1 && lastRaceId <= 300 || lastRaceId >= 377 && lastRaceId <= 428) {
          raceId = lastRaceId + 1;
        }
      } else if (registration.category === 'family') {
        if (lastRaceId >= 377 && lastRaceId <= 428) {
          raceId = lastRaceId + 1;
        }
      }
    } else {
      if (registration.category === 'fun') {
        raceId = 1;
      } else if (registration.category === 'family') {
        raceId = 377;
      }
    }

    if (raceId === 0) {
      return NextResponse.json(
        { error: 'No available id for this category' },
        { status: 400 }
      );
    }

    const matches = data.racePackPhoto.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid race pack photo format' },
        { status: 400 }
      );
    }
    const ext = matches[1].split('/')[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const fileName = `racepack_${registration.id}_${Date.now()}.${ext}`;
    const path = require('path');
    const fs = require('fs');
    const publicDir = path.join(process.cwd(), 'public', 'race-packs');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const filePath = path.join(publicDir, fileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Set the public URL path for storage in DB
    const racePackPhotoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/race-packs/${fileName}`;

    // Mark ticket as used
    await prisma.race.create({
      data: {
        id: raceId,
        registrationId: registration.id,
        racePackPhotoUrl: racePackPhotoUrl,
      },
    });

    const packageDetails = {
      type: registration.packageType || 'N/A',
      shirtSize: registration.shirtSize || 'N/A',
      familyDetails: registration.familyPackageData || null,
      racePackPhotoUrl: racePackPhotoUrl,
    };

    return NextResponse.json({
      success: true,
      message: 'Ticket validated successfully',
      data: {
        name: registration.name,
        category: registration.category,
        packageDetails,
        ticketUsed: true,
      },
    });
  } catch (error) {
    console.error('Ticket validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 