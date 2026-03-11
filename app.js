import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Firebase 설정 정보입니다. (Firebase 콘솔에서 확인 가능)
const firebaseConfig = {
  apiKey: "AIzaSyCYwrD1lffDR7mQ_CwXDCrKb4TKjOodOrc",
  authDomain: "myportfolio-bce34.firebaseapp.com",
  projectId: "myportfolio-bce34",
  storageBucket: "myportfolio-bce34.firebasestorage.app",
  messagingSenderId: "593570696399",
  appId: "1:593570696399:web:6cfbec05aafb462049bbba",
};

// Firebase 및 Firestore 데이터베이스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 전역 변수: 불러온 프로젝트와 언어 정보를 저장합니다.
let allProjects = [];
let allLanguages = [];

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const yearSpan = document.getElementById("year");
  const detailView = document.getElementById("detail-view");
  const backBtn = document.getElementById("back-to-main");

  // 푸터에 현재 연도를 표시합니다.
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 모바일 메뉴 토글 (열기/닫기)
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }

  // 상단 네비게이션 메뉴 클릭 시 해당 섹션으로 부드럽게 스크롤
  document.querySelectorAll('.nav-list a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      if (navList.classList.contains('open')) {
        navList.classList.remove('open');
      }
      
      // 상세 화면이 열려있다면 닫고 메인으로 이동
      if (!detailView.classList.contains('hidden')) {
        hideDetailView();
      }

      e.preventDefault();
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 섹션 제목(타이틀) 클릭 시 상세 화면으로 전환하는 이벤트 리스너
  document.addEventListener('click', (e) => {
    // 클릭된 요소가 .section-title 클래스를 가지고 있는지 확인합니다.
    // 이제 '자세히 보기' 버튼은 없으므로, 오직 타이틀 클릭에만 반응합니다.
    if (e.target.classList.contains('section-title')) {
      const target = e.target;
      const section = target.closest('section');
      // data-type 속성을 사용하여 어떤 섹션인지 식별합니다.
      const type = target.dataset.type || (section ? section.id : null);
      
      // 'about', 'projects', 'language' 섹션인 경우에만 상세 화면을 보여줍니다.
      if (type && ['about', 'projects', 'language'].includes(type)) {
        showDetailView(type);
      }
    }
  });

  // 상세 화면의 "뒤로 가기" 버튼 클릭 시 메인으로 복귀
  if (backBtn) {
    backBtn.addEventListener('click', hideDetailView);
  }

  // 초기 데이터 로딩 시작
  initFirebaseAndLoadData();
});

/**
 * 상세 화면을 보여주는 함수
 * @param {string} type - 섹션의 ID (about, projects, language)
 */
function showDetailView(type) {
  const mainContent = document.getElementById("main-content");
  const detailView = document.getElementById("detail-view");
  const detailContents = document.querySelectorAll(".detail-content");
  
  // 메인 숨기고 상세 화면 표시
  mainContent.classList.add("hidden");
  detailView.classList.remove("hidden");
  window.scrollTo(0, 0); // 화면 최상단으로 이동

  // 모든 상세 내용 숨기고 선택한 것만 표시
  detailContents.forEach(content => content.classList.add("hidden"));
  const targetContent = document.getElementById(`${type}-detail`);
  if (targetContent) {
    targetContent.classList.remove("hidden");
  }

  // 프로젝트나 언어 섹션인 경우 데이터를 다시 렌더링
  if (type === 'projects') {
    renderProjectsDetail();
  } else if (type === 'language') {
    renderLanguageDetail();
  }
}

/**
 * 상세 화면을 닫고 메인 화면으로 돌아가는 함수
 */
function hideDetailView() {
  const mainContent = document.getElementById("main-content");
  const detailView = document.getElementById("detail-view");
  
  detailView.classList.add("hidden");
  mainContent.classList.remove("hidden");
}

/**
 * Firebase에서 데이터를 불러와 초기화하는 함수
 */
async function initFirebaseAndLoadData() {
  try {
    setProjectsIntro("데이터를 불러오는 중...");
    await loadProjects();
  } catch (err) {
    console.error("Firebase error:", err);
    setProjectsIntro(`오류 발생: ${formatFirebaseError(err)}`);
  }
}

