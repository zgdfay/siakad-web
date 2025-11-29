import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Clear session cookie
    const response = NextResponse.json(
      { message: 'Logout berhasil' },
      { status: 200 }
    );

    // Clear cookie
    response.cookies.delete('siakad_session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}

