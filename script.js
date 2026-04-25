
/* =============================================
   📌 ПЛАВАЮЧА КНОПКА
   ============================================= */
function initFloatingBtn() {
  const btn = document.getElementById('floatingCta');
  const orderSection = document.getElementById('order');
  if (!btn || !orderSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        btn.classList.remove('visible');
        btn.classList.add('hidden');
      } else {
        btn.classList.add('visible');
        btn.classList.remove('hidden');
      }
    });
  }, { threshold: 0.2 });

  observer.observe(orderSection);

  // Показуємо після прокрутки вниз на 300px
  let shown = false;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300 && !shown) {
      shown = true;
      btn.classList.add('visible');
    }
  }, { passive: true });
}
'use strict';

/* =============================================
   ⚙️ КОНФІГУРАЦІЯ — редагуй тут
   ============================================= */
const CONFIG = {
  TICKET_PRICE: 2,
  ADMIN_PASSWORD: 'admin12345', // TODO: змінити перед запуском!
  WAYFORPAY_MERCHANT: 't_me_ac6e3',
  SITE_URL: 'https://bmwgiveaway.online',
  BRAND: 'AI Agency',
  PRIZE: 'BMW M760Li',
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbyuAsAD_usceadu8lVBbQa-YbK2On9_lSxJUXyZYCyCIhiCQdbKSwPHvULNCQnqJCtS/exec',
  TELEGRAM_URL: 'PASTE_YOUR_TELEGRAM_ENDPOINT_HERE',
  EMAIL_URL: 'PASTE_YOUR_EMAIL_ENDPOINT_HERE',
  STORAGE_KEY: 'bmwPromoV2',
};

const PRICE_MAP = { 1: 2, 3: 6, 5: 10 };

/* =============================================
   📍 ВИЗНАЧАЄМО СТОРІНКУ
   script.js спільний для index.html та admin.html
   Частина коду запускається тільки на index.html
   ============================================= */
const IS_INDEX = !!document.getElementById('hero');
const IS_ADMIN = !!document.getElementById('loginPage');

/* =============================================
   🌐 МОВА
   ============================================= */
let lang = localStorage.getItem('siteLang') || 'uk';

function applyLang(l) {
  lang = l;
  localStorage.setItem('siteLang', l);
  document.querySelectorAll('[data-uk]').forEach(el => {
    const val = l === 'uk' ? el.dataset.uk : el.dataset.en;
    if (val !== undefined) el.textContent = val;
  });
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = l === 'uk' ? 'EN' : 'UA';
  renderFAQ();
}

document.getElementById('langBtn')?.addEventListener('click', () => {
  applyLang(lang === 'uk' ? 'en' : 'uk');
});

/* =============================================
   📱 MOBILE BURGER MENU — тільки index.html
   ============================================= */
const burgerBtn = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');

if (burgerBtn && mobileNav) {
  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      burgerBtn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* =============================================
   📜 HEADER SCROLL
   ============================================= */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });
if (window.scrollY > 30) header?.classList.add('scrolled');

/* =============================================
   👁 SCROLL REVEAL
   ============================================= */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =============================================
   🖼 LIGHTBOX
   ============================================= */
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
// Expose globally для onclick
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

/* =============================================
   📦 БАЗА ПОКУПЦІВ (localStorage)
   TODO: замінити на API для продакшну
   ============================================= */
const demoData = [

];

function getParticipants() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    return saved.length ? saved : demoData;
  } catch { return demoData; }
}

function saveParticipant(p) {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    saved.unshift(p);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(saved));
  } catch {}
}

function generateNumber() {
  return `A-${Math.floor(10000 + Math.random() * 90000)}`;
}
function generateOrderId() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
}
function maskPhone(phone) {
  const d = phone.replace(/\D/g, '');
  if (d.length < 6) return phone;
  return `${phone.slice(0, 7)} *** ** ${phone.slice(-2)}`;
}
function fmtDate(date = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

/* =============================================
   📊 СТАТИСТИКА
   ============================================= */
function updateStats() {
  const all = getParticipants();
  const total = all.length;
  const tickets = all.reduce((s, p) => s + (Number(p.tickets) || 1), 0);

  const animNum = (el, target) => {
    if (!el) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 30);
  };

  animNum(document.getElementById('heroCount'), total);
  animNum(document.getElementById('statTotal'), total);
  animNum(document.getElementById('statTickets'), tickets);
}

