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
    if (text.includes('광어') || text.includes('회')) tags.push('Raw Seafood');
    if (text.includes('구이') || text.includes('조림')) tags.push('Cooked');
    if (text.includes('낙지') || text.includes('문어')) tags.push('Adventurous');
    
    // 2. 캐시 미스로 가져온 새로운 번역 결과를 DB에 저장 (다음번엔 캐시 히트)
    if (db) {
      await addDoc(collection(db, 'translations_cache'), {
        original: text,
        translated: translatedText,
        tags: tags,
        createdAt: serverTimestamp()
      });
    }

    return {
      translatedText,
      tags
    };
  } catch (error) {
    console.error("Translation logic error:", error);
    // 에러 발생 시에도 UI가 멈추지 않도록 원본 반환
    return {
      translatedText: text,
      tags: ['Local']
    };
  }
}
