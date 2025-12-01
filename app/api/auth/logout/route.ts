import { NextRequest, NextResponse } from 'next/server';
import { clearSession, shouldUseSecureCookie } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Clear session cookie dengan set expiration di masa lalu
    const response = NextResponse.json(
      { message: 'Logout berhasil' },
      { status: 200 }
    );

    // Clear cookie dengan set expiration di masa lalu untuk memastikan cookie benar-benar dihapus
    response.cookies.set('siakad_session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: shouldUseSecureCookie(),
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}

