'use strict';

// ── Header scroll shrink ──────────────────────────────────────────
(function () {
  const hdr = document.querySelector('header');
  if (!hdr) return;
  let ticking = false;
  const update = () => {
    hdr.classList.toggle('header--scrolled', window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}());

// ── Chess board rendering ─────────────────────────────────────────
const HERO_FEN = 'r1q1k2r/2p1b1pp/2p1bpn1/p3p3/N3P3/1N1QB3/PPP2PPP/R2R2K1 b - - 0 1';

const PIECE_IMAGES = {
  wP: './images/chess_bold_white_pawn.png',
  wR: './images/chess_bold_white_rook.png',
  wN: './images/chess_bold_white_knight.png',
  wB: './images/chess_bold_white_bishop.png',
  wQ: './images/chess_bold_white_queen.png',
  wK: './images/chess_bold_white_king.png',
  bP: './images/chess_bold_black_pawn.png',
  bR: './images/chess_bold_black_rook.png',
  bN: './images/chess_bold_black_knight.png',
  bB: './images/chess_bold_black_bishop.png',
  bQ: './images/chess_bold_black_queen.png',
  bK: './images/chess_bold_black_king.png',
};

if (document.getElementById('chess-board')) {
  Chessboard('chess-board', {
    position: HERO_FEN,
    draggable: false,
    pieceTheme: (piece) => PIECE_IMAGES[piece],
  });
}

// ── Scroll reveal ─────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(el => observer.observe(el));

// ── Nav tabs → navigate to app ────────────────────────────────────
document.querySelectorAll('.nav-tab[data-page], .drawer-nav-btn[data-page]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = '/app#' + btn.dataset.page;
  });
});

// ── Auth buttons → open modal directly on landing page ───────────
document.getElementById('btn-login')?.addEventListener('click',        () => { closeDrawer(); openAuthModal('login'); });
document.getElementById('btn-signup')?.addEventListener('click',       () => { closeDrawer(); openAuthModal('signup'); });
document.getElementById('btn-drawer-login')?.addEventListener('click', () => { closeDrawer(); openAuthModal('login'); });
document.getElementById('btn-drawer-signup')?.addEventListener('click',() => { closeDrawer(); openAuthModal('signup'); });

// ── Mobile drawer open / close ────────────────────────────────────
const hamburger  = document.getElementById('btn-hamburger');
const drawer     = document.getElementById('mobile-drawer');
const backdrop   = document.getElementById('mobile-drawer-backdrop');
const drawerClose = document.getElementById('btn-drawer-close');

function openDrawer() {
  drawer?.classList.add('open');
  backdrop?.classList.add('open');
  hamburger?.classList.add('open');
  hamburger?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawer?.classList.remove('open');
  backdrop?.classList.remove('open');
  hamburger?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);

// ── Auth state: adapt page for logged-in users ────────────────────
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(({ user }) => {
    if (!user) return;

    // Header: swap guest buttons for user identity (avatar, username, plan badge)
    document.getElementById('header-auth-guest').style.display = 'none';
    const headerUser = document.getElementById('header-auth-user');
    if (headerUser) {
      headerUser.style.display = '';
      const nameEl = document.getElementById('header-username-text');
      if (nameEl) {
        nameEl.textContent = user.username;
        nameEl.addEventListener('click', () => { window.location.href = '/app#profile'; });
      }
      const headerAvatar = document.getElementById('header-avatar');
      if (headerAvatar) {
        if (user.avatarUrl) {
          const img = document.createElement('img');
          img.src = user.avatarUrl;
          img.alt = '';
          headerAvatar.replaceChildren(img);
        } else {
          headerAvatar.textContent = (user.username || '?')[0].toUpperCase();
        }
      }
      const planBadge = document.getElementById('header-plan-badge');
      if (planBadge) {
        planBadge.textContent = user.plan === 'pro' ? 'Pro' : user.plan === 'premium' ? 'Premium' : 'Free';
        planBadge.className = 'header-plan-badge' + (user.plan === 'pro' || user.plan === 'premium' ? ' header-plan-badge--premium' : '');
      }
    }

    // Drawer: swap guest buttons for open-app link
    const drawerGuest = document.getElementById('drawer-auth-guest');
    if (drawerGuest) drawerGuest.style.display = 'none';
    const drawerUser = document.getElementById('drawer-auth-user');
    if (drawerUser) drawerUser.style.display = '';

    // Hero primary CTA → "Open app"
    const heroPrimary = document.getElementById('hero-btn-primary');
    if (heroPrimary) {
      heroPrimary.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg> Open app';
    }

  })
  .catch(() => {});

