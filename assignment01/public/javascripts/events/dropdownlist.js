(() => {
  let openMenu = null;

  function closeOpen() {
    if (!openMenu) return;
    const { btn, menu } = openMenu;
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    Object.assign(menu.style, { left:'', right:'', top:'', bottom:'' });
    openMenu = null;
  }

  function flipAndShift(btn, menu) {
    menu.classList.remove('right-0','origin-top-right','origin-bottom-right','origin-bottom-left');
    menu.classList.add('left-0','origin-top-left');
    Object.assign(menu.style, { left:'', right:'', top:'', bottom:'' });

    const vw = innerWidth, vh = innerHeight, gap = 8;
    let r = menu.getBoundingClientRect();

    if (r.right > vw - gap) {
      menu.classList.remove('left-0','origin-top-left');
      menu.classList.add('right-0','origin-top-right');
      r = menu.getBoundingClientRect();
    }
    if (r.left < gap) {
      const d = gap - r.left;
      menu.style.left = `${d}px`;
      r = menu.getBoundingClientRect();
    }
    if (r.right > vw - gap) {
      const d = r.right - (vw - gap);
      if (menu.classList.contains('right-0')) menu.style.right = `${d}px`;
      else menu.style.left = `${(parseFloat(getComputedStyle(menu).left)||0) - d}px`;
      r = menu.getBoundingClientRect();
    }

    const spaceBelow = vh - r.top;
    if (spaceBelow < r.height + gap) {
      menu.style.top = 'auto';
      menu.style.bottom = `${btn.offsetHeight + 8}px`;
      menu.classList.remove('origin-top-left','origin-top-right');
      menu.classList.add(menu.classList.contains('right-0') ? 'origin-bottom-right' : 'origin-bottom-left');
    }
  }

  function setSelected(root, value, label) {
    const btn = root.querySelector('.dd-btn');
    const input = root.querySelector('.dd-input');
    const allowEmpty = root.dataset.allowEmpty === 'true';
    const placeholder = root.dataset.placeholder || 'Please Select';

    const val = (value ?? '').toString();
    if (input) input.value = val;
    root.dataset.value = val;
    root.dataset.label = label ?? '';

    if (btn) {
      const text = (allowEmpty && val === '') ? placeholder : (label || placeholder);
      const tn = [...btn.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      if (tn) tn.nodeValue = ` ${text} `;
      else btn.textContent = text;
      btn.classList.toggle('text-gray-400', allowEmpty && val === '');
    }

    root.dispatchEvent(new CustomEvent('dropdown:change', { detail: { value: val, label }, bubbles: true }));
  }

  function initDropdown(root) {
    const btn  = root.querySelector('.dd-btn');
    const menu = root.querySelector('.dd-menu');
    const input = root.querySelector('.dd-input');
    const nameFromData = root.dataset.name;

    if (!btn || !menu || !input) return;
    if (nameFromData && !input.name) input.name = nameFromData;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menu.classList.contains('hidden');
      closeOpen();
      if (willOpen) {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        flipAndShift(btn, menu);
        openMenu = { btn, menu };
      }
    });

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-value]');
      if (!item) return;
      const code  = (item.dataset.value ?? '').toString();
      const label = item.textContent.trim();

      const allowEmpty = root.dataset.allowEmpty === 'true';
      const current = (root.dataset.value ?? '').toString();

      if (allowEmpty && code === current) {
        setSelected(root, '', '');
      } else {
        setSelected(root, code, label);
      }
      closeOpen();
    });

    const initVal =
      (input.value && input.value.trim()) ||
      (root.dataset.value && root.dataset.value.trim()) || '';
    if (initVal !== '') {
      const match = root.querySelector(`[data-value="${CSS.escape(initVal)}"]`);
      setSelected(root, initVal, match ? match.textContent.trim() : initVal);
    } else {
      setSelected(root, '', '');
    }
  }

  window.Dropdown = {
    initAll(root = document) {
      root.querySelectorAll('.dropdown').forEach(initDropdown);
      document.addEventListener('click', closeOpen);
      addEventListener('resize', closeOpen);
      addEventListener('scroll', closeOpen, true);
    },
    getValue(rootEl) {
      return {
        value: rootEl?.dataset.value || '',
        label: rootEl?.dataset.label || ''
      };
    },
    setValue(rootEl, value, label) {
      setSelected(rootEl, value ?? '', label ?? '');
    }
  };
})();


Dropdown.initAll();

//const ddEvent = document.querySelector('.dropdown[data-name="eventType"]');

//Dropdown.setValue(ddEvent, 'webinar', 'Webinar'); 
