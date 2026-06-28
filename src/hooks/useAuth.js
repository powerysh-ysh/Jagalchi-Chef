import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/db';
import { doc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock_api_key';

    if (isMock) {
      // Mock Mode: 로컬 스토리지 기반 가짜 인증 상태
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        setUser({ uid: mockUser.uid, email: mockUser.email });
        setRole(mockUser.role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
      
      // 스토리지 변경 감지 (같은 탭 내 강제 업데이트용 이벤트 리스너 추가 가능)
      const handleStorageChange = () => {
        const updated = localStorage.getItem('mock_user');
        if (updated) {
          const u = JSON.parse(updated);
          setUser({ uid: u.uid, email: u.email });
          setRole(u.role);
        } else {
          setUser(null);
          setRole(null);
        }
      };
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('mock-auth-change', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('mock-auth-change', handleStorageChange);
      };
    }

    // 실제 Firebase Auth 모드
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          if (!db) {
            setRole('tourist');
          } else {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setRole(userDoc.data().role || 'tourist');
            } else {
              setRole('tourist');
            }
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setRole('tourist');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, role, loading };
}
