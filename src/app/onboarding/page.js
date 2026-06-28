"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { saveTouristProfile } from '@/lib/db';
import './onboarding.css';

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    dietary: [],
    allergies: [],
    preferences: []
  });

  const handleNext = async () => {
    if (step < 3) setStep(step + 1);
    else {
      try {
        console.log('Saving profile to DB...', profile);
        const uid = user?.uid || 'test-tourist-001'; 
        
        // await로 인해 Firebase 응답 지연 시 멈추는 현상 방지 (백그라운드 처리)
        saveTouristProfile(uid, profile).catch(err => {
          console.error("백그라운드 저장 실패:", err);
        });
        
        alert('프로필이 안전하게 저장되었습니다. 마켓플레이스로 이동합니다...');
        router.push('/marketplace');
      } catch (error) {
        console.error("프로필 저장 오류:", error);
        alert('저장에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  const handleToggle = (category, item) => {
    setProfile(prev => {
      const list = prev[category];
      if (list.includes(item)) {
        return { ...prev, [category]: list.filter(i => i !== item) };
      }
      return { ...prev, [category]: [...list, item] };
    });
  };

  return (
    <div className="onboarding-container">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>
      
      <div className="card animate-fade-in step-card" key={step}>
        {step === 1 && (
          <>
            <h2>식단 제한이 있으신가요?</h2>
            <p>최고의 식재료를 준비할 수 있도록 고객님의 라이프스타일을 알려주세요.</p>
            <div className="options-grid">
              {['비건(Vegan)', '채식(Vegetarian)', '할랄(Halal)', '글루텐프리', '페스코(Pescatarian)', '해당없음'].map(item => (
                <button 
                  key={item} 
                  className={`option-btn ${profile.dietary.includes(item) ? 'selected' : ''}`}
                  onClick={() => handleToggle('dietary', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
        
        {step === 2 && (
          <>
            <h2>알레르기가 있으신가요?</h2>
            <p>고객님의 안전이 최우선입니다. 알레르기 유발 물질을 선택해 주세요.</p>
            <div className="options-grid">
              {['땅콩', '갑각류', '대두(콩)', '유제품', '생선', '달걀', '해당없음'].map(item => (
                <button 
                  key={item} 
                  className={`option-btn ${profile.allergies.includes(item) ? 'selected' : ''}`}
                  onClick={() => handleToggle('allergies', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
        
        {step === 3 && (
          <>
            <h2>미식 취향</h2>
            <p>오늘은 어떤 스타일의 요리를 원하시나요?</p>
            <div className="options-grid">
              {['매콤한 맛', '신선한 회(날것)', '구이', '튀김', '부드러운 맛', '이색 체험(도전!)'].map(item => (
                <button 
                  key={item} 
                  className={`option-btn ${profile.preferences.includes(item) ? 'selected' : ''}`}
                  onClick={() => handleToggle('preferences', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
        
        <div className="nav-buttons">
          {step > 1 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>뒤로</button>}
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={handleNext}>
            {step === 3 ? '프로필 완성 및 입장' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}
