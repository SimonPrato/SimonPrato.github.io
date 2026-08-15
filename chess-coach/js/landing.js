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
