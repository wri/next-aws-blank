import { NextResponse } from 'next/server';

let requestCount = 0;
let lastLoggedAt = 0;

export async function GET() {
  requestCount++;

  const now = Date.now();
  const LOG_INTERVAL_MS = 60_000;

  if (now - lastLoggedAt >= LOG_INTERVAL_MS) {
    console.log(`[Health API] Requests in last minute: ${requestCount}`);
    lastLoggedAt = now;
    requestCount = 0;
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    version: process.env.npm_package_version || '1.0.0',
    requestsPerMinute: requestCount,
  });
}