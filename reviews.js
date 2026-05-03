(function () {
  'use strict';

  const grid = document.getElementById('tin-grid');
  const modal = document.getElementById('tin-modal');
  const backdrop = document.getElementById('tin-modal-backdrop');
  const closeBtn = document.getElementById('tin-modal-close');
  const producerEl = document.getElementById('tin-modal-producer');
  const nameEl = document.getElementById('tin-modal-name');
  const starsEl = document.getElementById('tin-modal-stars');
  const scoreEl = document.getElementById('tin-modal-score');
  const noteEl = document.getElementById('tin-modal-note');

  const addModal = document.getElementById('add-tin-modal');
  const addForm = document.getElementById('add-tin-form');
  const addBackdrop = addModal ? addModal.querySelector('.form-modal__backdrop') : null;
  const addCloseBtns = addModal ? addModal.querySelectorAll('[data-close-add-tin]') : [];
  const openAddBtns = document.querySelectorAll('[data-open-add-tin]');

  if (!grid || !modal) return;

  function allTins() {
    return window.getMergedMatchaTins ? window.getMergedMatchaTins() : window.MATCHA_TINS || [];
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

  function tinThumbHtml() {
    return (
      '<img class="tin-card__img" src="assets/collection-thumb-chawan.png" width="100" height="130" alt="" draggable="false" />'
    );
  }

  function openModal(tin) {
    if (!producerEl || !nameEl || !starsEl || !scoreEl || !noteEl || !closeBtn) return;
    producerEl.textContent = tin.producer || '';
    nameEl.textContent = tin.name || '';
    starsEl.innerHTML = renderStars(tin.rating);
    starsEl.setAttribute('aria-label', `Rating ${tin.rating} out of 5`);
    scoreEl.textContent = Number(tin.rating).toFixed(1) + ' / 5';
    noteEl.textContent = tin.note || '';
    modal.hidden = false;
    document.body.classList.add('collection-modal-open');
    closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    if (!addModal || addModal.hidden) {
      document.body.classList.remove('collection-modal-open');
    }
  }

  function openAddTin() {
    if (!addModal || typeof window.addUserMatchaTin !== 'function') return;
    addModal.hidden = false;
    document.body.classList.add('collection-modal-open');
    const first = addForm && addForm.querySelector('input');
    if (first) first.focus();
  }

  function closeAddTin() {
    if (!addModal) return;
    addModal.hidden = true;
    if (modal.hidden) {
      document.body.classList.remove('collection-modal-open');
    }
    if (addForm) addForm.reset();
  }

  function renderGrid() {
    grid.innerHTML = '';
    allTins().forEach(function (tin) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tin-card';
      btn.setAttribute('aria-label', 'View rating for ' + (tin.name || 'matcha'));
      btn.innerHTML =
        '<span class="tin-card__visual">' +
        tinThumbHtml() +
        '</span>' +
        '<span class="tin-card__name">' +
        (tin.name || '') +
        '</span>' +
        '<span class="tin-card__producer">' +
        (tin.producer || '') +
        '</span>';
      btn.addEventListener('click', function () {
        openModal(tin);
      });
      grid.appendChild(btn);
    });
  }

  renderGrid();

  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  openAddBtns.forEach(function (btn) {
    btn.addEventListener('click', openAddTin);
  });

  addCloseBtns.forEach(function (btn) {
    btn.addEventListener('click', closeAddTin);
  });
  if (addBackdrop) addBackdrop.addEventListener('click', closeAddTin);

  if (addForm) {
    addForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(addForm);
      const tin = {
        name: fd.get('tin_name'),
        producer: fd.get('tin_producer'),
        rating: fd.get('tin_rating'),
        note: fd.get('tin_note'),
        tinColor: fd.get('tin_color') || '#5a8f4a',
        lidColor: fd.get('tin_lid') || '#d4bc7a',
      };
      const saved = window.addUserMatchaTin(tin);
      if (!saved) {
        alert('Please enter a tin name.');
        return;
      }
      closeAddTin();
      renderGrid();
      openModal(saved);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (addModal && !addModal.hidden) {
      closeAddTin();
      return;
    }
    if (modal && !modal.hidden) closeModal();
  });
})();
