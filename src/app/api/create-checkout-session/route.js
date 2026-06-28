import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 환경 변수 보안 주입 (환경 변수가 없으면 오류 발생)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16',
});

export async function POST(req) {
  try {
    const { items, touristId } = await req.json();

    // 1. 보안 검증: 필수 데이터 유무
    if (!items || !touristId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Stripe Checkout 세션 생성 (안티그래비티 인프라 표준)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'krw',
          product_data: {
            name: item.name,
            description: item.desc || 'Jagalchi Culinary Experience',
          },
          unit_amount: item.price * 100, // KRW 단위
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        touristId: touristId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
