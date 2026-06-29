import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { title, content, nickname } = await request.json();

    if (!title || !content || !nickname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 관리자 토큰 조회 (users 컬렉션에서 isAdmin: true 이거나 fcmToken을 보유한 특정 문서)
    // 여기서는 가장 간단하게 모든 관리자 토큰을 가져오거나 특정 이메일로 쿼리합니다.
    const adminQuery = await adminDb.collection('users')
      .where('role', '==', 'admin')
      .where('fcmToken', '!=', null)
      .get();

    if (adminQuery.empty) {
      return NextResponse.json({ error: 'No admin device tokens found' }, { status: 404 });
    }

    const tokens = [];
    adminQuery.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) tokens.push(data.fcmToken);
    });

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No valid tokens' }, { status: 404 });
    }

    // 알림 컨텍스트 최적화 (멘토 코멘트 반영)
    const payload = {
      notification: {
        title: `🚨 [새 문의] ${title}`,
        body: `작성자: ${nickname}\n내용: ${content.substring(0, 50)}...`,
      },
      tokens: tokens,
    };

    const response = await adminMessaging.sendEachForMulticast(payload);
    
    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('FCM Send Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
