const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const sharp = require("sharp"); // 설치 필요
// const path = require("path");
// const os = require("os");
// const fs = require("fs");

admin.initializeApp();

/**
 * Phase 3: 안티그래비티 이미지 자동 리사이징 스크립트 (스캐폴딩)
 * Firebase Storage에 업로드되는 이미지를 가로 800px의 WebP 형식으로 자동 변환하여
 * 모바일 로딩 속도를 극대화하고 트래픽 비용을 절감합니다.
 */
exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket; // Storage 버킷
  const filePath = object.name; // 파일 경로
  const contentType = object.contentType; // 파일 타입

  // 이미 썸네일(WebP)이거나 이미지가 아니면 종료하여 무한 루프 방지
  if (!contentType.startsWith("image/") || filePath.includes("thumb_")) {
    return console.log("이미 처리되었거나 이미지가 아닙니다.");
  }

  console.log(`[Anti-Gravity] 리사이징 작업 시작: ${filePath}`);

  // 실제 리사이징 로직 구현 부 (sharp 모듈 사용)
  // 1. Storage에서 로컬 임시 폴더(os.tmpdir)로 이미지 다운로드
  // 2. sharp(임시파일).resize({width: 800}).webp().toFile(새_임시파일)
  // 3. 변환된 WebP 이미지를 Storage 버킷에 업로드 (이름 앞에 'thumb_' 추가)
  // 4. 임시 파일 삭제 및 기존 원본 파일 삭제(선택)

  console.log(`[Anti-Gravity] 리사이징 파이프라인 뼈대 구축 완료.`);
  return null;
});
