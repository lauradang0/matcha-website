(function () {
  'use strict';

  var modal = document.getElementById('add-cafe-modal');
  if (!modal || typeof window.addUserMatchaPlace !== 'function') return;

  var form = document.getElementById('add-cafe-form');
  var backdrop = modal.querySelector('.form-modal__backdrop');
  var closeBtns = modal.querySelectorAll('[data-close-add-cafe]');
  var openBtns = document.querySelectorAll('[data-open-add-cafe]');

  function open() {
    modal.hidden = false;
    document.body.classList.add('collection-modal-open');
    var first = form && form.querySelector('input, select, textarea, button');
    if (first) first.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove('collection-modal-open');
    if (form) form.reset();
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      open();
    });
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', close);
  });

  if (backdrop) backdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var place = {
        name: fd.get('cafe_name'),
        city: fd.get('cafe_city'),
        country: fd.get('cafe_country'),
        lat: fd.get('cafe_lat'),
        lng: fd.get('cafe_lng'),
        rating: fd.get('cafe_rating'),
        tagline: fd.get('cafe_tagline'),
        note: fd.get('cafe_note'),
        signatureDrink: fd.get('cafe_signature'),
        icon: fd.get('cafe_icon'),
      };
      var saved = window.addUserMatchaPlace(place);
      if (!saved) {
        alert('Please fill in cafe name, city, latitude, and longitude.');
        return;
      }
      if (typeof window.reloadMatchaMapMarkers === 'function') {
        window.reloadMatchaMapMarkers();
      }
      close();
      document.dispatchEvent(new CustomEvent('matcha:select', { detail: saved, bubbles: true }));
    });
  }
})();
