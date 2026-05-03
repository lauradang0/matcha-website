(function () {
  'use strict';

  const card = document.getElementById('matcha-detail-card');
  const eyebrowEl = document.getElementById('matcha-detail-eyebrow');
  const taglineEl = document.getElementById('matcha-detail-tagline');
  const nameEl = document.getElementById('matcha-detail-name');
  const starsEl = document.getElementById('matcha-detail-stars');
  const noteEl = document.getElementById('matcha-detail-note');
  const signatureEl = document.getElementById('matcha-detail-signature');
  const closeBtn = card ? card.querySelector('.matcha-detail-card__close') : null;

  let closingTimer = null;

  /** Three rotating matcha illustrations (PNG in assets/). */
  const PIN_IMAGES = ['assets/map-pin-cup.png', 'assets/map-pin-latte.png', 'assets/map-pin-bowl.png'];

  const PIN_ICON_IDS = ['pin-cup', 'pin-latte', 'pin-bowl'];

  const LEGACY_PIN_INDEX = {
    'pin-cup': 0,
    'pin-latte': 1,
    'pin-bowl': 2,
    cup: 0,
    latte: 1,
    bowl: 2,
    whisk: 2,
    tin: 0,
    softserve: 1,
    strawberry: 1,
    'y2k-heart': 0,
    'y2k-camera': 1,
    'y2k-bow': 2,
    'y2k-denim': 0,
    'y2k-button': 1,
    'y2k-sparkle': 1,
    'y2k-cd': 1,
    'y2k-eye': 2,
  };

  function pinImageIndex(place, index) {
    if (place.icon) {
      const id = String(place.icon).trim();
      const fromList = PIN_ICON_IDS.indexOf(id);
      if (fromList >= 0) return fromList;
      if (Object.prototype.hasOwnProperty.call(LEGACY_PIN_INDEX, id)) {
        return LEGACY_PIN_INDEX[id];
      }
    }
    return index % 3;
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
    const imgIdx = pinImageIndex(place, index);
    const src = PIN_IMAGES[imgIdx];
    const name = escapeHtml(place.name || 'Matcha');
    const line = escapeHtml(defaultTagline(place));
    return (
      '<div class="matcha-map-pin" tabindex="0" role="button">' +
      '<div class="matcha-map-pin__bubble matcha-map-pin__bubble--illu">' +
      '<img class="map-pin-illu" src="' +
      escapeHtml(src) +
      '" width="48" height="48" alt="" draggable="false" />' +
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

  function getPlaces() {
    return window.getMergedMatchaPlaces ? window.getMergedMatchaPlaces() : window.MATCHA_PLACES || [];
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

    const markersLayer = L.layerGroup().addTo(map);

    function bindMarker(marker, place) {
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
    }

    function addMarkersFromPlaces(placesList) {
      markersLayer.clearLayers();
      const latLngs = [];
      placesList.forEach(function (place, index) {
        if (place.lat == null || place.lng == null || isNaN(Number(place.lat)) || isNaN(Number(place.lng))) {
          return;
        }
        const html = bubbleMarkerHtml(place, index);
        const icon = L.divIcon({
          className: 'matcha-marker-leaflet',
          html: html,
          iconSize: [268, 76],
          iconAnchor: [30, 70],
          popupAnchor: [0, -52],
        });
        const marker = L.marker([Number(place.lat), Number(place.lng)], { icon: icon }).addTo(markersLayer);
        bindMarker(marker, place);
        latLngs.push([Number(place.lat), Number(place.lng)]);
      });

      if (latLngs.length) {
        map.fitBounds(latLngs, { padding: [56, 56], maxZoom: 12 });
      } else {
        map.setView([20, 0], 2);
      }
    }

    addMarkersFromPlaces(getPlaces());

    window.reloadMatchaMapMarkers = function () {
      addMarkersFromPlaces(getPlaces());
    };

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
