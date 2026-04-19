const DELAY = 1000;
let tooltip, ttTitle, ttBody, timer, current;

function showTip(el) {
  const title = el.dataset.tipTitle || '';
  const p1 = el.dataset.tipP1 || '';
  const p2 = el.dataset.tipP2 || '';
  const sc = el.dataset.tipShortcut || '';

  ttTitle.textContent = title;
  let bodyHTML = p1 ? '<p>' + p1 + '</p>' : '';
  if (p2) bodyHTML += '<p>' + p2 + '</p>';
  if (sc) bodyHTML += '<div class="tt-shortcut">Keyboard shortcut: <kbd>' + sc + '</kbd></div>';
  ttBody.innerHTML = bodyHTML;

  const elRect = el.getBoundingClientRect();

  const tipLeft = elRect.left;
  const tipTop = elRect.bottom + 6; // 6px below the element

  tooltip.style.left = tipLeft + 'px';
  tooltip.style.top = tipTop + 'px';
  tooltip.style.width = '220px';

  // Adjust if tooltip goes off the right edge
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  if (tipLeft + 220 > viewportWidth - 8) {
    tooltip.style.left = (viewportWidth - 228) + 'px';
  }

  tooltip.classList.add('visible');
  el.classList.add('tip-active');
}

function hideTip() {
  tooltip.classList.remove('visible');
  if (current) {
    current.classList.remove('tip-active', 'tip-loading');
    const bar = current.querySelector('.tip-progress');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }
    current = null;
  }
}

export function initTooltips() {
  tooltip = document.getElementById('ribbon-tooltip');
  ttTitle = document.getElementById('tt-title');
  ttBody = document.getElementById('tt-body');

  document.querySelectorAll('[data-tip]').forEach(el => {
    const bar = el.querySelector('.tip-progress');

    el.addEventListener('mouseenter', () => {
      if (timer) clearTimeout(timer);
      hideTip();
      current = el;

      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
      }
      void el.offsetWidth;
      el.classList.add('tip-loading');
      if (bar) {
        bar.style.transition = 'width 1s linear';
        bar.style.width = '100%';
      }

      timer = setTimeout(() => showTip(el), DELAY);
    });

    el.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      hideTip();
    });
  });
}