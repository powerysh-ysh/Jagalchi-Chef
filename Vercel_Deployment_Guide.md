# Phase 7: 글로벌 프로덕션 배포 가이드 (대표님 전용)

안티그래비티 팀의 코드가 배포 준비를 완료했습니다. 
대표님께서는 아래 절차를 따라 **클릭 몇 번으로** 자갈치 셰프를 전 세계에 오픈하실 수 있습니다.

---

## 1. Firebase (데이터베이스) 설정
1. [Firebase Console](https://console.firebase.google.com/)에 접속하여 **새 프로젝트 추가**를 클릭합니다.
2. 프로젝트 이름을 입력하고 생성한 뒤, 메인 화면에서 **웹(</>) 아이콘**을 클릭해 웹 앱을 추가합니다.
3. 앱 등록을 완료하면 `firebaseConfig` 객체가 나타납니다.
4. 그 화면에 있는 **API Key**, **Auth Domain**, **Project ID** 등을 복사해 둡니다. (이따 Vercel에 붙여넣을 것입니다.)
5. (필수) Firebase 좌측 메뉴에서 **Authentication(빌드 > 인증)** 에 들어가서 `이메일/비밀번호` 로그인 제공업체를 **사용 설정** 합니다.
6. (필수) Firebase 좌측 메뉴에서 **Firestore Database(빌드 > Firestore 데이터베이스)** 에 들어가서 **데이터베이스 만들기** 를 클릭합니다. (위치는 `asia-northeast3(Seoul)`을 권장합니다.)

---

## 2. GitHub (코드 저장소) 연동
1. [GitHub](https://github.com/)에 로그인합니다.
2. 우측 상단의 `+` 버튼을 누르고 **New repository**를 클릭합니다.
3. Repository name을 `jagalchi-chef` (원하시는 이름)으로 적고 **Create repository**를 누릅니다.
4. 방금 생성된 빈 저장소의 **URL 주소** (예: `https://github.com/아이디/jagalchi-chef.git`)를 복사합니다.
5. 현재 컴퓨터(VS Code 터미널)에서 아래 명령어 세 줄을 복사하여 실행합니다:
   ```bash
   git branch -M main
   git remote add origin 복사한_GitHub_주소
   git push -u origin main
   ```
   *(이렇게 하면 로컬에 있던 코드가 대표님의 GitHub로 안전하게 모두 전송됩니다.)*

---

## 3. Vercel (배포 자동화) 연동
1. [Vercel](https://vercel.com/)에 접속하여 GitHub 계정으로 **Log in** 합니다.
2. 대시보드 우측 상단의 **Add New... > Project**를 클릭합니다.
3. 방금 GitHub에 올린 `jagalchi-chef` 저장소가 목록에 보일 것입니다. **Import** 버튼을 누릅니다.
4. **Configure Project** 화면이 나오면 아래로 내려서 **Environment Variables(환경 변수)** 섹션을 펼칩니다.
5. 여기에 1단계에서 복사해 둔 Firebase 키값들을 한 줄씩 복사해서 추가합니다:
   - Name: `NEXT_PUBLIC_FIREBASE_API_KEY` / Value: `AIzaSy...` (자신의 API 키)
   - Name: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` / Value: `...firebaseapp.com`
   - Name: `NEXT_PUBLIC_FIREBASE_PROJECT_ID` / Value: `...`
6. 다 넣으셨다면 하단의 파란색 **Deploy** 버튼을 누릅니다.
7. 약 1분 뒤 팡파르(축하 화면)가 터지며 배포가 완료됩니다! 화면에 나오는 도메인(예: `jagalchi-chef.vercel.app`)을 클릭하여 진짜 라이브 서버에 접속해 보세요!

---

💡 **배포 완료 후 체크리스트**
- [ ] 핸드폰으로 라이브 주소에 접속하여 회원가입 진행해보기
- [ ] 상품을 하나 등록하고 예약 결제하기 버튼이 잘 눌리는지 확인
- [ ] Firebase Firestore 콘솔에 데이터가 정상적으로 들어오는지 확인

**완료되었습니다! 안티그래비티 팀의 코어 엔진이 성공적으로 가동 중입니다.**
