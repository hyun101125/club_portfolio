import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYwrD1lffDR7mQ_CwXDCrKb4TKjOodOrc",
  authDomain: "myportfolio-bce34.firebaseapp.com",
  projectId: "myportfolio-bce34",
  storageBucket: "myportfolio-bce34.firebasestorage.app",
  messagingSenderId: "593570696399",
  appId: "1:593570696399:web:6cfbec05aafb462049bbba",
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state
let allProjects = [];
let allLanguages = [];

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const yearSpan = document.getElementById("year");
  const mainContent = document.getElementById("main-content");
  const detailView = document.getElementById("detail-view");
  const backBtn = document.getElementById("back-to-main");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }

  // Smooth-scroll for nav links (only if on main content)
  document.querySelectorAll('.nav-list a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      if (navList.classList.contains('open')) {
        navList.classList.remove('open');
      }
      
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

  // Section titles and "View Detail" buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('section-title') || e.target.closest('.view-detail')) {
      const target = e.target.classList.contains('section-title') ? e.target : e.target.closest('.view-detail');
      const section = target.closest('section');
      const type = target.dataset.type || (section ? section.id : null);
      
      if (type && ['about', 'projects', 'language'].includes(type)) {
        showDetailView(type);
      }
    }
  });

  if (backBtn) {
    backBtn.addEventListener('click', hideDetailView);
  }

  initFirebaseAndLoadData();
});

function showDetailView(type) {
  const mainContent = document.getElementById("main-content");
  const detailView = document.getElementById("detail-view");
  const detailContents = document.querySelectorAll(".detail-content");
  
  mainContent.classList.add("hidden");
  detailView.classList.remove("hidden");
  window.scrollTo(0, 0);

  detailContents.forEach(content => content.classList.add("hidden"));
  const targetContent = document.getElementById(`${type}-detail`);
  if (targetContent) {
    targetContent.classList.remove("hidden");
  }

  if (type === 'projects') {
    renderProjectsDetail();
  } else if (type === 'language') {
    renderLanguageDetail();
  }
}

function hideDetailView() {
  const mainContent = document.getElementById("main-content");
  const detailView = document.getElementById("detail-view");
  
  detailView.classList.add("hidden");
  mainContent.classList.remove("hidden");
}

async function initFirebaseAndLoadData() {
  try {
    setProjectsIntro("데이터를 불러오는 중...");
    await loadProjects();
  } catch (err) {
    console.error("Firebase error:", err);
    setProjectsIntro(`오류 발생: ${formatFirebaseError(err)}`);
  }
}

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
      
      const languages = Array.isArray(data.language) ? data.language : (data.language ? [data.language] : []);
      languages.forEach(l => langsSet.add(l));
    });

    allLanguages = [...langsSet].sort();
    renderProjectsMain();
    setProjectsLanguage(allLanguages);
    setProjectsIntro(`총 ${allProjects.length}개의 프로젝트를 불러왔습니다.`);
  } catch (err) {
    console.error("Error loading projects:", err);
    setProjectsIntro("데이터를 불러오지 못했습니다.");
  }
}

function renderProjectsMain() {
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = "";
  // Show only first 3 projects on main page
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

function setProjectsIntro(text) {
  const intro = document.getElementById("projects-intro");
  if (intro) intro.textContent = text;
}

function setProjectsLanguage(langs) {
  const intro = document.getElementById("language-intro");
  if (intro) {
    intro.textContent = langs.length > 0 
      ? `주로 ${langs.join(", ")} 등을 사용하여 프로젝트를 구현했습니다.`
      : "사용된 언어 정보를 불러오는 중입니다.";
  }
}

function formatFirebaseError(err) {
  return err.code || err.message || "알 수 없는 오류";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/"/g, "&quot;");
}
