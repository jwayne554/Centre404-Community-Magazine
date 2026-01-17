import { NextRequest, NextResponse } from 'next/server';
import { mkdir, unlink, stat } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { rateLimit } from '@/lib/rate-limit';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials are available
const useCloudinary = !!process.env.CLOUDINARY_URL;

if (useCloudinary) {
  // CLOUDINARY_URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  // Cloudinary SDK auto-configures from CLOUDINARY_URL env var
  cloudinary.config({
    secure: true,
  });
}

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

    // Validate file size BEFORE processing (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Read file into buffer for type detection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file type
    const detectedType = await fileTypeFromBuffer(buffer);
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
      return NextResponse.json(
        {
          error: 'Invalid file type. Only images and audio files are allowed.',
          detected: detectedType?.mime || 'unknown',
        },
        { status: 400 }
      );
    }

    // Determine if this is an image or audio
    const isImage = detectedType.mime.startsWith('image/');
    const isAudio = detectedType.mime.startsWith('audio/');

    // Use Cloudinary in production, local storage in development
    if (useCloudinary) {
      // Upload to Cloudinary
      const resourceType = isImage ? 'image' : 'video'; // Cloudinary uses 'video' for audio

      const uploadResult = await new Promise<{ secure_url: string; public_id: string; bytes: number }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: 'community-magazine',
            // For audio files, keep original format
            ...(isAudio && { format: detectedType.ext }),
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('No result from Cloudinary'));
          }
        );

        // Write buffer to upload stream
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        url: uploadResult.secure_url,
        fileName: uploadResult.public_id,
        originalName: file.name,
        size: uploadResult.bytes,
        type: detectedType.mime,
        storage: 'cloudinary',
      });
    } else {
      // Local file storage (development)
      const fileExtension = path.extname(file.name) || `.${detectedType.ext}`;
      const fileName = `${randomUUID()}${fileExtension}`;

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // Write file to disk
      const filePath = path.join(uploadDir, fileName);
      tempFilePath = filePath;

      const fileStream = Readable.from(buffer);
      const writeStream = createWriteStream(filePath);
      await pipeline(fileStream, writeStream);

      // Verify file size on disk
      const fileStats = await stat(filePath);

      // Clear temp file path (successful upload)
      tempFilePath = null;

      // Return public URL
      const publicUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        url: publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: fileStats.size,
        type: detectedType.mime,
        storage: 'local',
      });
    }
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
