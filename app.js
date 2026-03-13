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
