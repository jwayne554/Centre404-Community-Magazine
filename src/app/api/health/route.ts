import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, only return minimal health status (no sensitive info)
  if (isProduction) {
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      await prisma.submission.count();
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    } catch {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  }

  // In development, return detailed diagnostics
  const diagnostics = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET ✓' : '❌ NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET ✓' : '❌ NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ NOT SET',
    },
    database: {
      connected: false,
      error: null as string | null,
      tablesExist: false,
      submissionCount: 0,
    },
    diagnosis: [] as string[],
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    diagnostics.database.connected = true;
    diagnostics.diagnosis.push('✓ Database connection successful');

    try {
      const count = await prisma.submission.count();
      diagnostics.database.submissionCount = count;
      diagnostics.database.tablesExist = true;
      diagnostics.diagnosis.push('✓ Database tables exist');
      diagnostics.status = 'healthy';
    } catch {
      diagnostics.database.error = 'Tables not found - migrations not applied';
      diagnostics.diagnosis.push('❌ Database tables missing - run migrations!');
      diagnostics.status = 'unhealthy';
    }
  } catch (error) {
    diagnostics.database.connected = false;
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.diagnosis.push('❌ Cannot connect to database');
    diagnostics.status = 'unhealthy';
  }

  const statusCode = diagnostics.status === 'healthy' ? 200 : 503;
  return NextResponse.json(diagnostics, { status: statusCode });
}