// ── Hero "Ask about this position" ───────────────────────────────
const HERO_EXISTING_ANALYSIS =
  '15. Na4 is a positional preparation to occupy the c5 outpost. From a4, the knight provides ' +
  'essential overprotection for the c5 square, complementing the Be3. This maneuver exploits ' +
  "Black's structural weaknesses, specifically the c5 hole and the doubled c-pawns. By establishing " +
  "a dominant knight on c5, White pressures the Be6, restricts Black's queenside mobility, and " +
  'cements a lasting positional advantage.';

const HERO_LOADING_MESSAGES = [
  "Consulting the ghost of Magnus Carlsen…",
  "Bribing the engine for a second opinion…",
  "Counting pawns twice, just to be safe…",
  "Checking if this is actually a stalemate…",
  "Replaying the Immortal Game for inspiration…",
  "Politely asking Stockfish to explain itself…",
  "Calculating 37 moves ahead (give or take)…",
  "Reviewing 500 years of chess theory…",
  "Searching for the refutation…",
  "Wondering if Tal would've sacrificed a rook here…",
  "Arguing with the engine (it's not budging)…",
  "Your pawns are filing a formal grievance…",
  "The bishop is still complaining about its diagonal…",
  "Asking Fischer what he'd do (he hung up)…",
  "Cross-referencing 4 million master games…",
  "Simulating parallel universes where you played Qh5…",
  "This position was last seen in 1842…",
  "Reticulating chess splines…",
  "The knight insists it can get there in two moves…",
  "Currently arguing with a pawn about its self-worth…",
  "Summoning the spirit of Capablanca…",
  "Please do not tilt the board…",
  "Verifying you didn't accidentally play into the Fried Liver…",
  "Running 40,000 simulations (37,999 of which you lost)…",
  "Checking the almanac under 'blunders'…",
  "Evaluating 'I meant to do that'…",
  "The rook wants to know why it's still in the corner…",
  "The engine is judging silently…",
  "Your pieces are having a strategy meeting…",
  "Consulting ancient chess manuscripts…",
  "Checking if this is a zugzwang (it might be)…",
  "The queen wants a word with you…",
  "Untangling your pawn structure…",
  "Just a sec, the computer is sweating…",
  "Asking a grandmaster on their lunch break…",
  "Loading chess wisdom…",
  "Making sure this isn't just a trap…",
  "The king has entered the chat…",
  "Translating 'oops' into algebraic notation…",
  "Googling 'how to explain this diplomatically'…",
  "The rook and bishop are not on speaking terms…",
  "Desperately searching for good news…",
];

function heroRenderMd(text) {
  const safe = text.replace(/^(\d+)\.\s/gm, '$1\\. ');
  return DOMPurify.sanitize(marked.parse(safe));
}

const heroAskInput     = document.getElementById('hero-ask-input');
const heroAskBtn       = document.getElementById('hero-ask-btn');
const heroAnalysisBody = document.getElementById('hero-analysis-body');
const heroHistory      = [];

const HERO_TOOL_LABELS = {
  validate_move: 'Checking move legality…',
  evaluate_position: 'Evaluating position…',
  get_attacks_on_square: 'Analyzing piece interactions…',
  get_top_line: 'Calculating best line…',
  get_structural_info: 'Analyzing structure…',
  get_opening_info: 'Looking up opening…',
};

