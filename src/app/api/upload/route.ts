import { NextRequest, NextResponse } from 'next/server';
import { mkdir, unlink, stat } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileTypeFromFile } from 'file-type';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting - 10 uploads per hour
  const rateLimitResponse = await rateLimit.upload(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let tempFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size BEFORE streaming (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${randomUUID()}${fileExtension}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Stream file to disk (Task 1.6 - no memory buffering)
    const filePath = path.join(uploadDir, fileName);
    tempFilePath = filePath;

    const fileStream = file.stream();
    const nodeStream = Readable.fromWeb(fileStream as any);
    const writeStream = createWriteStream(filePath);

    await pipeline(nodeStream, writeStream);

    // Validate file type AFTER streaming (can delete if invalid)
    const detectedType = await fileTypeFromFile(filePath);
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
    ];

    if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
      // Delete invalid file
      await unlink(filePath);
      return NextResponse.json(
        {
          error: 'Invalid file type. Only images and audio files are allowed.',
          detected: detectedType?.mime || 'unknown',
        },
        { status: 400 }
      );
    }

    // Verify file size on disk matches reported size (security check)
    const fileStats = await stat(filePath);
    if (Math.abs(fileStats.size - file.size) > 100) {
      // Allow small discrepancy for encoding
      await unlink(filePath);
      return NextResponse.json(
        { error: 'File size mismatch. Upload may be corrupted.' },
        { status: 400 }
      );
    }

    // Clear temp file path (successful upload)
    tempFilePath = null;

    // Return public URL
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: fileStats.size, // Use actual file size
      type: detectedType.mime, // Use detected MIME type
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Clean up temp file on error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}