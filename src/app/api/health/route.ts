import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const diagnostics = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET ✓' : '❌ NOT SET - THIS IS YOUR PROBLEM!',
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
    // Try to connect
    await prisma.$queryRaw`SELECT 1 as test`;
    diagnostics.database.connected = true;
    diagnostics.diagnosis.push('✓ Database connection successful');
    
    // Check if tables exist
    try {
      const count = await prisma.submission.count();
      diagnostics.database.submissionCount = count;
      diagnostics.database.tablesExist = true;
      diagnostics.diagnosis.push('✓ Database tables exist');
      diagnostics.status = 'healthy';
    } catch (tableError) {
      diagnostics.database.error = 'Tables not found - migrations not applied';
      diagnostics.diagnosis.push('❌ Database tables missing - run migrations!');
      diagnostics.status = 'unhealthy';
    }
  } catch (error) {
    diagnostics.database.connected = false;
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.diagnosis.push('❌ Cannot connect to database');
    diagnostics.diagnosis.push('❌ Check DATABASE_URL in Railway variables');
    diagnostics.status = 'unhealthy';
  }

  // Final diagnosis
  if (!process.env.DATABASE_URL) {
    diagnostics.diagnosis.unshift('🚨 CRITICAL: DATABASE_URL not set in Railway!');
    diagnostics.diagnosis.push('FIX: Add PostgreSQL in Railway (New → Database → PostgreSQL)');
  }

  const statusCode = diagnostics.status === 'healthy' ? 200 : 503;
  return NextResponse.json(diagnostics, { status: statusCode });
}