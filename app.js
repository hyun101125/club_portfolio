import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYwrD1lffDR7mQ_CwXDCrKb4TKjOodOrc",
  authDomain: "myportfolio-bce34.firebaseapp.com",
  projectId: "myportfolio-bce34",<｜begin▁of▁sentence｜>",
  storageBucket: "myportfolio-bce34.firebasestorage.app",
  messagingSenderId: "593570696399",
  appId: "1:593570696399:web:6cfbec05aafb462049bbba",
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

  // smooth-scroll to section anchors when nav links are clicked
  document.querySelectorAll('.nav-list a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      // close mobile menu if open
      if (navList.classList.contains('open')) {
        navList.classList.remove('open');
      }
      e.preventDefault();
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // also let the visible section titles themselves be clickable (they're bold)
  document.querySelectorAll('.section-title').forEach(title => {
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
      const section = title.closest('section');
      if (section && section.id) {
        document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  initFirebaseAndLoadData();
});

async function initFirebaseAndLoadData() {
  try {
    setProjectsIntro("Checking Firebase connection...");
    await Promise.all([loadProjects(), loadSkills()]);
  } catch (err) {
    console.error("Firebase initialization or data loading error:", err);
    setProjectsIntro(`Failed: ${formatFirebaseError(err)}`);
    renderFallbackData();
  }
}

// Rest of your functions (formatFirebaseError, loadProjects, loadSkills, etc.) go here

