/* ============================================================
   Michelle Yin — main.js
   Smooth anchors · ticker clock · scroll reveals · video play/pause
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth anchor scrolling ---------- */

  var anchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  anchors.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.pushState(null, '', '#' + id);
    });
  });

  /* ---------- Ticker: live NYC clock ---------- */

  var clocks = document.querySelectorAll('.ticker-clock');
  if (clocks.length) {
    var clockFmt = null;
    try {
      clockFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (err) {
      clockFmt = null;
    }
    var tickClock = function () {
      var now = new Date();
      var label = (clockFmt ? clockFmt.format(now) : now.toLocaleTimeString('en-US')) + ' NYC';
      clocks.forEach(function (c) { c.textContent = label; });
    };
    tickClock();
    window.setInterval(tickClock, 1000);
  }

  /* ---------- Scroll reveals ---------- */

  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Videos: play when >= 50% visible ---------- */

  var videos = document.querySelectorAll('video');
  if (reduceMotion) {
    videos.forEach(function (v) {
      v.removeAttribute('autoplay');
      try { v.pause(); } catch (err) { /* poster stays */ }
    });
  } else if ('IntersectionObserver' in window) {
    /* Hysteresis: play once ~a third is visible, pause only when fully
       offscreen — ratios that hover around a single threshold can report
       fractionally under it and would otherwise stick videos paused. */
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          video.dataset.inview = 'true';
          var p = video.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stays */ });
        } else if (!entry.isIntersecting) {
          delete video.dataset.inview;
          video.pause();
        }
      });
    }, { threshold: [0, 0.3, 0.6] });
    videos.forEach(function (v) { videoObserver.observe(v); });
  }

})();
