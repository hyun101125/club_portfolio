// Firebase 프로젝트 설정 예시 파일입니다.
// 실제 사용 시 자신의 Firebase 콘솔에서 발급받은 값들로 교체한 뒤
// 이 파일 이름을 firebase-config.js 등으로 변경해 사용하세요.

// Firebase v9+ 모듈 방식 사용 예시

// <script type="module"> 방식으로 사용할 경우:
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 이 예시에서는 전역 window.firebaseConfig / window.firestore 를 사용하는 간단한 방식으로 작성합니다.

window.firebaseConfig = {
  apiKey: "AIzaSyCYwrD1lffDR7mQ_CwXDCrKb4TKjOodOrc",
  authDomain: "myportfolio-bce34.firebaseapp.com",
  projectId: "myportfolio-bce34",
  storageBucket: "myportfolio-bce34.firebasestorage.app",
  messagingSenderId: "593570696399",
  appId: "1:593570696399:web:6cfbec05aafb462049bbba",
};

// Firestore 초기화는 app.js에서 수행합니다.

