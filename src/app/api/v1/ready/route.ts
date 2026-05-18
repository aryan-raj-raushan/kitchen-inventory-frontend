import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const state = mongoose.connection.readyState;
    if (state !== 1) throw new Error('Not connected');
    return NextResponse.json({ status: 'ready' });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }
}
