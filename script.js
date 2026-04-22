'use strict';

/* =============================================
   ⚙️ КОНФІГУРАЦІЯ — редагуй тут
   ============================================= */
const CONFIG = {
  TICKET_PRICE: 2,
  ADMIN_PASSWORD: 'admin12345', // TODO: змінити перед запуском!
  WAYFORPAY_MERCHANT: 'YOUR_MERCHANT_ACCOUNT', // TODO: вставити merchant
  SITE_URL: 'https://your-domain.com', // TODO: вставити домен
  BRAND: 'AI Agency',
  PRIZE: 'BMW M760Li',
  SHEETS_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE',
  TELEGRAM_URL: 'PASTE_YOUR_TELEGRAM_ENDPOINT_HERE',
  EMAIL_URL: 'PASTE_YOUR_EMAIL_ENDPOINT_HERE',
  STORAGE_KEY: 'bmwGiveawayV2',
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
   📦 БАЗА УЧАСНИКІВ (localStorage)
   TODO: замінити на API для продакшну
   ============================================= */
const demoData = [

];

function getParticipants() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    return [...saved, ...demoData];
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
   📋 ТАБЛИЦЯ УЧАСНИКІВ
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
      ${lang === 'uk' ? 'Учасників ще немає. Будь першим! 🚀' : 'No participants yet. Be the first! 🚀'}
    </td></tr>`;
    return;
  }
  tbody.innerHTML = all.map(p => `
    <tr>
      <td>${esc(p.number)}</td>
      <td>${esc(p.name)}</td>
      <td>${esc(p.phone)}</td>
      <td>${esc(p.city || '—')}</td>
      <td>${p.tickets}</td>
      <td>${esc(p.createdAt)}</td>
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

async function handlePayment(formData) {
  const btn = document.querySelector('#orderForm .btn--primary');
  if (btn) { btn.textContent = '⏳ Обробка...'; btn.disabled = true; }

  /* ---------------------------------------------------
     TODO: РЕАЛЬНА WAYFORPAY ІНТЕГРАЦІЯ
     1. Відправте дані формита суму на ВАШ сервер
     2. Сервер рахує merchantSignature і повертає параметри
     3. Відкрийте форму WayForPay:

     const wfp = new Wayforpay();
     wfp.run({
       merchantAccount: CONFIG.WAYFORPAY_MERCHANT,
       merchantDomainName: CONFIG.SITE_URL,
       merchantSignature: serverSignature, // з вашого бекенду!
       orderReference: formData.get('orderId'),
       orderDate: Math.floor(Date.now()/1000),
       amount: PRICE_MAP[formData.get('tickets')],
       currency: 'USD',
       productName: ['BMW Giveaway Ticket'],
       productPrice: [PRICE_MAP[formData.get('tickets')]],
       productCount: [1],
       clientFirstName: formData.get('name').split(' ')[0],
       clientEmail: formData.get('email'),
       clientPhone: formData.get('phone'),
     }, onSuccess, onFail);

     ВАЖЛИВО: НЕ вставляй secretKey у фронтенд!
     --------------------------------------------------- */

  // ДЕМО: симулюємо оплату 1.5 сек
  await new Promise(r => setTimeout(r, 1500));

  if (btn) { btn.textContent = '💳 Оплатити та отримати номер'; btn.disabled = false; }
  onPaySuccess(formData);
}

function onPaySuccess(formData) {
  const tickets = Number(formData.get('tickets') || 1);
  const participant = {
    number: generateNumber(),
    orderId: formData.get('orderId'),
    name: formData.get('name')?.trim(),
    phone: maskPhone(formData.get('phone')?.trim() || ''),
    email: formData.get('email')?.trim(),
    city: formData.get('city')?.trim() || '—',
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
    ? `Я беру участь у розіграші BMW M760Li від AI Agency! Мій номер: ${num} 🏆 ${CONFIG.SITE_URL}`
    : `I'm participating in the BMW M760Li giveaway by AI Agency! My number: ${num} 🏆 ${CONFIG.SITE_URL}`;
  if (navigator.share) {
    navigator.share({ title: 'BMW Giveaway', text });
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
    { q: 'Як я отримую номер учасника?', a: 'Після успішної оплати номер генерується автоматично та показується на сайті. Зберігається в публічному списку учасників.' },
    { q: 'Чи можна оплатити Apple Pay / Google Pay?', a: 'Так, якщо ці методи активовані у WayForPay для вашого магазину та підтримуються пристроєм.' },
    { q: 'Де зберігаються дані учасників?', a: 'У публічному списку на сайті. Для продакшну рекомендується Google Sheets або база даних.' },
    { q: 'Коли відбудеться розіграш?', a: 'Дата розіграшу буде оголошена в наших соціальних мережах. Стежте за оновленнями!' },
    { q: 'Скільки квитків можна купити?', a: 'Від 1 до 5 квитків за одну покупку. Більше квитків — більше шансів виграти!' },
    { q: 'Чи готовий сайт до запуску?', a: 'Front-end готовий. Для повного запуску ще потрібні: backend під WayForPay, webhook та юридичні сторінки.' },
  ],
  en: [
    { q: 'How do I get my participant number?', a: 'After successful payment, your number is generated automatically and shown on the site. It is saved in the public participant list.' },
    { q: 'Can I pay with Apple Pay / Google Pay?', a: 'Yes, if these methods are enabled in WayForPay for your store and supported by your device.' },
    { q: 'Where is participant data stored?', a: 'In the public list on the site. For production, Google Sheets or a database is recommended.' },
    { q: 'When will the draw take place?', a: 'The draw date will be announced on our social media. Stay tuned!' },
    { q: 'How many tickets can I buy?', a: 'From 1 to 5 tickets per purchase. More tickets = more chances to win!' },
    { q: 'Is the site ready to launch?', a: 'The front-end is ready. For full launch: WayForPay backend, webhook and legal pages are still needed.' },
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

  // Re-render FAQ on lang change
  document.getElementById('langBtn')?.addEventListener('click', () => {
    renderFAQ();
  });
});
