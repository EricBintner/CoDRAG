import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Lemon Squeezy API to find orders by email
    // and trigger license key resend or return keys.
    // For now, we simulate a success to unblock the UI flow.
    
    console.log(`[Mock] Recovering license for: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'If an order exists, a recovery email has been sent.' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