const TYPEWRITER_CHARS_PER_FRAME = 8;

async function heroAsk() {
  if (!heroAskInput || !heroAskBtn || !heroAnalysisBody) return;
  const question = heroAskInput.value.trim();
  if (!question) return;

  heroAskBtn.disabled = true;
  heroAskInput.disabled = true;

  const block = document.createElement('div');
  block.className = 'qa-block';
  const loadingMsg = HERO_LOADING_MESSAGES[Math.floor(Math.random() * HERO_LOADING_MESSAGES.length)];
  block.innerHTML =
    `<div class="qa-question">${question.replace(/</g, '&lt;')}</div>` +
    `<div class="qa-answer qa-answer--loading"><span class="qa-dots"><span></span><span></span><span></span></span><span class="qa-loading-msg">${loadingMsg}</span></div>`;
  heroAnalysisBody.appendChild(block);
  heroAnalysisBody.scrollTop = heroAnalysisBody.scrollHeight;

  const answerEl = block.querySelector('.qa-answer');
  let statusEl = null;
  let streamingStarted = false;
  let streamAccumulated = '';
  let typewriterChars = [];
  let typewriterShown = '';
  let typewriterRaf = null;

  function cancelTypewriter() {
    if (typewriterRaf) { cancelAnimationFrame(typewriterRaf); typewriterRaf = null; }
    typewriterChars = [];
  }

  function renderStreaming(text) {
    answerEl.innerHTML = heroRenderMd(text);
  }

  function startStreaming(text) {
    streamingStarted = true;
    answerEl.classList.remove('qa-answer--loading');
    answerEl.classList.add('qa-answer--streaming');
    renderStreaming(text);
  }

  function drainTypewriter() {
    if (typewriterChars.length === 0) { typewriterRaf = null; return; }
    typewriterShown += typewriterChars.splice(0, TYPEWRITER_CHARS_PER_FRAME).join('');
    if (!streamingStarted) {
      startStreaming(typewriterShown);
    } else {
      renderStreaming(typewriterShown);
    }
    heroAnalysisBody.scrollTop = heroAnalysisBody.scrollHeight;
    typewriterRaf = requestAnimationFrame(drainTypewriter);
  }

  function enqueueText(text) {
    typewriterChars.push(...text);
    if (!typewriterRaf) typewriterRaf = requestAnimationFrame(drainTypewriter);
  }

  function showToolStatus(tools) {
    if (streamingStarted) return;
    if (!statusEl) {
      statusEl = document.createElement('span');
      statusEl.className = 'qa-status';
      answerEl.appendChild(statusEl);
    }
    statusEl.textContent = HERO_TOOL_LABELS[tools[0]] || tools[0] || '';
  }

  try {
    const response = await fetch('/api/ask/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: HERO_FEN,
        question,
        skillLevel: 'intermediate',
        lastMoveSan: 'Na4',
        existingAnalysis: HERO_EXISTING_ANALYSIS,
        uciMoves: [],
        history: [...heroHistory],
      }),
    });

    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let streamDone = false;

    while (!streamDone) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const raw = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          let evt;
          try { evt = JSON.parse(line.slice(6)); } catch { continue; }

          if (evt.type === 'tool') {
            showToolStatus(evt.tools);

          } else if (evt.type === 'chunk') {
            streamAccumulated += evt.text;
            enqueueText(evt.text);

          } else if (evt.type === 'done') {
            const finalAnswer = evt.answer || streamAccumulated;
            heroHistory.push({ question, answer: finalAnswer });

            const finalize = () => {
              answerEl.classList.remove('qa-answer--streaming');
              answerEl.innerHTML = heroRenderMd(finalAnswer);
              heroAnalysisBody.scrollTop = heroAnalysisBody.scrollHeight;
            };

            if (typewriterChars.length > 0) {
              const waitAndFinalize = () => {
                if (typewriterChars.length === 0) { cancelTypewriter(); finalize(); return; }
                typewriterShown += typewriterChars.splice(0, TYPEWRITER_CHARS_PER_FRAME).join('');
                renderStreaming(typewriterShown);
                heroAnalysisBody.scrollTop = heroAnalysisBody.scrollHeight;
                typewriterRaf = requestAnimationFrame(waitAndFinalize);
              };
              cancelTypewriter();
              typewriterRaf = requestAnimationFrame(waitAndFinalize);
            } else {
              cancelTypewriter();
              finalize();
            }
            streamDone = true;

          } else if (evt.type === 'error') {
            cancelTypewriter();
            answerEl.className = 'qa-answer qa-answer--error';
            answerEl.textContent = evt.message || 'Unable to answer. Please try again.';
            streamDone = true;
          }
        }
      }
    }

    if (!streamDone) {
      cancelTypewriter();
      answerEl.className = 'qa-answer qa-answer--error';
      answerEl.textContent = 'Connection dropped. Please try again.';
    }
  } catch {
    cancelTypewriter();
    answerEl.className = 'qa-answer qa-answer--error';
    answerEl.textContent = 'Unable to answer. Please try again.';
  } finally {
    heroAskBtn.disabled = false;
    heroAskInput.disabled = false;
    heroAskInput.value = '';
    heroAnalysisBody.scrollTop = heroAnalysisBody.scrollHeight;
  }
}