/* =============================================
   📋 ТАБЛИЦЯ ПОКУПЦІВ
   ============================================= */
function renderTable(filter = '') {
  const tbody = document.getElementById('participantsTable');
  if (!tbody) return;
  let all = getParticipants();
  if (filter) {
    const q = filter.toLowerCase();
    all = all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      String(p.number).toLowerCase().includes(q)
    );
  }
  if (!all.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">
      ${lang === 'uk' ? 'Покупців ще немає. Будь першим! 🚀' : 'No buyers yet. Be the first! 🚀'}
    </td></tr>`;
    return;
  }
  tbody.innerHTML = all.map(p => `
    <tr>
      <td data-label="Номер">${esc(p.number)}</td>
      <td data-label="Ім'я">${esc(p.name)}</td>
      <td data-label="Телефон">${esc(p.phone)}</td>
      <td data-label="Місто">${esc(p.city || '—')}</td>
      <td data-label="Кількість">${p.tickets}</td>
      <td data-label="Дата">${esc(p.createdAt)}</td>
      <td data-label="">${isAdmin ? "<button class=\"delete-btn\" onclick=\"handleDelete('"+esc(p.number)+"')\">🗑</button>" : ""}</td>
    </tr>
  `).join('');
}

document.getElementById('searchInput')?.addEventListener('input', e => {
  renderTable(e.target.value);
});

/* =============================================
   📦 ПАКЕТИ — кнопки
   ============================================= */
function initPackageButtons() {
  document.querySelectorAll('.package-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = btn.dataset.qty;
      const select = document.getElementById('tickets');
      if (select) { select.value = qty; updatePrice(); }
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* =============================================
   💰 ЦІНА
   ============================================= */
function updatePrice() {
  const qty = Number(document.getElementById('tickets')?.value || 1);
  const price = PRICE_MAP[qty] || qty * CONFIG.TICKET_PRICE;
  const el = document.getElementById('totalPrice');
  if (el) el.textContent = `$${price}`;
}
document.getElementById('tickets')?.addEventListener('change', updatePrice);

/* =============================================
   ✅ ВАЛІДАЦІЯ
   ============================================= */
function validatePhone(phone) {
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 13;
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(formData) {
  let valid = true;

  const setErr = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    if (msg) valid = false;
  };

  // Нова Пошта
  const cityRef = document.getElementById('npCityRef')?.value || '';
  const whRef   = document.getElementById('npWarehouseRef')?.value || '';
  if (!cityRef) {
    showToast('🚚 Оберіть місто доставки зі списку');
    valid = false;
  }
  if (!whRef) {
    showToast('🚚 Оберіть відділення Нової Пошти');
    valid = false;
  }

  const name = formData.get('name')?.trim() || '';
  const phone = formData.get('phone')?.trim() || '';
  const email = formData.get('email')?.trim() || '';

  setErr('err-name', name.length < 2 ? (lang === 'uk' ? "Введіть ім'я" : 'Enter your name') : '');
  setErr('err-phone', !validatePhone(phone) ? (lang === 'uk' ? 'Невірний формат телефону (+380...)' : 'Invalid phone format (+380...)') : '');
  setErr('err-email', !validateEmail(email) ? (lang === 'uk' ? 'Невірний email' : 'Invalid email') : '');

  const agreed = document.getElementById('agreeCheck')?.checked;
  if (!agreed) {
    showToast(lang === 'uk' ? '☑️ Погодьтесь з умовами участі' : '☑️ Please agree to the terms');
    valid = false;
  }

  // Підсвічуємо поля
  ['fname', 'fphone', 'femail'].forEach(id => {
    const el = document.getElementById(id);
    const errId = { fname: 'err-name', fphone: 'err-phone', femail: 'err-email' }[id];
    const errEl = document.getElementById(errId);
    if (el) el.classList.toggle('error', !!(errEl?.textContent));
  });

  return valid;
}

/* =============================================
   🎫 ФОРМА — ОБРОБКА
   ============================================= */
function initForm() {
  const orderIdInput = document.getElementById('orderId');
  if (orderIdInput) orderIdInput.value = generateOrderId();

  const form = document.getElementById('orderForm');
  const demoBtn = document.getElementById('demoPaymentBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (!validateForm(fd)) return;
    await handlePayment(fd);
  });

  demoBtn?.addEventListener('click', async () => {
    const fd = new FormData(document.getElementById('orderForm'));
    if (!validateForm(fd)) return;
    await handlePayment(fd);
  });
}

const WFP_LINKS = {
  1:  'https://secure.wayforpay.com/button/b5f8b45e84c47',
  3:  'https://secure.wayforpay.com/button/b982694aa25ae',
  5:  'https://secure.wayforpay.com/button/bd78317951e5f',
};

async function handlePayment(formData) {
  const tickets = Number(formData.get('tickets') || 1);
  const amount  = PRICE_MAP[tickets] || tickets * CONFIG.TICKET_PRICE;
  const orderId = formData.get('orderId');

  // Зберігаємо дані до оплати
  const pendingData = {
    name:      formData.get('name'),
    phone:     formData.get('phone'),
    email:     formData.get('email'),
    city:      document.getElementById('npCity')?.value?.trim() || '—',
    warehouse: document.getElementById('npWarehouse')?.value?.trim() || '—',
    tickets,
    amount,
    orderId,
  };
  localStorage.setItem('pendingOrder', JSON.stringify(pendingData));

  // Також кодуємо в URL щоб success.html отримав дані
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(pendingData))));
  localStorage.setItem('pendingOrderEncoded', encoded);

  // Відкриваємо потрібне посилання WayForPay
  const link = WFP_LINKS[tickets] || WFP_LINKS[1];
  window.location.href = link;
}

function completePurchase() {
  const raw = localStorage.getItem('pendingOrder');
  if (!raw) return;
  const p = JSON.parse(raw);
  localStorage.removeItem('pendingOrder');

  const participant = {
    number:    generateNumber(),
    orderId:   p.orderId,
    name:      p.name,
    phone:     maskPhone(p.phone || ''),
    email:     p.email,
    city:      p.city,
    warehouse: p.warehouse,
    tickets:   p.tickets,
    amount:    p.amount,
    createdAt: fmtDate(),
  };

  saveParticipant(participant);
  updateStats();
  renderTable();
  sendToWebhooks(participant);
  showSuccessModal(participant);

  document.getElementById('orderForm')?.reset();
  updatePrice();
  const orderIdInput = document.getElementById('orderId');
  if (orderIdInput) orderIdInput.value = generateOrderId();
}

function onPaySuccess(formData) {
  const tickets = Number(formData.get('tickets') || 1);
  const participant = {
    number: generateNumber(),
    orderId: formData.get('orderId'),
    name: formData.get('name')?.trim(),
    phone: maskPhone(formData.get('phone')?.trim() || ''),
    email: formData.get('email')?.trim(),
    city: document.getElementById('npCity')?.value?.trim() || '—',
    warehouse: document.getElementById('npWarehouse')?.value?.trim() || '—',
    tickets,
    amount: PRICE_MAP[tickets] || tickets * CONFIG.TICKET_PRICE,
    createdAt: fmtDate(),
  };

  saveParticipant(participant);
  updateStats();
  renderTable();
  sendToWebhooks(participant);
  showSuccessModal(participant);

  // Скидаємо форму
  document.getElementById('orderForm')?.reset();
  updatePrice();
  const orderIdInput = document.getElementById('orderId');
  if (orderIdInput) orderIdInput.value = generateOrderId();
}

/* =============================================
   🎉 SUCCESS MODAL
   ============================================= */
function showSuccessModal(participant) {
  const numEl = document.getElementById('modalTicketNum');
  const nameEl = document.getElementById('modalTicketName');
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return; // не на index.html — виходимо
  if (numEl) numEl.textContent = participant.number;
  if (nameEl) nameEl.textContent = participant.name;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose')?.addEventListener('click', () => {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('modalOverlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
});

document.getElementById('modalShareBtn')?.addEventListener('click', () => {
  const num = document.getElementById('modalTicketNum').textContent;
  const text = lang === 'uk'
    ? `Я замовив ароматизатор та отримав номер ${num} в акції BMW M760Li від AI Agency! 🏆 ${CONFIG.SITE_URL}`
    : `I got order number ${num} in the BMW M760Li promo by AI Agency! 🏆 ${CONFIG.SITE_URL}`;
  if (navigator.share) {
    navigator.share({ title: 'BMW Promo', text });
  } else {
    navigator.clipboard?.writeText(text);
    showToast(lang === 'uk' ? '✅ Скопійовано!' : '✅ Copied!');
  }
});

/* =============================================
   🌐 WEBHOOK СПОВІЩЕННЯ
   ============================================= */
async function sendToWebhooks(payload) {
  const tasks = [];
  if (CONFIG.SHEETS_URL && !CONFIG.SHEETS_URL.includes('PASTE_YOUR')) {
    tasks.push(fetch(CONFIG.SHEETS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}));
  }
  if (CONFIG.TELEGRAM_URL && !CONFIG.TELEGRAM_URL.includes('PASTE_YOUR')) {
    tasks.push(fetch(CONFIG.TELEGRAM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}));
  }
  if (CONFIG.EMAIL_URL && !CONFIG.EMAIL_URL.includes('PASTE_YOUR')) {
    tasks.push(fetch(CONFIG.EMAIL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}));
  }
  await Promise.allSettled(tasks);
}

/* =============================================
   ❓ FAQ
   ============================================= */
const FAQ = {
  uk: [
    { q: 'Як я отримую номер замовлення?', a: 'Після успішної оплати номер генерується автоматично та показується на сайті. Зберігається в публічному списку покупців.' },
    { q: 'Чи можна оплатити Apple Pay / Google Pay?', a: 'Так, якщо ці методи активовані у WayForPay для вашого магазину та підтримуються пристроєм.' },
    { q: 'Де зберігаються дані покупців?', a: 'Дані покупців зберігаються на сайті та в нашій внутрішній базі даних відповідно до політики конфіденційності.' },
    { q: 'Коли буде оголошено обраного покупця?', a: 'Дата оголошення буде опублікована в наших соціальних мережах. Стежте за оновленнями!' },
    { q: 'Скільки ароматизаторів можна замовити?', a: 'Від 1 до 5 ароматизаторів за одну покупку.' },

  ],
  en: [
    { q: 'How do I get my order number?', a: 'After successful payment, your number is generated automatically and shown on the site. It is saved in the public buyer list.' },
    { q: 'Can I pay with Apple Pay / Google Pay?', a: 'Yes, if these methods are enabled in WayForPay for your store and supported by your device.' },
    { q: 'Where is customer data stored?', a: 'Customer data is stored on the website and in our internal database in accordance with our privacy policy.' },
    { q: 'When will the selected buyer be announced?', a: 'The announcement date will be published on our social media. Stay tuned!' },
    { q: 'How many fresheners can I order?', a: 'From 1 to 5 fresheners per purchase.' },

  ],
};

function renderFAQ() {
  const container = document.getElementById('faqList');
  if (!container) return;
  const items = FAQ[lang] || FAQ.uk;
  container.innerHTML = items.map((item, i) => `
    <div class="faq-item" data-index="${i}">
      <div class="faq-question">
        <span>${esc(item.q)}</span>
        <div class="faq-chevron">▾</div>
      </div>
      <div class="faq-answer"><p>${esc(item.a)}</p></div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* =============================================
   🍞 TOAST
   ============================================= */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
}

