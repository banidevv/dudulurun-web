import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = params.path.join('/');
        const fullPath = path.join(process.cwd(), 'public', 'race-packs', filePath);

        // Security check - ensure the file is within the race-packs directory
        const racePacksDir = path.join(process.cwd(), 'public', 'race-packs');
        const resolvedPath = path.resolve(fullPath);
        const resolvedRacePacksDir = path.resolve(racePacksDir);

        if (!resolvedPath.startsWith(resolvedRacePacksDir)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Read file
        const fileBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();

        // Set appropriate content type
        let contentType = 'application/octet-stream';
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
        }

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Error serving static file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
