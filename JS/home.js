// Scroll Reveal Animationen
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

const scrollReveal = typeof ScrollReveal === 'function' ? ScrollReveal() : null;

if (scrollReveal) {
  scrollReveal.reveal(".header__video", {
    ...scrollRevealOption,
    origin: "right",
    delay: 1000
  });
  
  scrollReveal.reveal(".header__content h1", {
    ...scrollRevealOption,
    delay: 500,
  });
  
  scrollReveal.reveal(".header__content p", {
    ...scrollRevealOption,
    delay: 1000,
  });
  
  scrollReveal.reveal(".header__content .bar", {
    ...scrollRevealOption,
    delay: 1500,
  });
  
  scrollReveal.reveal(".cta-button-div", {
    ...scrollRevealOption,
    delay: 2000,
  });
}

// Wenn das Video im Header vorhanden ist, automatisch abspielen
document.addEventListener('DOMContentLoaded', function() {
  const video = document.querySelector('.header__video video');
  if (video) {
    video.play().catch(error => {
      console.log('Video autoplay failed:', error);
    });
  }
});
