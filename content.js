// Ro-ID — Roblox User ID Copier

const TOAST_DURATION = 2000;

function showToast(message, isError = false) {
  const existing = document.getElementById('ro-id-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'ro-id-toast';
  toast.className = isError ? 'ro-id-toast ro-id-toast--error' : 'ro-id-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('ro-id-toast--visible'));
  setTimeout(() => {
    toast.classList.remove('ro-id-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, TOAST_DURATION);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`✓ Copied: ${text}`);
  }).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    el.remove();
    showToast(`✓ Copied: ${text}`);
  });
}

function extractUUIDFromURL(url) {
  const match = url && url.match(/\/users\/(\d+)/);
  return match ? match[1] : null;
}

function extractUUIDFromProfilePage() {
  const meta = document.querySelector('meta[name="user-data"]');
  if (meta) {
    try {
      const data = JSON.parse(meta.content);
      if (data.userId) return String(data.userId);
    } catch (_) {}
  }
  const fromURL = extractUUIDFromURL(window.location.href);
  if (fromURL) return fromURL;
  const userIdEl = document.querySelector('[data-userid], [data-user-id]');
  if (userIdEl) return userIdEl.dataset.userid || userIdEl.dataset.userId;
  return null;
}

function createCopyButton(userId) {
  const btn = document.createElement('button');
  btn.className = 'ro-id-btn';
  btn.title = `Copy User ID: ${userId}`;
  btn.setAttribute('data-ro-id', userId);
  btn.innerHTML = `
    <img class="ro-id-icon ro-id-icon--outline" src="${chrome.runtime.getURL('icons/icon_outline.png')}" alt="" />
    <img class="ro-id-icon ro-id-icon--filled"  src="${chrome.runtime.getURL('icons/icon_filled.png')}"      alt="" />
    <span>Copy ID</span>
  `;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard(userId);
    btn.classList.add('ro-id-btn--copied');
    btn.querySelector('span').textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('ro-id-btn--copied');
      btn.querySelector('span').textContent = 'Copy ID';
    }, 1500);
  });
  return btn;
}

function handleProfilePage() {
  if (!window.location.pathname.match(/^\/users\/\d+/)) return;
  const userId = extractUUIDFromProfilePage();
  if (!userId) return;
  if (document.querySelector('.ro-id-profile-btn')) return;

  const targetSelectors = [
    '.profile-header-top', '.profile-header', '[class*="profile-header"]',
    '.profile-container', 'h1.ng-binding', '[data-testid="profile-header"]'
  ];

  function inject() {
    for (const sel of targetSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const btn = createCopyButton(userId);
        btn.classList.add('ro-id-profile-btn');
        el.appendChild(btn);
        return true;
      }
    }
    return false;
  }

  if (!inject()) {
    const observer = new MutationObserver(() => { if (inject()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }
}

function injectIntoContextMenus() {
  const menuObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const isMenu = node.matches(
          '[class*="dropdown"], [class*="context-menu"], [class*="options-menu"], [role="menu"], [role="listbox"]'
        ) || node.querySelector('[class*="dropdown-item"], [role="menuitem"]');
        if (!isMenu) continue;

        const nearbyLink = (
          node.previousElementSibling?.querySelector('a[href*="/users/"]') ||
          node.closest('[data-userid]') ||
          document.activeElement?.closest('[data-userid]') ||
          document.querySelector('a[href*="/users/"]:focus')
        );

        let userId = null;
        if (nearbyLink) {
          userId = extractUUIDFromURL(nearbyLink.href) || nearbyLink.dataset.userid || nearbyLink.dataset.userId;
        }
        if (!userId) userId = extractUUIDFromProfilePage();
        if (!userId) continue;
        if (node.querySelector('.ro-id-menu-item')) continue;

        const menuItem = document.createElement('li');
        menuItem.className = 'ro-id-menu-item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.innerHTML = `
          <img class="ro-id-icon ro-id-icon--outline" src="${chrome.runtime.getURL('icons/icon_outline.png')}" alt="" />
          <img class="ro-id-icon ro-id-icon--filled"  src="${chrome.runtime.getURL('icons/icon_filled.png')}"      alt="" />
          Copy User ID
        `;
        menuItem.addEventListener('click', (e) => { e.stopPropagation(); copyToClipboard(userId); });
        const list = node.querySelector('ul') || node;
        list.appendChild(menuItem);
      }
    }
  });
  menuObserver.observe(document.body, { childList: true, subtree: true });
}

let lastPath = location.pathname;
function onNavigate() {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    setTimeout(() => handleProfilePage(), 800);
  }
}

function init() {
  handleProfilePage();
  injectIntoContextMenus();
  const domObserver = new MutationObserver(() => onNavigate());
  domObserver.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
