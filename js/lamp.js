/* ==========================================================================
   LAMP ANIMATION — JS CONTROLLER
   --------------------------------------------------------------------------
   The lamp animation runs automatically on page load via lamp.css.
   This script adds:
     1. A global replay function:  window.replayLamp()
     2. (Optional) a re-trigger when the hero scrolls back into view —
        commented out by default. Uncomment the OBSERVER block below to enable.
   ========================================================================== */

(function () {
    'use strict';

    /* --- Replay function: restarts the lamp animation from the beginning --- */
    function replayLamp() {
        var hero = document.querySelector('.aurora-hero');
        if (!hero) return;

        // Add the replay class (which sets animation: none on all targets),
        // force a browser reflow, then remove it — this restarts the animations.
        hero.classList.add('lamp-replay');
        void hero.offsetWidth;        // force reflow
        hero.classList.remove('lamp-replay');
    }

    // Expose globally so it can be called from anywhere
    // e.g. a button:  <button onclick="replayLamp()">Replay</button>
    window.replayLamp = replayLamp;


    /* --- OPTIONAL: re-trigger when the hero scrolls back into view --------- */
    /* Uncomment this block if you want the animation to play again every    */
    /* time the user scrolls back up to the hero section.                    */

    /*
    function initObserver() {
      var hero = document.querySelector('.aurora-hero');
      if (!hero || !('IntersectionObserver' in window)) return;
  
      var hasPlayed = true; // initial play handled by CSS on page load
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            if (!hasPlayed) {
              replayLamp();
              hasPlayed = true;
            }
          } else {
            hasPlayed = false;
          }
        });
      }, { threshold: [0, 0.4, 0.8] });
  
      observer.observe(hero);
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initObserver);
    } else {
      initObserver();
    }
    */
})();