heroAskInput?.addEventListener('keydown', e => { if (e.key === 'Enter') heroAsk(); });
heroAskBtn?.addEventListener('click', heroAsk);

// Pricing toggle (monthly / annual)
(function () {
  const monthlyBtn  = document.getElementById('pricing-btn-monthly');
  const annualBtn   = document.getElementById('pricing-btn-annual');
  const priceEl     = document.getElementById('landing-price');
  const billedEl    = document.getElementById('landing-billed');
  const upgradeBtn  = document.getElementById('landing-upgrade-btn');
  const priceProEl  = document.getElementById('landing-price-pro');
  const billedProEl = document.getElementById('landing-billed-pro');
  const proBtn      = document.getElementById('landing-pro-btn');

  if (!monthlyBtn || !annualBtn) return;

  let currentInterval = 'monthly';

  function setPricingInterval(interval) {
    currentInterval = interval;
    const isAnnual = interval === 'annual';
    monthlyBtn.classList.toggle('active', !isAnnual);
    annualBtn.classList.toggle('active', isAnnual);
    monthlyBtn.setAttribute('aria-pressed', String(!isAnnual));
    annualBtn.setAttribute('aria-pressed', String(isAnnual));
    if (isAnnual) {
      if (priceEl)     priceEl.textContent    = '6.40';
      if (billedEl)    billedEl.innerHTML     = 'Billed <strong>$76.99/year</strong> &mdash; save $18.89';
      if (upgradeBtn)  upgradeBtn.textContent = 'Upgrade for $76.99/year';
      if (priceProEl)  priceProEl.textContent = '16.00';
      if (billedProEl) billedProEl.innerHTML  = 'Billed <strong>$191.99/year</strong> &mdash; save $47.89';
      if (proBtn)      proBtn.textContent     = 'Go Pro for $191.99/year';
    } else {
      if (priceEl)     priceEl.textContent    = '7.99';
      if (billedEl)    billedEl.innerHTML     = '';
      if (upgradeBtn)  upgradeBtn.textContent = 'Upgrade to Premium';
      if (priceProEl)  priceProEl.textContent = '19.99';
      if (billedProEl) billedProEl.innerHTML  = '';
      if (proBtn)      proBtn.textContent     = 'Go Pro';
    }
  }

  monthlyBtn.addEventListener('click', () => setPricingInterval('monthly'));
  annualBtn.addEventListener('click',  () => setPricingInterval('annual'));

  async function initiateCheckout(plan, btn) {
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Opening checkout…';
    try {
      const resp = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ interval: currentInterval, plan }),
      });
      if (resp.status === 401) {
        window.location.href = `/app?upgrade=1&interval=${currentInterval}&plan=${plan}`;
        return;
      }
      const data = await resp.json();
      if (resp.ok && data.url) {
        window.ccTrack?.('begin_checkout', { plan, interval: currentInterval });
        window.location.href = data.url;
        return;
      }
      btn.disabled = false;
      btn.textContent = originalText;
      const errEl = document.createElement('p');
      errEl.style.cssText = 'color:#ef4444;font-size:0.85rem;margin-top:0.5rem;text-align:center';
      errEl.textContent = data.error || 'Could not start checkout. Please try again.';
      btn.parentNode.insertBefore(errEl, btn.nextSibling);
      setTimeout(() => errEl.remove(), 5000);
    } catch {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  if (upgradeBtn) upgradeBtn.addEventListener('click', () => initiateCheckout('premium', upgradeBtn));
  if (proBtn)     proBtn.addEventListener('click',     () => initiateCheckout('pro', proBtn));
}());

