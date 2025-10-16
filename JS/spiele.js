// Navigation Menu Funktionen
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");
  
  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
  
  // Body Scroll verhindern wenn Menü offen ist
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-line");
  document.body.style.overflow = ''; // Scrollen dann wieder erlauben
});

// Menü schließen wenn außerhalb geklickt wird
document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !menuBtn.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
    document.body.style.overflow = '';
  }
});

// Scroll Reveal Animationen für Spiele-Seite
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// Titel "UNSERE SPIELE"
ScrollReveal().reveal(".spiele_main_container h2", {
  ...scrollRevealOption,
  delay: 300,
});

// Beschreibungstext
ScrollReveal().reveal(".spiele_main_container p", {
  ...scrollRevealOption,
  delay: 600,
});

// Spiele Grid - jedes Spiel mit Verzögerung
ScrollReveal().reveal(".spiel_box", {
  ...scrollRevealOption,
  delay: 800,
  interval: 100, 
});

// Erste Reihe der Spiele
ScrollReveal().reveal(".spiele_grid a:nth-child(1)", {
  ...scrollRevealOption,
  origin: "left",
  delay: 800,
});

ScrollReveal().reveal(".spiele_grid a:nth-child(2)", {
  ...scrollRevealOption,
  delay: 1000,
});

ScrollReveal().reveal(".spiele_grid a:nth-child(3)", {
  ...scrollRevealOption,
  origin: "right",
  delay: 1200,
});

// Zweite Reihe der Spiele
ScrollReveal().reveal(".spiele_grid a:nth-child(4)", {
  ...scrollRevealOption,
  origin: "left",
  delay: 1400,
});

ScrollReveal().reveal(".spiele_grid a:nth-child(5)", {
  ...scrollRevealOption,
  delay: 1600,
});

ScrollReveal().reveal(".spiele_grid a:nth-child(6)", {
  ...scrollRevealOption,
  origin: "right",
  delay: 1800,
});

// PopUp Animation für jedes Spiel
ScrollReveal().reveal(".spiel_box", {
  distance: "30px",
  origin: "bottom",
  duration: 800,
  scale: 0.9,
  easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  interval: 150
});