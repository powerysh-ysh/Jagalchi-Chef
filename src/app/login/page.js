"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/db';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock_api_key';
      
      let finalRole = 'tourist';

      if (isMock) {
        // Mock Mode: 로컬 스토리지에서 가짜 로그인 처리
        localStorage.setItem('mock_user', JSON.stringify({ uid: 'mock-user-123', email, role: 'tourist' })); // 데모용
        window.dispatchEvent(new Event('mock-auth-change'));
        finalRole = 'tourist';
      } else {
        // 1. Firebase Auth 로그인
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Firestore에서 역할(Role) 확인 후 라우팅
        if (db) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            finalRole = userDoc.data().role || 'tourist';
          }
        }
      }

      if (finalRole === 'tourist') {
        router.push('/marketplace');
      } else if (finalRole === 'merchant') {
        router.push('/dashboard/admin');
      } else if (finalRole === 'chef') {
        router.push('/dashboard/chef');
      } else if (finalRole === 'admin') {
        router.push('/dashboard/admin');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#007db5] mb-2">환영합니다</h1>
          <p className="text-gray-500">자갈치 셰프 로그인</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">이메일</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#007db5]"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">비밀번호</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#007db5]"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#007db5] text-white font-bold py-3 rounded-lg mt-2 hover:bg-[#006494] transition-colors disabled:opacity-70"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          계정이 없으신가요? <Link href="/signup" className="text-[#ff5722] font-bold hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
