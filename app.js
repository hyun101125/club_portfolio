// Firebase SDK (v12.10.0) ES Module import
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// 당신이 제공한 Firebase 설정 값
const firebaseConfig = {
  apiKey: "AIzaSyCYwrD1lffDR7mQ_CwXDCrKb4TKjOodOrc",
  authDomain: "myportfolio-bce34.firebaseapp.com",
  projectId: "myportfolio-bce34",
  storageBucket: "myportfolio-bce34.firebasestorage.app",
  messagingSenderId: "593570696399",
  appId: "1:593570696399:web:6cfbec05aafb462049bbba",
};

// Firebase & Firestore 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 간단한 네비게이션 토글 + 초기 데이터 로드
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const yearSpan = document.getElementById("year");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }

  initFirebaseAndLoadData();
});

async function initFirebaseAndLoadData() {
  try {
    setProjectsIntro("Firebase 연동 확인 중...");
    await Promise.all([loadProjects(), loadSkills()]);
  } catch (err) {
    console.error("Firebase 초기화 또는 데이터 로드 중 오류:", err);
    setProjectsIntro(`연동 실패: ${formatFirebaseError(err)}`);
    renderFallbackData();
  }
}

function renderFallbackData() {
  const projectsGrid = document.getElementById("projects-grid");
  const skillsGrid = document.getElementById("skills-grid");

  if (projectsGrid) {
    projectsGrid.innerHTML = `
      <div class="card">
        <p class="card-meta">Demo Data</p>
        <h3 class="card-title">Firebase 설정 필요</h3>
        <p class="card-desc">
          Firebase 프로젝트 설정이 없어서 예시 프로젝트만 표시됩니다.
          Firestore에 프로젝트 데이터를 추가하면 자동으로 이 영역이 채워집니다.
        </p>
        <div class="badge-row">
          <span class="badge">HTML</span>
          <span class="badge">CSS</span>
          <span class="badge">JavaScript</span>
        </div>
      </div>
    `;
  }

  if (skillsGrid) {
    skillsGrid.innerHTML = `
      <div class="skill-item">
        <div class="skill-top">
          <span class="skill-name">Firebase</span>
          <span class="skill-level">Sample</span>
        </div>
        <div class="skill-bar">
          <div class="skill-bar-fill" style="width: 70%;"></div>
        </div>
      </div>
    `;
  }
}