/* =============================================
   🔧 HELPERS
   ============================================= */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =============================================
   🚀 INIT — тільки для index.html
   ============================================= */

/* =============================================
   🚚 НОВА ПОШТА — автопідказка міст та відділень
   ============================================= */
const NP_KEY = 'd6c5442b96b8aa4921b6c1a66c55f208';
const NP_API = 'https://api.novaposhta.ua/v2.0/json/';

async function npRequest(modelName, calledMethod, props = {}) {
  const res = await fetch(NP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NP_KEY,
      modelName,
      calledMethod,
      methodProperties: props
    })
  });
  const data = await res.json();
  return data.data || [];
}

function showDropdown(list, items, onSelect) {
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = '<li class="np-loading">Нічого не знайдено</li>';
    list.classList.add('open');
    return;
  }
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.label;
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onSelect(item);
      list.classList.remove('open');
    });
    list.appendChild(li);
  });
  list.classList.add('open');
}

function initNovaPoshta() {
  const cityInput = document.getElementById('npCity');
  const cityList  = document.getElementById('npCityList');
  const cityRef   = document.getElementById('npCityRef');
  const whInput   = document.getElementById('npWarehouse');
  const whList    = document.getElementById('npWarehouseList');
  const whRef     = document.getElementById('npWarehouseRef');

  if (!cityInput) return;

  let cityTimer;

  cityInput.addEventListener('input', () => {
    const q = cityInput.value.trim();
    cityRef.value = '';
    whInput.disabled = true;
    whInput.value = '';
    whRef.value = '';
    whList.classList.remove('open');

    clearTimeout(cityTimer);
    if (q.length < 2) { cityList.classList.remove('open'); return; }

    cityList.innerHTML = '<li class="np-loading">Пошук...</li>';
    cityList.classList.add('open');

    cityTimer = setTimeout(async () => {
      const data = await npRequest('Address', 'searchSettlements', {
        CityName: q, Limit: 10
      });
      const addresses = data[0]?.Addresses || [];
      const items = addresses.map(a => ({
        label: `${a.Present}`,
        ref: a.DeliveryCity || a.Ref,
        name: a.MainDescription
      }));
      showDropdown(cityList, items, (item) => {
        cityInput.value = item.label;
        cityRef.value = item.ref;
        // Завантажуємо відділення
        loadWarehouses(item.ref);
      });
    }, 400);
  });

  cityInput.addEventListener('blur', () => {
    setTimeout(() => cityList.classList.remove('open'), 200);
  });

  async function loadWarehouses(ref) {
    whInput.disabled = false;
    whInput.value = '';
    whInput.placeholder = 'Завантаження...';
    whRef.value = '';

    const data = await npRequest('AddressGeneral', 'getWarehouses', {
      CityRef: ref, Limit: 100
    });
    const items = data.map(w => ({ label: w.Description, ref: w.Ref }));
    whInput.placeholder = 'Введіть номер відділення...';

    whInput.addEventListener('input', () => {
      const q = whInput.value.toLowerCase();
      whRef.value = '';
      const filtered = items.filter(i => i.label.toLowerCase().includes(q)).slice(0, 15);
      if (q.length < 1) { whList.classList.remove('open'); return; }
      showDropdown(whList, filtered, (item) => {
        whInput.value = item.label;
        whRef.value = item.ref;
      });
    });

    whInput.addEventListener('blur', () => {
      setTimeout(() => whList.classList.remove('open'), 200);
    });
  }
}


