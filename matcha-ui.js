/**
 * Shared UI helpers for map and collection pages (classic scripts on window).
 */
(function (w) {
  'use strict';

  function ratingNumber(rating) {
    return typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0;
  }

  w.escapeMatchaHtml = function (s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  w.renderMatchaStarsHtml = function (rating) {
    const r = ratingNumber(rating);
    const parts = [];
    for (let i = 0; i < 5; i++) {
      const fullTh = i + 1;
      const halfTh = i + 0.5;
      if (r >= fullTh) {
        parts.push('<span class="matcha-star matcha-star--full">★</span>');
      } else if (r >= halfTh) {
        parts.push(
          '<span class="matcha-star matcha-star--half" aria-hidden="true">' +
            '<span class="matcha-star__empty">☆</span>' +
            '<span class="matcha-star__half-layer"><span class="matcha-star__half">★</span></span>' +
            '</span>'
        );
      } else {
        parts.push('<span class="matcha-star matcha-star--empty">☆</span>');
      }
    }
    return parts.join('');
  };

  w.setMatchaStarsOnElement = function (el, rating) {
    if (!el) return;
    const r = ratingNumber(rating);
    el.innerHTML = w.renderMatchaStarsHtml(rating);
    el.setAttribute('aria-label', `Rating ${r} out of 5`);
  };
})(window);