async function loadProjects() {
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  let snapshot;
  try {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    snapshot = await getDocs(q);
  } catch (err) {
    console.error("projects 컬렉션을 가져오지 못했습니다:", err);
    setProjectsIntro(`연동 실패(프로젝트 조회): ${formatFirebaseError(err)}`);
    projectsGrid.innerHTML =
      "<p class=\"section-intro\">Firestore에서 데이터를 불러오지 못했습니다. (권한/규칙/네트워크 확인)</p>";
    return;
  }

  if (snapshot.empty) {
    setProjectsIntro("연동됨: 프로젝트가 아직 없습니다. (projects 컬렉션에 문서를 추가해 주세요)");
    projectsGrid.innerHTML = "<p class=\"section-intro\">등록된 프로젝트가 없습니다.</p>";
    return;
  }

  projectsGrid.innerHTML = "";

  const categories = new Map();
  let count = 0;
  const languagesSet = new Set();

  snapshot.forEach((doc) => {
    count += 1;
    const data = doc.data();
    const card = document.createElement("article");
    card.className = "card";

    const category = data.category ? String(data.category) : "Project";
    categories.set(category, (categories.get(category) || 0) + 1);

    const languages =
      Array.isArray(data.language) && data.language.length
        ? data.language
        : data.language
        ? [data.language]
        : [];
    languages.forEach((lang) => languagesSet.add(String(lang)));

    const techBadges =
      Array.isArray(data.technologies) && data.technologies.length
        ? data.technologies
            .map((t) => `<span class="badge">${escapeHtml(String(t))}</span>`)
            .join("")
        : "";

    const highlights =
      Array.isArray(data.highlights) && data.highlights.length
        ? `
          <ul class="card-list">
            ${data.highlights
              .slice(0, 6)
              .map((h) => `<li>${escapeHtml(String(h))}</li>`)
              .join("")}
          </ul>
        `
        : "";

    const infoRows = [
      data.period ? ["기간", String(data.period)] : null,
      data.role ? ["역할", String(data.role)] : null,
      data.contribution ? ["기여", String(data.contribution)] : null,
      languages.length ? ["언어", languages.map((l) => String(l)).join(", ")] : null,
    ].filter(Boolean);

    const infoBlock =
      infoRows.length > 0
        ? `
          <dl class="card-kv">
            ${infoRows
              .map(
                ([k, v]) =>
                  `<div class="card-kv-row"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`
              )
              .join("")}
          </dl>
        `
        : "";

    const detailText = data.details ? `<p class="card-detail">${escapeHtml(String(data.details))}</p>` : "";

    const demoLink = data.demoUrl
      ? `<a href="${escapeAttr(data.demoUrl)}" target="_blank" rel="noopener noreferrer">Demo</a>`
      : "";
    const repoLink = data.repoUrl
      ? `<a href="${escapeAttr(data.repoUrl)}" target="_blank" rel="noopener noreferrer">Code</a>`
      : "";

    card.innerHTML = `
      <p class="card-meta">${escapeHtml(category)}</p>
      <h3 class="card-title">${escapeHtml(data.title || "제목 없음")}</h3>
      <p class="card-desc">${escapeHtml(data.description || "")}</p>
      ${infoBlock}
      ${detailText}
      ${highlights}
      <div class="badge-row">
        ${techBadges}
      </div>
      <div class="card-links">
        ${demoLink}
        ${repoLink}
      </div>
    `;

    projectsGrid.appendChild(card);
  });

  const topCats = [...categories.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} ${v}개`)
    .join(" · ");

  const langs = [...languagesSet].sort();
  const langsText = langs.length ? ` · 사용 언어: ${langs.join(", ")}` : "";

  setProjectsIntro(
    (topCats.length > 0 ? `연동됨: 총 ${count}개 프로젝트 · ${topCats}` : `연동됨: 총 ${count}개 프로젝트`) +
      langsText
  );

  setProjectsLanguage(langs);
}

async function loadSkills() {
  // skills 섹션을 제거하여 현재는 동작하지 않습니다.
  return;
}

function setProjectsIntro(text) {
  const projectsIntro = document.getElementById("projects-intro");
  if (projectsIntro) projectsIntro.textContent = text;
}

function setProjectsLanguage(langs) {
  const intro = document.getElementById("language-intro");
  if (!intro) return;

  if (!langs || langs.length === 0) {
    intro.textContent =
      "Firebase의 `projects` 컬렉션에서 language 필드를 활용해 사용 언어 정보를 관리합니다.";
    return;
  }

  intro.textContent = `이 포트폴리오에서는 주로 ${langs.join(
    ", "
  )} 등을 사용하여 프로젝트를 구현했습니다.`;
}

function formatFirebaseError(err) {
  const code = err?.code ? String(err.code) : "unknown";
  const message = err?.message ? String(err.message) : String(err);
  if (code.includes("permission-denied")) return "권한 거부 (Firestore Rules 확인 필요)";
  if (code.includes("failed-precondition")) return "인덱스/사전조건 문제 (콘솔 안내 확인)";
  if (code.includes("unavailable")) return "네트워크/서비스 불가 (연결 상태 확인)";
  return `${code} - ${message}`;
}

function levelToLabel(level) {
  if (typeof level !== "number") return "Level";
  if (level >= 80) return "Advanced";
  if (level >= 60) return "Intermediate";
  if (level >= 40) return "Junior";
  return "Learning";
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

