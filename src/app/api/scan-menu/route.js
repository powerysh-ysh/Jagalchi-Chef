import { NextResponse } from 'next/server';

// -----------------------------------------------------------------------------
// [Master Blueprint] Option B: AI Menu Scanner Engine
// 이 API는 상인이 업로드한 종이 메뉴판 사진을 분석(Vision AI)하여 
// 요리명, 영어 번역, 추천 태그, 매칭 이미지를 한 번에 추출합니다.
// -----------------------------------------------------------------------------

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('menuImage');

    if (!imageFile) {
      return NextResponse.json(
        { error: '메뉴판 이미지가 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log(`[Vision AI] 스캔 시작: ${imageFile.name} (${imageFile.size} bytes)`);

    // =========================================================================
    // 🚀 [TODO: 실제 서비스 전환 시] 
    // 여기에 Google Gemini Vision AI API 또는 Google Cloud Vision API를 연동합니다.
    // 1. imageFile을 buffer로 변환 후 AI에 전송
    // 2. AI Prompt: "이 메뉴판 이미지에서 메뉴 이름들을 추출하고, 각각을 영어로 번역하고, 
    //    ['할랄', '부드러운 맛', '매운맛', '이색체험', '날해산물'] 중 알맞은 태그 2개를 골라 JSON으로 반환해."
    // =========================================================================
    
    // 현재는 '상인 승인(Confirm)' 및 아키텍처 검증을 위한 시뮬레이션(Mock) 지연 처리
    await new Promise(resolve => setTimeout(resolve, 2500)); // AI 분석 시간 2.5초 시뮬레이션

    // [시뮬레이션 데이터] AI가 메뉴판을 스캔하여 반환했다고 가정한 최상급 결과물
    const scannedResults = [
      {
        id: "mock_1",
        name: "모둠 해산물 세트",
        englishName: "Assorted Seafood Platter",
        category: "General",
        tags: ["신선한", "이색체험"],
        // Unsplash의 검증된 고화질 해산물 이미지 (자동 매칭 결과)
        imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&auto=format&fit=crop" 
      },
      {
        id: "mock_2",
        name: "매콤 갈치조림",
        englishName: "Spicy Braised Cutlassfish",
        category: "General",
        tags: ["매운맛", "전통체험"],
        imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "mock_3",
        name: "부산 밀면",
        englishName: "Busan Cold Wheat Noodles",
        category: "General",
        tags: ["시원한 맛", "로컬추천"],
        imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop"
      }
    ];

    console.log(`[Vision AI] 스캔 성공. 총 ${scannedResults.length}개의 메뉴 추출 완료.`);

    return NextResponse.json({
      success: true,
      message: '메뉴판 스캔이 성공적으로 완료되었습니다.',
      items: scannedResults
    });

  } catch (error) {
    console.error('[Vision AI] 스캔 오류:', error);
    return NextResponse.json(
      { error: '메뉴 스캔 중 오류가 발생했습니다. 이미지를 확인해주세요.' },
      { status: 500 }
    );
  }
}