// Pricing scroll state — hide gradient + swipe hint once user scrolls
(function () {
  const wrap = document.querySelector('.pricing-scroll-wrap');
  const outer = document.querySelector('.pricing-scroll-outer');
  const hint = document.querySelector('.pricing-swipe-hint');
  if (!wrap || !outer) return;

  function update() {
    const atEnd = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 12;
    outer.classList.toggle('at-end', atEnd);
    if (hint) hint.classList.toggle('faded', wrap.scrollLeft > 30);
  }

  wrap.addEventListener('scroll', update, { passive: true });
  update();
}());

// ── Auth modal ────────────────────────────────────────────────────
(function initAuth() {
  const modal      = document.getElementById('auth-modal');
  const btnClose   = document.getElementById('btn-close-auth');
  const tabs       = document.querySelectorAll('.auth-tab');
  const formLogin  = document.getElementById('auth-form-login');
  const formSignup = document.getElementById('auth-form-signup');
  const titleEl    = document.getElementById('auth-modal-title');
  const subtitleEl = document.getElementById('auth-subtitle');
  if (!modal) return;

  function equalizeFormHeights() {
    const wrap = formLogin.parentElement;
    if (!wrap || wrap.dataset.heightSet) return;
    wrap.dataset.heightSet = '1';
    const prevLogin  = formLogin.style.display;
    const prevSignup = formSignup.style.display;
    formLogin.style.display  = '';
    formSignup.style.display = '';
    const maxH = Math.max(formLogin.offsetHeight, formSignup.offsetHeight);
    formLogin.style.display  = prevLogin;
    formSignup.style.display = prevSignup;
    if (maxH > 0) wrap.style.minHeight = maxH + 'px';
  }

  window.openAuthModal = function openAuthModal(tab) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    equalizeFormHeights();
    window.renderGoogleButton?.();
    switchTab(tab);
  };

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    clearErrors();
  }

  function switchTab(tab) {
    tabs.forEach(t => {
      const active = t.dataset.authTab === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });
    if (tab === 'login') {
      formLogin.style.display  = '';
      formSignup.style.display = 'none';
      titleEl.textContent    = 'Welcome back';
      subtitleEl.textContent = 'Sign in to your account';
    } else {
      formLogin.style.display  = 'none';
      formSignup.style.display = '';
      titleEl.textContent    = 'Create an account';
      subtitleEl.textContent = 'Join Chess Explain for free';
    }
    clearErrors();
  }

  function clearErrors() {
    document.querySelectorAll('#auth-modal .auth-error').forEach(el => { el.style.display = 'none'; el.textContent = ''; });
    document.querySelectorAll('#auth-modal .auth-input').forEach(el => el.classList.remove('input-error'));
  }

  function showError(errorElId, msg) {
    const el = document.getElementById(errorElId);
    if (el) { el.textContent = msg; el.style.display = ''; }
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display !== 'none') closeModal(); });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.authTab));
  });

  // Password visibility toggles
  document.querySelectorAll('#auth-modal .auth-eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.querySelector('.eye-closed').style.display = isHidden ? 'none' : '';
      btn.querySelector('.eye-open').style.display   = isHidden ? ''     : 'none';
    });
  });

  // Password strength meter
  const signupPasswordInput = document.getElementById('signup-password');
  const strengthFill        = document.getElementById('strength-fill');
  const strengthLabel       = document.getElementById('strength-label');

  function measureStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  signupPasswordInput?.addEventListener('input', () => {
    const pw = signupPasswordInput.value;
    if (!pw) { strengthFill.style.width = '0'; strengthLabel.textContent = ''; return; }
    const score = measureStrength(pw);
    strengthFill.style.width      = Math.min(100, score * 20) + '%';
    strengthFill.style.background = ['#ef4444','#f97316','#eab308','#22c55e','#10b981','#10b981'][score];
    strengthLabel.textContent     = ['','Too weak','Weak','Fair','Good','Strong'][score];
  });

  // Login form
  formLogin.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email) {
      document.getElementById('login-email').classList.add('input-error');
      showError('login-error', 'Please enter your email or username.');
      return;
    }
    if (password.length < 6) {
      document.getElementById('login-password').classList.add('input-error');
      showError('login-error', 'Password must be at least 6 characters.');
      return;
    }
    const submitBtn = formLogin.querySelector('.auth-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) { showError('login-error', data.error || 'Login failed.'); return; }
      window.ccTrack?.('login', { method: 'email' });
      window.location.href = '/app';
    } catch { showError('login-error', 'Network error. Please try again.'); }
    finally { submitBtn.disabled = false; submitBtn.textContent = 'Log in'; }
  });

  // Sign up form
  formSignup.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const username = document.getElementById('signup-username').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      document.getElementById('signup-username').classList.add('input-error');
      showError('signup-error', 'Username must be 3–30 characters: letters, numbers, and underscores only.');
      return;
    }
    if (!validateEmail(email)) {
      document.getElementById('signup-email').classList.add('input-error');
      showError('signup-error', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      document.getElementById('signup-password').classList.add('input-error');
      showError('signup-error', 'Password must be at least 8 characters.');
      return;
    }
    const submitBtn = formSignup.querySelector('.auth-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, username, password }),
      });
      const data = await resp.json();
      if (!resp.ok) { showError('signup-error', data.error || 'Registration failed.'); return; }
      window.ccTrack?.('sign_up', { method: 'email' });
      window.location.href = '/app';
    } catch { showError('signup-error', 'Network error. Please try again.'); }
    finally { submitBtn.disabled = false; submitBtn.textContent = 'Create account'; }
  });

  // Forgot password
  const forgotPanel    = document.getElementById('auth-forgot-panel');
  const forgotForm     = document.getElementById('auth-form-forgot');
  const forgotSent     = document.getElementById('auth-forgot-sent');
  const forgotBack     = document.getElementById('btn-forgot-back');
  const forgotBackSent = document.getElementById('btn-forgot-back-sent');
  const socialRow      = modal.querySelector('.auth-social');
  const dividerRow     = modal.querySelector('.auth-divider');
  const tabsRow        = modal.querySelector('.auth-tabs');

  function showForgotPanel() {
    tabsRow.style.display   = 'none';
    socialRow.style.display = 'none';
    dividerRow.style.display = 'none';
    forgotPanel.style.display = '';
    forgotForm.style.display  = '';
    forgotSent.style.display  = 'none';
    document.querySelectorAll('#auth-modal .auth-form').forEach(f => { f.style.display = 'none'; });
    titleEl.textContent    = 'Forgot password?';
    subtitleEl.textContent = '';
    setTimeout(() => { const inp = document.getElementById('forgot-email'); if (inp) inp.focus(); }, 50);
  }

  function hideForgotPanel(tab) {
    forgotPanel.style.display  = 'none';
    tabsRow.style.display      = '';
    socialRow.style.display    = '';
    dividerRow.style.display   = '';
    document.getElementById('forgot-email').value = '';
    document.getElementById('forgot-error').style.display = 'none';
    switchTab(tab || 'login');
  }

  document.getElementById('link-forgot-password')?.addEventListener('click', e => {
    e.preventDefault();
    const emailVal = document.getElementById('login-email').value.trim();
    if (emailVal) document.getElementById('forgot-email').value = emailVal;
    showForgotPanel();
  });

  forgotBack?.addEventListener('click', () => hideForgotPanel('login'));
  forgotBackSent?.addEventListener('click', () => hideForgotPanel('login'));

  forgotForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const emailInput = document.getElementById('forgot-email');
    const email = emailInput.value.trim();
    const errEl = document.getElementById('forgot-error');
    errEl.style.display = 'none';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.classList.add('input-error');
      errEl.textContent = 'Please enter a valid email address.';
      errEl.style.display = '';
      return;
    }
    const btn = forgotForm.querySelector('.auth-submit');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
      });
      forgotForm.style.display = 'none';
      forgotSent.style.display = '';
      if (forgotBack) forgotBack.style.display = 'none';
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = '';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send reset link';
    }
  });

  // Google Sign In. One Tap (accounts.id.prompt) is silently suppressed on most
  // mobile browsers, so the GSI-rendered button is the primary sign-in flow; the
  // custom button only remains as a fallback while GSI is unavailable.
  const btnGoogle = document.getElementById('btn-auth-google');
  let gsiInitialized = false;

  function initGoogleSignIn(clientId) {
    if (!clientId || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const resp = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ credential: response.credential }),
          });
          const data = await resp.json();
          if (!resp.ok) { alert(data.error || 'Google sign-in failed.'); return; }
          window.ccTrack?.('login', { method: 'google' });
          window.location.href = '/app';
        } catch { alert('Google sign-in failed. Try again.'); }
      },
    });
    gsiInitialized = true;
    renderGoogleButton();
  }

  // The slot has no width while the modal is closed, so this is retried from
  // openAuthModal().
  window.renderGoogleButton = function renderGoogleButton() {
    const slot = document.getElementById('google-btn-slot');
    if (!slot || slot.dataset.rendered) return;
    if (!gsiInitialized || !window.google?.accounts?.id) return;
    const width = slot.parentElement?.clientWidth || 0;
    if (!width) return;
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'outline' : 'filled_black';
    window.google.accounts.id.renderButton(slot, {
      type: 'standard',
      theme,
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(Math.round(width), 400),
    });
    slot.dataset.rendered = '1';
    slot.style.display = '';
    if (btnGoogle) btnGoogle.style.display = 'none';
  };

  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      if (!window.google?.accounts?.id) {
        alert('Google Sign-In is not available. Please use email/password.');
        return;
      }
      if (!gsiInitialized) initGoogleSignIn(btnGoogle.dataset.clientId || '');
      window.google.accounts.id.prompt();
    });
  }

  // Load OAuth client IDs
  fetch('/api/auth/config', { credentials: 'same-origin' }).then(r => r.json()).then(({ googleClientId }) => {
    if (googleClientId && btnGoogle) {
      btnGoogle.dataset.clientId = googleClientId;
      if (window.google?.accounts?.id) {
        initGoogleSignIn(googleClientId);
      } else {
        window.onGoogleLibraryLoad = () => initGoogleSignIn(googleClientId);
      }
    }
  }).catch(() => {});
}());

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-question').forEach(b => {
      b.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

