(function () {
  'use strict';

  const places = window.MATCHA_PLACES || [];
  const card = document.getElementById('matcha-detail-card');
  const eyebrowEl = document.getElementById('matcha-detail-eyebrow');
  const taglineEl = document.getElementById('matcha-detail-tagline');
  const nameEl = document.getElementById('matcha-detail-name');
  const starsEl = document.getElementById('matcha-detail-stars');
  const noteEl = document.getElementById('matcha-detail-note');
  const signatureEl = document.getElementById('matcha-detail-signature');
  const closeBtn = card ? card.querySelector('.matcha-detail-card__close') : null;

  let closingTimer = null;

  /** Cute matcha icons (32×32) for bubble markers */
  const BUBBLE_ICONS = {
    whisk:
      '<svg class="matcha-bubble-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">' +
      '<path fill="#c4a574" d="M11 5h10v4H11z"/>' +
      '<rect x="13" y="9" width="6" height="11" rx="1" fill="#e8c088"/>' +
      '<path fill="#f5e6d3" d="M8 14h16v2H8zm0 4h16v2H8zm0 4h14v2H8z"/>' +
      '<ellipse cx="16" cy="29" rx="5" ry="2" fill="#a08c6e"/>' +
      '</svg>',
    bowl:
      '<svg class="matcha-bubble-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">' +
      '<path fill="#faf5e6" stroke="#a08c6e" stroke-width="1.2" d="M5 15c0 7.5 4.5 11.5 11 11.5S27 22.5 27 15"/>' +
      '<ellipse cx="16" cy="15" rx="11" ry="4" fill="#7cb868"/>' +
      '</svg>',
    latte:
      '<svg class="matcha-bubble-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">' +
      '<rect x="7" y="7" width="16" height="20" rx="2" fill="#faf5e6" stroke="#a08c6e" stroke-width="1.2"/>' +
      '<rect x="9" y="10" width="12" height="7" rx="1" fill="#c8e6b8"/>' +
      '<path fill="none" stroke="#f0ebe3" stroke-width="1.3" d="M11 11c2.2-1.8 6.8-1.8 9 0"/>' +
      '</svg>',
    tin:
      '<svg class="matcha-bubble-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">' +
      '<rect x="10" y="10" width="12" height="16" rx="1.5" fill="#6b9e52" stroke="#4a6b38" stroke-width="1"/>' +
      '<rect x="11" y="7" width="10" height="5" rx="1" fill="#d4bc7a" stroke="#a08c6e" stroke-width="0.8"/></svg>',
    softserve:
      '<svg class="matcha-bubble-icon" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">' +
      '<path fill="#e8c4a0" stroke="#c4a082" stroke-width="1" d="M11 26 L16 14 L21 26 z"/>' +
      '<path fill="#a8d89a" d="M13 16 Q16 8 19 16 Q16 20 13 16"/>' +
      '<path fill="#8bc97a" d="M14 14 Q16 10 18 14"/></svg>',
  };

  const ICON_KEYS = Object.keys(BUBBLE_ICONS);

  function placeIconKey(place, index) {
    const k = place.icon;
    if (k && BUBBLE_ICONS[k]) return k;
    return ICON_KEYS[index % ICON_KEYS.length];
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function defaultTagline(place) {
    if (place.tagline) return place.tagline;
    if (place.signatureDrink) return 'famous for ' + place.signatureDrink;
    return 'saved matcha spot';
  }

  function bubbleMarkerHtml(place, index) {
    const iconKey = placeIconKey(place, index);
    const svg = BUBBLE_ICONS[iconKey];
    const name = escapeHtml(place.name || 'Matcha');
    const line = escapeHtml(defaultTagline(place));
    return (
      '<div class="matcha-map-pin" tabindex="0" role="button">' +
      '<div class="matcha-map-pin__bubble">' +
      svg +
      '</div>' +
      '<div class="matcha-map-pin__labels">' +
      '<span class="matcha-map-pin__name">' +
      name +
      '</span>' +
      '<span class="matcha-map-pin__tagline">' +
      line +
      '</span>' +
      '</div>' +
      '</div>'
    );
  }

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
    if (!nameEl || !starsEl || !noteEl || !signatureEl) return;
    const loc = [place.city, place.country].filter(Boolean).join(' · ');
    if (eyebrowEl) eyebrowEl.textContent = loc;
    nameEl.textContent = place.name || '';
    if (taglineEl) taglineEl.textContent = defaultTagline(place);
    starsEl.innerHTML = renderStars(place.rating);
    starsEl.setAttribute('aria-label', `Rating ${place.rating} out of 5`);
    noteEl.textContent = place.note || '';
    if (place.signatureDrink) {
      signatureEl.hidden = false;
      signatureEl.textContent = '— signature: ' + place.signatureDrink;
    } else {
      signatureEl.hidden = true;
      signatureEl.textContent = '';
    }
  }

  function openCard(place) {
    if (!card) return;
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
    if (!card) return;
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

  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeCard();
    });
  }

  if (card) {
    card.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  function initMap() {
    const el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return;

    const map = L.map('map', {
      scrollWheelZoom: true,
      zoomControl: true,
    });

    /* Light, low-contrast basemap (Gen-Z “clean map” vibe) */
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const latLngs = places.map(function (p) {
      return [p.lat, p.lng];
    });

    places.forEach(function (place, index) {
      const html = bubbleMarkerHtml(place, index);
      const icon = L.divIcon({
        className: 'matcha-marker-leaflet',
        html: html,
        iconSize: [268, 76],
        iconAnchor: [30, 70],
        popupAnchor: [0, -52],
      });
      const marker = L.marker([place.lat, place.lng], { icon: icon }).addTo(map);

      function activate(ev) {
        if (typeof L !== 'undefined' && L.DomEvent && ev) {
          const domEv = ev.originalEvent != null ? ev.originalEvent : ev;
          L.DomEvent.stopPropagation(domEv);
        }
        document.dispatchEvent(
          new CustomEvent('matcha:select', { detail: place, bubbles: true })
        );
      }

      marker.on('click', activate);

      setTimeout(function () {
        const wrap = marker.getElement && marker.getElement();
        const pin = wrap && wrap.querySelector('.matcha-map-pin');
        if (!pin) return;
        pin.addEventListener('keydown', function (ke) {
          if (ke.key === 'Enter' || ke.key === ' ') {
            ke.preventDefault();
            activate(ke);
          }
        });
      }, 0);
    });

    if (latLngs.length) {
      map.fitBounds(latLngs, { padding: [56, 56], maxZoom: 12 });
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