/* =============================================
   🚪 EXIT INTENT POPUP
   ============================================= */
function initExitPopup() {
  const overlay = document.getElementById('exitOverlay');
  const closeBtn = document.getElementById('exitClose');
  const skipBtn  = document.getElementById('exitSkip');
  const ctaBtn   = document.getElementById('exitCta');
  if (!overlay) return;

  let shown = false;

  function showExit() {
    if (shown) return;
    shown = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function hideExit() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Desktop — при русі миші до верхнього краю
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 10) showExit();
  });

  // Мобільний — при скролі вгору швидко
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (lastScroll - current > 60 && current > 300) showExit();
    lastScroll = current;
  }, { passive: true });

  closeBtn?.addEventListener('click', hideExit);
  skipBtn?.addEventListener('click', hideExit);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) hideExit();
  });

  ctaBtn?.addEventListener('click', () => {
    hideExit();
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  });
}


/* =============================================
   🔐 АДМІН ПАНЕЛЬ
   ============================================= */
const ADMIN_PASS = 'bmwadmin2026';
let isAdmin = false;

function initAdmin() {
  // Перевіряємо чи є збережена сесія
  if (sessionStorage.getItem('adminAuth') === ADMIN_PASS) {
    isAdmin = true;
    showAdminUI();
  }

  // Слухаємо хеш #admin
  function checkHash() {
    if (window.location.hash === '#admin') {
      // Невелика затримка щоб DOM завантажився
      setTimeout(() => showAdminLogin(), 300);
    }
  }

  // Перевіряємо одразу при завантаженні
  checkHash();
  // І при зміні хешу
  window.addEventListener('hashchange', checkHash);
}

