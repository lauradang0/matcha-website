(function () {
  'use strict';

  const places = window.MATCHA_PLACES || [];
  const card = document.getElementById('matcha-detail-card');
  const eyebrowEl = document.getElementById('matcha-detail-eyebrow');
  const nameEl = document.getElementById('matcha-detail-name');
  const starsEl = document.getElementById('matcha-detail-stars');
  const noteEl = document.getElementById('matcha-detail-note');
  const signatureEl = document.getElementById('matcha-detail-signature');
  const closeBtn = card.querySelector('.matcha-detail-card__close');

  let closingTimer = null;

  function renderStars(rating) {
    const r = typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0;
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
  }

  function populateCard(place) {
    eyebrowEl.textContent = `${place.city}, ${place.country}`;
    nameEl.textContent = place.name;
    starsEl.innerHTML = renderStars(place.rating);
    starsEl.setAttribute('aria-label', `Rating ${place.rating} out of 5`);
    noteEl.textContent = place.note || '';
    if (place.signatureDrink) {
      signatureEl.hidden = false;
      signatureEl.textContent = `— signature: ${place.signatureDrink}`;
    } else {
      signatureEl.hidden = true;
      signatureEl.textContent = '';
    }
  }

  function openCard(place) {
    if (closingTimer) {
      clearTimeout(closingTimer);
      closingTimer = null;
    }
    populateCard(place);
    card.hidden = false;
    card.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        card.classList.add('matcha-detail-card--open');
      });
    });
  }

  function closeCard() {
    card.classList.remove('matcha-detail-card--open');
    card.setAttribute('aria-hidden', 'true');
    closingTimer = setTimeout(function () {
      card.hidden = true;
      closingTimer = null;
    }, 260);
  }

  function onMatchaSelect(ev) {
    const place = ev.detail;
    if (!place || typeof place !== 'object') return;
    openCard(place);
  }

  document.addEventListener('matcha:select', onMatchaSelect);

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeCard();
  });

  card.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  function initMap() {
    const el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return;

    const map = L.map('map', { scrollWheelZoom: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const latLngs = places.map(function (p) {
      return [p.lat, p.lng];
    });

    places.forEach(function (place) {
      const marker = L.marker([place.lat, place.lng]).addTo(map);
      marker.on('click', function (ev) {
        if (typeof L !== 'undefined' && L.DomEvent && ev) {
          L.DomEvent.stopPropagation(ev);
        }
        document.dispatchEvent(
          new CustomEvent('matcha:select', { detail: place, bubbles: true })
        );
      });
    });

    if (latLngs.length) {
      map.fitBounds(latLngs, { padding: [48, 48], maxZoom: 12 });
    } else {
      map.setView([20, 0], 2);
    }

    map.on('click', function () {
      closeCard();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
