/**
 * Persist user-added cafes (map) and tins (collection) in localStorage.
 * Merged with MATCHA_PLACES / MATCHA_TINS when helpers are called.
 */
(function (w) {
  'use strict';

  var K_PLACES = 'laura_matcha_user_places';
  var K_TINS = 'laura_matcha_user_tins';

  function readArr(key) {
    try {
      var s = localStorage.getItem(key);
      if (!s) return [];
      var a = JSON.parse(s);
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }

  function writeArr(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function clampRating(r) {
    var n = parseFloat(r);
    if (isNaN(n)) return 4;
    return Math.max(0, Math.min(5, n));
  }

  var ICONS = ['pin-cup', 'pin-latte', 'pin-bowl'];

  w.getMergedMatchaPlaces = function () {
    var base = w.MATCHA_PLACES || [];
    return base.concat(readArr(K_PLACES));
  };

  w.getMergedMatchaTins = function () {
    var base = w.MATCHA_TINS || [];
    return base.concat(readArr(K_TINS));
  };

  w.addUserMatchaPlace = function (place) {
    var lat = parseFloat(place.lat);
    var lng = parseFloat(place.lng);
    if (!place.name || !String(place.name).trim()) return null;
    if (!place.city || !String(place.city).trim()) return null;
    if (isNaN(lat) || isNaN(lng)) return null;

    var row = {
      id: place.id || 'user-place-' + Date.now(),
      name: String(place.name).trim(),
      city: String(place.city).trim(),
      country: String(place.country || '').trim() || '—',
      lat: lat,
      lng: lng,
      rating: clampRating(place.rating),
      tagline: place.tagline ? String(place.tagline).trim() : '',
      note: place.note ? String(place.note).trim() : '',
    };

    if (place.icon && String(place.icon).trim() && ICONS.indexOf(String(place.icon).trim()) >= 0) {
      row.icon = String(place.icon).trim();
    }

    if (place.signatureDrink && String(place.signatureDrink).trim()) {
      row.signatureDrink = String(place.signatureDrink).trim();
    }

    var arr = readArr(K_PLACES);
    arr.push(row);
    writeArr(K_PLACES, arr);
    return row;
  };

  w.addUserMatchaTin = function (tin) {
    if (!tin.name || !String(tin.name).trim()) return null;

    var row = {
      id: tin.id || 'user-tin-' + Date.now(),
      name: String(tin.name).trim(),
      producer: tin.producer ? String(tin.producer).trim() : '—',
      rating: clampRating(tin.rating),
      note: tin.note ? String(tin.note).trim() : '',
      tinColor: tin.tinColor || '#5a8f4a',
      lidColor: tin.lidColor || '#d4bc7a',
    };

    var arr = readArr(K_TINS);
    arr.push(row);
    writeArr(K_TINS, arr);
    return row;
  };
})(window);
