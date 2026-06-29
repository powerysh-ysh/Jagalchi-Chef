'use server';

import { db } from '@/lib/db';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export async function translateAndTag(text, targetLang = 'en') {
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;
  
  // API 키가 등록되지 않은 경우에도 무료 API로 우회하도록 하단 로직으로 바로 넘어갑니다.

  try {
    // 1. i18n_cache: 캐시 미스 검사 (비용 최적화)
    if (db) {
      const q = query(collection(db, 'translations_cache'), where('original', '==', text));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        console.log('⚡ Translation Cache HIT:', text);
        const cacheData = querySnapshot.docs[0].data();
        return {
          translatedText: cacheData.translated,
          tags: cacheData.tags
        };
      }
    }
    
    console.log('🌐 Translation Cache MISS - Calling API:', text);
    let translatedText = '';
    
    // 무료 번역 API (MyMemory) 호출 - 별도 API 키 불필요
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|en`);
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      translatedText = data.responseData.translatedText;
    } else {
      translatedText = text; // 번역 실패 시 원본 유지
    }
    
    // 키워드 기반 태그 추출 로직 (예제용 자동화)
    let tags = ['Local Pick'];
    
    // 🚀 [TODO: 실제 서비스 전환 시]
    // 1. Google Cloud Translation API를 통해 text 번역
    // 2. 번역된 텍스트(예: Assorted Seafood Platter)를 Unsplash API에 검색하여 고화질 이미지 URL 획득

    // [시뮬레이션 데이터] AI 단건 분석 결과
    const result = {
      translatedText: "Assorted Seafood Platter",
      tags: ["신선한", "로컬추천", "부드러운 맛"],
      imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&auto=format&fit=crop"
    };

    // 요청한 텍스트에 따라 다른 이미지를 매칭해주는 시뮬레이션 로직
    if (text.includes("낙지") || text.includes("문어")) {
      result.translatedText = "Live Octopus Sashimi";
      result.tags = ["이색체험", "날해산물"];
      result.imageUrl = "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600&auto=format&fit=crop";
    } else if (text.includes("광어") || text.includes("회")) {
      result.translatedText = "Sliced Raw Flatfish";
      result.tags = ["신선한", "로컬추천"];
      result.imageUrl = "https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop";
    } else if (text.includes("돔")) {
      result.translatedText = "Wild Red Sea Bream";
      result.tags = ["할랄", "고급스러운"];
      result.imageUrl = "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop";
    }
    
    // 2. 캐시 미스로 가져온 새로운 번역 결과를 DB에 저장 (다음번엔 캐시 히트)
    if (db) {
      await addDoc(collection(db, 'translations_cache'), {
        original: text,
        translated: result.translatedText,
        tags: result.tags,
        imageUrl: result.imageUrl,
        createdAt: serverTimestamp()
      });
    }

    return result;
  } catch (error) {
    console.error("Translation logic error:", error);
    // 에러 발생 시에도 UI가 멈추지 않도록 원본 반환
    return {
      translatedText: text,
      tags: ['Local'],
      imageUrl: ""
    };
  }
}
