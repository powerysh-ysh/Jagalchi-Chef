"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/db';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tourist'); // 기본값: 여행객
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock_api_key';
      
      if (isMock) {
        // Mock Mode: 로컬 스토리지에 가짜 유저 저장
        localStorage.setItem('mock_user', JSON.stringify({ uid: 'mock-user-' + Date.now(), email, role }));
        window.dispatchEvent(new Event('mock-auth-change'));
      } else {
        // 1. Firebase Auth 유저 생성
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Firestore에 Role(역할)과 함께 유저 문서 생성
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date()
        });
      }

      // 3. 역할에 따라 다른 페이지로 이동
      if (role === 'tourist') {
        router.push('/onboarding');
      } else if (role === 'merchant') {
        router.push('/dashboard/admin');
      } else if (role === 'chef') {
        router.push('/dashboard/chef');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#007db5] mb-3">자갈치 셰프</h1>
          <p className="text-lg text-gray-500">자갈치 미식체험에 합류하세요</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">이메일</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#007db5]"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">비밀번호</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#007db5]"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-700 mb-3">가입 유형 선택</label>
            <div className="flex gap-3">
              {[
                { id: 'tourist', label: '여행객(Tourist)' }, 
                { id: 'merchant', label: '상인(Merchant)' }, 
                { id: 'chef', label: '셰프(Chef)' }
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex-1 py-3 text-lg rounded-lg font-bold border transition-colors ${role === r.id ? 'bg-[#007db5] text-white border-[#007db5]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ff5722] text-white text-xl font-bold py-4 rounded-lg mt-4 hover:bg-[#e64a19] transition-colors disabled:opacity-70"
          >
            {loading ? '계정 생성 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          이미 계정이 있으신가요? <Link href="/login" className="text-[#007db5] font-bold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
