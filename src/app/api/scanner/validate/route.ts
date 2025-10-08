import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/onesender';

export async function POST(request: Request) {
  const prisma = getPrismaClient();

  try {
    let data: any;
    let racePackPhotoBuffer: Buffer | null = null;
    let racePackPhotoExt: string | null = null;

    // Check if request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data
      const formData = await request.formData();

      // Extract form fields
      data = {
        id: formData.get('id') as string,
        ktpChecked: formData.get('ktpChecked') === 'true',
        bibChecked: formData.get('bibChecked') === 'true',
        jerseyChecked: formData.get('jerseyChecked') === 'true',
      };

      // Extract file upload
      const racePackPhotoFile = formData.get('racePackPhoto') as File;
      if (racePackPhotoFile) {
        racePackPhotoBuffer = Buffer.from(await racePackPhotoFile.arrayBuffer());
        racePackPhotoExt = racePackPhotoFile.name.split('.').pop() || 'jpg';
      }
    } else {
      // Handle JSON (existing functionality)
      data = await request.json();
    }

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

      // Send WhatsApp notification after successful check-in
      try {
        // Format BIB number (3 digits with leading zeros)
        const bibNumber = String(registration.race.id).padStart(3, '0');

        // Build package details based on category and package type
        let packageDetails = '';

        if (registration.category === 'family') {
          // Family package details
          const familyData = registration.familyPackageData as any;


          if (familyData && familyData.parentCount && familyData.childCount && familyData.parentShirtSizes && familyData.childShirtSizes) {
            packageDetails += `\n• Jumlah Orangtua: ${familyData.parentCount} orang`;
            packageDetails += `\n• Jumlah Anak: ${familyData.childCount} orang`;

            if (familyData.parentShirtSizes) {
              packageDetails += `\n• Ukuran Baju Orangtua: ${familyData.parentShirtSizes}`;
            }
            if (familyData.childShirtSizes) {
              packageDetails += `\n• Ukuran Baju Anak: ${familyData.childShirtSizes}`;
            }
          }

        } else {
          // Individual package details
          packageDetails = `• Tipe: ${registration.packageType || 'N/A'}`;

          if (registration.shirtSize) {
            packageDetails += `\n• Ukuran Baju: ${registration.shirtSize}`;
          }

          if (registration.customShirtSize) {
            packageDetails += `\n• Ukuran Baju Custom: ${registration.customShirtSize}`;
          }

          if (registration.customChildShirtSize) {
            packageDetails += `\n• Ukuran Baju Anak Custom: ${registration.customChildShirtSize}`;
          }
        }

        const whatsappMessage = `🏃‍♂️ *DUDULURUN 2025 - Check-in Berhasil*

Halo ${registration.name}! 

Anda telah berhasil melakukan check-in untuk kategori *${registration.category === 'family' ? 'Family Run 2.5K' : 'Fun Run 5K'}*.

🏷️ *No. BIB: ${bibNumber}*

📦 *Detail Paket:*
${packageDetails}

✅ *Status:* Check-in berhasil
📸 *Foto Race Pack:* Tersimpan

Selamat berlari di DUDULURUN 2025! 

Semoga sukses! 🏃‍♀️🏃‍♂️`;

        await sendWhatsAppMessage({
          to: registration.phone,
          message: whatsappMessage,
        });

        console.log(`WhatsApp check-in notification sent to ${registration.phone} for registration ${registration.id}`);
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp check-in notification:', whatsappError);
        // Don't fail the entire request if WhatsApp fails
      }

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
          raceId: registration.race.id,
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

    // Handle race pack photo based on request type
    let finalBuffer: Buffer;
    let finalExt: string;

    if (racePackPhotoBuffer && racePackPhotoExt) {
      // Handle multipart file upload
      finalBuffer = racePackPhotoBuffer;
      finalExt = racePackPhotoExt;
    } else if (data.racePackPhoto && typeof data.racePackPhoto === 'string' && data.racePackPhoto.startsWith('data:image/')) {
      // Handle base64 string (existing functionality)
      const matches = data.racePackPhoto.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: 'Invalid race pack photo format' },
          { status: 400 }
        );
      }
      finalExt = matches[1].split('/')[1];
      const base64Data = matches[2];
      finalBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return NextResponse.json(
        { error: 'Race pack photo is required and must be a valid image file or base64 string' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = `racepack_${registration.id}_${Date.now()}.${finalExt}`;
    const path = require('path');
    const fs = require('fs');
    const publicDir = path.join(process.cwd(), 'public', 'race-packs');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const filePath = path.join(publicDir, fileName);

    // Write file
    fs.writeFileSync(filePath, finalBuffer);

    // Set the public URL path for storage in DB
    const racePackPhotoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/race-packs/${fileName}`;

    // Mark ticket as used
    await prisma.race.create({
      data: {
        id: data.raceId,
        registrationId: registration.id,
        racePackPhotoUrl: racePackPhotoUrl,
      },
    });

    // Send WhatsApp notification after successful race creation
    try {
      // Format BIB number (3 digits with leading zeros)
      const bibNumber = String(data.raceId).padStart(3, '0');

      // Build package details based on category and package type
      let packageDetails = '';

      if (registration.category === 'family') {
        // Family package details
        const familyData = registration.familyPackageData as any;

        if (familyData && familyData.parentCount && familyData.childCount) {
          packageDetails += `\n• Jumlah Orangtua: ${familyData.parentCount} orang`;
          packageDetails += `\n• Jumlah Anak: ${familyData.childCount} orang`;

          if (familyData.parentShirtSizes) {
            packageDetails += `\n• Ukuran Baju Orangtua: ${familyData.parentShirtSizes}`;
          }
          if (familyData.childShirtSizes) {
            packageDetails += `\n• Ukuran Baju Anak: ${familyData.childShirtSizes}`;
          }
        }

        if (familyData && familyData.childAge) {
          packageDetails += `\n• Usia Anak: ${familyData.childAge} tahun`;
        }
      } else {
        // Individual package details
        packageDetails = `• Tipe: ${registration.packageType || 'N/A'}`;

        if (registration.shirtSize) {
          packageDetails += `\n• Ukuran Baju: ${registration.shirtSize}`;
        }

        if (registration.customShirtSize) {
          packageDetails += `\n• Ukuran Baju Custom: ${registration.customShirtSize}`;
        }

        if (registration.customChildShirtSize) {
          packageDetails += `\n• Ukuran Baju Anak Custom: ${registration.customChildShirtSize}`;
        }
      }

      const whatsappMessage = `🏃‍♂️ *DUDULURUN 2025 - Tiket Berhasil Divalidasi*

Halo ${registration.name}! 

Tiket Anda telah berhasil divalidasi untuk kategori *${registration.category === 'family' ? 'Family Run 2.5K' : 'Fun Run 5K'}*.

🏷️ *No. BIB: ${bibNumber}*

📦 *Detail Paket:*
${packageDetails}

✅ *Status:* Tiket telah digunakan dan divalidasi
📸 *Foto Race Pack:* Tersimpan

Terima kasih telah berpartisipasi dalam DUDULURUN 2025! 

Selamat berlari! 🏃‍♀️🏃‍♂️`;

      await sendWhatsAppMessage({
        to: registration.phone,
        message: whatsappMessage,
      });

      console.log(`WhatsApp notification sent to ${registration.phone} for registration ${registration.id}`);
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError);
      // Don't fail the entire request if WhatsApp fails
    }

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
        raceId: data.raceId,
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