// Scroll Reveal Animationen für Spiele-Seite
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

const scrollReveal = typeof ScrollReveal === 'function' ? ScrollReveal() : null;

if (scrollReveal) {
  // Titel "UNSERE SPIELE"
  scrollReveal.reveal(".spiele_main_container h2", {
    ...scrollRevealOption,
    delay: 300,
  });
  
  // Beschreibungstext
  scrollReveal.reveal(".spiele_main_container p", {
    ...scrollRevealOption,
    delay: 600,
  });
  
  // Spiele Grid - jedes Spiel mit Verzögerung
  scrollReveal.reveal(".spiel_box", {
    ...scrollRevealOption,
    delay: 800,
    interval: 100, 
  });
  
  // Erste Reihe der Spiele
  scrollReveal.reveal(".spiele_grid a:nth-child(1)", {
    ...scrollRevealOption,
    origin: "left",
    delay: 800,
  });
  
  scrollReveal.reveal(".spiele_grid a:nth-child(2)", {
    ...scrollRevealOption,
    delay: 1000,
  });
  
  scrollReveal.reveal(".spiele_grid a:nth-child(3)", {
    ...scrollRevealOption,
    origin: "right",
    delay: 1200,
  });
  
  // Zweite Reihe der Spiele
  scrollReveal.reveal(".spiele_grid a:nth-child(4)", {
    ...scrollRevealOption,
    origin: "left",
    delay: 1400,
  });
  
  scrollReveal.reveal(".spiele_grid a:nth-child(5)", {
    ...scrollRevealOption,
    delay: 1600,
  });
  
  scrollReveal.reveal(".spiele_grid a:nth-child(6)", {
    ...scrollRevealOption,
    origin: "right",
    delay: 1800,
  });
  
  // PopUp Animation für jedes Spiel
  scrollReveal.reveal(".spiel_box", {
    distance: "30px",
    origin: "bottom",
    duration: 800,
    scale: 0.9,
    easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    interval: 150
  });
}