/**
 * Firestore의 'projects' 컬렉션에서 데이터를 가져오는 함수
 */
async function loadProjects() {
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  try {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    allProjects = [];
    const langsSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      allProjects.push(data);
      
      // 언어 정보 수집
      const languages = Array.isArray(data.language) ? data.language : (data.language ? [data.language] : []);
      languages.forEach(l => langsSet.add(l));
    });

    allLanguages = [...langsSet].sort();
    
    // 메인 화면과 상세 화면에 데이터 표시
    renderProjectsMain();
    setProjectsLanguage(allLanguages);
    setProjectsIntro(`총 ${allProjects.length}개의 프로젝트를 불러왔습니다.`);
  } catch (err) {
    console.error("Error loading projects:", err);
    setProjectsIntro("데이터를 불러오지 못했습니다.");
  }
}

/**
 * 메인 화면의 프로젝트 그리드에 데이터를 표시 (상위 3개)
 */
function renderProjectsMain() {
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = "";
  // 처음 3개 프로젝트만 메인에 노출
  allProjects.slice(0, 3).forEach(project => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <p class="card-meta">${escapeHtml(project.category || "Project")}</p>
      <h3 class="card-title">${escapeHtml(project.title || "Untitled")}</h3>
      <p class="card-desc">${escapeHtml(project.description || "")}</p>
    `;
    projectsGrid.appendChild(card);
  });
}

/**
 * 프로젝트 상세 화면에 모든 프로젝트 데이터를 표시
 */
function renderProjectsDetail() {
  const grid = document.getElementById("projects-detail-grid");
  if (!grid) return;

  grid.innerHTML = "";
  allProjects.forEach(project => {
    const card = document.createElement("article");
    card.className = "card";
    
    const techBadges = Array.isArray(project.technologies) 
      ? project.technologies.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("")
      : "";

    card.innerHTML = `
      <p class="card-meta">${escapeHtml(project.category || "Project")}</p>
      <h3 class="card-title">${escapeHtml(project.title || "Untitled")}</h3>
      <p class="card-desc">${escapeHtml(project.description || "")}</p>
      <div class="badge-row">${techBadges}</div>
      <div class="card-links">
        ${project.demoUrl ? `<a href="${escapeAttr(project.demoUrl)}" target="_blank">Demo</a>` : ""}
        ${project.repoUrl ? `<a href="${escapeAttr(project.repoUrl)}" target="_blank">Code</a>` : ""}
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * 언어 상세 화면에 기술 스택 데이터를 표시
 */
function renderLanguageDetail() {
  const container = document.getElementById("language-detail-container");
  if (!container) return;

  container.innerHTML = `
    <p class="detail-text">이 포트폴리오 프로젝트들에서 사용된 주요 기술 및 언어들입니다.</p>
    <div class="detail-info">
      <h3>주요 언어</h3>
      <div class="badge-row" style="gap: 1rem; margin-top: 1rem;">
        ${allLanguages.map(lang => `<span class="badge" style="font-size: 1.1rem; padding: 0.6rem 1.2rem;">${escapeHtml(lang)}</span>`).join("")}
      </div>
    </div>
  `;
}

/**
 * 프로젝트 소개 문구를 업데이트하는 헬퍼 함수
 */
function setProjectsIntro(text) {
  const intro = document.getElementById("projects-intro");
  if (intro) intro.textContent = text;
}

/**
 * 언어 소개 문구를 업데이트하는 헬퍼 함수
 */
function setProjectsLanguage(langs) {
  const intro = document.getElementById("language-intro");
  if (intro) {
    intro.textContent = langs.length > 0 
      ? `주로 ${langs.join(", ")} 등을 사용하여 프로젝트를 구현했습니다.`
      : "사용된 언어 정보를 불러오는 중입니다.";
  }
}

/**
 * Firebase 오류 메시지를 포맷팅하는 함수
 */
function formatFirebaseError(err) {
  return err.code || err.message || "알 수 없는 오류";
}

/**
 * HTML 특수 문자를 치환하여 보안을 강화하는 함수
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * HTML 속성 내 특수 문자를 치환하는 함수
 */
function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/"/g, "&quot;");
}