function showAdminLogin() {
  const existing = document.getElementById('adminLoginOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'adminLoginOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999; padding: 20px;
  `;
  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px 32px;max-width:380px;width:100%;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:16px">🔐</div>
      <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:8px;color:#fff">Адмін панель</h2>
      <p style="color:#888;font-size:14px;margin-bottom:24px">Введіть пароль для доступу</p>
      <input type="password" id="adminPassInput" placeholder="Пароль..." style="
        width:100%;background:#111;border:1px solid rgba(255,255,255,0.1);
        border-radius:12px;padding:14px 16px;color:#fff;font-size:15px;
        margin-bottom:12px;outline:none;box-sizing:border-box;
      " />
      <button onclick="checkAdminPass()" style="
        width:100%;background:linear-gradient(135deg,#ff6b35,#e07b39);
        border:none;border-radius:50px;padding:14px;color:#fff;
        font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px;
      ">Увійти</button>
      <button onclick="document.getElementById('adminLoginOverlay').remove();history.pushState('',document.title,window.location.pathname);" style="
        background:none;border:none;color:#666;font-size:13px;cursor:pointer;text-decoration:underline;
      ">Скасувати</button>
      <div id="adminLoginError" style="color:#ff4444;font-size:13px;margin-top:8px;display:none">Невірний пароль</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Enter для підтвердження
  document.getElementById('adminPassInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAdminPass();
  });
  setTimeout(() => document.getElementById('adminPassInput')?.focus(), 100);
}

function checkAdminPass() {
  const input = document.getElementById('adminPassInput');
  if (input?.value === ADMIN_PASS) {
    isAdmin = true;
    sessionStorage.setItem('adminAuth', ADMIN_PASS);
    document.getElementById('adminLoginOverlay')?.remove();
    history.pushState('', document.title, window.location.pathname);
    showAdminUI();
    showToast('✅ Адмін режим увімкнено');
    renderTable();
  } else {
    const err = document.getElementById('adminLoginError');
    if (err) err.style.display = 'block';
    input?.select();
  }
}

function showAdminUI() {
  // Показуємо адмін бейдж
  const existing = document.getElementById('adminBadge');
  if (existing) return;
  const badge = document.createElement('div');
  badge.id = 'adminBadge';
  badge.style.cssText = `
    position: fixed; bottom: 20px; left: 20px;
    background: rgba(224,123,57,0.15); border: 1px solid rgba(224,123,57,0.4);
    border-radius: 50px; padding: 8px 16px;
    color: #e07b39; font-size: 13px; font-weight: 600;
    z-index: 9999; cursor: pointer;
  `;
  badge.innerHTML = '🔐 Адмін · Вийти';
  badge.addEventListener('click', () => {
    isAdmin = false;
    sessionStorage.removeItem('adminAuth');
    badge.remove();
    renderTable();
    showToast('Адмін режим вимкнено');
  });
  document.body.appendChild(badge);
}


// ✅ Завантаження даних з Google Sheets

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    // Якщо вже у форматі "2026-04-25 16:58" — повертаємо як є
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(dateStr))) return String(dateStr).slice(0, 16);
    const d = new Date(dateStr);
    if (isNaN(d)) return String(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch(e) { return String(dateStr); }
}

async function loadFromSheets() {
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('PASTE_YOUR')) return;
  try {
    const res = await fetch(CONFIG.SHEETS_URL + '?t=' + Date.now());
    const data = await res.json();
    if (!data.rows || !data.rows.length) return;

    const formatted = data.rows.map(r => ({
      number:    r['Номер замовлення'] || '',
      name:      r["Ім'я"] || '',
      phone:     maskPhone(String(r['Телефон'] || '').replace(/^'/, '')),
      email:     r['Email'] || '',
      city:      r['Місто'] || '—',
      warehouse: r['Відділення НП'] || '—',
      tickets:   r['Кількість'] || 1,
      amount:    r['Сума ($)'] || 2,
      createdAt: formatDate(r['Дата'] || ''),
      status:    r['Статус'] || '',
    }));

    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(formatted));
    updateStats();
    renderTable();
  } catch(e) {
    console.log('Sheets load error:', e);
  }
}

// ✅ Видалення з Google Sheets
async function deleteFromSheets(number) {
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('PASTE_YOUR')) return;
  try {
    await fetch(CONFIG.SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', number }),
    });
  } catch(e) {}
}


/* =============================================
   ⏱ ТАЙМЕР ЗВОРОТНОГО ВІДЛІКУ
   ============================================= */
function initCountdown() {
  // Всі подарунки з датами
  const gifts = [
    { id: 'countdown1', date: '2026-05-25T00:00:00', label: '⏳ До подарунку #4 — 10 000 грн', emoji: '💵' },
    { id: 'countdown2', date: '2026-06-25T00:00:00', label: '⏳ До подарунку #3 — 20 000 грн', emoji: '💵' },
    { id: 'countdown3', date: '2026-07-25T00:00:00', label: '⏳ До подарунку #2 — iPhone 17 Pro', emoji: '📱' },
    { id: 'countdown4', date: '2026-08-25T00:00:00', label: '⏳ До подарунку #1 — BMW M760Li', emoji: '🏆' },
  ];

  function getTimeLeft(dateStr) {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    const now = new Date();

    // Малі таймери в картках таймлайну
    gifts.forEach(({ id, date }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const t = getTimeLeft(date);
      if (!t) { el.innerHTML = '<span class="countdown-done">🎉 Оголошення сьогодні!</span>'; return; }
      el.innerHTML = `<div class="countdown-boxes">
        <div class="countdown-box"><span class="countdown-num">${pad(t.d)}</span><span class="countdown-lbl">дн</span></div>
        <div class="countdown-sep">:</div>
        <div class="countdown-box"><span class="countdown-num">${pad(t.h)}</span><span class="countdown-lbl">год</span></div>
        <div class="countdown-sep">:</div>
        <div class="countdown-box"><span class="countdown-num">${pad(t.m)}</span><span class="countdown-lbl">хв</span></div>
        <div class="countdown-sep">:</div>
        <div class="countdown-box"><span class="countdown-num">${pad(t.s)}</span><span class="countdown-lbl">сек</span></div>
      </div>`;
    });

    // Великий таймер в hero — знаходимо найближчий майбутній подарунок
    const next = gifts.find(g => new Date(g.date) > now);
    const heroLabel = document.getElementById('heroCountdownLabel');
    if (next && heroLabel) {
      heroLabel.textContent = next.label;
      const t = getTimeLeft(next.date);
      if (t) {
        document.getElementById('hcd-d').textContent = pad(t.d);
        document.getElementById('hcd-h').textContent = pad(t.h);
        document.getElementById('hcd-m').textContent = pad(t.m);
        document.getElementById('hcd-s').textContent = pad(t.s);
      }
    } else if (heroLabel) {
      heroLabel.textContent = '🎉 Акція завершена!';
    }
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Якщо це адмін сторінка — script.js надає тільки CONFIG, showToast, esc, fmtDate
  // Решта ініціалізується в admin.html inline script
  if (IS_ADMIN) return;

  applyLang(lang);
  updateStats();
  renderTable();
  renderFAQ();
  initPackageButtons();
  initForm();
  updatePrice();
  initReveal();
  initNovaPoshta();
  initExitPopup();
  loadFromSheets();
  initAdmin();
  initCountdown();
  initFloatingBtn();

  // Re-render FAQ on lang change
  document.getElementById('langBtn')?.addEventListener('click', () => {
    renderFAQ();
  });
});
// ✅ Видалення покупця
async function handleDelete(number) {
  if (!confirm('Видалити запис ' + number + '?')) return;

  // Видаляємо з localStorage
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    const filtered = saved.filter(p => p.number !== number);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filtered));
  } catch(e) {}

  // Видаляємо з Google Sheets
  await deleteFromSheets(number);

  updateStats();
  renderTable();
  showToast('✅ Запис видалено');
}
