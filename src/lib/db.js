import { getFirestore, collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export { db };

/**
 * 안티그래비티 원칙 2: 논리적 상승력 (State Machine Logic)
 * 예약 상태의 유효한 전이(Transition)를 정의합니다.
 */
const VALID_TRANSITIONS = {
  pending: ['chef_assigned', 'cancelled'],
  chef_assigned: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

/**
 * 상태 변경을 수행하는 안전한 래퍼 함수입니다.
 */
export async function transitionReservationState(reservationId, currentState, newState) {
  if (!VALID_TRANSITIONS[currentState]?.includes(newState)) {
    throw new Error(`Invalid state transition from ${currentState} to ${newState}`);
  }

  const reservationRef = doc(db, 'reservations', reservationId);
  await updateDoc(reservationRef, {
    status: newState,
    updatedAt: new Date()
  });
  
  return true;
}

/**
 * 유저 프로필 저장 함수 (온보딩 완료 시 호출)
 */
export async function saveTouristProfile(uid, profileData) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    role: 'tourist',
    foodProfile: profileData,
    createdAt: new Date()
  }, { merge: true });
}
