import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// -----------------------------------------------------------------------------
// [Master Blueprint] Phase 9: Hyper-Automation Engine
// Gemini 1.5 Flash Vision 모델을 활용한 완벽한 메뉴판 자동화 스캐너입니다.
// -----------------------------------------------------------------------------

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&auto=format&fit=crop", // 모둠 해산물
  "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=600&auto=format&fit=crop", // 조림/구이
  "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop", // 회/날것
  "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop", // 낙지/해산물
  "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop"  // 생선
];

// Base64 변환 유틸리티
async function fileToGenerativePart(file) {
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type
    },
  };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('menuImage');

    if (!imageFile) {
      return NextResponse.json({ error: '메뉴판 이미지가 없습니다.' }, { status: 400 });
    }

    console.log(`[Hyper-Automation] Gemini 엔진 가동: ${imageFile.name}`);

    // 1. 환경변수 체킹
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[WARNING] GEMINI_API_KEY is not set. Falling back to mock data for safety.");
      // API 키가 없을 때의 안전 장치 (에러 방지)
      await new Promise(r => setTimeout(r, 2000));
      return NextResponse.json({
        success: true,
        message: 'API 키 누락으로 기본 시뮬레이션 데이터를 반환합니다.',
        items: [
          { name: "자연산 모둠회 (Wild Assorted Sashimi)", category: "General", price: 50000, tags: ["신선한 회(날것)", "고급스러운"], imageUrl: FALLBACK_IMAGES[2] },
          { name: "해물파전 (Seafood Pancake)", category: "General", price: 15000, tags: ["전통체험", "부드러운 맛"], imageUrl: FALLBACK_IMAGES[0] }
        ]
      });
    }

    // 2. Gemini 1.5 Flash 모델 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // JSON 모드 강제: 불필요한 텍스트 섞임 방지
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are an expert culinary AI for a premium Korean seafood market (Jagalchi Market).
      Analyze this menu image. Extract all food items.
      For each item, provide:
      - menuName: The original Korean name.
      - translatedName: An appetizing English translation.
      - price: The price as a number (if not found, use 0).
      - tags: Select exactly 2 appropriate tags from this list: ["할랄", "부드러운 맛", "이색체험", "날해산물", "글루텐프리", "건강식", "매운맛", "전통체험", "고급스러운", "신선한 회(날것)", "달콤한 맛", "구이", "조림"]

      Return ONLY a valid JSON array of objects. Example format:
      [
        { "menuName": "산낙지", "translatedName": "Live Octopus", "price": 20000, "tags": ["날해산물", "이색체험"] }
      ]
    `;

    const imagePart = await fileToGenerativePart(imageFile);
    
    // 3. AI 호출
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // 4. 파싱 및 검증
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(responseText);
      if (!Array.isArray(parsedItems)) throw new Error("Not an array");
    } catch (e) {
      console.error("[Hyper-Automation] JSON 파싱 실패:", responseText);
      throw new Error("AI가 유효한 JSON을 반환하지 않았습니다.");
    }

    console.log(`[Hyper-Automation] AI 스캔 성공: ${parsedItems.length}건 추출됨.`);

    // 5. Unsplash 이미지 자동 매칭 (병렬 처리로 속도 극대화)
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY; // 환경변수에서 로드 (없으면 기본 fallback 사용)
    
    const itemsWithImages = await Promise.all(parsedItems.map(async (item) => {
      let imageUrl = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
      
      if (unsplashKey) {
        try {
          const query = encodeURIComponent(`${item.translatedName} seafood high quality`);
          const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${query}&client_id=${unsplashKey}&per_page=1`);
          const unsplashData = await unsplashRes.json();
          if (unsplashData.results && unsplashData.results.length > 0) {
            imageUrl = unsplashData.results[0].urls.regular;
          }
        } catch (err) {
          console.warn(`[Unsplash] 매칭 실패 (${item.translatedName}), Fallback 이미지 사용.`);
        }
      }
      
      return {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${item.menuName} (${item.translatedName})`,
        category: "General",
        price: item.price,
        tags: item.tags || ["신선한 회(날것)", "로컬추천"],
        imageUrl: imageUrl
      };
    }));

    // 6. DB에 직접 저장하지 않고(비용통제), 클라이언트로 바로 반환
    return NextResponse.json({
      success: true,
      message: '성공',
      items: itemsWithImages
    });

  } catch (error) {
    console.error('[Hyper-Automation] 치명적 오류:', error);
    // 우아한 에러 핸들링: 시스템이 터지지 않고 자연스럽게 상인에게 알림
    return NextResponse.json(
      { error: '메뉴판을 분석하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
