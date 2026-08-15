'use strict';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  game: new Chess(),
  board: null,
  skillLevel: 'beginner',
  selectedSquare: null,       // for click-to-move
  legalTargetSquares: [],     // for click-to-move
  orientation: 'white',
  evalVisible: true,
  root: null,
  currentNode: null,
  analyzingNodeId: null,      // ID of node currently being analyzed (null if none)
  previewBoard: null,         // small preview board instance
  gameTitle: 'Chess game 1',
  drawingColor: 'green',      // active drawing color for right-click annotations
  arrowPreview: null,         // {from, to, color} live preview while right-dragging
  suggestedMoveArrow: null,   // {from, to} arrow shown for AI-suggested move
  activePanel: 'comments',    // 'comments' | 'opening'
  loadedGameId: null,         // collection item id the current board was loaded from
};

// ---------------------------------------------------------------------------
// Play page state
// ---------------------------------------------------------------------------
const PERSONAS_CLIENT = {
  jonas:  { name: 'Alex',   elo: 500,  avatar: '♟', colorClass: 'jonas'  },
  clarer: { name: 'Sam',    elo: 900,  avatar: '♞', colorClass: 'clarer' },
  rahim:  { name: 'Jamie',  elo: 1400, avatar: '♝', colorClass: 'rahim'  },
  david:  { name: 'Morgan', elo: 1900, avatar: '♜', colorClass: 'david'  },
  gert:   { name: 'Casey',  elo: 2400, avatar: '♛', colorClass: 'gert'   },
};

const LOADING_MESSAGES = [
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
  "Flipping through Zurich 1953 for a precedent…",
  "Loading chess wisdom…",
  "Making sure this isn't just a trap…",
  "The king has entered the chat…",
  "Translating 'oops' into algebraic notation…",
  "Petrov didn't cover this, but let's see…",
  "Checking if Nimzowitsch would approve…",
  "Your knight just asked for a map…",
  "Re-evaluating the concept of 'fine'…",
  "The endgame tablebase is buffering…",
  "Confirming this isn't theory (it's not)…",
  "Googling 'how to explain this diplomatically'…",
  "The rook and bishop are not on speaking terms…",
  "Desperately searching for good news…",
];

// Large pool of pre-written idle banter messages — shown every 5-10s with no loading
const PERSONA_IDLE_MESSAGES = {
  jonas: [
    "I definitely know what I'm doing here.",
    "Wait, what does the knight do again? Just kidding... mostly.",
    "My grandma taught me this opening.",
    "Okay this is fine. Everything is fine.",
    "Is en passant legal? I keep forgetting.",
    "I watched a 3-hour chess tutorial yesterday. Very prepared.",
    "This is going exactly as planned.",
    "Hmm. What if I just... no. Never mind.",
    "I once beat someone in 4 moves. It was an accident.",
    "My rating says 500 but I feel like a 501 today.",
    "I think I'm actually doing really well here.",
    "Okay. Breathe. You've got this, Alex.",
    "I just need one good move and I'll be fine.",
    "My friend told me: control the center. I'm definitely doing that.",
    "Is it too early to offer a draw?",
    "I need a minute. I'm recalculating.",
    "Pretty sure I had a strategy here somewhere...",
    "Okay I see it. No I don't. Yes I do.",
    "Chess is mostly intuition, right?",
    "I read somewhere that pawns are really important.",
    "Wait, can bishops jump over pieces? No. Right?",
    "I'm about to do something incredible. Or terrible.",
    "Actually... actually... hmm.",
    "I should've practiced more this week.",
    "Nobody expects the Sicilian! Wait, that's not what that means.",
    "I have a system. It's just... evolving.",
    "I'm not panicking. You're panicking.",
    "I think I saw this position in a meme once.",
    "Technically I'm still in book here.",
    "The good news is I'm completely unpredictable!",
    "Deep breaths. Deep breaths.",
    "I'll figure this out. Probably.",
    "My clock is fine. My position is fine. Everything is fine.",
    "Every move I make is a bold choice.",
    "Wait did I just hang my queen? ...No. Okay cool.",
  ],
  clarer: [
    "I beat a 1100 last week. I'm basically a grandmaster.",
    "This is the London System. I think.",
    "Actually I might have mixed this up with the Italian.",
    "I once swindled a 1300. Still proud of that.",
    "I have a great feeling about this position.",
    "My coach says I have a 'creative' playing style.",
    "I usually blitz out my openings. Obviously.",
    "I've been rated 900 for two years now. Character development.",
    "Hang on, let me remember what that YouTube video said.",
    "I'm basically unbeatable on Tuesdays.",
    "My rating goes up and down but my spirit stays constant.",
    "I once got to a rook endgame and forgot how rook endgames work.",
    "I'm playing the psychological game here.",
    "I'm gonna castle queenside and see what happens.",
    "I learned this from a meme, which is peak chess preparation.",
    "My opening prep ends after move 3.",
    "Pretty sure I'm better here. Vibes-based assessment.",
    "I should join a chess club. I keep saying that.",
    "I once had a winning position and somehow drew. Growth mindset.",
    "Everyone says tactics, tactics, tactics. I prefer chaos.",
    "I'm going for a very specific plan that I'll explain later.",
    "My best game was against myself. True story.",
    "I'm gonna play fast and confidently. It's a mindset thing.",
    "I once missed a checkmate in one. It happens.",
    "I've got a surprise up my sleeve. It might not be a good surprise.",
    "Aggressive chess is my middle name. Well, my middle name is Sam.",
    "Chess is mostly luck, right? No? Okay.",
    "I've analyzed this exact position for about 90 seconds total in my life.",
    "Honestly I'm surprised how well this is going. Don't jinx it.",
    "Pretty sure I'm supposed to fianchetto something here.",
  ],
  rahim: [
    "The pawn structure favors long-term play here.",
    "Interesting. I'll need to calculate this carefully.",
    "I've prepared something for this line.",
    "That's not the critical move, but it's solid enough.",
    "The knight is heading for d5.",
    "You're playing above your rating. I respect that.",
    "I see an imbalance forming.",
    "Passed pawns must be pushed.",
    "The key is piece coordination.",
    "I've been studying endgames for three months. Pays off.",
    "The position requires precision now.",
    "Rooks belong on open files. Basic principles.",
    "Prophylaxis, have you considered it?",
    "I don't blunder. Usually.",
    "Bishop pair in the endgame is always nice.",
    "Good fight. This is getting interesting.",
    "Overextension is a real concern here.",
    "I'd say I have a slight edge, objectively.",
    "Long-term thinking is where the game is won.",
    "I annotate all my games. This one is getting an interesting chapter.",
    "Structure matters more than people think.",
    "You're finding the right moves. Impressive.",
    "The critical moment is coming. I can feel it.",
    "I don't play hope chess. I calculate.",
    "The isolated pawn is a long-term weakness.",
    "Every exchange changes the evaluation.",
    "I admire the fighting spirit.",
    "The engine would probably disagree with my last move. But I have reasons.",
    "Position, tactics, technique, in that order.",
    "You're making this harder than I expected. Good.",
  ],
  david: [
    "I could see your plan three moves ago.",
    "The position is becoming instructive.",
    "Your intuition was good. The execution, less so.",
    "Every move has a cost.",
    "You're playing well. Don't get comfortable.",
    "I've played this exact pawn break many times.",
    "The endgame here will be technical.",
    "Tactics aside, the strategy is clear.",
    "A slight edge is enough at this level.",
    "You're holding on well, I'll give you that.",
    "I see two candidate moves. One is clearly better.",
    "Control of the open file is often decisive.",
    "Pressure, pressure, pressure.",
    "Your pieces are passive. That's the real problem.",
    "I don't rush. The advantage grows on its own.",
    "Piece activity trumps material in this structure.",
    "You're making me work. Good.",
    "One inaccuracy is all I need.",
    "The clock is also a piece.",
    "Strong players don't lose positions, they give them up.",
    "An interesting decision. Unorthodox, but interesting.",
    "I've been in this structure before. Many times.",
    "You're a tough opponent. I mean that as a compliment.",
    "The knight is more valuable than it looks here.",
    "Patience is a weapon.",
    "You found a resource. Well done.",
    "These positions are decided by who blinks first.",
    "Never underestimate the power of a good bishop.",
    "The evaluation hasn't changed. It's just clearer now.",
    "I've converted worse positions than this.",
  ],
  gert: [
    "Your technique has some... interesting qualities.",
    "I've played this exact position 47 times.",
    "Objectively, the position was already lost two moves ago.",
    "An instructive mistake.",
    "The concept is correct. The execution, primitive.",
    "I calculated this variation before the game.",
    "At the top level, this would be over already.",
    "You're fighting. I appreciate the effort.",
    "This endgame is a textbook exercise. For me.",
    "Your pawn structure tells me everything I need to know.",
    "Interesting. I didn't expect you to find that.",
    "The position is dynamically balanced, in my favor.",
    "Carlsen would've found the win by now.",
    "I've already calculated 15 moves ahead.",
    "Resistance is natural. It's also futile.",
    "The engine agrees with me. As usual.",
    "Perhaps consider a different opening next time.",
    "I see five plans. Four of them are winning.",
    "Endgames are where real chess begins.",
    "The beauty of this position is lost on most players.",
    "Chess is 99% tactics. I know 100% of them.",
    "I remember studying this exact position at age 12.",
    "I don't bluff. I don't need to.",
    "Your queenside pawns are structurally compromised.",
    "At my level, these decisions are instinctive.",
    "I've beaten four titled players with this exact line.",
    "A logical but ultimately insufficient defense.",
    "I can see seven moves ahead. Comfortably.",
    "There's a beautiful combination here. You won't find it.",
    "Every pawn move is permanent. Remember that.",
    "Technique is what separates good players from great ones.",
    "I could explain why your last move was wrong, but we'd be here all day.",
    "The geometry of the position is against you.",
    "You had one good move available. You didn't play it.",
    "I've prepared deeply for this. You can tell.",
  ],
};

const playState = {
  game: new Chess(),
  board: null,
  orientation: 'white',
  userColor: 'white',
  persona: null,          // 'jonas' | 'clarer' | 'rahim' | 'david' | 'gert'
  active: false,
  waitingForOpponent: false,
  _dropHandledClick: false,
  selectedSquare: null,
  legalTargetSquares: [],
  playMoves: [],          // [{ num, white, black, whitePly, blackPly }] for move history
  plyHistory: [],         // [{fen, from, to, san}] indexed by ply (0-based)
  browseIndex: null,      // null = at current; number = browsing a past ply
  aiLastMove: null,       // {from, to} of the most recent AI move (for highlighting)
  gameTitle: '',
  savedToCollection: false,
  resignResult: null,     // 'resigned' when user resigned
  plyCount: 0,                 // total half-moves played this game
  _prefetchedComment: null,    // pre-fetched special comment text (ready to show instantly)
  _prefetchingComment: false,  // whether a prefetch request is in flight
  _specialCommentTimer: null,  // setTimeout handle for next special position comment
  _idleTimer: null,            // setTimeout handle for next idle banter message
  _idleShownIndices: new Set(), // indices shown recently (avoids repeats)
  customStartFen: null,        // null = standard position
  _chatHistory: [],            // [{question, answer}] for in-game opponent chat (last 5 turns)
  _chatPending: false,         // true while a chat request is in flight
  _askThread: [],              // [{question, answer}] coach Q&A thread for the current game
  _askPending: false,          // true while a coach answer is streaming
};

// true while the position builder is being opened from the play setup
let posBuilderPlayMode = false;

// ---------------------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------------------
const authState = {
  user: null,    // { id, email, username, plan } or null
  calls: null,   // { used, limit, remaining, plan } or null
  loaded: false, // true once the first /api/auth/me response has been processed
};

// ---------------------------------------------------------------------------
// Login-required gate for collection saves
// ---------------------------------------------------------------------------
function requireLoginForCollection(action) {
  if (authState.user) { action(); return; }
  const modal = document.getElementById('login-required-modal');
  if (modal) modal.style.display = 'flex';
}

// ---------------------------------------------------------------------------
// Toast notifications
// ---------------------------------------------------------------------------
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ---------------------------------------------------------------------------
// High-traffic notice
// Shown when the server reports engine latency (SSE `{type:'latency'}` events
// or `highLatency: true` on JSON responses). The engine keeps calculating at
// full strength — this popup only explains why results take longer.
// ---------------------------------------------------------------------------
const TRAFFIC_NOTICE_COOLDOWN_MS = 120000; // at most one popup per 2 minutes
const TRAFFIC_NOTICE_VISIBLE_MS  = 12000;
let _trafficNoticeLastShown = 0;
let _trafficNoticeHideTimer = null;

function showTrafficNotice() {
  const now = Date.now();
  if (now - _trafficNoticeLastShown < TRAFFIC_NOTICE_COOLDOWN_MS) return;
  _trafficNoticeLastShown = now;

  let notice = document.getElementById('traffic-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'traffic-notice';
    notice.className = 'traffic-notice';
    notice.setAttribute('role', 'alert');
    notice.setAttribute('aria-live', 'assertive');
    notice.innerHTML = `
      <div class="traffic-notice-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div class="traffic-notice-body">
        <div class="traffic-notice-title">Busier than usual</div>
        <div class="traffic-notice-text">A lot of players are analyzing right now, so responses may take a little longer than normal. Your request is still running at full strength &mdash; nothing is lost.</div>
      </div>
      <button type="button" class="traffic-notice-close" aria-label="Dismiss notice">&times;</button>`;
    notice.querySelector('.traffic-notice-close').addEventListener('click', hideTrafficNotice);
    document.body.appendChild(notice);
  }

  // Restart the entry animation on repeat showings
  notice.classList.remove('traffic-notice--visible');
  void notice.offsetWidth;
  notice.classList.add('traffic-notice--visible');

  clearTimeout(_trafficNoticeHideTimer);
  _trafficNoticeHideTimer = setTimeout(hideTrafficNotice, TRAFFIC_NOTICE_VISIBLE_MS);
}

function hideTrafficNotice() {
  clearTimeout(_trafficNoticeHideTimer);
  const notice = document.getElementById('traffic-notice');
  if (notice) notice.classList.remove('traffic-notice--visible');
}

function updateVerifyBanner(user) {
  const banner = document.getElementById('verify-banner');
  if (!banner) return;
  if (user && !user.emailVerified) {
    banner.style.display = '';
  } else {
    banner.style.display = 'none';
  }
}

function updateAuthUI(user, calls) {
  const prevUser = authState.user;
  authState.user = user;
  authState.calls = calls;

  const guestEl  = document.getElementById('header-auth-guest');
  const userEl   = document.getElementById('header-auth-user');
  const planBadge = document.getElementById('header-plan-badge');
  const usernameEl = document.getElementById('header-username');
  const headerAvatar = document.getElementById('header-avatar');

  if (user) {
    guestEl.style.display = 'none';
    userEl.style.display = '';
    usernameEl.textContent = user.username;
    const isPaidPlan = user.plan === 'pro' || user.plan === 'premium';
    planBadge.textContent = user.plan === 'pro' ? 'Pro' : user.plan === 'premium' ? 'Premium' : '';
    planBadge.className = 'header-plan-badge' + (isPaidPlan ? ' header-plan-badge--premium' : '');
    planBadge.style.display = isPaidPlan ? '' : 'none';
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
  } else {
    guestEl.style.display = '';
    userEl.style.display = 'none';
  }

  updateVerifyBanner(user);

  // Sync drawer auth
  const drawerGuest = document.getElementById('drawer-auth-guest');
  const drawerUser  = document.getElementById('drawer-auth-user');
  const drawerName  = document.getElementById('drawer-username');
  const drawerBadge = document.getElementById('drawer-plan-badge');
  if (drawerGuest && drawerUser) {
    if (user) {
      drawerGuest.style.display = 'none';
      drawerUser.style.display = '';
      if (drawerName)  drawerName.textContent  = user.username;
      if (drawerBadge) {
        const isPaidDrawer = user.plan === 'pro' || user.plan === 'premium';
        drawerBadge.textContent = user.plan === 'pro' ? 'Pro' : user.plan === 'premium' ? 'Premium' : '';
        drawerBadge.className = 'drawer-plan-badge' + (isPaidDrawer ? ' drawer-plan-badge--premium' : '');
        drawerBadge.style.display = isPaidDrawer ? '' : 'none';
      }
    } else {
      drawerGuest.style.display = '';
      drawerUser.style.display  = 'none';
    }
  }

  // Update settings account panel if visible
  syncAccountPanel(user);

  // If user just became authenticated and the profile page is already open (race condition on
  // initial load via #profile hash), reload it so it shows real data instead of guest state.
  if (user && !prevUser) {
    const profilePageEl = document.getElementById('page-profile');
    if (profilePageEl && profilePageEl.style.display !== 'none') {
      window._loadProfilePage?.();
    }
  }
}

function syncAccountPanel(user) {
  const loggedOut = document.getElementById('account-logged-out');
  const loggedIn  = document.getElementById('account-logged-in');
  const secOut    = document.getElementById('security-logged-out');
  const secIn     = document.getElementById('security-logged-in');

  if (!loggedOut) return; // panel not in DOM yet

  if (user) {
    loggedOut.style.display = 'none';
    loggedIn.style.display = '';
    secOut.style.display = 'none';
    secIn.style.display = '';

    document.getElementById('account-username').textContent = user.username;
    document.getElementById('account-email').textContent = user.email;

    // Username change button + cooldown note
    const unameEditBtn  = document.getElementById('btn-username-edit');
    const unameCooldown = document.getElementById('username-cooldown-note');
    if (unameEditBtn) {
      const nextAt = user.usernameNextChangeAt || null; // unix seconds
      const onCooldown = nextAt && nextAt * 1000 > Date.now();
      unameEditBtn.disabled = !!onCooldown;
      if (unameCooldown) {
        if (onCooldown) {
          const date = new Date(nextAt * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          unameCooldown.textContent = `You can change your username again on ${date}.`;
          unameCooldown.style.display = '';
        } else {
          unameCooldown.style.display = 'none';
        }
      }
      if (onCooldown) {
        const editor = document.getElementById('username-editor');
        if (editor) editor.style.display = 'none';
      }
    }

    // Avatar in settings panel
    const avatarPreview = document.getElementById('account-avatar-preview');
    const removeAvatarBtn = document.getElementById('btn-remove-avatar');
    if (avatarPreview) {
      if (user.avatarUrl) {
        const img = document.createElement('img');
        img.src = user.avatarUrl;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        avatarPreview.replaceChildren(img);
        if (removeAvatarBtn) removeAvatarBtn.style.display = '';
      } else {
        const span = document.createElement('span');
        span.textContent = (user.username || '?')[0].toUpperCase();
        avatarPreview.replaceChildren(span);
        if (removeAvatarBtn) removeAvatarBtn.style.display = 'none';
      }
    }

  } else {
    loggedOut.style.display = '';
    loggedIn.style.display = 'none';
    secOut.style.display = '';
    secIn.style.display = 'none';
  }
}

// Tracks billing interval and plan selection in the upgrade modal
let _upgradeInterval = 'monthly';
let _upgradePlan = 'premium';

const _UPGRADE_PRICES = {
  premium: { monthly: '$7.99', annual: '$76.99', monthlyDisplay: '$7.99', annualMonthly: '$6.40', annualNote: '$76.99' },
  pro:     { monthly: '$19.99', annual: '$191.99', monthlyDisplay: '$19.99', annualMonthly: '$16.00', annualNote: '$191.99' },
};

function _setUpgradeBillingInterval(interval) {
  _upgradeInterval = interval;
  const isAnnual = interval === 'annual';
  document.getElementById('btn-billing-monthly').classList.toggle('upgrade-billing-btn--active', !isAnnual);
  document.getElementById('btn-billing-annual').classList.toggle('upgrade-billing-btn--active', isAnnual);
  const priceEl = document.getElementById('upgrade-plan-price');
  const noteEl  = document.getElementById('upgrade-plan-annual-note');
  const ctaBtn  = document.getElementById('btn-upgrade-checkout');
  const p = _UPGRADE_PRICES[_upgradePlan] || _UPGRADE_PRICES.premium;
  const label = _upgradePlan === 'pro' ? 'Go Pro' : 'Upgrade';
  if (isAnnual) {
    priceEl.innerHTML = `${p.annualMonthly}<span class="upgrade-plan-period">/month</span>`;
    noteEl.textContent = `Billed ${p.annualNote}/year`;
    noteEl.style.display = '';
    ctaBtn.textContent = `${label} for ${p.annual}/year`;
  } else {
    priceEl.innerHTML = `${p.monthlyDisplay}<span class="upgrade-plan-period">/month</span>`;
    noteEl.style.display = 'none';
    ctaBtn.textContent = `${label} for ${p.monthly}/month`;
  }
}

function showUpgradeModal(limitData) {
  // Non-logged-in users should create an account first, not be asked to pay
  if (!authState.user || (limitData && limitData.plan === 'anonymous')) {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.querySelector('.auth-tab[data-auth-tab="signup"]')?.click();
    }
    return;
  }

  const modal    = document.getElementById('upgrade-modal');
  const subtitle = document.getElementById('upgrade-subtitle');
  const title    = document.getElementById('upgrade-modal-title');
  const loginHint = document.getElementById('upgrade-login-hint');
  const checkoutBtn = document.getElementById('btn-upgrade-checkout');

  if (limitData && limitData.plan === 'premium') {
    _upgradePlan = 'pro';
    title.textContent = 'Upgrade to Pro';
    subtitle.textContent = "You've reached your Premium AI budget. Upgrade to Pro for $19.99/month and get 5× more monthly AI analysis.";
  } else {
    _upgradePlan = 'premium';
    title.textContent = 'Upgrade to Premium';
    subtitle.textContent = "You've reached your free AI budget. Upgrade to Premium for $7.99/month and keep improving.";
  }

  checkoutBtn.style.display = '';
  loginHint.style.display   = 'none';

  // Reset to monthly view on each open
  _setUpgradeBillingInterval('monthly');

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

function showEmailUnverifiedError() {
  const modal = document.getElementById('verify-email-modal');
  if (!modal) return;
  // Reset resend button state each time
  const btn  = document.getElementById('btn-resend-verification');
  const note = document.getElementById('verify-email-modal-note');
  if (btn)  { btn.disabled = false; btn.textContent = 'Resend verification email'; }
  if (note) { note.style.display = 'none'; note.textContent = ''; }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideEmailUnverifiedModal() {
  const modal = document.getElementById('verify-email-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

// Top-level close for the auth modal. Mirrors the scoped closeModal() inside the
// auth-modal setup (display none, restore scroll, clear inline errors) so callers
// outside that scope — e.g. the Google Sign-In callback — can close it too.
function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
  document.querySelectorAll('.auth-error').forEach(el => { el.style.display = 'none'; el.textContent = ''; });
  document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('input-error'));
}

function initGoogleSignIn(clientId) {
  if (!clientId || !window.google?.accounts?.id) return;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async (response) => {
      // Only the network/auth call is guarded. Everything after a confirmed 200 is
      // post-login side-effect work — running it outside the try means a UI error
      // (or an out-of-scope reference) can never be misreported as a sign-in failure.
      let data, ok;
      try {
        const resp = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ credential: response.credential }),
        });
        ok = resp.ok;
        data = await resp.json().catch(() => ({}));
      } catch {
        showToast('Google sign-in failed. Try again.', 'error');
        return;
      }
      if (!ok) { showToast((data && data.error) || 'Google sign-in failed.', 'error'); return; }

      // Auth succeeded (cookie set server-side) — apply the logged-in state.
      window.ccTrack?.('login', { method: 'google' });
      updateAuthUI(data.user, data.calls);
      closeAuthModal();
      loadUserDataFromServer();
    },
    auto_select: false,
  });
  gsiInitialized = true;
  renderGoogleButton();
}

// One Tap (accounts.id.prompt) is silently suppressed on most mobile browsers
// (iOS Safari blocks the third-party cookies it needs, and dismissals trigger
// cool-downs), so the custom button's click → prompt() flow does nothing there.
// The GSI-rendered button is the only tap-to-sign-in flow that works everywhere;
// render it into the slot and hide the custom button. The slot has no width while
// the modal is closed, so this is retried from openModal().
let gsiInitialized = false;
function renderGoogleButton() {
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
  const customBtn = document.getElementById('btn-auth-google');
  if (customBtn) customBtn.style.display = 'none';
}

async function loadAuthConfig() {
  try {
    const resp = await fetch('/api/auth/config', { credentials: 'same-origin' });
    if (!resp.ok) return;
    const { googleClientId } = await resp.json();
    if (googleClientId) {
      const btn = document.getElementById('btn-auth-google');
      if (btn) btn.dataset.clientId = googleClientId;
      // Initialize once the GSI library is ready (it may not be loaded yet)
      if (window.google?.accounts?.id) {
        initGoogleSignIn(googleClientId);
      } else {
        window.onGoogleLibraryLoad = () => initGoogleSignIn(googleClientId);
      }
    }
  } catch { /* non-fatal */ }
}

async function loadAuthState() {
  try {
    const resp = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (resp.ok) {
      const data = await resp.json();
      const prevUserId = authState.user?.id ?? null;
      const wasLoaded = authState.loaded;
      updateAuthUI(data.user, data.calls);
      // Load server data when a user session becomes active or the user changes
      if (data.user && data.user.id !== prevUserId) {
        loadUserDataFromServer();
        window._refreshFriendBadge?.();
      }
      // Refresh collection tab when auth first resolves (removes the empty-page flash
      // from landing-page navigation) or when the user identity changes.
      const newUserId = data.user?.id ?? null;
      authState.loaded = true;
      if (!wasLoaded || newUserId !== prevUserId) {
        const collPage = document.getElementById('page-collection');
        if (collPage && collPage.style.display !== 'none') {
          window._onCollectionPageOpen?.();
        }
      }

      // Show toast on payment return, or auto-open upgrade modal from landing page
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        history.replaceState({}, '', '/');
        showToast('Subscription activated! Welcome to your new plan.', 'success', 5000);
        // Re-fetch to get updated plan
        setTimeout(async () => {
          const r2 = await fetch('/api/auth/me', { credentials: 'same-origin' });
          if (r2.ok) { const d2 = await r2.json(); updateAuthUI(d2.user, d2.calls); }
        }, 1500);
      } else if (params.get('payment') === 'error') {
        history.replaceState({}, '', '/');
        showToast('Payment could not be completed. Please try again.', 'error');
      } else if (params.get('payment') === 'cancelled') {
        history.replaceState({}, '', '/');
      } else if (params.get('upgrade') === '1') {
        history.replaceState({}, '', '/');
        const interval = params.get('interval') === 'annual' ? 'annual' : 'monthly';
        showUpgradeModal(data.calls);
        _setUpgradeBillingInterval(interval);
      } else if ((params.get('auth') === 'login' || params.get('auth') === 'signup') && !data.user) {
        const tab = params.get('auth');
        history.replaceState({}, '', '/');
        document.getElementById(tab === 'login' ? 'btn-login' : 'btn-signup')?.click();
      }
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Game title
// ---------------------------------------------------------------------------
let gameCounter = 1;
let cleanGameTitle = state.gameTitle;
let _isDirty = false;

function markDirty() { _isDirty = true; }
function markClean() { _isDirty = false; _hasUnsavedCommentEdits = false; cleanGameTitle = state.gameTitle; }

// Unsaved comment work on a game that is NOT in the collection — used to warn
// before the tab closes (collection games auto-persist instead).
let _hasUnsavedCommentEdits = false;

// Per-game modification stamp driving the merge-based sync: newer copy wins,
// both on the server and when merging server data into localStorage. The
// max(+1) keeps the stamp monotonic even against a skewed clock.
function gameUpdatedAt(item) {
  const ts = Number(item && item.updatedAt);
  return Number.isFinite(ts) && ts > 0 ? ts : 0;
}
function bumpGameUpdatedAt(item) {
  item.updatedAt = Math.max(Date.now(), gameUpdatedAt(item) + 1);
}

function hasUnsavedChanges() {
  return _isDirty || state.gameTitle !== cleanGameTitle;
}

function setGameTitle(title) {
  state.gameTitle = title;
  const el = document.getElementById('game-title');
  if (el) el.textContent = title;
}

function deriveImportTitle(pgn) {
  function header(key) {
    const m = pgn.match(new RegExp('\\[' + key + '\\s+"([^"]*)"\\]', 'i'));
    return m ? m[1].trim() : '';
  }
  const white      = header('White');
  const black      = header('Black');
  const whiteElo   = header('WhiteElo');
  const blackElo   = header('BlackElo');
  const whiteTitle = header('WhiteTitle');
  const blackTitle = header('BlackTitle');

  if (!white && !black) return null;

  function fmt(name, title, elo) {
    const cleanElo = elo && elo !== '?' ? elo : '';
    let display = name || '?';
    // Prefix FIDE title if not already present in name
    if (title && !display.startsWith(title + ' ') && !display.startsWith(title + '\u00a0')) {
      display = title + ' ' + display;
    }
    return display + (cleanElo ? ' (' + cleanElo + ')' : '');
  }

  return fmt(white, whiteTitle, whiteElo) + ' vs ' + fmt(black, blackTitle, blackElo);
}

// ---------------------------------------------------------------------------
// Move Tree
// ---------------------------------------------------------------------------
let nodeIdCounter = 0;

function createNode(parent, move, fen) {
  return {
    id: nodeIdCounter++,
    parent,
    move,   // { san, uci, color, moveNumber } or null for root
    fen,
    children: [],
    comment: null,
    theme: null,
    strategicContext: null,
    suggestedMoveUCI: null,
    qa: [],
    pendingQa: null,
    annotation: null,
    posAnnotation: null,
    arrows: [],        // [{from, to, color}]
    squareColors: {},  // {square: color}
  };
}

function initTree() {
  nodeIdCounter = 0;
  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  state.root = createNode(null, null, START_FEN);
  state.currentNode = state.root;
  state.loadedGameId = null;
  state.game.reset();
}

function getGameResult(game) {
  if (!game.game_over()) return null;
  if (game.in_draw()) return '1/2-1/2';
  return game.turn() === 'w' ? '0-1' : '1-0';
}

function addMoveToTree(san, uci) {
  // state.game has already made the move; capture new FEN
  const newFen = state.game.fen();

  // Color and move number come from the parent (pre-move) FEN
  const parts = state.currentNode.fen.split(' ');
  const color = parts[1];          // 'w' or 'b' — who made this move
  const moveNumber = parseInt(parts[5], 10);

  // If this move already exists as a child, just navigate there
  const existing = state.currentNode.children.find(c => c.move.san === san);
  if (existing) {
    state.currentNode = existing;
    return existing;
  }

  // New move → new child (becomes a variation if siblings already exist)
  const newNode = createNode(state.currentNode, { san, uci, color, moveNumber }, newFen);
  newNode.gameResult = getGameResult(state.game);
  state.currentNode.children.push(newNode);
  state.currentNode = newNode;
  markDirty();
  return newNode;
}

function getPathToNode(node) {
  // Returns array of SAN moves from root to this node
  const path = [];
  let cur = node;
  while (cur.move !== null) {
    path.unshift(cur.move.san);
    cur = cur.parent;
  }
  return path;
}

function getUciPathToNode(node) {
  // Returns array of UCI moves from root to this node (e.g. ["e2e4","e7e5"])
  const path = [];
  let cur = node;
  while (cur.move !== null) {
    path.unshift(cur.move.uci);
    cur = cur.parent;
  }
  return path;
}

function findNodeById(root, id) {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
let _lastNavTime = 0;
const NAV_ANIM_THRESHOLD_MS = 180; // skip animation if navigating faster than this
let _animationTimer = null;
const ANIMATION_DURATION_MS = 250; // slightly above chessboard.js default (200ms) to be safe

// Right-click during a piece drag cancels the drag and snaps the piece back
let _pieceIsDragging = false;
let _cancelNextDrop  = false;

function navigateTo(node, animate = false) {
  // If a piece animation is still running, cancel it by snapping the board to
  // the current logical position before applying the next move. This prevents
  // pieces from appearing on both the animating path and the destination square
  // when navigating faster than the animation duration.
  if (_animationTimer !== null) {
    clearTimeout(_animationTimer);
    _animationTimer = null;
    // chessboard.js appends the moving piece clone directly to <body> and
    // drives it with jQuery .animate(). Snapping the board via position()
    // rebuilds the squares but leaves that clone mid-flight, producing a
    // ghost duplicate. Stop and remove it before snapping — but spare each
    // board's persistent drag piece (.cb-persistent-drag-piece): removing it
    // detaches the element chessboard.js reuses for every drag, which made
    // dragged pieces invisible after rapid move navigation.
    $('body > .piece-417db').not('.cb-persistent-drag-piece').stop(true, false).remove();
    state.board.position(state.game.fen(), false);
  }

  if (_vcEl) closeVariationChooser();
  _pendingChildIdx = 0;
  state.currentNode = node;
  state.game.load(node.fen);
  state.board.position(node.fen, animate);

  if (animate) {
    _animationTimer = setTimeout(() => { _animationTimer = null; }, ANIMATION_DURATION_MS);
  }
  clearClickSelection();
  clearHighlights();
  clearAnalysis();
  if (node.comment || node.theme || (node.qa && node.qa.length > 0) || node.pendingQa) {
    if (node.comment || node.theme) showComment(node.comment, node.theme, null, node.strategicContext || null);
    else document.getElementById('analysis-result').classList.add('visible');
    renderQaThread(node.qa || [], node.pendingQa || null);
    if (node.suggestedMoveUCI && boardSettings.showMoveArrow) highlightMove(node.suggestedMoveUCI);
  }
  updateUI();
  updateCommentsEmptyState();
  scheduleEvalUpdate();
  if (state.activePanel === 'opening') fetchOpeningData(node);

  // Mobile: hint strip below board when current move has a comment but Analysis panel is hidden
  const _commentHintEl = document.getElementById('mobile-comment-hint');
  if (_commentHintEl) {
    const _hasComment = !!(node.comment || node.theme || (node.qa && node.qa.length > 0) || node.pendingQa);
    const _activeMpn = document.querySelector('#mobile-panel-nav .mpn-btn--active');
    const _onAnalysis = _activeMpn && _activeMpn.dataset.mpanel === 'left-comments';
    _commentHintEl.classList.toggle('visible', _hasComment && !_onAnalysis);
  }
}

function _stepNavigate(node) {
  const now = Date.now();
  const animate = boardSettings.moveAnimation && (now - _lastNavTime) >= NAV_ANIM_THRESHOLD_MS;
  _lastNavTime = now;
  navigateTo(node, animate);
}

function navigatePrev() {
  if (state.currentNode.parent) _stepNavigate(state.currentNode.parent);
}

function navigateNext() {
  const children = state.currentNode.children;
  if (children.length === 0) return;
  if (window.matchMedia('(max-width: 768px)').matches && children.length > 1) {
    _showVariationStripMobile();
    return;
  }
  const idx = (children.length > 1) ? Math.min(_pendingChildIdx, children.length - 1) : 0;
  _stepNavigate(children[idx]);
}

function _showVariationStripMobile() {
  const strip = document.getElementById('variation-strip');
  if (!strip) return;
  const children = state.currentNode.children;
  strip.innerHTML = '';
  children.forEach((child, i) => {
    const numStr = child.move.color === 'w' ? `${child.move.moveNumber}.` : `${child.move.moveNumber}…`;
    const ann = child.annotation ? ` ${escapeHtml(child.annotation)}` : '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vs-chip' + (i === 0 ? ' vs-active' : '');
    btn.title = i === 0 ? 'Main line' : 'Variation';
    btn.innerHTML = `<span class="vs-move">${numStr} ${sanToFigurine(child.move.san, child.move.color)}${ann}</span>`;
    btn.addEventListener('click', () => {
      strip.hidden = true;
      strip.innerHTML = '';
      _stepNavigate(child);
    });
    strip.appendChild(btn);
  });
  strip.hidden = false;
}

// ---------------------------------------------------------------------------
// Variation chooser — shown when stepping forward into a branch point.
// Desktop: a popover anchored above the "Next" button (mouse + keyboard).
// Mobile: a bottom action-sheet with large tap targets.
// ---------------------------------------------------------------------------
let _vcEl = null;            // root element of the open chooser (null when closed)
let _vcKeyHandler = null;
let _vcOutsideHandler = null;
let _vcSelIdx = 0;

// Inline variation strip: index of the highlighted continuation at the current branch point.
let _pendingChildIdx = 0;

function isVariationChooserOpen() { return !!_vcEl; }

function closeVariationChooser() {
  if (_vcKeyHandler) { document.removeEventListener('keydown', _vcKeyHandler, true); _vcKeyHandler = null; }
  if (_vcOutsideHandler) { document.removeEventListener('mousedown', _vcOutsideHandler, true); _vcOutsideHandler = null; }
  if (_vcEl) { _vcEl.remove(); _vcEl = null; }
}

function showVariationChooser(node) {
  closeVariationChooser();
  const children = node.children;
  if (children.length < 2) { if (children.length === 1) _stepNavigate(children[0]); return; }

  // Match the breakpoint where the mobile board layout activates (style.css).
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  _vcSelIdx = 0;

  const list = document.createElement('div');
  list.className = 'vc-list';
  children.forEach((child, i) => {
    const numStr = child.move.color === 'w' ? `${child.move.moveNumber}.` : `${child.move.moveNumber}…`;
    const ann = child.annotation ? `<span class="vc-ann">${escapeHtml(child.annotation)}</span>` : '';
    const btn = document.createElement('button');
    btn.className = 'vc-option';
    btn.type = 'button';
    btn.dataset.idx = i;
    btn.innerHTML =
      `<span class="vc-key">${i + 1}</span>` +
      `<span class="vc-move">${numStr} ${sanToFigurine(child.move.san, child.move.color)}${ann}</span>` +
      `<span class="vc-label">${i === 0 ? 'Main line' : 'Variation'}</span>`;
    btn.addEventListener('click', () => { closeVariationChooser(); _stepNavigate(child); });
    btn.addEventListener('mouseenter', () => _vcSetSel(i));
    list.appendChild(btn);
  });

  const header = document.createElement('div');
  header.className = 'vc-header';
  header.textContent = 'Choose continuation';

  const panel = document.createElement('div');
  panel.className = 'vc-panel';
  panel.appendChild(header);
  panel.appendChild(list);

  const wrap = document.createElement('div');
  wrap.className = 'variation-chooser ' + (isMobile ? 'variation-chooser--mobile' : 'variation-chooser--desktop');
  wrap.setAttribute('role', 'menu');

  if (isMobile) {
    // Backdrop that fills the screen; the panel slides up from the bottom.
    wrap.appendChild(panel);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) closeVariationChooser(); });
  } else {
    wrap.appendChild(panel);
  }

  document.body.appendChild(wrap);
  _vcEl = wrap;
  _vcSetSel(0);

  if (!isMobile) {
    // Anchor the popover above the Next button, clamped to the viewport.
    const anchor = document.getElementById('btn-next');
    const r = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, right: window.innerWidth / 2, top: window.innerHeight, bottom: window.innerHeight };
    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    let left = (r.left + r.right) / 2 - w / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.top - h - 8;
    if (top < 8) top = r.bottom + 8;   // not enough room above → drop below
    wrap.style.left = left + 'px';
    wrap.style.top = top + 'px';

    _vcOutsideHandler = (e) => { if (!wrap.contains(e.target)) closeVariationChooser(); };
    document.addEventListener('mousedown', _vcOutsideHandler, true);
  }

  _vcKeyHandler = (e) => {
    const n = children.length;
    if (e.key === 'Escape' || e.key === 'ArrowLeft') {
      e.preventDefault(); e.stopPropagation(); closeVariationChooser();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); e.stopPropagation(); _vcSetSel((_vcSelIdx + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation(); _vcSetSel((_vcSelIdx - 1 + n) % n);
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault(); e.stopPropagation();
      const child = children[_vcSelIdx]; closeVariationChooser(); _stepNavigate(child);
    } else if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      if (idx < n) { e.preventDefault(); e.stopPropagation(); const child = children[idx]; closeVariationChooser(); _stepNavigate(child); }
    }
  };
  document.addEventListener('keydown', _vcKeyHandler, true);
}

function _vcSetSel(i) {
  if (!_vcEl) return;
  _vcSelIdx = i;
  const opts = _vcEl.querySelectorAll('.vc-option');
  opts.forEach((el, j) => el.classList.toggle('vc-sel', j === i));
}

function navigateFirst() {
  navigateTo(state.root);
}

function navigateLast() {
  let node = state.currentNode;
  while (node.children.length > 0) node = node.children[0];
  navigateTo(node);
}

// ---------------------------------------------------------------------------
// Move sound (Web Audio API synthesis — no external file needed)
// ---------------------------------------------------------------------------
let _audioCtx = null;

function playMoveSound() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const ctx = _audioCtx;

  // Short percussive thud: filtered noise burst + low sine punch
  const now = ctx.currentTime;

  // Noise burst
  const bufLen = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1200;
  bandpass.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.08);

  // Low sine punch
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.4, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}

// ---------------------------------------------------------------------------
// Move classification → annotation symbol
const CLASSIFICATION_ANN = {
  great:      '!',   // backward compat for old saved analyses
  correct:    '✓',
  inaccuracy: '?!',
  mistake:    '?',
  blunder:    '??',
};

// Annotation symbol → move classification (reverse of CLASSIFICATION_ANN).
// Used to reconstruct analysis stats for games saved before the analysis
// payload was persisted alongside the game.
const ANN_CLASSIFICATION = {
  '!':  'great',
  '✓':  'correct',
  '?!': 'inaccuracy',
  '?':  'mistake',
  '??': 'blunder',
};

// Set of node IDs that just received a new annotation — drives pop-in animation
const _newlyAnnotatedNodeIds = new Set();

// ---------------------------------------------------------------------------
// Game analysis helpers — eval chart + navigation
// ---------------------------------------------------------------------------

function cpToWinPct(cp) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-1500, Math.min(1500, cp)))) - 1);
}

function getMainLineNodes() {
  const nodes = [];
  let n = state.root;
  while (n.children.length > 0) {
    n = n.children[0];
    nodes.push(n);
  }
  return nodes;
}

// Full eval chart for the insights modal (clickable, with key-moment markers)
function renderEvalChart(moves) {
  const W = 580, H = 80, cy = H / 2;
  if (!moves || moves.length < 2) return '';
  const cpArr = [];
  cpArr.push(moves[0] && moves[0].evalBeforeW !== undefined ? moves[0].evalBeforeW : 0);
  for (const m of moves) cpArr.push(m && m.evalAfterW !== undefined ? m.evalAfterW : (cpArr[cpArr.length - 1] ?? 0));
  const n = cpArr.length;
  const pts = cpArr.map((cp, i) => ({
    x: (i / (n - 1)) * W,
    y: (1 - cpToWinPct(cp) / 100) * H,
  }));
  let wFill = `M ${pts[0].x.toFixed(1)} ${cy}`;
  pts.forEach(p => { wFill += ` L ${p.x.toFixed(1)} ${Math.min(p.y, cy).toFixed(1)}`; });
  wFill += ` L ${pts[n - 1].x.toFixed(1)} ${cy} Z`;
  let bFill = `M ${pts[0].x.toFixed(1)} ${cy}`;
  pts.forEach(p => { bFill += ` L ${p.x.toFixed(1)} ${Math.max(p.y, cy).toFixed(1)}`; });
  bFill += ` L ${pts[n - 1].x.toFixed(1)} ${cy} Z`;
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  // Build marker data for overlay dots (SVG circles distort due to preserveAspectRatio="none")
  const MKR_CLS = { blunder: true, mistake: true, inaccuracy: true };
  const markerData = moves.map((m, i) => {
    if (!m || !MKR_CLS[m.classification]) return null;
    const p = pts[i + 1]; // pts[0] is before first move; pts[i+1] is after move i
    return { xPct: (p.x / W) * 100, yPct: (p.y / H) * 100, cls: m.classification, moveIdx: i, fen: m.fenAfter || null };
  }).filter(Boolean);
  const markersAttr = markerData.length
    ? ` data-markers='${JSON.stringify(markerData).replace(/'/g, '&#39;')}'`
    : '';
  return `<svg class="eval-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" data-move-count="${moves.length}"${markersAttr} role="img" aria-label="Evaluation chart">
    <defs>
      <linearGradient id="ecwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,0.22)"/><stop offset="100%" stop-color="rgba(255,255,255,0.05)"/></linearGradient>
      <linearGradient id="ecbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(20,20,20,0.07)"/><stop offset="100%" stop-color="rgba(0,0,0,0.28)"/></linearGradient>
    </defs>
    <path d="${wFill}" fill="url(#ecwg)" />
    <path d="${bFill}" fill="url(#ecbg)" />
    <line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" stroke-dasharray="4 3" />
    <path d="${line}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linejoin="round" />
  </svg>`;
}

// Compact live chart shown in the analysis panel while a game is being analyzed
function renderLiveEvalChart(cpArr) {
  const W = 300, H = 36, cy = H / 2;
  const n = cpArr.length;
  if (n < 2) return '';
  const pts = cpArr.map((cp, i) => ({
    x: (i / (n - 1)) * W,
    y: (1 - cpToWinPct(cp) / 100) * H,
  }));
  let wFill = `M 0 ${cy}`;
  pts.forEach(p => { wFill += ` L ${p.x.toFixed(1)} ${Math.min(p.y, cy).toFixed(1)}`; });
  wFill += ` L ${pts[n - 1].x.toFixed(1)} ${cy} Z`;
  let bFill = `M 0 ${cy}`;
  pts.forEach(p => { bFill += ` L ${p.x.toFixed(1)} ${Math.max(p.y, cy).toFixed(1)}`; });
  bFill += ` L ${pts[n - 1].x.toFixed(1)} ${cy} Z`;
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return `<svg class="live-eval-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <path d="${wFill}" fill="rgba(255,255,255,0.16)" />
    <path d="${bFill}" fill="rgba(0,0,0,0.26)" />
    <line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="rgba(255,255,255,0.1)" stroke-width="0.7" />
    <path d="${line}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linejoin="round" />
  </svg>`;
}

// ---------------------------------------------------------------------------
// Board settings
// ---------------------------------------------------------------------------
const boardSettings = {
  lightSquare: '#e8d8ba',
  darkSquare: '#4e7249',
  pieceSet: 'bold',
  roundedCorners: true,
  moveAnimation: true,
  highlightLegal: true,
  showNotation: true,
  soundEnabled: true,
  showMoveArrow: false,
  figurineNotation: false,
};

const gameplaySettings = {
  autoQueenPromotion: false,
};

function loadGameplaySettings() {
  try {
    const saved = localStorage.getItem('gameplaySettings');
    if (saved) Object.assign(gameplaySettings, JSON.parse(saved));
  } catch (e) {}
}

function saveGameplaySettings() {
  try {
    localStorage.setItem('gameplaySettings', JSON.stringify(gameplaySettings));
  } catch (e) {}
  syncSettingsToServer();
}

// ---------------------------------------------------------------------------
// Server-side persistence — settings & collection
// ---------------------------------------------------------------------------
let _settingsSyncTimer = null;
const SETTINGS_SYNC_DEBOUNCE_MS = 1500;

function syncSettingsToServer() {
  if (!authState.user) return;
  clearTimeout(_settingsSyncTimer);
  _settingsSyncTimer = setTimeout(async () => {
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ boardSettings, gameplaySettings }),
      });
    } catch {}
  }, SETTINGS_SYNC_DEBOUNCE_MS);
}

// Collection pushes are debounced and serialized: rapid saves coalesce into
// one PUT, and a second PUT never races ahead of an in-flight one (an older
// payload landing after a newer one is how edits used to get silently
// reverted). Each PUT re-reads localStorage so it always sends fresh data.
let _collectionSyncTimer = null;
let _collectionSyncRun = null;      // promise of the in-flight push loop
let _collectionSyncQueued = false;
const COLLECTION_SYNC_DEBOUNCE_MS = 800;

function _pushCollectionNow() {
  if (!authState.user) return Promise.resolve();
  clearTimeout(_collectionSyncTimer);
  _collectionSyncTimer = null;
  _collectionSyncQueued = true;
  if (_collectionSyncRun) return _collectionSyncRun;
  _collectionSyncRun = (async () => {
    try {
      while (_collectionSyncQueued) {
        _collectionSyncQueued = false;
        const items = window._collectionAPI ? window._collectionAPI.get() : [];
        try {
          await fetch('/api/user/games', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(items),
          });
        } catch {}
      }
    } finally {
      _collectionSyncRun = null;
    }
  })();
  return _collectionSyncRun;
}

function syncCollectionToServer({ immediate = false } = {}) {
  if (!authState.user) return Promise.resolve();
  if (immediate) return _pushCollectionNow();
  clearTimeout(_collectionSyncTimer);
  _collectionSyncTimer = setTimeout(_pushCollectionNow, COLLECTION_SYNC_DEBOUNCE_MS);
  return Promise.resolve();
}

// Flush a pending (debounced) push when the tab is being closed or
// backgrounded, so a comment edited right before closing still reaches the
// server. keepalive lets the request outlive the page.
window.addEventListener('pagehide', () => {
  if (!authState.user || (!_collectionSyncTimer && !_collectionSyncQueued && !_collectionSyncRun)) return;
  clearTimeout(_collectionSyncTimer);
  _collectionSyncTimer = null;
  _collectionSyncQueued = false;
  try {
    const items = window._collectionAPI ? window._collectionAPI.get() : [];
    fetch('/api/user/games', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
      body: JSON.stringify(items),
    }).catch(() => {});
  } catch {}
});

async function deleteGameFromServer(id) {
  if (!authState.user) return;
  try {
    await fetch(`/api/user/games/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch {}
}

async function loadUserDataFromServer() {
  try {
    const resp = await fetch('/api/user/data', { credentials: 'same-origin' });
    if (!resp.ok) return;
    const { settings, games, deleted } = await resp.json();

    // Apply settings — server is authoritative for logged-in users
    if (settings) {
      if (settings.boardSettings) {
        Object.assign(boardSettings, settings.boardSettings);
        applyBoardSettings();
      }
      if (settings.gameplaySettings) {
        Object.assign(gameplaySettings, settings.gameplaySettings);
      }
      // Persist to localStorage so settings load instantly on next visit
      try {
        localStorage.setItem('boardSettings',    JSON.stringify(boardSettings));
        localStorage.setItem('gameplaySettings', JSON.stringify(gameplaySettings));
      } catch {}
      // Re-sync settings panel UI if it is already initialised
      if (window._syncSettingsPanels) window._syncSettingsPanels();
    }

    // Merge collection per game: whichever copy was modified more recently
    // wins (server wins ties). Blanket "server wins" used to discard local
    // edits made while a sync PUT was still pending or had failed.
    if (Array.isArray(games) && window._collectionAPI) {
      const localItems = window._collectionAPI.get();
      const localById  = new Map(localItems.filter(g => g && g.id != null).map(g => [g.id, g]));
      const deletedAt  = new Map(
        (Array.isArray(deleted) ? deleted : []).map(d => [d.id, Number(d.deletedAt) || 0])
      );
      const merged = [];
      const seen = new Set();
      let localAhead = false;
      for (const sg of games) {
        if (!sg || sg.id == null) continue;
        seen.add(sg.id);
        const lg = localById.get(sg.id);
        if (lg && gameUpdatedAt(lg) > gameUpdatedAt(sg)) {
          merged.push(lg);
          localAhead = true;
        } else {
          merged.push(sg);
        }
      }
      for (const lg of localItems) {
        if (lg == null || seen.has(lg.id)) continue;
        // Deleted on another device — drop the local copy unless it was
        // edited after the deletion.
        const delTs = deletedAt.get(lg.id);
        if (delTs !== undefined && gameUpdatedAt(lg) <= delTs) continue;
        merged.push(lg);
        localAhead = true;
      }
      window._collectionAPI.set(merged);
      // Local had newer or extra games — push them so other devices see them.
      if (localAhead) syncCollectionToServer();
    }
  } catch {}
}

// Chess-piece icons rendered from the board's standard piece set (replaces the
// former hand-drawn inline SVGs). `.piece-icon` styling in style.css handles
// theme-aware tinting so the dark line-art reads on both dark and light surfaces.
function pieceIconImg(type) {
  return `<img class="piece-icon" src="./images/chess_bold_black_${type}.png" alt="" aria-hidden="true">`;
}
const PIECE_SVGS = {
  pawn:   pieceIconImg('pawn'),
  knight: pieceIconImg('knight'),
  bishop: pieceIconImg('bishop'),
  rook:   pieceIconImg('rook'),
  queen:  pieceIconImg('queen'),
  king:   pieceIconImg('king'),
};
const PIECE_TYPE_MAP = { '♟':'pawn','♙':'pawn','♞':'knight','♘':'knight','♝':'bishop','♗':'bishop','♜':'rook','♖':'rook','♛':'queen','♕':'queen','♔':'king','♚':'king' };
function xpIconHtml(icon) { return PIECE_SVGS[PIECE_TYPE_MAP[icon]] || PIECE_SVGS.pawn; }

const PIECE_SETS = {
  woodcut: {
    wP: './images/chess_woodcut_white_pawn.png',
    wR: './images/chess_woodcut_white_rook.png',
    wN: './images/chess_woodcut_white_knight.png',
    wB: './images/chess_woodcut_white_bishop.png',
    wQ: './images/chess_woodcut_white_queen.png',
    wK: './images/chess_woodcut_white_king.png',
    bP: './images/chess_woodcut_black_pawn.png',
    bR: './images/chess_woodcut_black_rook.png',
    bN: './images/chess_woodcut_black_knight.png',
    bB: './images/chess_woodcut_black_bishop.png',
    bQ: './images/chess_woodcut_black_queen.png',
    bK: './images/chess_woodcut_black_king.png',
  },

  minimal: {
    wP: './images/chess_minimal_white_pawn.png',
    wR: './images/chess_minimal_white_rook.png',
    wN: './images/chess_minimal_white_knight.png',
    wB: './images/chess_minimal_white_bishop.png',
    wQ: './images/chess_minimal_white_queen.png',
    wK: './images/chess_minimal_white_king.png',
    bP: './images/chess_minimal_black_pawn.png',
    bR: './images/chess_minimal_black_rook.png',
    bN: './images/chess_minimal_black_knight.png',
    bB: './images/chess_minimal_black_bishop.png',
    bQ: './images/chess_minimal_black_queen.png',
    bK: './images/chess_minimal_black_king.png',
  },

  bold: {
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
  },

  blind: Object.fromEntries(
    ['wP','wR','wN','wB','wQ','wK','bP','bR','bN','bB','bQ','bK']
      .map(k => [k, './images/transparent.png'])
  ),
};

// Board initialization
// ---------------------------------------------------------------------------
let PIECE_IMAGES = {
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

// chessboard.js appends one persistent floating drag-piece <img> to <body> per
// board and reuses it for every drag. The ghost-clone cleanup in navigateTo()
// must never remove it — once detached, every subsequent drag moves an element
// that is no longer in the DOM, so the dragged piece turns invisible. Tag the
// persistent piece right after each board is built; the transient animation
// clones chessboard.js creates during position() calls stay untagged.
const _VendorChessboard = window.Chessboard;
window.Chessboard = function (...args) {
  const board = _VendorChessboard.apply(this, args);
  $('body > .piece-417db').addClass('cb-persistent-drag-piece');
  return board;
};
window.Chessboard.fenToObj = _VendorChessboard.fenToObj;
window.Chessboard.objToFen = _VendorChessboard.objToFen;
window.ChessBoard = window.Chessboard;

function initBoard() {
  state.board = Chessboard('board', {
    position: 'start',
    draggable: true,
    pieceTheme: (piece) => PIECE_IMAGES[piece],
    onDragStart,
    onDrop,
    onSnapEnd,
  });

  state.previewBoard = Chessboard('preview-board', {
    position: 'start',
    draggable: false,
    pieceTheme: (piece) => PIECE_IMAGES[piece],
  });

  // jQuery UI draggable suppresses 'click' on piece elements via preventDefault on mousedown,
  // so we cannot rely on click events for own pieces. Instead:
  //  • own piece clicks  → detected via onDrop(source, source)
  //  • empty / opponent square clicks → click event fires normally (no draggable active)
  document.getElementById('board').addEventListener('click', (e) => {
    if (state._dropHandledClick) return; // already handled by onDrop
    const squareEl = e.target.closest('[data-square]');
    if (squareEl) onSquareClick(squareEl.dataset.square);
  });

  // Suppress the browser context menu anywhere on a chess board. A single
  // document-level handler also covers the dragged-piece clone that
  // chessboard.js appends directly to <body> (see snapBoardToNode), which sits
  // outside the board containers and would otherwise escape per-container
  // handlers.
  document.addEventListener('contextmenu', e => {
    if (e.target.closest(
      '#board-container, #play-board-container, #puzzle-board-container, ' +
      '#preview-board-container, #builder-board, ' +
      '.piece-417db'
    )) {
      e.preventDefault();
    }
  });

  // chessboard.js positions the dragged-piece clone in document coordinates as
  // a direct child of <body>. On mobile board pages the body is position:fixed
  // (pinned to the viewport), which makes the viewport the clone's containing
  // block — so any residual document scroll (typically left behind by the
  // on-screen keyboard after typing in the PGN-import textarea) displaces the
  // clone from the finger by exactly the scroll offset and the dragged piece
  // appears to vanish. With the body pinned, document scroll has no visual
  // effect, so resetting it is always safe. Two layers:
  //  1. Undo stray scroll the moment it appears — but not while an input is
  //     focused, since the OS scrolls to keep the keyboard from covering it.
  //  2. Reset on the touch/click that starts a drag, covering scroll left over
  //     from a still-focused input that never fired another scroll event.
  const _isTypingTarget = el =>
    el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  const _resetStrayScroll = () => {
    if (!(window.scrollX || window.scrollY)) return;
    // The mobile-board-active class alone isn't enough: it is set on desktop
    // too, where the body stays static and page scrolling is legitimate. Only
    // a genuinely pinned body (the mobile media query) makes scroll stray.
    if (!document.body.classList.contains('mobile-board-active')) return;
    if (getComputedStyle(document.body).position !== 'fixed') return;
    window.scrollTo(0, 0);
  };
  window.addEventListener('scroll', () => {
    if (_isTypingTarget(document.activeElement)) return;
    _resetStrayScroll();
  }, { passive: true });
  ['mousedown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, _resetStrayScroll, { capture: true, passive: true });
  });

  updateUI();
}

function applyBoardSettings() {
  const styleId = 'board-colors-override';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  // When notation is visible, use the opposite square color as the label color (contrast).
  // When notation is hidden, collapse the elements entirely.
  const notationLightColor = boardSettings.showNotation ? boardSettings.darkSquare  : boardSettings.lightSquare;
  const notationDarkColor  = boardSettings.showNotation ? boardSettings.lightSquare : boardSettings.darkSquare;
  styleEl.textContent =
    '.white-1e1d7 { background-color: ' + boardSettings.lightSquare + '; color: ' + notationLightColor + '; }' +
    '.black-3c85d  { background-color: ' + boardSettings.darkSquare  + '; color: ' + notationDarkColor  + '; }' +
    (boardSettings.showNotation ? '' : '.notation-322f9 { display: none !important; }');

  const root = document.documentElement;
  root.style.setProperty('--sq-light', boardSettings.lightSquare);
  root.style.setProperty('--sq-dark', boardSettings.darkSquare);

  const boardContainers = [
    document.getElementById('board-container'),
    document.getElementById('play-board-container'),
  ];
  boardContainers.forEach(el => {
    if (!el) return;
    if (boardSettings.roundedCorners) {
      el.style.borderRadius = '';
    } else {
      el.style.borderRadius = '0';
    }
  });

  PIECE_IMAGES = PIECE_SETS[boardSettings.pieceSet] || PIECE_SETS.bold;

  if (state.board) {
    const fen = state.game ? state.game.fen() : null;
    if (fen) state.board.position(fen, false);
    else state.board.resize();
  }
  if (playState.board) {
    const fen = playState.game ? playState.game.fen() : null;
    if (fen) playState.board.position(fen, false);
    else playState.board.resize();
  }

  // Belt-and-suspenders: directly set display on existing notation elements in
  // addition to the CSS injection above, since boards may not rebuild their DOM
  // on a position() call and some browsers defer style recalculation.
  document.querySelectorAll('.notation-322f9').forEach(el => {
    el.style.display = boardSettings.showNotation ? '' : 'none';
  });

  if (!boardSettings.showMoveArrow) clearHighlights();

  if (boardSettings.figurineNotation) {
    updateMoveHistoryDebounced();
    renderPlayMoveHistory();
  }

  try {
    localStorage.setItem('boardSettings', JSON.stringify(boardSettings));
  } catch (e) {}
  syncSettingsToServer();
}

function loadBoardSettings() {
  try {
    const saved = localStorage.getItem('boardSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(boardSettings, parsed);
    }
  } catch (e) {}
  // Migrate away from removed piece sets
  if (!PIECE_SETS[boardSettings.pieceSet]) boardSettings.pieceSet = 'bold';
  applyBoardSettings();
}

// anchorEl (optional): when the preview is triggered from inside a panel/list
// (e.g. the move history), pass that element so the board is placed clear of its
// whole bounding box instead of just left of the cursor — which would otherwise
// land on top of the list the user is hovering.
function showPreview(fen, x, y, anchorEl = null) {
  if (!state.previewBoard) return;
  if (window.matchMedia('(hover: none)').matches) return;
  const container = document.getElementById('preview-board-container');
  container.style.display = 'block';
  // Defer resize until after the browser has laid out the now-visible container,
  // otherwise chessboard.js measures 0px and renders the board too small.
  requestAnimationFrame(() => {
    state.previewBoard.resize();
    state.previewBoard.orientation(state.orientation);
    state.previewBoard.position(fen, false);
    updatePreviewPosition(x, y, anchorEl);
  });
}

function updatePreviewPosition(x, y, anchorEl = null) {
  const container = document.getElementById('preview-board-container');
  if (!container || container.style.display === 'none') return;
  const w = container.offsetWidth || 200;
  const h = container.offsetHeight || 200;
  // Horizontal anchor: clear the hovered element's box when given one (so the
  // preview never covers the move list), otherwise fall back to the cursor.
  const anchorRect = anchorEl?.getBoundingClientRect?.();
  const leftRef  = anchorRect ? anchorRect.left  : x;
  const rightRef = anchorRect ? anchorRect.right : x;
  const preferredLeft = leftRef - w - 18;
  const fallbackLeft = rightRef + 18;
  const left = preferredLeft >= 10 ? preferredLeft : Math.min(fallbackLeft, window.innerWidth - w - 10);
  const top = Math.max(10, Math.min(y - h / 2, window.innerHeight - h - 10));
  container.style.left = left + 'px';
  container.style.top = top + 'px';
}

function hidePreview() {
  const container = document.getElementById('preview-board-container');
  if (container) container.style.display = 'none';
}

function getFenAfterMoves(startFen, moves) {
  const tmp = new Chess(startFen);
  for (const move of moves) {
    if (!tmp.move(move)) break;
  }
  return tmp.fen();
}

function onDragStart(source, piece) {
  if (state.game.game_over() || state.currentNode.gameResult) return false;
  const turn = state.game.turn();
  if ((turn === 'w' && piece.search(/^b/) !== -1) ||
      (turn === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }

  _pieceIsDragging = true;

  // Track whether this piece was already selected before drag started
  state._dragStartWasSelected = (state.selectedSquare === source);

  // Show legal move highlights while dragging (same as click selection)
  clearClickSelection();
  const moves = state.game.moves({ square: source, verbose: true });
  if (moves.length > 0) {
    state.selectedSquare = source;
    state.legalTargetSquares = moves.map(m => m.to);
    $(`[data-square="${source}"]`).addClass('highlight-selected');
    if (boardSettings.highlightLegal) {
      state.legalTargetSquares.forEach(sq => {
        $(`[data-square="${sq}"]`).addClass('highlight-legal');
      });
    }
  }
}

function onDrop(source, target) {
  _pieceIsDragging = false;
  if (_cancelNextDrop) {
    _cancelNextDrop = false;
    clearClickSelection();
    clearHighlights();
    return 'snapback';
  }

  // source === target means the piece was clicked without dragging.
  // onDragStart already set up the selection and highlights; only deselect
  // if the piece was already selected before this drag started.
  if (source === target) {
    state._dropHandledClick = true;
    setTimeout(() => { state._dropHandledClick = false; }, 100);
    if (state._dragStartWasSelected) {
      clearClickSelection();
    }
    // else: first click — onDragStart's selection and highlights remain
    return 'snapback';
  }

  clearClickSelection();
  clearHighlights();
  clearAnalysis();

  // Check for promotion via legal moves
  const candidateMoves = state.game.moves({ verbose: true }).filter(m => m.from === source && m.to === target);
  if (!candidateMoves.length) return 'snapback';

  if (candidateMoves.some(m => m.promotion) && !gameplaySettings.autoQueenPromotion) {
    const turn = state.game.turn();
    showPromotionPicker(turn, (piece) => {
      const mv = state.game.move({ from: source, to: target, promotion: piece });
      if (!mv) return;
      if (boardSettings.soundEnabled) playMoveSound();
      addMoveToTree(mv.san, mv.from + mv.to + mv.promotion);
      state.board.position(state.game.fen(), false);
      updateUI();
      scheduleEvalUpdate();
    });
    return 'snapback';
  }

  const move = state.game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';

  if (boardSettings.soundEnabled) playMoveSound();
  const uci = move.from + move.to + (move.promotion || '');
  addMoveToTree(move.san, uci);

  updateUI();
  scheduleEvalUpdate();
  if (state.activePanel === 'opening') fetchOpeningData(state.currentNode);
}

function onSnapEnd() {
  _pieceIsDragging = false;
  state.board.position(state.game.fen(), false);
  // Re-apply highlights since board re-render clears CSS classes and inline styles
  if (state.selectedSquare) {
    $(`[data-square="${state.selectedSquare}"]`).addClass('highlight-selected');
    if (boardSettings.highlightLegal) {
      state.legalTargetSquares.forEach(sq => {
        $(`[data-square="${sq}"]`).addClass('highlight-legal');
      });
    }
  }
  applySquareColorHighlights(state.currentNode);
}

// ---------------------------------------------------------------------------
// Click-to-move
// ---------------------------------------------------------------------------
function onSquareClick(square) {
  if (state.game.game_over() || state.currentNode.gameResult) return;

  const piece = state.game.get(square);
  const turn  = state.game.turn();

  // If a square is already selected and this is a legal target → make the move
  if (state.selectedSquare && state.legalTargetSquares.includes(square)) {
    const from = state.selectedSquare;
    clearClickSelection();
    clearHighlights();
    clearAnalysis();

    const legalMoves = state.game.moves({ verbose: true });
    if (legalMoves.some(m => m.from === from && m.to === square && m.promotion) && !gameplaySettings.autoQueenPromotion) {
      const turn = state.game.turn();
      showPromotionPicker(turn, (piece) => {
        const mv = state.game.move({ from, to: square, promotion: piece });
        if (!mv) return;
        if (boardSettings.soundEnabled) playMoveSound();
        addMoveToTree(mv.san, mv.from + mv.to + mv.promotion);
        state.board.position(state.game.fen(), false);
        updateUI();
        scheduleEvalUpdate();
        if (state.activePanel === 'opening') fetchOpeningData(state.currentNode);
      });
      return;
    }

    const move = state.game.move({ from, to: square, promotion: 'q' });
    if (move) {
      if (boardSettings.soundEnabled) playMoveSound();
      addMoveToTree(move.san, move.from + move.to + (move.promotion || ''));
      state.board.position(state.game.fen(), false);
      updateUI();
      scheduleEvalUpdate();
      if (state.activePanel === 'opening') fetchOpeningData(state.currentNode);
    }
    return;
  }

  // Clicking the already-selected square → deselect
  if (state.selectedSquare === square) {
    clearClickSelection();
    return;
  }

  // Select a piece belonging to the side to move
  if (piece && piece.color === turn) {
    clearClickSelection();
    const moves = state.game.moves({ square, verbose: true });
    if (moves.length === 0) return;

    state.selectedSquare = square;
    state.legalTargetSquares = moves.map(m => m.to);

    $(`[data-square="${square}"]`).addClass('highlight-selected');
    if (boardSettings.highlightLegal) {
      state.legalTargetSquares.forEach(sq => {
        $(`[data-square="${sq}"]`).addClass('highlight-legal');
      });
    }
    return;
  }

  // Clicking an empty or opponent square with no selection → do nothing
  clearClickSelection();
}

function clearClickSelection() {
  if (state.selectedSquare) {
    $(`[data-square="${state.selectedSquare}"]`).removeClass('highlight-selected');
  }
  state.legalTargetSquares.forEach(sq => {
    $(`[data-square="${sq}"]`).removeClass('highlight-legal');
  });
  state.selectedSquare = null;
  state.legalTargetSquares = [];
}

// ---------------------------------------------------------------------------
// Live evaluation update — streaming SSE from Stockfish
// Design: abort-immediately / debounced-start / generation-guarded
//
//  scheduleEvalUpdate()  — called on every position change.
//    1. Kills the running stream RIGHT NOW (no 250 ms wait) so stale data
//       stops arriving immediately.
//    2. Resets the eval bar to the neutral/loading state immediately.
//    3. Debounces the *start* of the new stream by 250 ms so rapid
//       navigation (arrow-key held down) produces only one request per pause.
//
//  startEvalStream()     — called after the debounce settles.
//    Each invocation increments _evalGen. Closures capture their own gen value
//    and silently drop any data / reconnect attempt that belongs to a previous
//    generation. This is the final safety net against late-arriving chunks
//    that slipped through before the abort propagated.
// ---------------------------------------------------------------------------
let evalAbortController = null;
let _evalDebounceTimer  = null;
let _evalGen            = 0;

function scheduleEvalUpdate() {
  // Kill running stream immediately — don't wait for the debounce.
  if (evalAbortController) { evalAbortController.abort(); evalAbortController = null; }
  clearTimeout(_evalDebounceTimer);

  // Immediately show neutral/loading state so stale eval is never visible.
  resetEvalBar();
  markStockfishLinesStale();

  if (!state.evalVisible) return;
  _evalDebounceTimer = setTimeout(startEvalStream, 100);
}

function startEvalStream() {
  if (state.game.game_over() || state.currentNode.gameResult) return;
  if (!state.evalVisible) return;

  if (evalAbortController) { evalAbortController.abort(); }
  evalAbortController = new AbortController();

  const gen    = ++_evalGen;   // generation stamp — stale chunks check against this
  const signal = evalAbortController.signal;
  const fen    = state.game.fen();

  fetch('/api/evaluate/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    signal,
    body: JSON.stringify({ fen, moves: [], skillLevel: state.skillLevel }),
  }).then(response => {
    if (gen !== _evalGen) return;                          // superseded before response arrived
    if (!response.ok) {
      if (gen === _evalGen) setTimeout(() => { if (gen === _evalGen) startEvalStream(); }, 1500);
      return;
    }


    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = '';
    let gotFinal  = false;

    const pump = ({ done, value }) => {
      if (gen !== _evalGen) { reader.cancel().catch(() => {}); return; } // generation expired
      if (done) {
        // Only restart on unexpected close — not on intentional abort.
        // signal.aborted is the authoritative flag; gen===_evalGen is a belt-and-suspenders guard.
        if (!gotFinal && !signal.aborted && gen === _evalGen) startEvalStream();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop();
      for (const part of parts) {
        if (gen !== _evalGen) break;
        const dataLine = part.split('\n').find(l => l.startsWith('data: '));
        if (!dataLine) continue;
        try {
          const data = JSON.parse(dataLine.slice(6));
          if (data.type === 'latency') { showTrafficNotice(); continue; }
          updateEvalBar(data.numericScore, data.display);
          if (data.bestMoveUCI) {
            updateTopMove(data.bestMoveUCI);
            if (boardSettings.showMoveArrow && state.evalVisible) highlightMove(data.bestMoveUCI);
          }
          if (data.topMoves) queueStockfishRender(data.topMoves, data.sideToMove, data.depth);
          if (data.isFinal) gotFinal = true;
        } catch (_) {}
      }
      reader.read().then(pump).catch(() => {
        if (!gotFinal && !signal.aborted && gen === _evalGen) startEvalStream();
      });
    };

    reader.read().then(pump).catch(() => {
      if (!gotFinal && !signal.aborted && gen === _evalGen) startEvalStream();
    });
  }).catch(e => {
    if (e.name !== 'AbortError' && gen === _evalGen) {
      setTimeout(() => { if (gen === _evalGen) startEvalStream(); }, 1500);
    }
  });
}

// ---------------------------------------------------------------------------
// UI update helpers
// ---------------------------------------------------------------------------
let _moveHistoryTimer = null;
function updateMoveHistoryDebounced() {
  clearTimeout(_moveHistoryTimer);
  _moveHistoryTimer = setTimeout(updateMoveHistory, 120);
}

function updateUI() {
  updateFenDisplay();
  updateCheckHighlight();
  updateMoveHistoryDebounced();
  updateNavButtons();
  renderBoardDrawings();
  renderMaterialBars('mat-analysis-top', 'mat-analysis-bot', state.game.fen(), state.orientation);
  const _welcome = document.getElementById('analysis-welcome');
  if (_welcome) _welcome.style.display = state.root.children.length > 0 ? 'none' : '';
}

function updateFenDisplay() {
  // FEN display removed
}

function updateCheckHighlight() {
  // Clear any existing check highlight
  $('[data-square]').removeClass('highlight-check');

  if (state.game.in_check()) {
    // Find the king in check
    const turn = state.game.turn(); // 'w' or 'b'
    const kingPiece = turn === 'w' ? 'wK' : 'bK';
    const board = state.game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const file = String.fromCharCode(97 + c); // a-h
          const rank = 8 - r;                        // 1-8
          $(`[data-square="${file}${rank}"]`).addClass('highlight-check');
        }
      }
    }
  }
}

function updateNavButtons() {
  document.getElementById('btn-first').disabled = !state.currentNode.parent;
  document.getElementById('btn-prev').disabled  = !state.currentNode.parent;
  const nextBtn = document.getElementById('btn-next');
  nextBtn.disabled = state.currentNode.children.length === 0;
  nextBtn.classList.toggle('has-variations', state.currentNode.children.length > 1);
  document.getElementById('btn-last').disabled  = state.currentNode.children.length === 0;
  updateVariationStrip();
}

function updateVariationStrip() {
  const strip = document.getElementById('variation-strip');
  if (!strip) return;
  const children = state.currentNode.children;
  // On mobile the strip is shown only on explicit next-click; hide it on any nav change
  if (window.matchMedia('(max-width: 768px)').matches || children.length < 2) {
    strip.hidden = true;
    strip.innerHTML = '';
    return;
  }
  if (_pendingChildIdx >= children.length) _pendingChildIdx = 0;
  strip.hidden = false;
  strip.innerHTML = '';
  children.forEach((child, i) => {
    const numStr = child.move.color === 'w' ? `${child.move.moveNumber}.` : `${child.move.moveNumber}…`;
    const ann = child.annotation ? ` ${escapeHtml(child.annotation)}` : '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vs-chip' + (i === _pendingChildIdx ? ' vs-active' : '');
    btn.title = i === 0 ? 'Main line' : 'Variation';
    btn.innerHTML =
      `<span class="vs-move">${numStr} ${sanToFigurine(child.move.san, child.move.color)}${ann}</span>`;
    btn.addEventListener('click', () => {
      strip.hidden = true;
      strip.innerHTML = '';
      _stepNavigate(child);
    });
    strip.appendChild(btn);
  });
}

// ---------------------------------------------------------------------------
// Move history rendering (interactive tree with clickable moves and comments)
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Achievement icons that render as chess-piece PNG art.
const CHESS_PIECE_ICONS = new Set(['pawn', 'knight', 'bishop', 'rook', 'queen', 'king']);

// Crisp inline SVGs for the non-chess achievement icons (use currentColor so
// rarity styling carries through). Keyed by plain ASCII name — no Unicode.
const ACHIEV_SVG_ICONS = {
  flame:         '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.5 3 2.3 4.6 3.8 6 1.6 1.5 2.7 3.2 2.7 5.5a6.5 6.5 0 0 1-13 0c0-1.1.3-2.1.9-3 .2 1 .9 1.8 1.9 1.8 1.1 0 1.9-.9 1.9-2 0-1.4-.8-2.2-.8-3.8C9.4 4.7 10.4 3.2 12 2z"/></svg>',
  gem:           '<svg viewBox="0 0 24 24" fill="currentColor" stroke="rgba(0,0,0,0.18)" stroke-width="1" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l3.5 5.5L12 22 2.5 8.5z"/></svg>',
  star:          '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.4 12 18 5.8 21.4 7 14.4 2 9.5 8.9 8.6"/></svg>',
  target:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
  'arrow-up':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="20" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  'chevrons-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 12 12 6 18 12"/><polyline points="6 19 12 13 18 19"/></svg>',
  sparkle:       '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5l2.3 8.2 8.2 2.3-8.2 2.3L12 22.5l-2.3-8.2L1.5 12l8.2-2.3z"/></svg>',
  bolt:          '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 11 14 10 22 21 9 13 9"/></svg>',
  gauge:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 16a8.5 8.5 0 1 1 17 0"/><line x1="12" y1="16" x2="16" y2="11"/><circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none"/></svg>',
  rotate:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2.5 5 2.5 11 8.5 11"/><path d="M5 15a8 8 0 1 0 1.9-8.3L2.5 11"/></svg>',
};

function renderAchievIcon(icon) {
  if (CHESS_PIECE_ICONS.has(icon)) {
    return `<img src="./images/chess_bold_white_${icon}.png" alt="${escapeHtml(icon)}" class="achiev-piece-icon">`;
  }
  const svg = ACHIEV_SVG_ICONS[icon];
  if (svg) {
    return `<span class="achiev-svg-icon" role="img">${svg}</span>`;
  }
  return escapeHtml(icon || '');
}

function preventMarkdownMoveList(md) {
  // Markdown turns lines like "1. e4" into an ordered list item. We insert a
  // zero-width space only when the content looks like chess SAN notation so that
  // AI-generated numbered lists still render as real lists.
  //
  // Chess SAN patterns detected:
  //   pawn move:   [a-h][1-8]            e.g. e4, d5
  //   piece move:  [NRQK] x? [a-h1-8]   e.g. Nf3, Qxd5
  //   bishop:      B x? [a-h][1-8]       e.g. Bc4, Bxe5  (requires 2nd char to
  //                                       avoid matching words like "Be", "By")
  //   castling:    O-O
  const ZWSP = '\u200B';
  return String(md || '').replace(
    /^(\s*)(\d+(?:\.{1,3}|\u2026)\s+)(?=[a-h][1-8]|[NRQK]x?[a-h1-8]|Bx?[a-h][1-8]|O-O)/gm,
    `$1${ZWSP}$2`
  );
}

/**
 * Convert a SAN string to HTML with a piece image when figurine notation is on.
 * color: 'w' or 'b'. Returns escaped HTML safe for innerHTML.
 */
function sanToFigurine(san, color) {
  if (!boardSettings.figurineNotation || !san) return escapeHtml(san || '');
  const c = color === 'w' ? 'w' : 'b';
  let pieceLetter, rest;
  if (/^O-O/.test(san)) {
    pieceLetter = 'K';
    rest = san;
  } else if (/^[KQRBN]/.test(san)) {
    pieceLetter = san[0];
    rest = san.slice(1);
  } else {
    return escapeHtml(san);
  }
  const src = PIECE_IMAGES && PIECE_IMAGES[c + pieceLetter];
  if (!src) return escapeHtml(san);
  return `<img src="${escapeHtml(src)}" class="move-piece-icon" alt="${escapeHtml(pieceLetter)}" aria-hidden="true">${escapeHtml(rest)}`;
}

/**
 * Render a single clickable move span.
 */
function renderMoveSan(node) {
  const isCurrent = node.id === state.currentNode.id;
  const isNewAnn = node.annotation && _newlyAnnotatedNodeIds.has(node.id);
  const ann = node.annotation ? `<span class="move-annotation${isNewAnn ? ' ann-pop' : ''}" data-ann="${escapeHtml(node.annotation)}">${escapeHtml(node.annotation)}</span>` : '';
  const posAnn = node.posAnnotation ? `<span class="pos-annotation" data-pos="${escapeHtml(node.posAnnotation)}">${escapeHtml(node.posAnnotation)}</span>` : '';
  const bubble = (node.comment || (node.qa && node.qa.length > 0)) ? `<span class="move-comment-bubble" title="Has comment"><img src="./images/speech-bubble.png" class="move-comment-bubble-img" alt="comment"></span>` : '';
  const loadingRing = node.id === state.analyzingNodeId ? `<span class="move-loading-ring"></span>` : '';
  const result = node.gameResult ? `<span class="game-result">${escapeHtml(node.gameResult)}</span>` : '';
  return `<span class="move-san${isCurrent ? ' current' : ''}" data-node-id="${node.id}">${sanToFigurine(node.move.san, node.move.color)}${ann}${posAnn}${bubble}${loadingRing}</span>${result}`;
}

/**
 * Extract the data-node-id value from a rendered move HTML string.
 */
function extractNodeId(html) {
  const m = html.match(/data-node-id="(\d+)"/);
  return m ? m[1] : null;
}

/**
 * Convert a row object to a <tr> HTML string.
 * Row shape: { numStr, whiteHtml, blackHtml, openParen?, closeParen?, isVariation? }
 */
function rowToHtml(row) {
  const openP = row.openParen ? `<span class="var-paren">${'('.repeat(row.openParen)}</span>` : '';
  const closeP = row.closeParen ? `<span class="var-paren">${')'.repeat(row.closeParen)}</span>` : '';
  const trClass = row.isVariation ? ' class="variation-row"' : '';

  const wHtml = row.whiteHtml || '';
  const bHtml = row.blackHtml || '';

  const wId = extractNodeId(wHtml);
  const bId = extractNodeId(bHtml);

  // Close paren attaches to the rightmost non-empty cell
  let wCell, bCell;
  if (bHtml) {
    wCell = `<td class="move-cell"${wId ? ` data-node-id="${wId}"` : ''}>${wHtml}</td>`;
    bCell = `<td class="move-cell"${bId ? ` data-node-id="${bId}"` : ''}>${bHtml}${closeP}</td>`;
  } else {
    wCell = `<td class="move-cell"${wId ? ` data-node-id="${wId}"` : ''}>${wHtml}${closeP}</td>`;
    bCell = `<td class="move-cell"></td>`;
  }

  return `<tr${trClass}><td class="move-num-cell">${openP}${row.numStr}</td>${wCell}${bCell}</tr>`;
}

/**
 * Build table rows for the main line starting from parentNode's children.
 */
function buildMainRows(parentNode) {
  const rows = [];
  let current = parentNode;

  while (current.children.length > 0) {
    const main = current.children[0];
    const variations = current.children.slice(1);
    const { color, moveNumber } = main.move;

    if (color === 'w') {
      let blackHtml = '';
      let blackVariations = [];

      if (main.children.length > 0 && main.children[0].move.color === 'b') {
        const blackMain = main.children[0];
        blackHtml = renderMoveSan(blackMain);
        blackVariations = main.children.slice(1);
        current = blackMain;
      } else {
        current = main;
      }

      rows.push({ numStr: `${moveNumber}.`, whiteHtml: renderMoveSan(main), blackHtml });

      for (const varNode of variations) {
        rows.push(...buildVariationRows(varNode));
      }
      for (const varNode of blackVariations) {
        rows.push(...buildVariationRows(varNode));
      }
    } else {
      rows.push({ numStr: `${moveNumber}\u2026`, whiteHtml: '', blackHtml: renderMoveSan(main) });

      for (const varNode of variations) {
        rows.push(...buildVariationRows(varNode));
      }
      current = main;
    }
  }

  return rows;
}

/**
 * Build table rows for a variation starting at startNode.
 * All rows get isVariation=true; first gets openParen, last gets closeParen.
 */
function buildVariationRows(startNode) {
  const rows = [];
  const { color, moveNumber } = startNode.move;

  if (color === 'w') {
    let blackHtml = '';
    let blackVariations = [];
    let continuationNode = startNode;

    if (startNode.children.length > 0 && startNode.children[0].move.color === 'b') {
      const blackMain = startNode.children[0];
      blackHtml = renderMoveSan(blackMain);
      blackVariations = startNode.children.slice(1);
      continuationNode = blackMain;
    }

    rows.push({ numStr: `${moveNumber}.`, whiteHtml: renderMoveSan(startNode), blackHtml, isVariation: true });

    for (const varNode of blackVariations) {
      rows.push(...buildVariationRows(varNode));
    }

    rows.push(...buildMainRows(continuationNode).map(r => ({ ...r, isVariation: true })));
  } else {
    rows.push({ numStr: `${moveNumber}\u2026`, whiteHtml: '', blackHtml: renderMoveSan(startNode), isVariation: true });
    rows.push(...buildMainRows(startNode).map(r => ({ ...r, isVariation: true })));
  }

  if (rows.length > 0) {
    rows[0] = { ...rows[0], openParen: (rows[0].openParen || 0) + 1 };
    rows[rows.length - 1] = { ...rows[rows.length - 1], closeParen: (rows[rows.length - 1].closeParen || 0) + 1 };
  }

  return rows;
}

// Scroll the panel containing listEl so the .move-san.current element is visible.
// Finds the actual scrollable ancestor at runtime so it works on both desktop and mobile,
// where the scroll container differs (.move-history vs .card-move-history).
// Walk up from listEl to find the actual scrollable ancestor (differs between
// desktop .move-history and mobile .card-move-history).
function findScrollContainer(listEl) {
  let container = listEl;
  while (container && container !== document.body) {
    const oy = window.getComputedStyle(container).overflowY;
    if (oy === 'auto' || oy === 'scroll') break;
    container = container.parentElement;
  }
  return (!container || container === document.body) ? null : container;
}

function scrollCurrentMoveIntoView(listEl) {
  const currentEl = listEl.querySelector('.move-san.current');
  if (!currentEl) return;

  const container = findScrollContainer(listEl);
  if (!container) return;

  const cRect = container.getBoundingClientRect();
  const mRect = currentEl.getBoundingClientRect();
  if (mRect.top < cRect.top) {
    container.scrollTop += mRect.top - cRect.top;
  } else if (mRect.bottom > cRect.bottom) {
    container.scrollTop += mRect.bottom - cRect.bottom;
  }
}

function updateMoveHistory() {
  const el = document.getElementById('move-history');
  const agBtn = document.getElementById('btn-analyze-game');

  if (state.root.children.length === 0) {
    el.innerHTML = '<span class="move-empty">No moves yet.</span>';
    if (agBtn && !agBtn.dataset.analysisRunning) {
      agBtn.disabled = true;
      agBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,12 5,8 8,10 11,5 14,7"/><circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg> Analyze game`;
    }
    return;
  }

  // Enable the analyze-game button when there are moves (unless live analysis is currently running)
  if (agBtn && !agBtn.dataset.analysisRunning) agBtn.disabled = false;

  // While a full-game analysis is running, moves get annotated in rapid
  // succession. Re-rendering would reset the user's scroll position (innerHTML
  // wipe + scrollCurrentMoveIntoView jump), so capture it here and restore it
  // below instead of auto-scrolling.
  const analysisRunning = !!(agBtn && agBtn.dataset.analysisRunning);
  const scrollContainer = analysisRunning ? findScrollContainer(el) : null;
  const savedScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

  const rows = buildMainRows(state.root);
  const html = rows.map(rowToHtml).join('');
  el.innerHTML = rows.length === 0
    ? '<span class="move-empty">No moves yet.</span>'
    : `<table class="move-table"><tbody>${html}</tbody></table>`;
  // Clear immediately after render so the next render doesn't re-add ann-pop to the same
  // nodes (which restarts the animation and causes the visible flicker during analysis).
  _newlyAnnotatedNodeIds.clear();

  // Attach click and right-click handlers to move cells (whole cell is the hit target)
  el.querySelectorAll('td.move-cell[data-node-id]').forEach(td => {
    const nodeId = parseInt(td.dataset.nodeId, 10);
    td.addEventListener('click', () => {
      const node = findNodeById(state.root, nodeId);
      if (node) navigateTo(node);
      hidePreview();
    });
    td.addEventListener('mouseenter', (e) => {
      const node = findNodeById(state.root, nodeId);
      if (node) showPreview(node.fen, e.clientX, e.clientY, el);
    });
    td.addEventListener('mousemove', (e) => {
      updatePreviewPosition(e.clientX, e.clientY, el);
    });
    td.addEventListener('mouseleave', hidePreview);
    td.addEventListener('contextmenu', (e) => showContextMenu(e, nodeId));
  });

  if (scrollContainer) {
    scrollContainer.scrollTop = savedScrollTop;
  } else {
    scrollCurrentMoveIntoView(el);
  }
  updateAnnToolbar();
}

function updateAnnToolbar() {
  const node = state.currentNode;
  const hasMove = node && node.move;
  const isLeaf = hasMove && node.children.length === 0;
  document.querySelectorAll('.ann-tb-move').forEach(btn => {
    btn.classList.toggle('ann-tb-active', hasMove && node.annotation === btn.dataset.ann);
    btn.disabled = !hasMove;
  });
  document.querySelectorAll('.ann-tb-pos').forEach(btn => {
    btn.classList.toggle('ann-tb-active', hasMove && node.posAnnotation === btn.dataset.pos);
    btn.disabled = !hasMove;
  });
  document.querySelectorAll('.ann-tb-result').forEach(btn => {
    btn.classList.toggle('ann-tb-active', isLeaf && node.gameResult === btn.dataset.result);
    btn.disabled = !isLeaf;
  });
}

// ---------------------------------------------------------------------------
// Evaluation bar
// ---------------------------------------------------------------------------
// Tween state for the displayed eval number so it glides between readings
// instead of snapping each time a deeper search reports a new score.
let _evalScoreTween = { raf: null, current: 0 };

function _fmtEvalCp(cp) {
  const pawns = cp / 100;
  return (pawns > 0 ? '+' : '') + pawns.toFixed(2);
}

function _evalScoreEls() {
  return [
    document.getElementById('eval-score'),
    document.getElementById('mobile-eval-display'),
    document.getElementById('mob-eval-score'),
  ].filter(Boolean);
}

function animateEvalScore(targetCp, display, immediate) {
  const els = _evalScoreEls();
  if (_evalScoreTween.raf) { cancelAnimationFrame(_evalScoreTween.raf); _evalScoreTween.raf = null; }

  // Mate scores (and an immediate reset) skip the tween — there is no
  // meaningful in-between value to count through.
  const isMate = typeof display === 'string' && /M/i.test(display);
  if (immediate || isMate) {
    _evalScoreTween.current = Number.isFinite(targetCp) ? targetCp : 0;
    els.forEach(el => { el.textContent = display; });
    return;
  }

  const from = _evalScoreTween.current;
  const to = Number.isFinite(targetCp) ? targetCp : 0;
  if (Math.abs(to - from) < 1) {           // already there — just snap text
    _evalScoreTween.current = to;
    els.forEach(el => { el.textContent = display; });
    return;
  }

  const start = performance.now();
  const DUR = 420;
  const step = (now) => {
    const t = Math.min(1, (now - start) / DUR);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    if (t < 1) {
      const val = from + (to - from) * eased;
      _evalScoreTween.current = val;
      const txt = _fmtEvalCp(val);
      els.forEach(el => { el.textContent = txt; });
      _evalScoreTween.raf = requestAnimationFrame(step);
    } else {
      _evalScoreTween.current = to;
      els.forEach(el => { el.textContent = display; }); // land on server's exact text
      _evalScoreTween.raf = null;
    }
  };
  _evalScoreTween.raf = requestAnimationFrame(step);
}

function updateEvalBar(numericScore, display, immediate) {
  if (!state.evalVisible) return;

  const barWhite = document.getElementById('eval-bar-white');
  const barBlack = document.getElementById('eval-bar-black');

  const MAX_CP = 800;
  const clamped = Math.max(-MAX_CP, Math.min(MAX_CP, numericScore));
  const whitePct = Math.round((clamped + MAX_CP) / (2 * MAX_CP) * 100);
  const blackPct = 100 - whitePct;

  barWhite.style.flexGrow = whitePct;
  barBlack.style.flexGrow = blackPct;

  animateEvalScore(numericScore, display, immediate);

  const mobScore = document.getElementById('mob-eval-score');
  if (mobScore) {
    mobScore.classList.remove('lead-white', 'lead-black', 'lead-even');
    mobScore.classList.add(clamped > 35 ? 'lead-white' : clamped < -35 ? 'lead-black' : 'lead-even');
  }
}

function resetEvalBar() {
  updateEvalBar(0, '0.00', true);  // immediate — position changed, don't count down to 0
  clearTopMove();
}

// ---------------------------------------------------------------------------
// Material balance
// ---------------------------------------------------------------------------
function computeMaterialBalance(fen) {
  const VAL   = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const START = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const cnt   = { w: {p:0,n:0,b:0,r:0,q:0}, b: {p:0,n:0,b:0,r:0,q:0} };

  for (const ch of fen.split(' ')[0]) {
    const lo = ch.toLowerCase();
    if (VAL[lo]) cnt[ch === lo ? 'b' : 'w'][lo]++;
  }

  const capturedByBlack = [];
  const capturedByWhite = [];
  let wScore = 0, bScore = 0;

  for (const [t, val] of Object.entries(VAL)) {
    wScore += cnt.w[t] * val;
    bScore += cnt.b[t] * val;
    const diff = (START[t] - cnt.w[t]) - (START[t] - cnt.b[t]);
    if (diff > 0) for (let i = 0; i < diff; i++) capturedByBlack.push({ code: 'w' + t.toUpperCase(), val });
    else if (diff < 0) for (let i = 0; i < -diff; i++) capturedByWhite.push({ code: 'b' + t.toUpperCase(), val });
  }

  const byVal = (a, b) => b.val - a.val;
  return {
    capturedByBlack: capturedByBlack.sort(byVal),
    capturedByWhite: capturedByWhite.sort(byVal),
    net: wScore - bScore,
  };
}

function renderMaterialBars(topId, botId, fen, orientation) {
  const topEl = document.getElementById(topId);
  const botEl = document.getElementById(botId);
  if (!topEl || !botEl) return;

  const { capturedByBlack, capturedByWhite, net } = computeMaterialBalance(fen);
  const flipped = orientation === 'black';

  const topPieces = flipped ? capturedByWhite : capturedByBlack;
  const botPieces = flipped ? capturedByBlack : capturedByWhite;
  const topAdv    = flipped ? Math.max(0, net)  : Math.max(0, -net);
  const botAdv    = flipped ? Math.max(0, -net) : Math.max(0, net);

  topEl.innerHTML = _matBarHTML(topPieces, topAdv);
  botEl.innerHTML = _matBarHTML(botPieces, botAdv);
}

function _matBarHTML(pieces, adv) {
  // Build groups of consecutive same-type pieces for stacking
  const groups = [];
  for (const { code } of pieces) {
    if (groups.length && groups[groups.length - 1].code === code) {
      groups[groups.length - 1].count++;
    } else {
      groups.push({ code, count: 1 });
    }
  }

  let html = '';
  for (const { code, count } of groups) {
    const src = PIECE_IMAGES[code] || '';
    const cls = 'mb-piece' + (code[0] === 'b' ? ' mb-piece--dark' : '');
    html += '<span class="mb-group">';
    for (let i = 0; i < count; i++) {
      html += `<img class="${cls}" src="${src}" alt="" aria-hidden="true">`;
    }
    html += '</span>';
  }

  if (adv > 0) html += `<span class="mb-score">+${adv}</span>`;
  return html;
}

function updateTopMove(uciMove) {
  const chip = document.getElementById('top-move-chip');
  const sanEl = document.getElementById('top-move-san');
  if (!chip || !sanEl) return;
  const tmp = new Chess(state.game.fen());
  const from = uciMove.slice(0, 2);
  const to   = uciMove.slice(2, 4);
  const promotion = uciMove.length === 5 ? uciMove[4] : undefined;
  const result = tmp.move({ from, to, promotion });
  if (!result) return;
  sanEl.textContent = result.san;
  chip.classList.add('active');

  // Hover preview
  const previewFen = tmp.fen();
  chip.onmouseenter = (e) => showPreview(previewFen, e.clientX, e.clientY);
  chip.onmousemove = (e) => updatePreviewPosition(e.clientX, e.clientY);
  chip.onmouseleave = hidePreview;
}

function clearTopMove() {
  const chip = document.getElementById('top-move-chip');
  if (chip) chip.classList.remove('active');
}

// ---------------------------------------------------------------------------
// Stockfish top lines tool (Comments panel)
// ---------------------------------------------------------------------------
function setStockfishLinesEnabled(enabled) {
  const tool = document.getElementById('stockfish-lines-tool');
  const hint = document.getElementById('stockfish-lines-hint');
  if (!tool) return;
  tool.classList.toggle('is-disabled', !enabled);
  if (hint) hint.textContent = enabled ? 'Depth —' : 'Disabled';
}

function _formatStockfishLineScore(tm, sideToMove) {
  if (!tm) return '';
  if (tm.mate !== null && tm.mate !== undefined) {
    const mateFromWhite = sideToMove === 'b' ? -tm.mate : tm.mate;
    const n = Math.abs(tm.mate);
    return mateFromWhite >= 0 ? `M${n}` : `-M${n}`;
  }
  if (tm.score !== null && tm.score !== undefined) {
    const cpFromWhite = sideToMove === 'b' ? -tm.score : tm.score;
    const pawns = (cpFromWhite / 100).toFixed(2);
    return cpFromWhite >= 0 ? `+${pawns}` : `${pawns}`;
  }
  return '?';
}

function _pvUciToSanMoves(fen, pvUci) {
  const tmp = new Chess(fen);
  const sanMoves = [];
  for (const uci of (pvUci || [])) {
    if (!uci || uci.length < 4) break;
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length === 5 ? uci[4] : undefined;
    const mv = tmp.move({ from, to, promotion });
    if (!mv) break;
    sanMoves.push(mv.san);
  }
  return sanMoves;
}


let _sfRafId = null;
let _sfPendingArgs = null;

function queueStockfishRender(topMoves, sideToMove, depth) {
  _sfPendingArgs = [topMoves, sideToMove, depth];
  if (_sfRafId) return;
  _sfRafId = requestAnimationFrame(() => {
    _sfRafId = null;
    if (_sfPendingArgs) { renderStockfishLines(..._sfPendingArgs); _sfPendingArgs = null; }
  });
}

function _ensureSfRows(body) {
  // Remove any non-row content (e.g. the initial "Waiting for evaluation…" static div)
  for (let i = body.children.length - 1; i >= 0; i--) {
    if (!body.children[i].classList.contains('stockfish-line')) {
      body.removeChild(body.children[i]);
    }
  }
  while (body.children.length < 3) {
    const row = document.createElement('div');
    row.className = 'stockfish-line';
    const score = document.createElement('span');
    score.className = 'stockfish-line-score';
    const moves = document.createElement('span');
    moves.className = 'stockfish-line-moves';
    row.appendChild(score);
    row.appendChild(moves);
    body.appendChild(row);
  }
}

function markStockfishLinesStale() {
  if (_sfRafId) { cancelAnimationFrame(_sfRafId); _sfRafId = null; }
  _sfPendingArgs = null;
  const body = document.getElementById('stockfish-lines-body');
  if (!body) return;
  _ensureSfRows(body);
  for (const row of body.children) {
    row.classList.remove('stockfish-line--ready', 'stockfish-line--skeleton', 'stockfish-line--placeholder');
    row.classList.add('stockfish-line--stale');
  }
  const mobLabel = document.getElementById('mob-engine-label');
  if (mobLabel) mobLabel.textContent = 'Engine evaluating…';
  const mobDepth = document.getElementById('mob-engine-depth');
  if (mobDepth) mobDepth.textContent = '';
  const mobLines = document.getElementById('mob-engine-lines');
  if (mobLines) mobLines.innerHTML = '';
}

function renderStockfishLines(topMoves, sideToMove, depth) {
  const body = document.getElementById('stockfish-lines-body');
  if (!body) return;
  const hint = document.getElementById('stockfish-lines-hint');
  if (hint && state.evalVisible) hint.textContent = `Depth ${Number.isFinite(depth) ? depth : '—'}`;

  const anchorId = state.currentNode && typeof state.currentNode.id === 'number'
    ? state.currentNode.id : null;

  _ensureSfRows(body);
  const fen = state.game.fen();
  const side = sideToMove || state.game.turn();

  const lines = Array.isArray(topMoves) ? topMoves.slice(0, 3) : [];
  const MIN_DEPTH = 1;
  const depthOk = Number.isFinite(depth) && depth >= MIN_DEPTH;
  // Ready when at least 1 valid line exists; fewer than 3 lines is fine (forced positions).
  const linesOk = lines.length >= 1 && lines.every(tm => tm && Array.isArray(tm.pv) && tm.pv.length > 0);
  const ready = state.evalVisible && anchorId !== null && depthOk && linesOk;

  // How many moves the position actually has. Slots beyond this count can never
  // be filled, so they stay blank; slots within it but not yet returned by the
  // engine show a shimmering skeleton — the panel always reads as "3 lines
  // loading" rather than visibly popping from 1 → 2 → 3 lines as depth climbs.
  let legalCount = 3;
  try { legalCount = state.game.moves().length; } catch (_) {}

  for (let i = 0; i < 3; i++) {
    const row = body.children[i];
    const scoreEl = row.querySelector('.stockfish-line-score');
    const movesEl = row.querySelector('.stockfish-line-moves');

    row.classList.remove('stockfish-line--stale', 'stockfish-line--ready');

    if (!state.evalVisible) {
      row.classList.remove('stockfish-line--skeleton', 'stockfish-line--placeholder');
      delete row.dataset.sfMovesSig;
      scoreEl.textContent = i === 0 ? '—' : '';
      movesEl.textContent = i === 0 ? 'Enable eval bar to see lines.' : '';
      continue;
    }

    const tm = (ready && i < lines.length) ? lines[i] : null;

    if (!tm) {
      // No line for this slot yet: shimmer while the engine is still resolving a
      // move that exists, blank spacer only when the position has fewer moves.
      delete row.dataset.sfMovesSig;
      row.classList.toggle('stockfish-line--skeleton', i < legalCount);
      row.classList.toggle('stockfish-line--placeholder', i < legalCount);
      scoreEl.textContent = '';
      movesEl.textContent = '';
      continue;
    }

    // Real line for this slot. The score updates live every reading, but the
    // move list is only rebuilt when the actual moves change — so a deepening
    // search that keeps recommending the same line never flickers.
    row.classList.remove('stockfish-line--skeleton', 'stockfish-line--placeholder');
    scoreEl.textContent = _formatStockfishLineScore(tm, side);

    const sanMoves = _pvUciToSanMoves(fen, tm.pv);
    const movesSig = side + '|' + sanMoves.join(' ');
    if (row.dataset.sfMovesSig === movesSig) continue;  // identical — leave DOM untouched

    row.dataset.sfMovesSig = movesSig;

    movesEl.innerHTML = '';
    if (sanMoves.length === 0) {
      movesEl.textContent = '…';
    } else {
      sanMoves.forEach((san, idx) => {
        if (idx > 0) movesEl.appendChild(document.createTextNode(' '));
        const span = document.createElement('span');
        span.className = 'variation-move';
        span.textContent = san;
        const prefix = sanMoves.slice(0, idx + 1);
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          playVariationFromNode(anchorId, prefix, { fallbackToAnchor: false });
          hidePreview();
        });
        span.addEventListener('mouseenter', (e) => {
          const previewFen = getFenAfterMoves(fen, prefix);
          showPreview(previewFen, e.clientX, e.clientY);
        });
        span.addEventListener('mousemove', (e) => updatePreviewPosition(e.clientX, e.clientY));
        span.addEventListener('mouseleave', hidePreview);
        movesEl.appendChild(span);
      });
    }

    // Crossfade the new moves in so a changed line glides rather than snaps.
    movesEl.classList.remove('sf-moves-in');
    void movesEl.offsetWidth;   // restart the animation
    movesEl.classList.add('sf-moves-in');
  }

  // Mobile engine bar — collapsed header shows a plain "Engine evaluation"
  // label; the expanded body shows the full evaluation (up to 3 lines).
  const mobLabel = document.getElementById('mob-engine-label');
  const mobDepth = document.getElementById('mob-engine-depth');
  const mobLines = document.getElementById('mob-engine-lines');
  if (mobDepth) mobDepth.textContent = (ready && depthOk) ? `Depth ${depth}` : '';
  if (mobLabel) {
    mobLabel.textContent = !state.evalVisible ? 'Engine hidden, tap to reveal'
      : !ready ? 'Engine evaluating…'
      : 'Engine evaluation';
  }
  if (mobLines) {
    mobLines.innerHTML = '';
    if (ready) {
      lines.forEach((tm) => {
        if (!tm || !Array.isArray(tm.pv) || tm.pv.length === 0) return;
        const sanMoves = _pvUciToSanMoves(fen, tm.pv);
        if (sanMoves.length === 0) return;
        const row = document.createElement('div');
        row.className = 'mob-engine-line-row';
        const score = document.createElement('span');
        score.className = 'mob-engine-line-score';
        score.textContent = _formatStockfishLineScore(tm, side);
        const moves = document.createElement('span');
        moves.className = 'mob-engine-line-moves';
        _appendClickableSanMoves(moves, sanMoves, anchorId);
        row.appendChild(score);
        row.appendChild(moves);
        mobLines.appendChild(row);
      });
    }
  }
}

// Build clickable SAN move spans into a container (mobile engine bar).
// Each move plays the variation up to that point from the given anchor node.
function _appendClickableSanMoves(container, sanMoves, anchorId) {
  sanMoves.forEach((san, idx) => {
    if (idx > 0) container.appendChild(document.createTextNode(' '));
    const span = document.createElement('span');
    span.className = 'variation-move';
    span.textContent = san;
    const prefix = sanMoves.slice(0, idx + 1);
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      playVariationFromNode(anchorId, prefix, { fallbackToAnchor: false });
      hidePreview();
    });
    container.appendChild(span);
  });
}

function toggleEvalBar() {
  const checkbox = document.getElementById('eval-toggle-input');
  setEvalVisible(checkbox.checked);
}

// Single source of truth for engine-eval visibility. Keeps the desktop toggle
// switch and the mobile eye button in sync, persists the choice, and starts /
// stops the engine accordingly.
function setEvalVisible(visible) {
  state.evalVisible = !!visible;
  try { localStorage.setItem('eval-visible', state.evalVisible ? 'true' : 'false'); } catch (_) {}

  const checkbox = document.getElementById('eval-toggle-input');
  if (checkbox) checkbox.checked = state.evalVisible;

  document.getElementById('eval-bar-wrap').classList.toggle('hidden', !state.evalVisible);

  const bar = document.getElementById('mobile-engine-bar');
  if (bar) bar.classList.toggle('engine-hidden', !state.evalVisible);
  const eye = document.getElementById('mob-engine-eye');
  if (eye) {
    eye.setAttribute('aria-pressed', state.evalVisible ? 'false' : 'true');
    eye.setAttribute('aria-label', state.evalVisible ? 'Hide engine evaluation' : 'Show engine evaluation');
  }
  const mobLabel = document.getElementById('mob-engine-label');
  if (mobLabel && !state.evalVisible) mobLabel.textContent = 'Engine hidden, tap to reveal';

  if (state.evalVisible) {
    scheduleEvalUpdate();
  } else {
    clearTopMove();
    clearHighlights();
  }
  setStockfishLinesEnabled(state.evalVisible);
  if (!state.evalVisible) renderStockfishLines([], state.game.turn(), 0);
}

// ---------------------------------------------------------------------------
// Arrow for suggested move
// ---------------------------------------------------------------------------
function highlightMove(uciMove) {
  if (!uciMove || uciMove.length < 4) {
    clearHighlights();
    return;
  }
  state.suggestedMoveArrow = { from: uciMove.slice(0, 2), to: uciMove.slice(2, 4) };
  renderBoardDrawings();
}

function clearHighlights() {
  if (!state.suggestedMoveArrow) return;
  state.suggestedMoveArrow = null;
  renderBoardDrawings();
}

// ---------------------------------------------------------------------------
// Board drawing (arrows + square highlights via SVG overlay)
// ---------------------------------------------------------------------------
const ARROW_STYLE = {
  green:  { fill: 'rgba(16,185,129,0.86)',  stroke: 'rgba(16,185,129,0.25)',  glow: 'rgba(16,185,129,0.55)'  },
  yellow: { fill: 'rgba(245,158,11,0.86)',  stroke: 'rgba(245,158,11,0.25)',  glow: 'rgba(245,158,11,0.55)'  },
  red:    { fill: 'rgba(239,68,68,0.86)',   stroke: 'rgba(239,68,68,0.25)',   glow: 'rgba(239,68,68,0.55)'   },
};

function squareCenter(sq) {
  const file = sq.charCodeAt(0) - 97; // 0-7
  const rank = parseInt(sq[1]) - 1;   // 0-7
  const flipped = state.orientation === 'black';
  const x = flipped ? (7 - file + 0.5) : (file + 0.5);
  const y = flipped ? (rank + 0.5) : (7 - rank + 0.5);
  return { x, y };
}

function makeArrowPoints(x1, y1, x2, y2) {
  const headLen  = 0.34;   // length of arrowhead triangle
  const shaftW   = 0.095;  // shaft half-width (rectangular body)
  const headW    = 0.265;  // arrowhead half-width at base
  const startOff = 0.36;   // gap from source-square centre to shaft start

  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return null;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux; // perpendicular unit vector

  const sx = x1 + ux * startOff, sy = y1 + uy * startOff; // shaft start
  const hx = x2 - ux * headLen,  hy = y2 - uy * headLen;  // head base

  // 7-point polygon: rectangular shaft + triangular head
  return [
    [sx + px * shaftW,  sy + py * shaftW],  // shaft start, top
    [hx + px * shaftW,  hy + py * shaftW],  // shaft end, top
    [hx + px * headW,   hy + py * headW ],  // head wing, top
    [x2, y2],                                // tip
    [hx - px * headW,   hy - py * headW ],  // head wing, bottom
    [hx - px * shaftW,  hy - py * shaftW],  // shaft end, bottom
    [sx - px * shaftW,  sy - py * shaftW],  // shaft start, bottom
  ].map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join(' ');
}

// Build per-color SVG glow filters and inject into defs
function buildArrowDefs(NS) {
  const defs = document.createElementNS(NS, 'defs');

  for (const [colorKey] of Object.entries(ARROW_STYLE)) {
    // Outer glow filter (blur + merge with source)
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', `af-${colorKey}`);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const blur = document.createElementNS(NS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '0.09');
    blur.setAttribute('result', 'blurred');

    const merge = document.createElementNS(NS, 'feMerge');
    const n1 = document.createElementNS(NS, 'feMergeNode'); n1.setAttribute('in', 'blurred');
    const n2 = document.createElementNS(NS, 'feMergeNode'); n2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(n1); merge.appendChild(n2);

    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);
  }

  return defs;
}

// Render a single arrow onto svg
function drawArrowElement(svg, NS, fromSq, toSq, colorKey, isPreview) {
  const c1 = squareCenter(fromSq);
  const c2 = squareCenter(toSq);
  const pts = makeArrowPoints(c1.x, c1.y, c2.x, c2.y);
  if (!pts) return;

  const style = ARROW_STYLE[colorKey] || ARROW_STYLE.green;

  const poly = document.createElementNS(NS, 'polygon');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill', style.fill);
  poly.setAttribute('stroke', 'rgba(255,255,255,0.22)');
  poly.setAttribute('stroke-width', '0.018');
  poly.setAttribute('stroke-linejoin', 'round');
  poly.setAttribute('filter', `url(#af-${colorKey})`);

  if (isPreview) {
    poly.setAttribute('opacity', '0.72');
    poly.classList.add('arrow-preview');

    // Glowing dot pulsing at the arrowhead tip
    const tip = document.createElementNS(NS, 'circle');
    tip.setAttribute('cx', c2.x);
    tip.setAttribute('cy', c2.y);
    tip.setAttribute('r', '0.14');
    tip.setAttribute('fill', style.fill);
    tip.setAttribute('filter', `url(#af-${colorKey})`);
    tip.classList.add('arrow-preview-tip');
    svg.appendChild(poly);
    svg.appendChild(tip);
  } else {
    svg.appendChild(poly);
  }
}

// Apply user square-color highlights as CSS on board square divs.
// Done via inline style so the color appears under pieces (which are children of the square div).
// Must be called after every board.position() since chessboard.js re-renders clear inline styles.
function applySquareColorHighlights(node) {
  $('[data-square]').css({ 'background-color': '', 'box-shadow': '' });
  if (!node) return;
  for (const [sq, color] of Object.entries(node.squareColors || {})) {
    const style = ARROW_STYLE[color] || ARROW_STYLE.green;
    const fill = style.fill.replace('0.86', '0.50');
    const glow = style.glow;
    $(`[data-square="${sq}"]`).css({
      'background-color': fill,
      'box-shadow': `inset 0 0 0 3px ${glow}`,
    });
  }
}

function renderBoardDrawings() {
  const svg = document.getElementById('board-svg');
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const NS = 'http://www.w3.org/2000/svg';

  svg.appendChild(buildArrowDefs(NS));

  const node = state.currentNode;

  // Square highlights: applied as CSS on the square divs so they sit under pieces
  applySquareColorHighlights(node);

  if (node) {
    // Committed arrows
    for (const { from, to, color } of (node.arrows || [])) {
      drawArrowElement(svg, NS, from, to, color, false);
    }
  }

  // Suggested move arrow (from AI analysis)
  if (state.suggestedMoveArrow) {
    const { from, to } = state.suggestedMoveArrow;
    drawArrowElement(svg, NS, from, to, 'green', false);
  }

  // Live preview arrow (while right-dragging)
  if (state.arrowPreview && state.arrowPreview.from !== state.arrowPreview.to) {
    const { from, to, color } = state.arrowPreview;
    drawArrowElement(svg, NS, from, to, color, true);
  }

}

// ---------------------------------------------------------------------------
// Clickable variation moves in comments
// ---------------------------------------------------------------------------

// Regex matching a full move sequence that starts with a move number
// e.g. "1. e4 e5 2. Nf3 Nc6" or "12... Nf6"
const _MOVE_SEQ_RE = (function () {
  const san = `(?:O-O-O|O-O|[KQRBN][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|[a-h](?:x[a-h])?[1-8](?:=[QRBN])?)(?:[+#])?`;
  // Accept both "1..." and the single-character ellipsis "1…"
  const moveNum = `\\d+(?:\\.{1,3}|\\u2026)\\s*`;
  const optMoveNum = `(?:\\d+(?:\\.{1,3}|\\u2026)\\s*)?`;
  return new RegExp(`${moveNum}${san}(?:\\s+${optMoveNum}${san})*`, 'g');
})();

function _extractSanMoves(str) {
  const re = /O-O-O(?:[+#])?|O-O(?:[+#])?|[KQRBN][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?(?:[+#])?|[a-h](?:x[a-h])?[1-8](?:=[QRBN])?(?:[+#])?/g;
  return [...str.matchAll(re)].map(m => m[0]);
}

function _parseLeadingMoveNumber(seqStr) {
  // Returns { moveNumber: number, startsWithBlack: boolean } or null.
  // Examples:
  //  - "1. e4"      -> {1, false}
  //  - "1... Ke7"   -> {1, true}
  //  - "12… Nf6"    -> {12, true}
  const m = String(seqStr || '').match(/^\s*(\d+)\s*(\.{1,3}|\u2026)\s*/);
  if (!m) return null;
  const moveNumber = parseInt(m[1], 10);
  if (!Number.isFinite(moveNumber)) return null;
  const dots = m[2];
  const startsWithBlack = (dots === '...' || dots === '\u2026');
  return { moveNumber, startsWithBlack };
}

function _mainlineNodeAtPly(root, ply) {
  // ply is 0-based from the root position. Returns the node at that ply on the main line.
  let node = root;
  let remaining = Math.max(0, ply | 0);
  while (remaining > 0 && node && node.children && node.children.length > 0) {
    node = node.children[0];
    remaining--;
  }
  return node;
}

function _nodePly(node) {
  // Half-move ply from the FEN: 0 = initial position, 1 = after White's first move, etc.
  if (!node || !node.fen) return 0;
  const parts = node.fen.split(' ');
  const turn = parts[1];
  const moveNum = parseInt(parts[5], 10);
  if (!Number.isFinite(moveNum)) return 0;
  return 2 * (moveNum - 1) + (turn === 'b' ? 1 : 0);
}

function _resolveAnchorForSeq(seqStr, defaultAnchorId) {
  // Returns the node id that is the correct starting position for seqStr.
  // Parses the leading move number (e.g. "23. a4" → ply 44, "22... h6" → ply 43)
  // and finds the best matching node in the tree.
  const parsed = _parseLeadingMoveNumber(seqStr);
  if (!parsed) return defaultAnchorId;
  const targetPly = 2 * (parsed.moveNumber - 1) + (parsed.startsWithBlack ? 1 : 0);

  const defaultNode = findNodeById(state.root, defaultAnchorId);
  if (defaultNode && _nodePly(defaultNode) === targetPly) return defaultAnchorId;

  // Walk up the ancestor chain (handles sequences that start before the anchor)
  let cur = defaultNode ? defaultNode.parent : null;
  while (cur) {
    if (_nodePly(cur) === targetPly) return cur.id;
    cur = cur.parent;
  }

  // Fall back to the mainline node at that ply
  const mlNode = _mainlineNodeAtPly(state.root, targetPly);
  if (mlNode && _nodePly(mlNode) === targetPly) return mlNode.id;

  // Cannot resolve — return null so moves are rendered as plain text
  return null;
}

function _buildSeqFragment(seqStr, allMoves, anchorNodeId) {
  // Resolve the correct starting position based on the sequence's leading move number.
  let effectiveAnchorId = _resolveAnchorForSeq(seqStr, anchorNodeId);

  // Validate that every move in the sequence is actually legal from the anchor position.
  // If any move fails (e.g. only White's moves are listed, skipping Black's responses),
  // the position after each move cannot be reliably determined, so disable highlighting.
  if (effectiveAnchorId !== null && allMoves.length > 0) {
    const anchorNode = findNodeById(state.root, effectiveAnchorId);
    if (anchorNode) {
      const tmp = new Chess(anchorNode.fen);
      for (const san of allMoves) {
        if (!tmp.move(san)) { effectiveAnchorId = null; break; }
      }
    } else {
      effectiveAnchorId = null;
    }
  }

  const frag = document.createDocumentFragment();
  const sanRe = /O-O-O(?:[+#])?|O-O(?:[+#])?|[KQRBN][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?(?:[+#])?|[a-h](?:x[a-h])?[1-8](?:=[QRBN])?(?:[+#])?/g;
  let lastIdx = 0;
  let moveIdx = 0;
  let m;
  while ((m = sanRe.exec(seqStr)) !== null) {
    if (m.index > lastIdx) {
      frag.appendChild(document.createTextNode(seqStr.slice(lastIdx, m.index)));
    }
    const span = document.createElement('span');
    span.textContent = m[0];
    const movesToPlay = allMoves.slice(0, moveIdx + 1);
    if (effectiveAnchorId !== null) {
      span.className = 'variation-move';
      span.addEventListener('click', e => {
        e.stopPropagation();
        playVariationFromNode(effectiveAnchorId, movesToPlay);
        hidePreview();
      });
      span.addEventListener('mouseenter', e => {
        const startNode = findNodeById(state.root, effectiveAnchorId);
        if (startNode) {
          const previewFen = getFenAfterMoves(startNode.fen, movesToPlay);
          showPreview(previewFen, e.clientX, e.clientY);
        }
      });
      span.addEventListener('mousemove', e => {
        updatePreviewPosition(e.clientX, e.clientY);
      });
      span.addEventListener('mouseleave', hidePreview);
    }
    frag.appendChild(span);
    moveIdx++;
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < seqStr.length) {
    frag.appendChild(document.createTextNode(seqStr.slice(lastIdx)));
  }
  return frag;
}

function linkifyMovesInElement(el, anchorNodeId) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  for (const textNode of textNodes) {
    const text = textNode.textContent;
    _MOVE_SEQ_RE.lastIndex = 0;
    if (!_MOVE_SEQ_RE.test(text)) continue;
    _MOVE_SEQ_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    while ((match = _MOVE_SEQ_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const allMoves = _extractSanMoves(match[0]);
      if (allMoves.length === 0) {
        frag.appendChild(document.createTextNode(match[0]));
      } else {
        frag.appendChild(_buildSeqFragment(match[0], allMoves, anchorNodeId));
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode.replaceChild(frag, textNode);
  }
}

function playVariationFromNode(anchorNodeId, sanMoves, { fallbackToAnchor = true } = {}) {
  const anchorNode = findNodeById(state.root, anchorNodeId);
  if (!anchorNode) return;

  const prevNode = state.currentNode;
  state.currentNode = anchorNode;
  state.game.load(anchorNode.fen);

  for (const san of sanMoves) {
    const move = state.game.move(san);
    if (!move) {
      // Invalid move — restore original state
      state.currentNode = prevNode;
      state.game.load(prevNode.fen);
      return;
    }
    const uci = move.from + move.to + (move.promotion || '');
    addMoveToTree(move.san, uci);
  }

  navigateTo(state.currentNode, false);
  updateMoveHistory();

  // Fall back to showing the anchor node's analysis only if the destination has none
  // (disabled for Stockfish line clicks, where an empty panel is expected)
  const destNode = state.currentNode;
  const destHasAnalysis = destNode.comment || destNode.theme || (destNode.qa && destNode.qa.length > 0) || destNode.pendingQa;
  if (!destHasAnalysis && fallbackToAnchor) {
    if (anchorNode.comment || anchorNode.theme) {
      showComment(anchorNode.comment, anchorNode.theme, anchorNodeId, anchorNode.strategicContext || null);
    } else if (anchorNode.qa && anchorNode.qa.length > 0) {
      document.getElementById('analysis-result').classList.add('visible');
      renderQaThread(anchorNode.qa, null, anchorNodeId);
    }
  }
}

// ---------------------------------------------------------------------------
// Analysis result rendering
// ---------------------------------------------------------------------------
function clearAnalysis() {
  document.getElementById('analysis-result').classList.remove('visible');
  document.getElementById('explanation-text').innerHTML = '';
  document.getElementById('theme-badge').textContent = '';
  document.getElementById('theme-badge').style.display = 'none';
  document.getElementById('strategic-context').textContent = '';
  document.getElementById('strategic-context').style.display = 'none';
  document.getElementById('qa-thread').innerHTML = '';
  document.getElementById('analysis-card-title').textContent = 'Comments';
  const _empty = document.getElementById('analysis-empty');
  if (_empty) _empty.style.display = 'none';
  hideError('error-msg');
}

// Show a friendly placeholder when a game is loaded but the current move has no
// AI comment — e.g. a solid book move with no inaccuracy to flag — so the
// Comments panel never looks blank/broken. Mutually exclusive with the
// spinner, error, analysis result and onboarding welcome.
function updateCommentsEmptyState() {
  const emptyEl = document.getElementById('analysis-empty');
  if (!emptyEl) return;
  const titleEl = document.getElementById('analysis-empty-title');
  const descEl  = document.getElementById('analysis-empty-desc');

  const gameLoaded    = !!(state.root && state.root.children.length > 0);
  const node          = state.currentNode;
  const atRoot        = node === state.root;
  const resultVisible = document.getElementById('analysis-result').classList.contains('visible');
  const spinnerEl     = document.getElementById('spinner');
  const spinnerVisible = spinnerEl && spinnerEl.classList.contains('visible');
  const errEl         = document.getElementById('error-msg');
  const errVisible    = errEl && errEl.classList.contains('visible');

  if (!gameLoaded || atRoot || resultVisible || spinnerVisible || errVisible) {
    emptyEl.style.display = 'none';
    return;
  }

  const cls = node.classification;
  if (cls === 'correct' || cls === 'great') {
    if (titleEl) titleEl.textContent = 'Nothing to flag here';
    if (descEl)  descEl.textContent  = 'A solid move with no inaccuracy. Ask a question below to explore the position further.';
  } else if (cls) {
    if (titleEl) titleEl.textContent = 'No notes for this move';
    if (descEl)  descEl.textContent  = 'Ask a question below for a neural explanation of this position.';
  } else {
    if (titleEl) titleEl.textContent = 'No notes for this move yet';
    if (descEl)  descEl.textContent  = 'Run a full game review for move-by-move notes, or ask a question below.';
  }
  emptyEl.style.display = '';
}

function qaToMarkdown(qaItems) {
  return qaItems.map(({ question, answer }) => {
    const quoted = question.split('\n').map(l => '> ' + l).join('\n');
    return quoted + '\n\n' + answer;
  }).join('\n\n');
}

function renderQaThread(qaItems, pendingQuestion = null, anchorNodeId = null) {
  const thread = document.getElementById('qa-thread');
  thread.innerHTML = '';
  const anchorId = anchorNodeId ?? state.currentNode.id;
  for (const { question, answer } of qaItems) {
    const qaBlock = document.createElement('div');
    qaBlock.className = 'qa-block';
    qaBlock.innerHTML = `<p class="qa-question">${question.replace(/</g, '&lt;')}</p><div class="qa-answer">${DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(answer)))}</div>`;
    linkifyMovesInElement(qaBlock.querySelector('.qa-answer'), anchorId);
    thread.appendChild(qaBlock);
  }
  if (pendingQuestion !== null) {
    const qaBlock = document.createElement('div');
    qaBlock.className = 'qa-block';
    qaBlock.innerHTML = `<p class="qa-question">${pendingQuestion.replace(/</g, '&lt;')}</p><div class="qa-answer qa-answer--loading"><span class="qa-dots"><span></span><span></span><span></span></span><span class="qa-loading-msg"></span></div>`;
    thread.appendChild(qaBlock);
  }
}

function showComment(comment, theme, anchorNodeId = null, strategicContext = null) {
  const badge = document.getElementById('theme-badge');
  const titleEl = document.getElementById('analysis-card-title');
  badge.className = 'theme-badge';
  if (theme) {
    badge.textContent = theme;
    badge.style.display = 'block';
    titleEl.textContent = theme;
  } else {
    badge.style.display = 'none';
    titleEl.textContent = 'Analysis';
  }
  const explanationEl = document.getElementById('explanation-text');
  explanationEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(comment || '')));
  linkifyMovesInElement(explanationEl, anchorNodeId ?? state.currentNode.id);
  const ctxEl = document.getElementById('strategic-context');
  if (strategicContext) {
    ctxEl.textContent = strategicContext;
    ctxEl.style.display = 'block';
  } else {
    ctxEl.style.display = 'none';
  }
  document.getElementById('qa-thread').innerHTML = '';
  document.getElementById('analysis-result').classList.add('visible');
}

async function askQuestion() {
  const input = document.getElementById('question-input');
  const question = input.value.trim();
  if (!question) return;
  if (question.length > AI_MSG_MAX_LEN.ask) {
    showError('error-msg', 'Message too long');
    return;
  }
  hideError('error-msg');

  const askingNode = state.currentNode;
  const sendBtn = document.getElementById('btn-ask-question');

  input.value = '';
  input.blur();
  askingNode.pendingQa = question;
  document.getElementById('analysis-result').classList.add('visible');
  renderQaThread(askingNode.qa || [], question);
  const thread = document.getElementById('qa-thread');
  thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Show one random loading message for the entire duration. It is hidden only
  // while the "Analyzing <move>…" tool status is on screen (see showToolStatus).
  const loadingMsgEl = thread.lastElementChild?.querySelector('.qa-loading-msg');
  if (loadingMsgEl) loadingMsgEl.textContent = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  const loadingMsgInterval = null;

  sendBtn.disabled = true;
  const analyzeBtn = document.getElementById('btn-analyze');
  if (analyzeBtn) analyzeBtn.disabled = true;
  document.getElementById('btn-edit-comment').disabled = true;
  document.getElementById('btn-delete-comment').disabled = true;

  // References for in-place streaming updates on the pending bubble
  const pendingBlock = thread.lastElementChild;
  const answerEl = pendingBlock?.querySelector('.qa-answer');
  let streamingStarted = false;
  let streamAccumulated = ''; // full markdown text received from server so far

  // ── Typewriter queue ──────────────────────────────────────────────────────
  // Chunks may arrive in a burst and get processed in one synchronous JS turn,
  // leaving no gap for browser paints. The queue drains via rAF so every batch
  // of characters triggers exactly one paint, regardless of network timing.
  const TYPEWRITER_CHARS_PER_FRAME = 8;
  let typewriterChars = [];   // individual characters waiting to be displayed
  let typewriterShown = '';   // characters displayed so far
  let typewriterRaf   = null; // rAF handle, null when idle

  function cancelTypewriter() {
    if (typewriterRaf) { cancelAnimationFrame(typewriterRaf); typewriterRaf = null; }
    typewriterChars = [];
  }

  function drainTypewriter() {
    if (typewriterChars.length === 0) { typewriterRaf = null; return; }
    typewriterShown += typewriterChars.splice(0, TYPEWRITER_CHARS_PER_FRAME).join('');
    if (askingNode.id === state.currentNode.id && answerEl) {
      if (!streamingStarted) {
        startStreaming(typewriterShown);
      } else {
        renderStreaming(typewriterShown);
      }
      thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    typewriterRaf = requestAnimationFrame(drainTypewriter);
  }

  function enqueueText(text) {
    typewriterChars.push(...text);
    if (!typewriterRaf) typewriterRaf = requestAnimationFrame(drainTypewriter);
  }
  // ─────────────────────────────────────────────────────────────────────────

  const TOOL_LABELS = {
    validate_move: 'Checking move legality…',
    evaluate_position: 'Evaluating position…',
    get_attacks_on_square: 'Analyzing piece interactions…',
    get_top_line: 'Calculating best line…',
    get_structural_info: 'Analyzing structure…',
    get_opening_info: 'Looking up opening…',
  };

  function showToolStatus(tools, moves) {
    if (!answerEl || streamingStarted || !loadingMsgEl) return;
    // When a move-bound tool runs (at any position in the turn's tool batch)
    // REPLACE the random loading message with a move-annotated status:
    //   analyze_candidate_move → "Analyzing <move>…"
    //   get_position_at_move   → "Investigating position at <move>…"
    // For any other tool the random message stays unchanged.
    const acmIdx = tools.indexOf('analyze_candidate_move');
    const gpmIdx = tools.indexOf('get_position_at_move');
    if (acmIdx !== -1 && moves && moves[acmIdx]) {
      loadingMsgEl.textContent = `Analyzing ${moves[acmIdx]}…`;
    } else if (gpmIdx !== -1 && moves && moves[gpmIdx]) {
      loadingMsgEl.textContent = `Investigating position at ${moves[gpmIdx]}…`;
    }
  }

  function renderStreaming(text) {
    // Re-render full accumulated text as markdown on every rAF tick.
    // innerHTML replacement recreates child nodes, re-triggering the CSS
    // qa-stream-in fade on :last-child for a continuous materialisation effect.
    answerEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(text)));
  }

  function startStreaming(text) {
    if (!answerEl) return;
    clearInterval(loadingMsgInterval);
    streamingStarted = true;
    answerEl.classList.remove('qa-answer--loading');
    answerEl.classList.add('qa-answer--streaming');
    renderStreaming(text);
  }

  try {
    const payload = {
      fen: askingNode.fen,
      question,
      skillLevel: state.skillLevel,
      lastMoveSan: askingNode.move ? askingNode.move.san : null,
      existingAnalysis: askingNode.comment || null,
      uciMoves: getUciPathToNode(askingNode),
      history: askingNode.qa || [],
    };

    const response = await fetch('/api/ask/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    if (response.status === 403 || response.status === 429 || response.status === 503) {
      const errData = await response.json().catch(() => ({}));
      askingNode.pendingQa = null;
      if (askingNode.id === state.currentNode.id) {
        renderQaThread(askingNode.qa || []);
        if (errData.error === 'email_unverified') {
          showEmailUnverifiedError('error-msg');
        } else if (errData.error === 'limit_reached') {
          showUpgradeModal(errData);
        } else if (errData.error === 'global_limit') {
          showError('error-msg', 'Service temporarily unavailable. Please try again later.');
        } else {
          showError('error-msg', 'Too many requests. Please wait a moment and try again.');
        }
      }
      return;
    }

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

          if (evt.type === 'latency') {
            showTrafficNotice();

          } else if (evt.type === 'tool') {
            if (askingNode.id === state.currentNode.id) showToolStatus(evt.tools, evt.moves);

          } else if (evt.type === 'chunk') {
            streamAccumulated += evt.text;
            if (askingNode.id === state.currentNode.id) {
              enqueueText(evt.text);
            }

          } else if (evt.type === 'done') {
            const finalAnswer = evt.answer || streamAccumulated;
            askingNode.qa = askingNode.qa || [];
            askingNode.qa.push({ question, answer: finalAnswer });
            askingNode.pendingQa = null;
            // The Q&A thread is part of the game's comments — persist it like
            // any other comment edit or it vanishes on reload.
            markDirty();
            window._persistCommentChange?.();
            // Drain remaining queued chars first, then finalise when queue empties.
            const finalize = () => {
              if (askingNode.id === state.currentNode.id) {
                if (streamingStarted && answerEl) {
                  answerEl.classList.remove('qa-answer--streaming');
                  answerEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(finalAnswer)));
                  linkifyMovesInElement(answerEl, askingNode.id);
                } else {
                  renderQaThread(askingNode.qa);
                }
                thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            };
            if (typewriterChars.length > 0) {
              // Drain remaining chars frame-by-frame, then finalise.
              const waitAndFinalize = () => {
                if (typewriterChars.length === 0) { cancelTypewriter(); finalize(); return; }
                typewriterShown += typewriterChars.splice(0, TYPEWRITER_CHARS_PER_FRAME).join('');
                if (askingNode.id === state.currentNode.id && answerEl) {
                  renderStreaming(typewriterShown);
                  thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
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
            askingNode.pendingQa = null;
            if (askingNode.id === state.currentNode.id) {
              renderQaThread(askingNode.qa || []);
              showError('error-msg', evt.message || 'Unable to answer. Please try again.');
            }
            streamDone = true;
          }
        }
      }
    }

    // Stream ended before a done/error event (connection dropped mid-response)
    if (askingNode.pendingQa !== null) {
      cancelTypewriter();
      askingNode.pendingQa = null;
      if (askingNode.id === state.currentNode.id) renderQaThread(askingNode.qa || []);
    }
  } catch (err) {
    console.error('askQuestion stream failed:', err);
    cancelTypewriter();
    askingNode.pendingQa = null;
    if (askingNode.id === state.currentNode.id) {
      renderQaThread(askingNode.qa || []);
      showError('error-msg', 'Network error. Please check your connection and try again.');
    }
  } finally {
    clearInterval(loadingMsgInterval);
    sendBtn.disabled = false;
    const analyzeBtn = document.getElementById('btn-analyze');
    if (analyzeBtn) analyzeBtn.disabled = false;
    document.getElementById('btn-edit-comment').disabled = false;
    document.getElementById('btn-delete-comment').disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Opening Explorer panel
// ---------------------------------------------------------------------------
const _openingCache = new Map(); // nodeId → { data, ts }
const OPENING_CACHE_TTL_MS = 15 * 60 * 1000;

function _openingCacheGet(nodeId) {
  const e = _openingCache.get(nodeId);
  if (!e) return null;
  if (Date.now() - e.ts > OPENING_CACHE_TTL_MS) { _openingCache.delete(nodeId); return null; }
  return e.data;
}

function _openingCacheSet(nodeId, data) {
  if (_openingCache.size >= 300) _openingCache.delete(_openingCache.keys().next().value);
  _openingCache.set(nodeId, { data, ts: Date.now() });
}

function _fmtGames(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function _obShow(spinnerId, contentId, emptyId) {
  document.getElementById('ob-spinner').style.display  = spinnerId  ? '' : 'none';
  document.getElementById('ob-content').style.display  = contentId  ? '' : 'none';
  document.getElementById('ob-empty').style.display    = emptyId    ? '' : 'none';
}

function _renderOpeningData(data) {
  const hasOpening = data.opening && data.opening.name;
  const hasMoves   = Array.isArray(data.top_moves) && data.top_moves.length > 0;
  const hasGames   = Array.isArray(data.top_games) && data.top_games.length > 0;

  if (!hasOpening && !hasMoves && !hasGames) {
    _obShow(false, false, true);
    return;
  }

  // Opening name + ECO (reset expansion on every data change)
  const nameRow = document.getElementById('ob-name-row');
  nameRow.classList.remove('ob-name-row--expanded');
  if (hasOpening) {
    document.getElementById('ob-eco').textContent          = data.opening.eco;
    document.getElementById('ob-opening-name').textContent = data.opening.name;
    nameRow.style.display = '';
  } else {
    nameRow.style.display = 'none';
  }

  // Total game count
  const totalEl = document.getElementById('ob-total');
  if (data.total_games > 0) {
    totalEl.textContent = _fmtGames(data.total_games) + ' master games';
    totalEl.style.display = '';
  } else {
    totalEl.style.display = 'none';
  }

  // Section label
  const movesLabel = document.getElementById('ob-moves-label');
  if (movesLabel) movesLabel.style.display = hasMoves ? '' : 'none';

  // Move rows
  const movesEl = document.getElementById('ob-moves');
  movesEl.innerHTML = '';
  if (hasMoves) {
    data.top_moves.forEach(mv => {
      const row = document.createElement('div');
      row.className = 'ob-move-row';
      row.dataset.uci = mv.uci;

      const san      = escapeHtml(mv.san);
      const wPct     = Math.max(0, Math.round(mv.white_pct || 0));
      const dPct     = Math.max(0, Math.round(mv.draw_pct  || 0));
      const bPct     = Math.max(0, 100 - wPct - dPct);
      const games    = _fmtGames(mv.total || 0);
      const rating   = mv.avg_rating ? ` · ${escapeHtml(String(mv.avg_rating))}` : '';

      row.innerHTML = `
        <span class="ob-san">${san}</span>
        <div class="ob-winbar-wrap">
          <div class="ob-winbar-track">
            <div class="ob-winbar-black" style="width:${bPct}%"></div>
            <div class="ob-winbar-draw"  style="width:${dPct}%"></div>
            <div class="ob-winbar-white"></div>
          </div>
          <div class="ob-winpcts">
            <span class="ob-winpct-w">${wPct}%</span>
            <span class="ob-winpct-d">${dPct}%</span>
            <span class="ob-winpct-b">${bPct}%</span>
            <span class="ob-winpct-games">${games}${rating}</span>
          </div>
        </div>`;

      row.addEventListener('click', () => _playOpeningMove(mv.uci, mv.san));
      movesEl.appendChild(row);
    });
  }

  // Top master games
  const gamesSection = document.getElementById('ob-games-section');
  const gamesEl      = document.getElementById('ob-games');
  if (gamesSection && gamesEl) {
    if (hasGames) {
      gamesEl.innerHTML = '';

      // Capture FEN now — used in game row helpers that may run later (show-more click)
      const posFen = state.currentNode.fen;

      function _makeGameRow(g) {
        const row         = document.createElement('div');
        row.className     = 'ob-game-row';
        if (g.id) { row.setAttribute('role', 'button'); row.setAttribute('tabindex', '0'); }

        const result      = g.winner === 'white' ? '1–0' : g.winner === 'black' ? '0–1' : '½–½';
        const resultClass = g.winner === 'white' ? 'ob-res--w' : g.winner === 'black' ? 'ob-res--b' : 'ob-res--d';
        const wName       = escapeHtml((g.white || '?').split(',')[0]);
        const bName       = escapeHtml((g.black || '?').split(',')[0]);
        const wRtg        = g.white_rating ? ` (${escapeHtml(String(g.white_rating))})` : '';

        // Derive SAN continuation using an isolated Chess instance (never touches state.game)
        let contSan = '';
        if (g.uci && g.uci.length >= 4) {
          try {
            const pg = new Chess(); pg.load(posFen);
            const mv = pg.move(_uciToMove(g.uci));
            if (mv) contSan = escapeHtml(mv.san);
          } catch {}
        }

        row.innerHTML = `
          <span class="ob-game-players">${wName}${wRtg} – ${bName}</span>
          <span class="ob-game-right">
            ${contSan ? `<span class="ob-game-cont">${contSan}</span>` : ''}
            <span class="ob-game-result ${resultClass}">${result}</span>
            <span class="ob-game-year">${escapeHtml(String(g.year || ''))}</span>
          </span>`;

        if (g.id) {
          row.addEventListener('click',   ()  => _openMasterGame(g, row));
          row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') _openMasterGame(g, row); });
        }
        return row;
      }

      data.top_games.slice(0, 5).forEach(g => gamesEl.appendChild(_makeGameRow(g)));

      const browseBtn = document.createElement('button');
      browseBtn.className = 'ob-games-showmore';
      browseBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Browse games`;
      browseBtn.addEventListener('click', _openBrowseModal);
      gamesEl.appendChild(browseBtn);

      // Wire up section collapse toggle (replace to avoid duplicate listeners)
      const toggleBtn = document.getElementById('ob-games-toggle');
      const isMobile = document.body.classList.contains('mobile-board-active');

      if (isMobile) {
        // On mobile: skip the expandable section entirely — show a direct Browse button
        if (toggleBtn) toggleBtn.style.display = 'none';
        gamesEl.style.display = 'none';

        // Remove stale mobile browse button from a previous position, then add fresh one
        gamesSection.querySelectorAll('.ob-mobile-browse-btn').forEach(el => el.remove());
        const mobileBrowseBtn = document.createElement('button');
        mobileBrowseBtn.className = 'ob-mobile-browse-btn';
        mobileBrowseBtn.textContent = 'Browse master games';
        mobileBrowseBtn.addEventListener('click', _openBrowseModal);
        gamesSection.appendChild(mobileBrowseBtn);
      } else if (toggleBtn) {
        // Remove any stale mobile browse button left from a prior mobile render
        gamesSection.querySelectorAll('.ob-mobile-browse-btn').forEach(el => el.remove());
        toggleBtn.style.display = '';
        gamesEl.style.display = '';
        const fresh = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(fresh, toggleBtn);
        fresh.setAttribute('aria-expanded', 'true');
        fresh.addEventListener('click', () => {
          const expanded = fresh.getAttribute('aria-expanded') === 'true';
          fresh.setAttribute('aria-expanded', String(!expanded));
          gamesEl.style.display = expanded ? 'none' : '';
        });
      }
      gamesSection.style.display = '';
    } else {
      gamesSection.style.display = 'none';
    }
  }

  _obShow(false, true, false);
}

async function fetchOpeningData(node) {
  const cached = _openingCacheGet(node.id);
  if (cached !== null) { _renderOpeningData(cached); return; }

  _obShow(true, false, false);

  const uciMoves = getUciPathToNode(node);
  const params   = new URLSearchParams({ fen: node.fen });
  if (uciMoves.length > 0) params.set('play', uciMoves.join(','));

  try {
    const res = await fetch(`/api/opening?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _openingCacheSet(node.id, data);
    if (state.currentNode.id === node.id) _renderOpeningData(data);
  } catch {
    if (state.currentNode.id === node.id) {
      _obShow(false, false, true);
      const sub = document.querySelector('#ob-empty .ob-empty-sub');
      if (sub) sub.textContent = 'Could not load opening data. Please try again.';
    }
  }
}

const _gamePgnCache = new Map(); // id → pgn string

async function _fetchGamePgn(id) {
  if (_gamePgnCache.has(id)) return _gamePgnCache.get(id);
  const res = await fetch(`/api/game/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { pgn } = await res.json();
  if (!pgn || !pgn.includes('[')) throw new Error('Invalid PGN');
  _gamePgnCache.set(id, pgn);
  return pgn;
}

async function _openMasterGame(game, rowEl) {
  if (!game.id) return;
  rowEl.classList.add('ob-game-loading');
  try {
    const pgn = await _fetchGamePgn(game.id);
    const key = `ce_game_${Date.now().toString(36)}`;
    const uciMoves = getUciPathToNode(state.currentNode);
    localStorage.setItem(key, JSON.stringify({ pgn, uciMoves }));
    window.open(`/app?g=${key}`, '_blank', 'noopener');
  } catch {
    // silently fail — row loading state is cleared in finally
  } finally {
    rowEl.classList.remove('ob-game-loading');
  }
}

// ── Browse Master Games Modal ────────────────────────────────────────────────
// Pages through Lichess Masters using a sliding `until` (year) cursor.

const _browseState = {
  allGames:    [],
  positionKey: null,
  positionFen: null,
  nextUntil:   null,
  loading:     false,
  exhausted:   false,
  moveOptions: [],
};

let _browseScrollHandler = null;

function _browseSan(g, posFen) {
  if (!g.uci || g.uci.length < 4) return '';
  try {
    const pg = new Chess(); pg.load(posFen);
    const mv = pg.move(_uciToMove(g.uci));
    return mv ? mv.san : '';
  } catch { return ''; }
}

function _browseShowPrimary(view) { // 'loading' | 'games' | 'empty'
  document.getElementById('browse-modal-loading').style.display = view === 'loading' ? '' : 'none';
  document.getElementById('browse-modal-games').style.display   = view === 'games'   ? '' : 'none';
  document.getElementById('browse-modal-empty').style.display   = view === 'empty'   ? '' : 'none';
}

function _browseSetFooter(mode, label) { // 'hidden' | 'paging' | 'done'
  const footer  = document.getElementById('browse-modal-footer');
  const loadEl  = document.getElementById('browse-footer-loading');
  const loadTxt = document.getElementById('browse-footer-loading-text');
  const doneEl  = document.getElementById('browse-footer-done');
  if (!footer) return;
  footer.style.display = mode === 'hidden' ? 'none' : '';
  loadEl.style.display = mode === 'paging' ? '' : 'none';
  doneEl.style.display = mode === 'done'   ? '' : 'none';
  if (loadTxt && label) loadTxt.textContent = label;
  if (mode === 'done' && label) doneEl.textContent = label;
}

function _browseRefreshMoveDropdown(preserveValue) {
  const sel = document.getElementById('bmf-move');
  if (!sel) return;
  const prev = preserveValue ? sel.value : '';
  sel.innerHTML = '<option value="">Any move played</option>';
  for (const san of _browseState.moveOptions) {
    const opt = document.createElement('option');
    opt.value = san; opt.textContent = san;
    sel.appendChild(opt);
  }
  if (prev) sel.value = prev;
}

async function _loadBrowsePage() {
  if (_browseState.loading || _browseState.exhausted) return 0;
  _browseState.loading = true;
  try {
    const uciMoves = getUciPathToNode(state.currentNode);
    const params   = new URLSearchParams({ fen: _browseState.positionFen, limit: 15 });
    if (uciMoves.length > 0) params.set('play', uciMoves.join(','));
    if (_browseState.nextUntil !== null) params.set('until', _browseState.nextUntil);

    const res = await fetch(`/api/opening?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const existingIds = new Set(_browseState.allGames.map(g => g.id).filter(Boolean));
    const newGames = (data.top_games || [])
      .map(g => ({ ...g, contSan: _browseSan(g, _browseState.positionFen) }))
      .filter(g => g.id && !existingIds.has(g.id));

    if (newGames.length === 0) { _browseState.exhausted = true; return 0; }

    _browseState.allGames.push(...newGames);

    const years = newGames.filter(g => g.year).map(g => g.year);
    if (years.length > 0) {
      const minYear = Math.min(...years);
      _browseState.nextUntil = minYear <= 1851 ? null : minYear - 1;
      if (_browseState.nextUntil === null) _browseState.exhausted = true;
    } else {
      _browseState.exhausted = true;
    }

    const moveSet = new Set(_browseState.moveOptions);
    for (const g of newGames) { if (g.contSan) moveSet.add(g.contSan); }
    _browseState.moveOptions = [...moveSet].sort();
    _browseRefreshMoveDropdown(true);

    return newGames.length;
  } catch {
    _browseState.exhausted = true;
    return 0;
  } finally {
    _browseState.loading = false;
  }
}

function _browseGetFiltered() {
  const result  = document.getElementById('bmf-result')?.value || '';
  const moveSan = document.getElementById('bmf-move')?.value   || '';
  return _browseState.allGames.filter(g => {
    if (result === 'white' && g.winner !== 'white') return false;
    if (result === 'black' && g.winner !== 'black') return false;
    if (result === 'draw'  && g.winner) return false;
    if (moveSan && g.contSan !== moveSan) return false;
    return true;
  });
}

function _browseRender(filtered) {
  const gamesEl  = document.getElementById('browse-modal-games');
  const countEl  = document.getElementById('browse-modal-count');
  const emptyMsg = document.getElementById('browse-empty-msg');
  const total    = _browseState.allGames.length;

  if (countEl) countEl.textContent = total === 0 ? '' :
    filtered.length < total
      ? `${filtered.length} of ${total} loaded`
      : `${total} game${total !== 1 ? 's' : ''}${_browseState.exhausted ? '' : '+'}`;

  if (filtered.length === 0) {
    _browseShowPrimary('empty');
    if (emptyMsg) emptyMsg.textContent = 'No games match your filters.';
    _browseSetFooter(_browseState.exhausted ? 'done' : 'hidden', `${total} games loaded`);
    return;
  }

  _browseShowPrimary('games');
  if (!gamesEl) return;
  gamesEl.innerHTML = '';

  for (const g of filtered) {
    const row = document.createElement('div');
    row.className = 'ob-game-row';
    if (g.id) { row.setAttribute('role', 'button'); row.setAttribute('tabindex', '0'); }

    const result      = g.winner === 'white' ? '1–0' : g.winner === 'black' ? '0–1' : '½–½';
    const resultClass = g.winner === 'white' ? 'ob-res--w' : g.winner === 'black' ? 'ob-res--b' : 'ob-res--d';
    const wRtg = g.white_rating ? ` (${escapeHtml(String(g.white_rating))})` : '';
    const bRtg = g.black_rating ? ` (${escapeHtml(String(g.black_rating))})` : '';

    row.innerHTML = `
      <span class="ob-game-players">${escapeHtml(g.white || '?')}${wRtg} – ${escapeHtml(g.black || '?')}${bRtg}</span>
      <span class="ob-game-right">
        ${g.contSan ? `<span class="ob-game-cont">${escapeHtml(g.contSan)}</span>` : ''}
        <span class="ob-game-result ${resultClass}">${result}</span>
        <span class="ob-game-year">${escapeHtml(String(g.year || ''))}</span>
      </span>`;

    if (g.id) {
      row.addEventListener('click',   ()  => _openMasterGame(g, row));
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') _openMasterGame(g, row); });
    }
    gamesEl.appendChild(row);
  }

  _browseSetFooter(_browseState.exhausted ? 'done' : 'hidden',
    `${total} game${total !== 1 ? 's' : ''} loaded`);

  // Proactively load next page if content fits without scrolling
  if (!_browseState.exhausted && !_browseState.loading) {
    requestAnimationFrame(() => {
      const body = document.getElementById('browse-modal-body');
      if (body && body.scrollHeight <= body.clientHeight + 80) {
        _loadBrowsePage().then(() => _browseRender(_browseGetFiltered()));
      }
    });
  }
}

async function _browseFilter() {
  const filtered = _browseGetFiltered();
  if (filtered.length > 0 || _browseState.exhausted) { _browseRender(filtered); return; }
  // Auto-load up to 3 pages when current results are empty
  for (let i = 0; i < 3; i++) {
    _browseSetFooter('paging', 'Loading more games…');
    await _loadBrowsePage();
    const f = _browseGetFiltered();
    if (f.length > 0 || _browseState.exhausted) { _browseRender(f); return; }
  }
  _browseRender(_browseGetFiltered());
}

function _browseAttachScroll() {
  const body = document.getElementById('browse-modal-body');
  if (!body) return;
  if (_browseScrollHandler) body.removeEventListener('scroll', _browseScrollHandler);
  _browseScrollHandler = () => {
    if (_browseState.loading || _browseState.exhausted) return;
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 180) {
      _loadBrowsePage().then(() => _browseRender(_browseGetFiltered()));
    }
  };
  body.addEventListener('scroll', _browseScrollHandler, { passive: true });
}

async function _openBrowseModal() {
  const modal = document.getElementById('browse-games-modal');
  if (!modal) return;
  modal.style.display = '';

  const uciMoves = getUciPathToNode(state.currentNode);
  const posKey   = uciMoves.length > 0 ? `play:${uciMoves.join(',')}` : `fen:${state.currentNode.fen}`;

  if (_browseState.positionKey === posKey && _browseState.allGames.length > 0) {
    _browseFilter();
    _browseAttachScroll();
    return;
  }

  _browseState.allGames    = [];
  _browseState.positionKey = posKey;
  _browseState.positionFen = state.currentNode.fen;
  _browseState.nextUntil   = null;
  _browseState.loading     = false;
  _browseState.exhausted   = false;
  _browseState.moveOptions = [];

  ['bmf-result','bmf-move'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  _browseRefreshMoveDropdown(false);

  const countEl = document.getElementById('browse-modal-count');
  if (countEl) countEl.textContent = '';
  _browseSetFooter('hidden');
  _browseShowPrimary('loading');

  await _loadBrowsePage();
  await _browseFilter();
  _browseAttachScroll();
}

function _closeBrowseModal() {
  const modal = document.getElementById('browse-games-modal');
  if (modal) modal.style.display = 'none';
  const body = document.getElementById('browse-modal-body');
  if (body && _browseScrollHandler) {
    body.removeEventListener('scroll', _browseScrollHandler);
    _browseScrollHandler = null;
  }
}

// Lichess uses Chess960 castling UCI notation (king to rook's square: e1h1, e8h8).
// chess.js expects the king's destination after castling (e1g1, e8g8 / e1c1, e8c8).
function _normalizeUci(uci) {
  const from = uci.slice(0, 2), to = uci.slice(2, 4);
  if (from === 'e1' && to === 'h1') return 'e1g1' + uci.slice(4);
  if (from === 'e1' && to === 'a1') return 'e1c1' + uci.slice(4);
  if (from === 'e8' && to === 'h8') return 'e8g8' + uci.slice(4);
  if (from === 'e8' && to === 'a8') return 'e8c8' + uci.slice(4);
  return uci;
}

function _uciToMove(uci) {
  const n = _normalizeUci(uci);
  const from = n.slice(0, 2), to = n.slice(2, 4);
  const promotion = n.length === 5 ? n[4].toLowerCase() : undefined;
  return { from, to, ...(promotion ? { promotion } : {}) };
}

function _playOpeningMove(uci, san) {
  if (state.game.game_over() || state.currentNode.gameResult) return;
  const mv = state.game.move(_uciToMove(uci));
  if (!mv) return;
  if (typeof playMoveSound === 'function' && boardSettings.soundEnabled) playMoveSound();
  const newNode = addMoveToTree(mv.san, _normalizeUci(uci));
  state.board.position(state.game.fen(), boardSettings.moveAnimation);
  updateUI();
  scheduleEvalUpdate();
  fetchOpeningData(newNode);
}

function switchAnalysisPanel(panel) {
  const commentsPanel = document.getElementById('comments-subpanel');
  const openingPanel  = document.getElementById('opening-subpanel');
  const commentBtn    = document.getElementById('btn-panel-comments');
  const openingBtn    = document.getElementById('btn-panel-opening');

  if (panel === 'opening') {
    commentsPanel.style.display = 'none';
    openingPanel.style.display  = '';
    commentBtn.classList.remove('panel-tab--active');
    commentBtn.setAttribute('aria-selected', 'false');
    openingBtn.classList.add('panel-tab--active');
    openingBtn.setAttribute('aria-selected', 'true');
    state.activePanel = 'opening';
    fetchOpeningData(state.currentNode);
  } else {
    openingPanel.style.display  = 'none';
    commentsPanel.style.display = '';
    openingBtn.classList.remove('panel-tab--active');
    openingBtn.setAttribute('aria-selected', 'false');
    commentBtn.classList.add('panel-tab--active');
    commentBtn.setAttribute('aria-selected', 'true');
    state.activePanel = 'comments';
  }
}

// ---------------------------------------------------------------------------
// Error display
// ---------------------------------------------------------------------------

// Max characters accepted by the AI question/chat endpoints, mirroring the
// server-side caps (ask: 300 in middleware/validate.js, play chat: 200 in
// routes/play.js). When a typed message exceeds the limit the page cancels the
// request up front and surfaces a "Message too long" error.
const AI_MSG_MAX_LEN = { ask: 300, chat: 200 };

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.add('visible');
}

function hideError(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = '';
  el.classList.remove('visible');
}

// ---------------------------------------------------------------------------
// Analyze position — calls backend, attaches result as comment on current node.
//
// This is the core flow for assessing a position and finding the best move:
//   1. Sends the current FEN + move path to the backend (/api/analyze).
//   2. Backend runs Stockfish to evaluate the position and identify the best
//      move, then feeds the result to an AI model to produce a natural-language
//      explanation, a positional theme label, and a strategic summary.
//   3. The explanation is stored on the move-tree node so it persists as the
//      user navigates, and the best-move arrow is rendered on the board.
//
// NOTE: The "Analyze position" button has been removed from the analysis tab UI
// (free-tier users get one use per month). The function is kept here because
// it is a high-quality entry-point that can be reused from other surfaces
// (e.g. triggered programmatically after loading a game, or wired to a
// different UI element in the future).
// ---------------------------------------------------------------------------
async function analyzePosition() {
  if (state.game.game_over()) {
    showError('error-msg', 'The game is over. Start a new game to analyze.');
    return;
  }

  const btn = document.getElementById('btn-analyze'); // may be null — button removed from analysis tab
  const spinner = document.getElementById('spinner');
  const titleEl = document.getElementById('analysis-card-title');
  const explanationEl = document.getElementById('explanation-text');
  const analyzingNode = state.currentNode;

  if (btn) btn.disabled = true;
  document.getElementById('btn-ask-question').disabled = true;
  document.getElementById('btn-edit-comment').disabled = true;
  document.getElementById('btn-delete-comment').disabled = true;
  spinner.classList.add('visible');
  clearAnalysis();
  clearHighlights();
  titleEl.textContent = 'Analyzing...';

  state.analyzingNodeId = analyzingNode.id;
  updateMoveHistory();

  // ── Typewriter queue (same pattern as ask flow) ───────────────────────────
  const CHARS_PER_FRAME = 8;
  let twChars = [];
  let twShown = '';
  let twRaf = null;
  let accumulated = '';
  let streamingStarted = false;

  function cancelTw() {
    if (twRaf) { cancelAnimationFrame(twRaf); twRaf = null; }
    twChars = [];
  }

  function renderExplanation(text) {
    explanationEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(text)));
  }

  function drainTw() {
    if (twChars.length === 0) { twRaf = null; return; }
    twShown += twChars.splice(0, CHARS_PER_FRAME).join('');
    if (analyzingNode.id === state.currentNode.id) {
      if (!streamingStarted) {
        streamingStarted = true;
        document.getElementById('analysis-result').classList.add('visible');
      }
      renderExplanation(twShown);
    }
    twRaf = requestAnimationFrame(drainTw);
  }

  function enqueueTw(text) {
    twChars.push(...text);
    if (!twRaf) twRaf = requestAnimationFrame(drainTw);
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const payload = {
      fen: analyzingNode.fen,
      moves: getPathToNode(analyzingNode),
      uciMoves: getUciPathToNode(analyzingNode),
      skillLevel: state.skillLevel,
    };

    const response = await fetch('/api/analyze/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    if (response.status === 403 || response.status === 429 || response.status === 503) {
      const errData = await response.json().catch(() => ({}));
      if (errData.error === 'email_unverified') {
        showEmailUnverifiedError('error-msg');
      } else if (errData.error === 'limit_reached') {
        showUpgradeModal(errData);
      } else if (errData.error === 'global_limit') {
        showError('error-msg', 'Service temporarily unavailable. Please try again later.');
      } else {
        showError('error-msg', 'Too many requests. Please wait a moment and try again.');
      }
      return;
    }

    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

    // Activation event: the first successful AI analysis on this device
    window.ccTrackOnce?.('first_analysis');

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

          if (evt.type === 'latency') {
            showTrafficNotice();

          } else if (evt.type === 'move') {
            // Show move arrow + eval immediately — no waiting for explanation
            if (evt.evaluation && analyzingNode.id === state.currentNode.id) {
              updateEvalBar(evt.evaluation.numericScore, evt.evaluation.display);
            }
            if (evt.suggestedMoveUCI) {
              analyzingNode.suggestedMoveUCI = evt.suggestedMoveUCI;
              if (analyzingNode.id === state.currentNode.id && boardSettings.showMoveArrow) {
                highlightMove(evt.suggestedMoveUCI);
              }
            }

          } else if (evt.type === 'chunk') {
            accumulated += evt.text;
            if (analyzingNode.id === state.currentNode.id) enqueueTw(evt.text);

          } else if (evt.type === 'done') {
            const finalText = accumulated;
            const theme = evt.theme || null;

            analyzingNode.comment = finalText || null;
            analyzingNode.theme = theme;
            markDirty();

            const finalize = () => {
              if (analyzingNode.id === state.currentNode.id) {
                const badge = document.getElementById('theme-badge');
                if (theme) {
                  badge.textContent = theme;
                  badge.style.display = 'block';
                  titleEl.textContent = theme;
                } else {
                  badge.style.display = 'none';
                  titleEl.textContent = 'Analysis';
                }
                if (finalText) {
                  renderExplanation(finalText);
                  linkifyMovesInElement(explanationEl, analyzingNode.id);
                }
                document.getElementById('analysis-result').classList.add('visible');
              }
            };

            // Drain any queued typewriter chars before finalising
            if (twChars.length > 0) {
              const waitAndFinalize = () => {
                if (twChars.length === 0) { cancelTw(); finalize(); return; }
                twShown += twChars.splice(0, CHARS_PER_FRAME).join('');
                if (analyzingNode.id === state.currentNode.id) renderExplanation(twShown);
                twRaf = requestAnimationFrame(waitAndFinalize);
              };
              cancelTw();
              twRaf = requestAnimationFrame(waitAndFinalize);
            } else {
              cancelTw();
              finalize();
            }
            streamDone = true;

          } else if (evt.type === 'error') {
            cancelTw();
            if (analyzingNode.id === state.currentNode.id) {
              showError('error-msg', evt.message || 'Analysis failed. Please try again.');
            }
            streamDone = true;
          }
        }
      }
    }

    // Stream closed without a done event — show whatever arrived
    if (!streamDone && accumulated && analyzingNode.id === state.currentNode.id) {
      cancelTw();
      renderExplanation(accumulated);
      linkifyMovesInElement(explanationEl, analyzingNode.id);
      document.getElementById('analysis-result').classList.add('visible');
    }
  } catch (err) {
    console.error('analyzePosition stream failed:', err);
    cancelTw();
    showError('error-msg', 'Network error. Please check your connection and try again.');
  } finally {
    if (btn) btn.disabled = false;
    document.getElementById('btn-ask-question').disabled = false;
    document.getElementById('btn-edit-comment').disabled = false;
    document.getElementById('btn-delete-comment').disabled = false;
    spinner.classList.remove('visible');
    state.analyzingNodeId = null;
    updateMoveHistory();
  }
}

// ---------------------------------------------------------------------------
// Context menu for move history
// ---------------------------------------------------------------------------
let contextMenuNode = null;

function generatePgnToNode(node) {
  // Collect path from root to this node
  const moves = [];
  let cur = node;
  while (cur.move !== null) {
    moves.unshift(cur);
    cur = cur.parent;
  }

  let pgn = '';
  for (let i = 0; i < moves.length; i++) {
    const { san, color, moveNumber } = moves[i].move;
    if (color === 'w') {
      pgn += `${moveNumber}. ${san} `;
    } else {
      // Need explicit move number for black if it's the first move or doesn't follow white
      if (i === 0 || moves[i - 1].move.color !== 'w') {
        pgn += `${moveNumber}... ${san} `;
      } else {
        pgn += `${san} `;
      }
    }
  }

  return pgn.trim();
}

function deleteFromNode(node) {
  const parent = node.parent;
  if (!parent) return; // Can't delete root
  markDirty();

  // Check if current position is at or below the node being deleted
  let isAtOrBelow = false;
  let cur = state.currentNode;
  while (cur) {
    if (cur.id === node.id) { isAtOrBelow = true; break; }
    cur = cur.parent;
  }

  parent.children = parent.children.filter(c => c.id !== node.id);

  if (isAtOrBelow) {
    navigateTo(parent);
  } else {
    updateMoveHistory();
  }
}

function showContextMenu(event, nodeId) {
  event.preventDefault();
  const node = findNodeById(state.root, nodeId);
  if (!node) return;
  contextMenuNode = node;

  const menu = document.getElementById('move-context-menu');
  menu.classList.add('visible');
  menu.setAttribute('aria-hidden', 'false');

  // Position near cursor, keeping within viewport
  const x = Math.min(event.clientX, window.innerWidth - menu.offsetWidth - 8);
  const y = Math.min(event.clientY, window.innerHeight - menu.offsetHeight - 8);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

function hideContextMenu() {
  const menu = document.getElementById('move-context-menu');
  menu.classList.remove('visible');
  menu.setAttribute('aria-hidden', 'true');
  contextMenuNode = null;
}

// ---------------------------------------------------------------------------
// Serialize / restore per-node comments for collection persistence
// ---------------------------------------------------------------------------
function serializeNodeComments(pathNodes) {
  const result = [];
  pathNodes.forEach((node, idx) => {
    const hasContent = node.comment || node.theme || node.strategicContext || (node.qa && node.qa.length > 0)
      || node.annotation || node.posAnnotation
      || (node.arrows && node.arrows.length > 0)
      || (node.squareColors && Object.keys(node.squareColors).length > 0);
    if (hasContent) {
      result.push({
        moveIndex: idx,
        comment: node.comment || null,
        theme: node.theme || null,
        strategicContext: node.strategicContext || null,
        qa: node.qa && node.qa.length > 0 ? node.qa.map(q => ({ question: q.question, answer: q.answer })) : [],
        annotation: node.annotation || null,
        posAnnotation: node.posAnnotation || null,
        arrows: node.arrows && node.arrows.length > 0 ? node.arrows.slice() : [],
        squareColors: node.squareColors && Object.keys(node.squareColors).length > 0 ? { ...node.squareColors } : {},
      });
    }
  });
  return result;
}

function applyNodeCommentsToTree(root, nodeComments) {
  if (!nodeComments || nodeComments.length === 0) return;
  const mainLine = [];
  let node = root;
  while (node.children.length > 0) {
    node = node.children[0];
    mainLine.push(node);
  }
  for (const entry of nodeComments) {
    const n = mainLine[entry.moveIndex];
    if (!n) continue;
    if (entry.comment) n.comment = entry.comment;
    if (entry.theme) n.theme = entry.theme;
    if (entry.strategicContext) n.strategicContext = entry.strategicContext;
    if (entry.qa && entry.qa.length > 0) n.qa = entry.qa.slice();
    if (entry.annotation) n.annotation = entry.annotation;
    if (entry.posAnnotation) n.posAnnotation = entry.posAnnotation;
    if (entry.arrows && entry.arrows.length > 0) n.arrows = entry.arrows.slice();
    if (entry.squareColors && Object.keys(entry.squareColors).length > 0) n.squareColors = { ...entry.squareColors };
  }
}

// ---------------------------------------------------------------------------
// Reconstruct an analysis payload ({ moves, stats }) from a serialized tree.
// Older saved games carry move classifications as annotation symbols inside
// treeData but were saved without the dedicated `analysis` object that powers
// the collection stats row and the insights modal. This walks the main line
// and rebuilds what it can from the annotations (counts + key moments). Eval
// data is unavailable for those games, so accuracy is left undefined and the
// eval chart simply renders flat. Returns null if the game has no engine
// classification annotations (i.e. it was never analyzed).
// ---------------------------------------------------------------------------
function reconstructAnalysisFromTreeData(treeData) {
  if (!treeData) return null;
  const moves = [];
  const stats = { blunder: 0, mistake: 0, inaccuracy: 0, correct: 0 };
  let hasClassification = false;
  let node = treeData;
  while (node.children && node.children.length > 0) {
    node = node.children[0];
    const cls = ANN_CLASSIFICATION[node.annotation] || null;
    if (cls) {
      hasClassification = true;
      // `great` is a strong move — bucket it with correct for the summary count.
      if (cls === 'great') stats.correct++;
      else if (stats[cls] !== undefined) stats[cls]++;
    }
    const mv = node.move || {};
    moves.push({
      classification: cls,
      san:        mv.san,
      color:      mv.color,
      moveNumber: mv.moveNumber,
      fenAfter:   node.fen,
      // Only AI-generated comments carry a theme; user comments don't.
      aiComment:  node.theme ? node.comment : undefined,
    });
  }
  return hasClassification ? { moves, stats } : null;
}

// ---------------------------------------------------------------------------
// Full tree serialization / restoration (all variations + all node data)
// ---------------------------------------------------------------------------
function serializeTree(root) {
  function serNode(node) {
    const d = { fen: node.fen, children: node.children.map(serNode) };
    if (node.move) d.move = { ...node.move };
    if (node.comment) d.comment = node.comment;
    if (node.theme) d.theme = node.theme;
    if (node.strategicContext) d.strategicContext = node.strategicContext;
    if (node.qa && node.qa.length > 0) d.qa = node.qa.map(q => ({ question: q.question, answer: q.answer }));
    if (node.annotation) d.annotation = node.annotation;
    if (node.posAnnotation) d.posAnnotation = node.posAnnotation;
    if (node.arrows && node.arrows.length > 0) d.arrows = node.arrows.slice();
    if (node.squareColors && Object.keys(node.squareColors).length > 0) d.squareColors = { ...node.squareColors };
    if (node.gameResult) d.gameResult = node.gameResult;
    return d;
  }
  return serNode(root);
}

function restoreFromTreeData(treeData) {
  nodeIdCounter = 0;
  state.loadedGameId = null; // load handlers set it when this came from the collection
  state.root = createNode(null, null, treeData.fen);

  function restoreChildren(parent, childArr) {
    for (const d of (childArr || [])) {
      const child = createNode(parent, d.move || null, d.fen);
      if (d.comment) child.comment = d.comment;
      if (d.theme) child.theme = d.theme;
      if (d.strategicContext) child.strategicContext = d.strategicContext;
      if (d.qa && d.qa.length > 0) child.qa = d.qa.slice();
      if (d.annotation) child.annotation = d.annotation;
      if (d.posAnnotation) child.posAnnotation = d.posAnnotation;
      if (d.arrows && d.arrows.length > 0) child.arrows = d.arrows.slice();
      if (d.squareColors && Object.keys(d.squareColors).length > 0) child.squareColors = { ...d.squareColors };
      if (d.gameResult) child.gameResult = d.gameResult;
      parent.children.push(child);
      restoreChildren(child, d.children);
    }
  }
  restoreChildren(state.root, treeData.children);

  // Navigate to end of main line
  let endNode = state.root;
  while (endNode.children.length > 0) endNode = endNode.children[0];
  state.currentNode = endNode;
  state.game.load(endNode.fen);
  state.board.position(endNode.fen, false);
  clearAnalysis();
  clearHighlights();
  resetEvalBar();
  updateUI();
  scheduleEvalUpdate();
  const agBtn = document.getElementById('btn-analyze-game');
  if (agBtn && !agBtn.dataset.analysisRunning) {
    delete agBtn.dataset.mode;
    agBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,12 5,8 8,10 11,5 14,7"/><circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg> Analyze game`;
  }
  window._resetLastAnalysisData?.();
}

// ---------------------------------------------------------------------------
// Apply saved analysis annotations to a move tree
// ---------------------------------------------------------------------------
function applyAnalysisToTree(root, movesData) {
  let node = root;
  let idx = 0;
  while (node.children.length > 0) {
    node = node.children[0];
    const data = movesData[idx];
    if (data) {
      const ann = CLASSIFICATION_ANN[data.classification] || '';
      if (ann) node.annotation = ann;
      if (data.aiComment) {
        node.comment = data.aiComment;
        node.theme = data.aiTheme || null;
      }
    }
    idx++;
  }
}

// ---------------------------------------------------------------------------
// PGN import
// ---------------------------------------------------------------------------
function importPGN() {
  hideError('pgn-error');
  const pgn = document.getElementById('pgn-input').value.trim();
  if (!pgn) { showError('pgn-error', 'Please paste a PGN before importing.'); return; }

  const fenHeaderMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i);
  if (fenHeaderMatch) {
    const castling = fenHeaderMatch[1].split(' ')[2] || '';
    if (/[A-Ha-h]/.test(castling) && !/[KQkq]/.test(castling)) {
      showError('pgn-error', 'Chess960 / Fischer Random games are not supported. Please import a standard chess game.');
      return;
    }
  }

  if (!importPgnString(pgn)) {
    showError('pgn-error', 'Invalid PGN. Please check the format and try again.');
    return;
  }

  const modal = document.getElementById('pgn-modal');
  if (modal) { modal.style.display = 'none'; document.getElementById('pgn-input').value = ''; }
}

function importPgnString(pgn) {
  const testGame = new Chess();
  if (!testGame.load_pgn(pgn)) return false;

  const moves            = testGame.history({ verbose: true });
  const fenHeaderMatch   = pgn.match(/\[FEN\s+"([^"]+)"\]/i);
  const resultHeaderMatch = pgn.match(/\[Result\s+"([^"]+)"\]/i);
  const pgnResult        = resultHeaderMatch ? resultHeaderMatch[1] : null;
  const startFen         = fenHeaderMatch
    ? fenHeaderMatch[1]
    : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  nodeIdCounter = 0;
  state.loadedGameId = null; // collection load handlers set it after importing
  state.root = createNode(null, null, startFen);

  const replayGame = new Chess();
  replayGame.load(startFen);

  let current = state.root;
  for (const moveData of moves) {
    const parts      = replayGame.fen().split(' ');
    const color      = parts[1];
    const moveNumber = parseInt(parts[5], 10);
    replayGame.move(moveData.san);
    const newFen = replayGame.fen();
    const uci    = moveData.from + moveData.to + (moveData.promotion || '');
    const newNode = createNode(current, { san: moveData.san, uci, color, moveNumber }, newFen);
    newNode.gameResult = getGameResult(replayGame);
    current.children.push(newNode);
    current = newNode;
  }

  if (current !== state.root && !current.gameResult && pgnResult && pgnResult !== '*') {
    current.gameResult = pgnResult;
  }

  state.currentNode = current;
  state.game.load(current.fen);
  state.board.position(current.fen, false); // no animation — caller may navigate away immediately

  clearAnalysis();
  clearHighlights();
  resetEvalBar();
  updateUI();
  scheduleEvalUpdate();

  const agBtn = document.getElementById('btn-analyze-game');
  if (agBtn && !agBtn.dataset.analysisRunning) {
    delete agBtn.dataset.mode;
    agBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,12 5,8 8,10 11,5 14,7"/><circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg> Analyze game`;
  }
  window._resetLastAnalysisData?.();

  const importedTitle = deriveImportTitle(pgn);
  if (importedTitle) setGameTitle(importedTitle);
  markClean();

  return true;
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Board size — measured from the actual layout so the board fills exactly
// ---------------------------------------------------------------------------
function applyBoardSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Mobile board view (≤640px): compute board size precisely so board.resize()
  // reads the correct container dimensions. Material bars are hidden via CSS on
  // mobile so they are not counted in the overhead. A late-order !important style
  // tag reliably overrides any cascade conflicts on the live site.
  if (vw <= 640 && document.body.classList.contains('mobile-board-active')) {
    const playPage = document.getElementById('page-play');
    const isPlay   = playPage && playPage.style.display !== 'none';
    let overrideEl = document.getElementById('_board-size-mobile-override');
    if (!overrideEl) {
      overrideEl = document.createElement('style');
      overrideEl.id = '_board-size-mobile-override';
      document.head.appendChild(overrideEl);
    }

    if (isPlay) {
      // Play: board fills the viewport width (moves scroll below). The container
      // is 8n+1 so chessboard.js — which sizes its board to 8·floor((w-1)/8) —
      // renders an exact 8n board inside it. We then pin it with a WHOLE-pixel
      // horizontal offset instead of letting it be flex-centered.
      //
      // Why integer offsets: the board is normally centered by `.board-section
      // { align-items: center }`, which yields a fractional side margin (e.g.
      // (390-385)/2 = 2.5px). On a high-DPR phone that is 7.5 device px, and the
      // browser rounds it inconsistently each time chessboard.js rebuilds the
      // piece layer on a move — so the board appears to jitter ~1px left/right
      // every move. Centering with a rounded, whole-pixel padding makes the
      // position repaint-stable.
      const n      = Math.floor((vw - 1) / 8);
      const boardW = Math.max(8 * n + 1, 201);
      const side   = Math.max(0, Math.round((vw - boardW) / 2));
      document.documentElement.style.setProperty('--board-size', boardW + 'px');
      overrideEl.textContent =
        `body.mobile-board-active #play-board-container{width:${boardW}px!important;height:${boardW}px!important}` +
        `body.mobile-board-active .play-arena .board-section{align-items:flex-start!important;padding-left:${side}px!important;padding-right:${side}px!important}`;
      return;
    }

    // Analysis: leave room for panel below — header(46)+button-bar(44)+compact-nav(40)+min-panel(200)=330.
    const boardSize = Math.min(vw, Math.max(vh - 330, 200));
    const n         = Math.floor((boardSize - 1) / 8);
    const snapped   = Math.max(8 * n + 1, 201);
    document.documentElement.style.setProperty('--board-size', snapped + 'px');
    overrideEl.textContent = `body.mobile-board-active #board-container{width:${snapped}px!important;height:${snapped}px!important}`;
    return;
  }

  // Not mobile: clear any override so desktop/tablet CSS takes control.
  const overrideEl = document.getElementById('_board-size-mobile-override');
  if (overrideEl) overrideEl.textContent = '';

  // Tablet (641–860px): CSS handles sizing via vw-based --board-size.
  if (vw <= 860) return;

  const main = document.getElementById('page-analysis');
  const buttonBar = document.querySelector('#page-analysis .button-bar');
  if (main && buttonBar && main.style.display !== 'none') {
    // Desktop: accurate measurement from the analysis page layout.
    const style  = getComputedStyle(main);
    const availH = main.clientHeight
                   - parseFloat(style.paddingTop)
                   - parseFloat(style.paddingBottom);
    const matTop = document.getElementById('mat-analysis-top');
    const matBot = document.getElementById('mat-analysis-bot');
    const matH   = (matTop ? matTop.offsetHeight : 0) + (matBot ? matBot.offsetHeight : 0);
    const uiH    = buttonBar.offsetHeight + matH;
    const rawSize = Math.max(Math.floor(availH - uiH), 280);
    const n = Math.floor((rawSize - 1) / 8);
    const size = Math.max(8 * n + 1, 281);
    document.documentElement.style.setProperty('--board-size', size + 'px');
    return;
  }

  // Desktop: accurate measurement from the play arena layout. Without this the
  // play board falls through to the generic fallback below, which ignores the
  // arena's material bars + button bar — sizing the board too tall so the center
  // column overflows and stretches the side panels (Moves / Ask the coach) past
  // the viewport, pushing the game-action buttons out of view.
  const playPanel = document.getElementById('play-game-panel');
  const playButtonBar = document.querySelector('#play-game-panel .button-bar');
  if (playPanel && playButtonBar && playPanel.style.display !== 'none') {
    const style  = getComputedStyle(playPanel);
    const availH = playPanel.clientHeight
                   - parseFloat(style.paddingTop)
                   - parseFloat(style.paddingBottom);
    const matTop = document.getElementById('mat-play-top');
    const matBot = document.getElementById('mat-play-bot');
    const matH   = (matTop ? matTop.offsetHeight : 0) + (matBot ? matBot.offsetHeight : 0);
    const uiH    = playButtonBar.offsetHeight + matH;
    const rawSize = Math.max(Math.floor(availH - uiH), 280);
    const n = Math.floor((rawSize - 1) / 8);
    const size = Math.max(8 * n + 1, 281);
    document.documentElement.style.setProperty('--board-size', size + 'px');
    return;
  }

  // Fallback: measure from viewport minus header chrome (used by train/puzzle tab).
  const header = document.querySelector('header');
  if (!header) return;
  const rawSize = Math.max(Math.floor(vh - header.offsetHeight - 60), 280);
  const n = Math.floor((rawSize - 1) / 8);
  const size = Math.max(8 * n + 1, 281);
  document.documentElement.style.setProperty('--board-size', size + 'px');
}

// ---------------------------------------------------------------------------
// Play page — board & game logic
// ---------------------------------------------------------------------------

function playHasMoves() {
  return playState.game.history().length > 0;
}

function playGeneratePgn() {
  const hist = playState.game.history();
  if (!hist.length) return null;
  const p = PERSONAS_CLIENT[playState.persona] || {};
  const isUserWhite = playState.userColor === 'white';
  const white = isUserWhite ? 'You' : (p.name || 'Opponent');
  const black = isUserWhite ? (p.name || 'Opponent') : 'You';

  let result = '*';
  if (playState.resignResult) {
    result = isUserWhite ? '0-1' : '1-0';
  } else if (playState.game.in_checkmate()) {
    result = playState.game.turn() === 'b' ? '1-0' : '0-1';
  } else if (playState.game.in_stalemate() || playState.game.in_threefold_repetition() ||
             playState.game.insufficient_material() || playState.game.in_draw()) {
    result = '1/2-1/2';
  }

  let movetext = '';
  for (let i = 0; i < hist.length; i++) {
    if (i % 2 === 0) movetext += `${Math.floor(i / 2) + 1}. `;
    movetext += hist[i] + ' ';
  }
  movetext = movetext.trim();

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const headers = [
    `[Event "Casual"]`,
    `[Site "Chess Explain"]`,
    `[Date "${date}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`,
  ].join('\n');

  return `${headers}\n\n${movetext} ${result}`;
}

function playDefaultTitle() {
  const p = PERSONAS_CLIENT[playState.persona] || {};
  return `vs ${p.name || 'Opponent'}`;
}

function initPlayBoard() {
  if (playState.board) {
    playState.board.resize();
    return;
  }
  // Board lives inside play-game-panel which starts hidden.
  // Temporarily show it to get correct dimensions, then hide again if needed.
  const gamePanel = document.getElementById('play-game-panel');
  const wasHidden = gamePanel && gamePanel.style.display === 'none';
  if (wasHidden) gamePanel.style.visibility = 'hidden';

  playState.board = Chessboard('play-board', {
    position: 'start',
    draggable: true,
    orientation: playState.orientation,
    pieceTheme: (piece) => PIECE_IMAGES[piece],
    onDragStart: playOnDragStart,
    onDrop: playOnDrop,
    onSnapEnd: playOnSnapEnd,
  });

  if (wasHidden) gamePanel.style.visibility = '';

  // Click-to-move for play board
  document.getElementById('play-board').addEventListener('click', (e) => {
    if (playState._dropHandledClick) return;
    const squareEl = e.target.closest('[data-square]');
    if (squareEl) playOnSquareClick(squareEl.dataset.square);
  });
}

function playOnDragStart(source, piece) {
  if (!playState.active || playState.waitingForOpponent || playState.browseIndex !== null) return false;
  if (playState.game.game_over()) return false;
  const turn = playState.game.turn();
  const userChar = playState.userColor === 'white' ? 'w' : 'b';
  if (turn !== userChar) return false;
  if ((turn === 'w' && piece.startsWith('b')) || (turn === 'b' && piece.startsWith('w'))) return false;

  _pieceIsDragging = true;
  playState.selectedSquare = source;
  const moves = playState.game.moves({ square: source, verbose: true });
  playState.legalTargetSquares = moves.map(m => m.to);
  $(`#play-board [data-square="${source}"]`).addClass('highlight-selected');
  if (boardSettings.highlightLegal) {
    playState.legalTargetSquares.forEach(sq => {
      $(`#play-board [data-square="${sq}"]`).addClass('highlight-legal');
    });
  }
}

function clearPlayHighlights() {
  $('#play-board [data-square]').removeClass('highlight-selected highlight-legal highlight-last-move');
}

let _promoCallback   = null;
let _promoKeyHandler = null;

// pieceColor: 'w' or 'b' (color of the pawn that's promoting)
// onPick: function(piece) called with 'q'|'r'|'b'|'n' when the user picks
function showPromotionPicker(pieceColor, onPick) {
  const pieces = ['q', 'r', 'b', 'n'];
  const labels = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };
  const keys   = { q: 'Q', r: 'R', b: 'B', n: 'N' };

  const container = document.getElementById('promo-options');
  if (container) {
    container.innerHTML = pieces.map(p => {
      const imgSrc = PIECE_IMAGES[pieceColor + p.toUpperCase()] || '';
      const isBest = p === 'q';
      return `<button class="promo-btn${isBest ? ' promo-btn--best' : ''}" data-piece="${p}" title="${labels[p]} (${keys[p]})">
        <img src="${imgSrc}" alt="${labels[p]}" class="promo-img" draggable="false">
        <span class="promo-name">${labels[p]}</span>
        <kbd class="promo-key">${keys[p]}</kbd>
      </button>`;
    }).join('');
    container.querySelectorAll('.promo-btn').forEach(btn => {
      btn.addEventListener('click', () => _resolvePromotion(btn.dataset.piece));
    });
  }

  _promoCallback = onPick;

  // Remove any stale keyboard handler before adding a new one
  if (_promoKeyHandler) document.removeEventListener('keydown', _promoKeyHandler);
  _promoKeyHandler = (e) => {
    const piece = { q:'q', r:'r', b:'b', n:'n' }[e.key.toLowerCase()];
    if (!piece) return;
    e.preventDefault();
    _resolvePromotion(piece);
  };
  document.addEventListener('keydown', _promoKeyHandler);

  const modal = document.getElementById('promo-picker-modal');
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function _resolvePromotion(piece) {
  if (_promoKeyHandler) {
    document.removeEventListener('keydown', _promoKeyHandler);
    _promoKeyHandler = null;
  }
  const modal = document.getElementById('promo-picker-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
  if (_promoCallback) { _promoCallback(piece); _promoCallback = null; }
}

function playDoMove(from, to, promotion, animate) {
  const move = playState.game.move({ from, to, promotion });
  if (!move) return false;
  // User moved — exit browse mode and clear AI highlight
  playState.browseIndex = null;
  playState.aiLastMove = null;
  document.getElementById('play-btn-jump-current').style.display = 'none';
  playState.board.position(playState.game.fen(), animate && boardSettings.moveAnimation);
  if (boardSettings.soundEnabled) playMoveSound();
  playRecordMove(move.san, playState.game.turn() === 'w' ? 'b' : 'w');
  renderMaterialBars('mat-play-top', 'mat-play-bot', playState.game.fen(), playState.orientation);
  if (playState.game.game_over()) { playHandleGameOver(); return true; }
  playRequestOpponentMove();
  return true;
}

function playOnDrop(source, target) {
  _pieceIsDragging = false;
  if (_cancelNextDrop) {
    _cancelNextDrop = false;
    clearPlayHighlights();
    playState.selectedSquare = null;
    playState.legalTargetSquares = [];
    return 'snapback';
  }

  if (source === target) {
    playState._dropHandledClick = true;
    setTimeout(() => { playState._dropHandledClick = false; }, 100);
    // Toggle selection
    if (playState.selectedSquare === source) {
      clearPlayHighlights();
      playState.selectedSquare = null;
      playState.legalTargetSquares = [];
    }
    return 'snapback';
  }

  clearPlayHighlights();
  playState.selectedSquare = null;
  playState.legalTargetSquares = [];

  if (!playState.active || playState.waitingForOpponent) return 'snapback';

  // Check for promotion via legal moves (most reliable)
  const candidateMoves = playState.game.moves({ verbose: true }).filter(m => m.from === source && m.to === target);
  if (!candidateMoves.length) return 'snapback';

  if (candidateMoves.some(m => m.promotion) && !gameplaySettings.autoQueenPromotion) {
    showPromotionPicker(playState.game.turn(), (piece) => playDoMove(source, target, piece, false));
    return 'snapback';
  }

  // Defer to playOnSnapEnd — calling playDoMove here invokes board.position() which
  // renders the piece on the target square while the snap animation is still running.
  playState._pendingDrop = { source, target };
}

function playOnSnapEnd() {
  _pieceIsDragging = false;
  if (playState._pendingDrop) {
    const { source, target } = playState._pendingDrop;
    playState._pendingDrop = null;
    if (!playDoMove(source, target, 'q', false)) {
      playState.board.position(playState.game.fen(), false);
    }
    return;
  }
  playState.board.position(playState.game.fen(), false);
  $(`#play-board [data-square="${playState.selectedSquare}"]`).addClass('highlight-selected');
  if (boardSettings.highlightLegal) {
    playState.legalTargetSquares.forEach(sq => {
      $(`#play-board [data-square="${sq}"]`).addClass('highlight-legal');
    });
  }
}

function playOnSquareClick(square) {
  if (playState.browseIndex !== null) {
    playJumpToCurrent();
    return;
  }
  if (!playState.active || playState.waitingForOpponent || playState.game.game_over()) return;
  const turn = playState.game.turn();
  const userChar = playState.userColor === 'white' ? 'w' : 'b';
  if (turn !== userChar) return;

  if (playState.selectedSquare) {
    // Try to complete a move
    const isLegal = playState.legalTargetSquares.includes(square);
    const prevSel = playState.selectedSquare;
    clearPlayHighlights();
    playState.selectedSquare = null;
    playState.legalTargetSquares = [];

    if (isLegal) {
      const legalMoves = playState.game.moves({ verbose: true });
      if (legalMoves.some(m => m.from === prevSel && m.to === square && m.promotion) && !gameplaySettings.autoQueenPromotion) {
        showPromotionPicker(playState.game.turn(), (piece) => playDoMove(prevSel, square, piece, true));
        return;
      }
      playDoMove(prevSel, square, 'q', true);
      return;
    }

    // If clicked own piece again — re-select
    const piece = playState.game.get(square);
    if (piece && piece.color === userChar) {
      playState.selectedSquare = square;
      const moves = playState.game.moves({ square, verbose: true });
      playState.legalTargetSquares = moves.map(m => m.to);
      $(`#play-board [data-square="${square}"]`).addClass('highlight-selected');
      if (boardSettings.highlightLegal) {
        playState.legalTargetSquares.forEach(sq => {
          $(`#play-board [data-square="${sq}"]`).addClass('highlight-legal');
        });
      }
    }
  } else {
    // First click — select piece
    const piece = playState.game.get(square);
    if (piece && piece.color === userChar) {
      clearPlayHighlights();
      playState.selectedSquare = square;
      const moves = playState.game.moves({ square, verbose: true });
      playState.legalTargetSquares = moves.map(m => m.to);
      $(`#play-board [data-square="${square}"]`).addClass('highlight-selected');
      if (boardSettings.highlightLegal) {
        playState.legalTargetSquares.forEach(sq => {
          $(`#play-board [data-square="${sq}"]`).addClass('highlight-legal');
        });
      }
    }
  }
}

// Append one ply to the move-history bookkeeping (plyHistory + playMoves grid).
// Fully determined by the running plyCount, so it is reused both when a move is
// played live and when the history is rebuilt after a take-back (see
// playRebuildBookkeeping).
function appendPlyRecord(san, color, fen, from, to) {
  const plyIdx = playState.plyCount;
  const moveNum = Math.ceil((plyIdx + 1) / 2);
  const isWhiteMove = color === 'w';

  playState.plyHistory[plyIdx] = { fen, from, to, san };

  if (isWhiteMove) {
    playState.playMoves.push({ num: moveNum, white: san, black: '', whitePly: plyIdx, blackPly: -1 });
  } else {
    const last = playState.playMoves[playState.playMoves.length - 1];
    if (last && last.num === moveNum && last.black === '') {
      last.black = san;
      last.blackPly = plyIdx;
    } else {
      playState.playMoves.push({ num: moveNum, white: '—', black: san, whitePly: -1, blackPly: plyIdx });
    }
  }

  playState.plyCount++;
}

function playRecordMove(san, color) {
  const verbHist = playState.game.history({ verbose: true });
  const lastMove = verbHist[verbHist.length - 1];
  appendPlyRecord(san, color, playState.game.fen(),
                  lastMove ? lastMove.from : null,
                  lastMove ? lastMove.to : null);
  renderPlayMoveHistory();
  updatePlayUndoBtn();

  // A move played after a save means the saved copy is now stale — re-arm the
  // save-before-leaving prompt so the new move isn't silently lost.
  playState.savedToCollection = false;
}

// Rebuild plyHistory / playMoves / plyCount from the current game state by
// replaying its move list. Used after a take-back trims the game.
function playRebuildBookkeeping() {
  const verbose = playState.game.history({ verbose: true });
  playState.plyHistory = [];
  playState.playMoves = [];
  playState.plyCount = 0;
  const tmp = new Chess();
  if (playState.customStartFen) tmp.load(playState.customStartFen); else tmp.reset();
  for (const mv of verbose) {
    tmp.move(mv.san);
    appendPlyRecord(mv.san, mv.color, tmp.fen(), mv.from, mv.to);
  }
}

function renderPlayMoveHistory() {
  const el = document.getElementById('play-move-history');
  if (!el) return;
  if (playState.playMoves.length === 0) {
    el.textContent = 'No moves yet.';
    return;
  }
  const cur = playState.browseIndex;
  const lastPly = playState.plyHistory.length - 1;
  const rows = playState.playMoves.map(r => {
    const wActive = r.whitePly >= 0 && cur === r.whitePly;
    const bActive = r.blackPly >= 0 && cur === r.blackPly;
    // Highlight the last move in the game (when not browsing) so user knows where we are
    const wLast = cur === null && r.whitePly === lastPly;
    const bLast = cur === null && r.blackPly === lastPly;
    const wCls = `move-san${wActive || wLast ? ' current' : ''}`;
    const bCls = `move-san${bActive || bLast ? ' current' : ''}`;
    const wCell = r.whitePly >= 0
      ? `<td class="move-cell" data-ply-idx="${r.whitePly}"><span class="${wCls}">${sanToFigurine(r.white, 'w')}</span></td>`
      : `<td class="move-cell"><span class="move-san">${sanToFigurine(r.white, 'w')}</span></td>`;
    const bCell = r.blackPly >= 0
      ? `<td class="move-cell" data-ply-idx="${r.blackPly}"><span class="${bCls}">${sanToFigurine(r.black, 'b')}</span></td>`
      : `<td class="move-cell"><span class="move-san">${sanToFigurine(r.black, 'b')}</span></td>`;
    return `<tr><td class="move-num-cell">${r.num}.</td>${wCell}${bCell}</tr>`;
  }).join('');
  el.innerHTML = `<table class="move-table"><tbody>${rows}</tbody></table>`;

  el.querySelectorAll('td.move-cell[data-ply-idx]').forEach(td => {
    td.addEventListener('click', () => playBrowseTo(parseInt(td.dataset.plyIdx, 10)));
  });

  scrollCurrentMoveIntoView(el);
}

function playApplyLastMoveHighlight() {
  clearPlayHighlights();
  if (playState.aiLastMove) {
    $(`#play-board [data-square="${playState.aiLastMove.from}"]`).addClass('highlight-last-move');
    $(`#play-board [data-square="${playState.aiLastMove.to}"]`).addClass('highlight-last-move');
  }
}

function playBrowseTo(plyIdx) {
  const entry = playState.plyHistory[plyIdx];
  if (!entry) return;
  const lastPly = playState.plyHistory.length - 1;
  if (plyIdx === lastPly) { playJumpToCurrent(); return; }
  playState.browseIndex = plyIdx;
  playState.board.position(entry.fen, false);
  clearPlayHighlights();
  if (entry.from) $(`#play-board [data-square="${entry.from}"]`).addClass('highlight-last-move');
  if (entry.to) $(`#play-board [data-square="${entry.to}"]`).addClass('highlight-last-move');
  const jumpBtn = document.getElementById('play-btn-jump-current');
  if (jumpBtn) jumpBtn.style.display = '';
  renderPlayMoveHistory();
}

function playBrowsePrev() {
  const lastPly = playState.plyHistory.length - 1;
  if (lastPly < 0) return;
  // When not browsing, virtual position is lastPly (the live game state)
  const curIdx = playState.browseIndex !== null ? playState.browseIndex : lastPly;
  if (curIdx > 0) playBrowseTo(curIdx - 1);
}

function playBrowseNext() {
  if (playState.browseIndex === null) return;
  const lastPly = playState.plyHistory.length - 1;
  if (playState.browseIndex >= lastPly - 1) {
    playJumpToCurrent();
  } else {
    playBrowseTo(playState.browseIndex + 1);
  }
}

function playJumpToCurrent() {
  playState.browseIndex = null;
  playState.board.position(playState.game.fen(), false);
  playApplyLastMoveHighlight();
  const jumpBtn = document.getElementById('play-btn-jump-current');
  if (jumpBtn) jumpBtn.style.display = 'none';
  renderPlayMoveHistory();
}

// The user has at least one of their own moves on the board (a take-back target).
function playUserHasMoved() {
  const userChar = playState.userColor === 'white' ? 'w' : 'b';
  return playState.game.history({ verbose: true }).some(m => m.color === userChar);
}

// Enable the take-back button only when the user has a move to take back and we
// are not mid opponent-think.
function updatePlayUndoBtn() {
  const btn = document.getElementById('play-btn-undo');
  if (!btn) return;
  btn.disabled = !(playState.active && !playState.waitingForOpponent && playUserHasMoved());
}

// Take back to the user's previous turn: removes the opponent's reply (if any)
// and the user's last move so it becomes the user's move again.
function playUndoMove() {
  if (!playState.active || playState.waitingForOpponent) return;
  if (!playUserHasMoved()) return;

  if (playState.browseIndex !== null) playJumpToCurrent();

  const userChar = playState.userColor === 'white' ? 'w' : 'b';

  // Remove the most recent move, then keep removing until it is the user's turn
  // again (this strips the opponent's reply plus the user's own last move).
  playState.game.undo();
  while (playState.game.history().length > 0 && playState.game.turn() !== userChar) {
    playState.game.undo();
  }

  playRebuildBookkeeping();
  playState.browseIndex = null;
  playState.aiLastMove = null;
  playState.selectedSquare = null;
  playState.legalTargetSquares = [];
  playState.savedToCollection = false;

  clearPlayHighlights();
  playState.board.position(playState.game.fen(), boardSettings.moveAnimation);
  renderMaterialBars('mat-play-top', 'mat-play-bot', playState.game.fen(), playState.orientation);
  renderPlayMoveHistory();

  const jumpBtn = document.getElementById('play-btn-jump-current');
  if (jumpBtn) jumpBtn.style.display = 'none';

  // Re-highlight the move that is now the latest one on the board.
  const lastPly = playState.plyHistory.length - 1;
  if (lastPly >= 0) {
    const e = playState.plyHistory[lastPly];
    if (e.from) $(`#play-board [data-square="${e.from}"]`).addClass('highlight-last-move');
    if (e.to)   $(`#play-board [data-square="${e.to}"]`).addClass('highlight-last-move');
  }

  setPlayStatus('Your turn', '');
  updatePlayUndoBtn();
}

async function playRequestOpponentMove() {
  playState.waitingForOpponent = true;
  setPlayThinking(true);
  updatePlayUndoBtn();

  try {
    const res = await fetch('/api/play/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ fen: playState.game.fen(), persona: playState.persona }),
    });

    const data = await res.json().catch(() => ({}));
    if (data.highLatency) showTrafficNotice();
    if (!res.ok) {
      if (data.error === 'game_over') { playHandleGameOver(); return; }
      throw new Error(data.error || 'Server error');
    }

    const promo = data.move && data.move.length === 5 ? data.move[4] : undefined;
    const move = playState.game.move({
      from: data.move.slice(0, 2),
      to: data.move.slice(2, 4),
      ...(promo && { promotion: promo }),
    });

    if (move) {
      playState.aiLastMove = { from: move.from, to: move.to };
      playState.board.position(playState.game.fen(), true);
      if (boardSettings.soundEnabled) playMoveSound();
      playRecordMove(data.san || move.san, playState.game.turn() === 'w' ? 'b' : 'w');
      renderMaterialBars('mat-play-top', 'mat-play-bot', playState.game.fen(), playState.orientation);
      // Only apply highlight if not currently browsing history
      if (playState.browseIndex === null) playApplyLastMoveHighlight();
    }

    if (playState.game.game_over()) playHandleGameOver();
  } catch (err) {
    console.error('[play] Opponent move error:', err.message);
    setPlayStatus('Network error. Please try again.', '');
  } finally {
    playState.waitingForOpponent = false;
    setPlayThinking(false);
    updatePlayUndoBtn();
  }
}

function startPlayGame() {
  // Resolve random color selection
  if (playState.userColor === 'random') {
    const resolved = Math.random() < 0.5 ? 'white' : 'black';
    playState.userColor = resolved;
    document.querySelectorAll('.play-color-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    const resolvedBtn = document.querySelector(`.play-color-btn[data-color="${resolved}"]`);
    resolvedBtn?.classList.add('active');
    resolvedBtn?.setAttribute('aria-pressed', 'true');
  }

  if (playState.customStartFen) {
    playState.game.load(playState.customStartFen);
  } else {
    playState.game.reset();
  }
  playState.active = true;
  playState.waitingForOpponent = false;
  playState.playMoves = [];
  playState.plyHistory = [];
  playState.browseIndex = null;
  playState.aiLastMove = null;
  playState.selectedSquare = null;
  playState.legalTargetSquares = [];
  playState.savedToCollection = false;
  playState.resignResult = null;
  playState.gameTitle = playDefaultTitle();
  playState.plyCount = 0;
  playState._prefetchedComment = null;
  playState._prefetchingComment = false;
  playState._chatHistory = [];
  playState._chatPending = false;
  playState._speechLog = [];
  renderPlaySpeechLog();
  togglePlayOppLog(false);

  // Switch panels
  document.getElementById('play-setup-panel').style.display = 'none';
  document.getElementById('play-game-panel').style.display = '';

  // Update character card
  const p = PERSONAS_CLIENT[playState.persona];
  const cc = playState.persona;
  const card = document.getElementById('play-character-card');
  if (card) {
    card.className = `play-character-card char-${cc}`;
  }
  const avatarEl = document.getElementById('play-character-avatar');
  if (avatarEl) {
    avatarEl.innerHTML = xpIconHtml(p.avatar);
    avatarEl.className = `play-character-avatar persona-color-${cc}`;
  }
  const nameEl = document.getElementById('play-character-name');
  if (nameEl) nameEl.textContent = p.name;
  const eloEl = document.getElementById('play-character-elo');
  if (eloEl) {
    eloEl.textContent = `${p.elo} Elo`;
    eloEl.className = `play-character-elo elo-${cc}`;
  }

  // Reset speech bubble and start idle banter + time-based special comments
  setSpeechText("Your move!", false);
  setPlayStatus('Your turn', '');
  startPlayIdleBanter();
  startSpecialCommentSchedule();

  // Show chat input
  const chatWrap = document.getElementById('play-chat-wrap');
  if (chatWrap) chatWrap.style.display = '';
  const chatInput = document.getElementById('play-chat-input');
  if (chatInput) {
    const p = PERSONAS_CLIENT[playState.persona];
    chatInput.placeholder = p ? `Chat with ${p.name}…` : 'Say something…';
    chatInput.disabled = false;
    chatInput.value = '';
  }
  const chatBtn = document.getElementById('btn-play-chat-send');
  if (chatBtn) chatBtn.disabled = false;
  // Show mobile chat toggle (mobile only); update placeholder
  const mobileChatToggle = document.getElementById('btn-play-mobile-chat-toggle');
  if (mobileChatToggle && window.innerWidth <= 640) mobileChatToggle.style.display = 'flex';
  // Show mobile resign button (mobile only) — desktop uses the .play-game-actions Resign button
  const mobileResignToggle = document.getElementById('btn-play-mobile-resign');
  if (mobileResignToggle && window.innerWidth <= 640) mobileResignToggle.style.display = 'flex';
  // Show mobile "ask the coach" toggle on the same breakpoint as the chat toggle
  const mobileAskToggle = document.getElementById('btn-play-mobile-ask-toggle');
  if (mobileAskToggle && window.innerWidth <= 860) mobileAskToggle.style.display = 'flex';

  // Reset the ask-the-coach panel for the new game
  resetPlayAsk();
  const askInput = document.getElementById('play-question-input');
  if (askInput) askInput.disabled = false;
  const askSend = document.getElementById('btn-play-ask');
  if (askSend) askSend.disabled = false;
  updatePlayUndoBtn();
  const mobileChatInput = document.getElementById('play-mobile-chat-input');
  if (mobileChatInput) {
    const p2 = PERSONAS_CLIENT[playState.persona];
    mobileChatInput.placeholder = p2 ? `Chat with ${p2.name}…` : 'Say something…';
    mobileChatInput.disabled = false;
    mobileChatInput.value = '';
  }

  // Orient and reset board — resize after making panel visible. Recompute
  // --board-size now that the game panel is shown, so applyBoardSize can measure
  // the arena's real chrome (material bars + button bar) instead of falling back.
  playState.orientation = playState.userColor;
  applyBoardSize();
  playState.board.resize();
  playState.board.orientation(playState.orientation);
  playState.board.position(playState.game.fen(), false);
  renderPlayMoveHistory();
  const matTop = document.getElementById('mat-play-top');
  const matBot = document.getElementById('mat-play-bot');
  if (matTop) matTop.innerHTML = '';
  if (matBot) matBot.innerHTML = '';

  // Let AI move first if the side to move in the starting position is not the user
  const startSideToMove = playState.game.turn(); // 'w' or 'b'
  const userChar = playState.userColor === 'white' ? 'w' : 'b';
  if (startSideToMove !== userChar) {
    setTimeout(() => playRequestOpponentMove(), 500);
  }
}

function playResign() {
  if (!playState.active) return;
  // Show confirmation modal instead of resigning immediately
  const modal = document.getElementById('play-resign-modal');
  if (modal) modal.style.display = 'flex';
}

function playDoResign() {
  playState.active = false;
  playState.waitingForOpponent = false;
  playState.resignResult = 'resigned';
  updatePlayUndoBtn();
  stopPlayIdleBanter();
  stopSpecialCommentSchedule();
  setPlayStatus('You resigned.', 'status-loss');
  const resignLines = [
    "Good game. Better luck next time!",
    "I'll take it! GG.",
    "Wise decision.",
    "That's the spirit, knowing when to stop.",
    "Respect for knowing when to call it.",
    "I was enjoying that. But sure.",
  ];
  setSpeechText(resignLines[Math.floor(Math.random() * resignLines.length)], true);
  const eloEl = document.getElementById('play-over-elo');
  if (eloEl) eloEl.style.display = 'none';
  submitPlayResult('loss');
  setTimeout(() => showPlayGameOverModal('loss', 'You resigned', 'You resigned.'), 900);
}

const REMATCH_LINES = {
  jonas:  ["Let's go again! I'll definitely win this time.", "Ok ok, one more game!", "Rematch! I was just warming up.", "I learned a lot. Ready!"],
  clarer: ["Ready for round 2!", "Rematch accepted!", "I'll be more careful this time.", "Sure, let's do this again!"],
  rahim:  ["Good, I was hoping you'd say that.", "Let's see if you can do it again.", "I welcome the rematch.", "I'm ready."],
  david:  ["A rematch, good call.", "Let's play again.", "I'll be precise this time.", "Show me what you've got."],
  gert:   ["Interesting. Let the second game begin.", "A rematch. Very well.", "I'll be more precise.", "Your move."],
};

function playRematch() {
  document.getElementById('play-game-over-modal').style.display = 'none';
  playState.userColor = playState.userColor === 'white' ? 'black' : 'white';
  document.querySelectorAll('.play-color-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  const rematchBtn = document.querySelector(`.play-color-btn[data-color="${playState.userColor}"]`);
  rematchBtn?.classList.add('active');
  rematchBtn?.setAttribute('aria-pressed', 'true');
  startPlayGame();
  const lines = REMATCH_LINES[playState.persona] || ["Ready for a rematch?"];
  setTimeout(() => setSpeechText(lines[Math.floor(Math.random() * lines.length)], true), 80);
}

function playReturnToSetup() {
  playState.active = false;
  playState.waitingForOpponent = false;
  playState.game.reset();
  playState.savedToCollection = false;
  stopPlayIdleBanter();
  stopSpecialCommentSchedule();
  document.getElementById('play-game-panel').style.display = 'none';
  document.getElementById('play-setup-panel').style.display = '';
  setPlayStatus('', '');
  if (playState.board) playState.board.position('start', false);
  playState.browseIndex = null;
  playState.aiLastMove = null;
  const jumpBtn = document.getElementById('play-btn-jump-current');
  if (jumpBtn) jumpBtn.style.display = 'none';
  clearPlayHighlights();
  renderPlayMoveHistory();
  const chatWrap = document.getElementById('play-chat-wrap');
  if (chatWrap) chatWrap.style.display = 'none';
  const chatInput = document.getElementById('play-chat-input');
  if (chatInput) { chatInput.value = ''; chatInput.disabled = false; }
  const chatBtn = document.getElementById('btn-play-chat-send');
  if (chatBtn) chatBtn.disabled = false;
  const mobileChatToggle2 = document.getElementById('btn-play-mobile-chat-toggle');
  if (mobileChatToggle2) mobileChatToggle2.style.display = 'none';
  const mobileChatBar2 = document.getElementById('play-mobile-chat-bar');
  if (mobileChatBar2) mobileChatBar2.style.display = 'none';
  const mobileChatInput2 = document.getElementById('play-mobile-chat-input');
  if (mobileChatInput2) { mobileChatInput2.value = ''; mobileChatInput2.disabled = false; }
  const mobileAskToggle2 = document.getElementById('btn-play-mobile-ask-toggle');
  if (mobileAskToggle2) mobileAskToggle2.style.display = 'none';
  const mobileResignToggle2 = document.getElementById('btn-play-mobile-resign');
  if (mobileResignToggle2) mobileResignToggle2.style.display = 'none';
  resetPlayAsk();
  updatePlayUndoBtn();
}

function playRequestSaveBeforeLeaving(onLeave) {
  if (!playHasMoves() || playState.savedToCollection) {
    onLeave();
    return;
  }
  const modal = document.getElementById('play-save-modal');
  if (!modal) { onLeave(); return; }
  const titleInput = document.getElementById('play-save-game-title');
  if (titleInput) titleInput.value = playState.gameTitle || playDefaultTitle();
  modal._onLeave = onLeave;
  modal.style.display = 'flex';
}

async function submitPlayResult(resultType) {
  if (!authState.user) return;
  const persona = playState.persona;
  if (!persona) return;
  try {
    const resp = await fetch('/api/play/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: resultType, persona }),
    });
    if (!resp.ok) return;
    const data = await resp.json();
    const eloEl = document.getElementById('play-over-elo');
    if (eloEl && data.eloChange !== undefined) {
      const sign  = data.eloChange >= 0 ? '+' : '';
      const dir   = data.eloChange > 0 ? 'elo-up' : data.eloChange < 0 ? 'elo-down' : 'elo-same';
      eloEl.className = `play-over-elo ${dir}`;
      eloEl.textContent = `${sign}${data.eloChange} rating  (${data.oldElo} → ${data.newElo})`;
      eloEl.style.display = '';
    }
  } catch (_) {}
}

function updatePlaySetupUI() {
  const indicator = document.getElementById('play-custom-pos-indicator');
  if (indicator) indicator.style.display = playState.customStartFen ? '' : 'none';
}

function playHandleGameOver() {
  playState.active = false;
  stopPlayIdleBanter();
  stopSpecialCommentSchedule();
  updatePlayUndoBtn();
  const game = playState.game;

  let msg = '';
  let cls = '';
  let bubble = '';
  let resultType = 'draw';
  let resultLabel = 'Draw';

  if (game.in_checkmate()) {
    const winner = game.turn() === 'w' ? 'Black' : 'White';
    const userColor = playState.userColor === 'white' ? 'White' : 'Black';
    if (winner === userColor) {
      msg = 'You win by checkmate!'; cls = 'status-win';
      bubble = "Well played. You got me there.";
      resultType = 'win'; resultLabel = 'You win!';
    } else {
      msg = 'Checkmate. You lose.'; cls = 'status-loss';
      bubble = "Checkmate! Great game, want a rematch?";
      resultType = 'loss'; resultLabel = 'You lose';
    }
  } else if (game.in_stalemate()) {
    msg = 'Stalemate. Draw.'; cls = 'status-draw';
    bubble = "Stalemate! I'll take the half point.";
    resultLabel = 'Stalemate';
  } else if (game.in_threefold_repetition()) {
    msg = 'Draw by repetition.'; cls = 'status-draw';
    bubble = "Going in circles, huh? I'll call it a draw.";
    resultLabel = 'Draw by repetition';
  } else if (game.insufficient_material()) {
    msg = 'Draw by insufficient material.'; cls = 'status-draw';
    bubble = "Not enough pieces left to finish this off.";
    resultLabel = 'Insufficient material';
  } else if (game.in_draw()) {
    msg = 'Draw.'; cls = 'status-draw';
    bubble = "It's a draw. Solid play.";
  }
  setPlayStatus(msg, cls);
  if (bubble) setSpeechText(bubble, true);

  const eloEl = document.getElementById('play-over-elo');
  if (eloEl) eloEl.style.display = 'none';
  submitPlayResult(resultType);

  // Show save prompt after a short delay so the board result is visible first
  setTimeout(() => showPlayGameOverModal(resultType, resultLabel, msg), 900);
}

function showPlayGameOverModal(resultType, resultLabel, statusMsg) {
  const modal = document.getElementById('play-game-over-modal');
  if (!modal) return;

  const badge = document.getElementById('play-over-result-badge');
  if (badge) {
    badge.textContent = resultLabel;
    badge.className = `play-over-result-badge result-${resultType}`;
  }

  const subtitle = document.getElementById('play-over-subtitle');
  if (subtitle) subtitle.textContent = statusMsg || 'Game over. Save to your collection?';

  const titleInput = document.getElementById('play-over-game-title');
  if (titleInput) titleInput.value = playState.gameTitle || playDefaultTitle();

  modal.style.display = 'flex';
  setTimeout(() => { if (titleInput && !window.matchMedia('(hover: none)').matches) titleInput.focus(); }, 80);
}

function setSpeechText(text, animate) {
  const textEl = document.getElementById('play-speech-text');
  const thinkEl = document.getElementById('play-speech-thinking');
  if (!textEl) return;
  thinkEl && (thinkEl.style.display = 'none');
  textEl.style.display = '';
  textEl.textContent = text;
  const bubble = document.getElementById('play-speech-bubble');
  if (bubble) bubble.scrollTop = 0;
  if (animate) {
    textEl.classList.remove('speech-new');
    void textEl.offsetWidth; // reflow to restart animation
    textEl.classList.add('speech-new');
  }
  // Record real utterances (animate=true) into the opponent speech log so the
  // mobile expandable chat can show the full conversation. The non-animated
  // "Your move!" base state is skipped; consecutive duplicates are deduped.
  if (animate && playState && Array.isArray(playState._speechLog)) {
    const log = playState._speechLog;
    if (!log.length || log[log.length - 1].text !== text) {
      log.push({ text, ts: Date.now() });
      if (log.length > 50) log.shift();
      renderPlaySpeechLog();
    }
  }
}

// ── Play: mobile expandable opponent chat ────────────────────────────────────
// The mobile opponent bar shows only the latest line; tapping it expands a panel
// listing everything the opponent has said this game (banter, move comments,
// chat replies). renderPlaySpeechLog repaints that panel from playState._speechLog.
function renderPlaySpeechLog() {
  const panel = document.getElementById('play-mobile-opp-log');
  if (!panel) return;
  const log = (playState && playState._speechLog) || [];
  if (!log.length) {
    panel.innerHTML = '<div class="play-opp-log-empty">No messages yet. Your opponent will chat as you play.</div>';
    return;
  }
  panel.innerHTML = log
    .map(({ text }) => `<div class="play-opp-log-msg">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`)
    .join('');
  // Pin to the newest message at the bottom
  panel.scrollTop = panel.scrollHeight;
}

function togglePlayOppLog(force) {
  const bar = document.getElementById('play-mobile-opp-bar');
  if (!bar) return;
  const willOpen = typeof force === 'boolean' ? force : !bar.classList.contains('expanded');
  bar.classList.toggle('expanded', willOpen);
  bar.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  if (willOpen) {
    const panel = document.getElementById('play-mobile-opp-log');
    if (panel) panel.scrollTop = panel.scrollHeight;
  }
}

function setPlayThinking(on) {
  if (on) {
    setPlayStatus('Thinking\u2026', '');
  } else {
    if (playState.active && !playState.game.game_over()) setPlayStatus('Your turn', '');
  }
}

function setPlayStatus(text, cls) {
  const el = document.getElementById('play-game-status');
  if (!el) return;
  el.textContent = text;
  el.className = 'play-game-status' + (cls ? ' ' + cls : '');
}

// ── Play: idle banter (time-based, instant, no loading) ──────────────────────

function startPlayIdleBanter() {
  stopPlayIdleBanter();
  playState._idleShownIndices = new Set();
  scheduleNextIdleMessage();
}

function stopPlayIdleBanter() {
  clearTimeout(playState._idleTimer);
  playState._idleTimer = null;
}

function scheduleNextIdleMessage() {
  // Random 25–50 second delay — decoupled from move pace
  const delay = 25000 + Math.random() * 25000;
  playState._idleTimer = setTimeout(showNextIdleMessage, delay);
}

function showNextIdleMessage() {
  if (!playState.active || playState.game.game_over()) return;

  // Skip while opponent is thinking — don't interrupt the thinking dots
  if (playState.waitingForOpponent) {
    scheduleNextIdleMessage();
    return;
  }

  const pool = PERSONA_IDLE_MESSAGES[playState.persona] || [];
  if (!pool.length) { scheduleNextIdleMessage(); return; }

  // Avoid repeating recently shown messages; reset when half the pool is used
  if (playState._idleShownIndices.size >= Math.floor(pool.length / 2)) {
    playState._idleShownIndices = new Set();
  }

  let idx;
  let attempts = 0;
  do {
    idx = Math.floor(Math.random() * pool.length);
    attempts++;
  } while (playState._idleShownIndices.has(idx) && attempts < 20);

  playState._idleShownIndices.add(idx);
  setSpeechText(pool[idx], true);
  scheduleNextIdleMessage();
}

// ── Play: special position comment on a time interval (proactively prefetched) ──

function startSpecialCommentSchedule() {
  stopSpecialCommentSchedule();
  scheduleNextSpecialComment();
}

function stopSpecialCommentSchedule() {
  clearTimeout(playState._specialCommentTimer);
  playState._specialCommentTimer = null;
}

function scheduleNextSpecialComment() {
  // Show every 3–4 minutes
  const delay = 180000 + Math.random() * 60000;
  // Start prefetching ~40s before it's due so the comment is ready instantly
  const prefetchDelay = Math.max(0, delay - 40000);
  setTimeout(() => {
    if (!playState.active || playState.game.game_over()) return;
    if (!playState._prefetchingComment && !playState._prefetchedComment) {
      playState._prefetchingComment = true;
      fetchSpecialComment();
    }
  }, prefetchDelay);
  playState._specialCommentTimer = setTimeout(consumeSpecialComment, delay);
}

async function fetchSpecialComment() {
  const fen = playState.game.fen();
  const sanHistory = playState.game.history();
  const personaColor = playState.userColor === 'white' ? 'black' : 'white';

  try {
    const res = await fetch('/api/play/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ fen, persona: playState.persona, sanHistory, personaColor }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.commentary && playState.active && !playState.game.game_over()) {
      playState._prefetchedComment = data.commentary;
    }
  } catch (err) {
    console.error('[play] Special comment prefetch error:', err.message);
  } finally {
    playState._prefetchingComment = false;
  }
}

function consumeSpecialComment() {
  if (!playState.active || playState.game.game_over()) return;

  if (playState._prefetchedComment) {
    const comment = playState._prefetchedComment;
    playState._prefetchedComment = null;
    stopPlayIdleBanter();
    setSpeechText(comment, true);
    setTimeout(startPlayIdleBanter, 8000);
  }

  scheduleNextSpecialComment();
}

// ── Play: chat with opponent ────────────────────────────────────────────────

async function sendPlayChat(srcInput, srcBtn) {
  if (playState._chatPending) return;
  if (!playState.active) return;

  const input   = srcInput  || document.getElementById('play-chat-input');
  const sendBtn = srcBtn    || document.getElementById('btn-play-chat-send');
  if (!input || !sendBtn) return;

  const question = input.value.trim();
  if (!question) return;
  if (question.length > AI_MSG_MAX_LEN.chat) {
    showToast('Message too long', 'error');
    return;
  }

  input.value = '';
  input.disabled = true;
  sendBtn.disabled = true;
  playState._chatPending = true;

  // Show thinking state in speech bubble while waiting
  stopPlayIdleBanter();
  const textEl  = document.getElementById('play-speech-text');
  const thinkEl = document.getElementById('play-speech-thinking');
  if (textEl)  textEl.style.display  = 'none';
  if (thinkEl) thinkEl.style.display = '';

  try {
    const personaColor = playState.userColor === 'white' ? 'black' : 'white';
    const res = await fetch('/api/play/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        fen:          playState.game.fen(),
        persona:      playState.persona,
        question,
        sanHistory:   playState.game.history(),
        personaColor,
        history:      playState._chatHistory,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const reply = data.response || '';

    if (reply && playState.active && !playState.game.game_over()) {
      // Keep last 5 exchanges in history
      playState._chatHistory.push({ question, answer: reply });
      if (playState._chatHistory.length > 5) playState._chatHistory.shift();

      setSpeechText(reply, true);
      // Resume idle banter after 9s so the reply gets read
      setTimeout(startPlayIdleBanter, 9000);
    } else {
      // No reply — restore previous state
      if (thinkEl) thinkEl.style.display = 'none';
      if (textEl)  textEl.style.display  = '';
      if (playState.active && !playState.game.game_over()) startPlayIdleBanter();
    }
  } catch (err) {
    console.error('[play/chat] Error:', err.message);
    if (thinkEl) thinkEl.style.display = 'none';
    if (textEl)  textEl.style.display  = '';
    if (playState.active && !playState.game.game_over()) startPlayIdleBanter();
  } finally {
    playState._chatPending = false;
    input.disabled  = false;
    sendBtn.disabled = false;
    // On mobile, close the chat bar after sending and skip focus (avoids keyboard re-pop)
    const mobileBar = document.getElementById('play-mobile-chat-bar');
    if (input.id === 'play-mobile-chat-input' && mobileBar) {
      mobileBar.style.display = 'none';
    } else {
      input.focus();
    }
  }
}

// ── Play: ask the coach about the current position ──────────────────────────
// Mirrors the Analysis tab's Q&A (same /api/ask/stream endpoint, same look) but
// answers as a neutral coach about the live game position — it never reveals the
// opponent's reply.

// Build the UCI move list leading to the current position (for the ask payload).
function playUciMovesForCurrentPosition() {
  return playState.game.history({ verbose: true })
    .map(m => m.from + m.to + (m.promotion || ''));
}

// Toggle the empty/onboarding state vs. the populated thread.
function refreshPlayAskEmptyState() {
  const empty = document.getElementById('play-ask-empty');
  const hasContent = (playState._askThread && playState._askThread.length > 0) || playState._askPending;
  if (empty) empty.style.display = hasContent ? 'none' : '';
}

function renderPlayQaThread(pendingQuestion = null) {
  const thread = document.getElementById('play-qa-thread');
  if (!thread) return;
  thread.innerHTML = '';
  for (const { question, answer } of (playState._askThread || [])) {
    const block = document.createElement('div');
    block.className = 'qa-block';
    block.innerHTML = `<p class="qa-question">${question.replace(/</g, '&lt;')}</p><div class="qa-answer">${DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(answer)))}</div>`;
    thread.appendChild(block);
  }
  if (pendingQuestion !== null) {
    const block = document.createElement('div');
    block.className = 'qa-block';
    block.innerHTML = `<p class="qa-question">${pendingQuestion.replace(/</g, '&lt;')}</p><div class="qa-answer qa-answer--loading"><span class="qa-dots"><span></span><span></span><span></span></span><span class="qa-loading-msg"></span></div>`;
    thread.appendChild(block);
  }
  refreshPlayAskEmptyState();
}

function openPlayAskSheet() {
  const panel = document.getElementById('play-right-panel');
  const backdrop = document.getElementById('play-ask-backdrop');
  if (panel) panel.classList.add('play-ask-open');
  if (backdrop) backdrop.classList.add('play-ask-open');
  setTimeout(() => document.getElementById('play-question-input')?.focus(), 60);
}

function closePlayAskSheet() {
  const panel = document.getElementById('play-right-panel');
  const backdrop = document.getElementById('play-ask-backdrop');
  if (panel) panel.classList.remove('play-ask-open');
  if (backdrop) backdrop.classList.remove('play-ask-open');
}

async function askPlayQuestion(presetQuestion = null) {
  const input = document.getElementById('play-question-input');
  const sendBtn = document.getElementById('btn-play-ask');
  if (!input || !sendBtn) return;
  if (playState._askPending) return;

  const question = (presetQuestion != null ? presetQuestion : input.value).trim();
  if (!question) return;
  if (!playState.active && !playState.game.history().length) return;
  if (question.length > AI_MSG_MAX_LEN.ask) {
    showError('play-ask-error', 'Message too long');
    return;
  }

  hideError('play-ask-error');
  input.value = '';
  input.blur();
  playState._askPending = true;
  sendBtn.disabled = true;
  input.disabled = true;

  // Snapshot the position at ask-time so the answer matches even if the game moves on.
  const askFen = playState.game.fen();
  const askUci = playUciMovesForCurrentPosition();
  const lastPly = playState.plyHistory[playState.plyHistory.length - 1];
  const lastMoveSan = lastPly ? lastPly.san : null;

  renderPlayQaThread(question);
  const thread = document.getElementById('play-qa-thread');
  const pendingBlock = thread.lastElementChild;
  const answerEl = pendingBlock?.querySelector('.qa-answer');
  const loadingMsgEl = pendingBlock?.querySelector('.qa-loading-msg');
  if (loadingMsgEl) loadingMsgEl.textContent = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // ── Typewriter queue (same approach as the analysis ask flow) ──
  const TYPEWRITER_CHARS_PER_FRAME = 8;
  let typewriterChars = [];
  let typewriterShown = '';
  let typewriterRaf = null;
  let streamingStarted = false;
  let streamAccumulated = '';

  function cancelTypewriter() {
    if (typewriterRaf) { cancelAnimationFrame(typewriterRaf); typewriterRaf = null; }
    typewriterChars = [];
  }
  function renderStreaming(text) {
    if (answerEl) answerEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(text)));
  }
  function startStreaming(text) {
    if (!answerEl) return;
    streamingStarted = true;
    answerEl.classList.remove('qa-answer--loading');
    answerEl.classList.add('qa-answer--streaming');
    renderStreaming(text);
  }
  function drainTypewriter() {
    if (typewriterChars.length === 0) { typewriterRaf = null; return; }
    typewriterShown += typewriterChars.splice(0, TYPEWRITER_CHARS_PER_FRAME).join('');
    if (!streamingStarted) startStreaming(typewriterShown); else renderStreaming(typewriterShown);
    thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    typewriterRaf = requestAnimationFrame(drainTypewriter);
  }
  function enqueueText(text) {
    typewriterChars.push(...text);
    if (!typewriterRaf) typewriterRaf = requestAnimationFrame(drainTypewriter);
  }

  function showToolStatus(tools, moves) {
    if (!answerEl || streamingStarted || !loadingMsgEl) return;
    const acmIdx = tools.indexOf('analyze_candidate_move');
    const gpmIdx = tools.indexOf('get_position_at_move');
    if (acmIdx !== -1 && moves && moves[acmIdx]) {
      loadingMsgEl.textContent = `Analyzing ${moves[acmIdx]}…`;
    } else if (gpmIdx !== -1 && moves && moves[gpmIdx]) {
      loadingMsgEl.textContent = `Investigating position at ${moves[gpmIdx]}…`;
    }
  }

  try {
    const response = await fetch('/api/ask/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        fen: askFen,
        question,
        skillLevel: state.skillLevel,
        lastMoveSan,
        uciMoves: askUci,
        history: (playState._askThread || []).slice(-5),
      }),
    });

    if (response.status === 403 || response.status === 429 || response.status === 503) {
      const errData = await response.json().catch(() => ({}));
      cancelTypewriter();
      renderPlayQaThread();
      if (errData.error === 'email_unverified') showEmailUnverifiedError('play-ask-error');
      else if (errData.error === 'limit_reached') showUpgradeModal(errData);
      else if (errData.error === 'global_limit') showError('play-ask-error', 'Service temporarily unavailable. Please try again later.');
      else showError('play-ask-error', 'Too many requests. Please wait a moment and try again.');
      return;
    }
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let streamDone = false;
    let settled = false;

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

          if (evt.type === 'latency') {
            showTrafficNotice();
          } else if (evt.type === 'tool') {
            showToolStatus(evt.tools, evt.moves);
          } else if (evt.type === 'chunk') {
            streamAccumulated += evt.text;
            enqueueText(evt.text);
          } else if (evt.type === 'done') {
            const finalAnswer = evt.answer || streamAccumulated;
            playState._askThread.push({ question, answer: finalAnswer });
            settled = true;
            const finalize = () => {
              if (answerEl && streamingStarted) {
                answerEl.classList.remove('qa-answer--streaming');
                answerEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(finalAnswer)));
              } else {
                renderPlayQaThread();
              }
              thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            };
            if (typewriterChars.length > 0) {
              const waitAndFinalize = () => {
                if (typewriterChars.length === 0) { cancelTypewriter(); finalize(); return; }
                typewriterShown += typewriterChars.splice(0, TYPEWRITER_CHARS_PER_FRAME).join('');
                renderStreaming(typewriterShown);
                thread.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            settled = true;
            renderPlayQaThread();
            showError('play-ask-error', evt.message || 'Unable to answer. Please try again.');
            streamDone = true;
          }
        }
      }
    }

    if (!settled) {
      cancelTypewriter();
      renderPlayQaThread();
    }
  } catch (err) {
    console.error('[play/ask] stream failed:', err.message);
    cancelTypewriter();
    renderPlayQaThread();
    showError('play-ask-error', 'Network error. Please check your connection and try again.');
  } finally {
    playState._askPending = false;
    sendBtn.disabled = false;
    input.disabled = false;
    refreshPlayAskEmptyState();
  }
}

function resetPlayAsk() {
  playState._askThread = [];
  playState._askPending = false;
  const thread = document.getElementById('play-qa-thread');
  if (thread) thread.innerHTML = '';
  hideError('play-ask-error');
  const input = document.getElementById('play-question-input');
  if (input) { input.value = ''; input.disabled = false; }
  const sendBtn = document.getElementById('btn-play-ask');
  if (sendBtn) sendBtn.disabled = false;
  closePlayAskSheet();
  refreshPlayAskEmptyState();
}

function savePlayGameToCollection(title) {
  const pgn = playGeneratePgn();
  if (!pgn) return false;

  // getCollection/saveCollection/etc. are defined inside DOMContentLoaded scope,
  // so we access them via the module-level wrappers set up there.
  if (typeof _playCollectionSave === 'function') {
    return _playCollectionSave(pgn, title || playDefaultTitle());
  }
  return false;
}

function showPlaySavedToast() {
  let toast = document.getElementById('play-saved-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'play-saved-toast';
    toast.className = 'play-saved-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = 'Game saved to collection!';
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ---------------------------------------------------------------------------
// Puzzle / Train page state
// ---------------------------------------------------------------------------
const puzzleState = {
  board: null,
  game: null,
  puzzle: null,      // { id, fen, triggerMove, solution, rating, themes }
  currentStep: 0,    // index in solution; user moves at 0,2,4; opponent at 1,3,5
  startTime: null,
  solved: false,
  validating: false, // true while checking an alternative move via the server
  usedHint: false,
  wrongAttempts: 0,
  attemptRecorded: false,
  userColor: 'white',
  stats: { puzzleElo: null, puzzlesSolved: 0, currentStreak: 0, puzzlesAttempted: 0 },
  loadingNext: false,
};

function puzzleIsUserTurn() {
  return puzzleState.currentStep % 2 === 0;
}

function puzzleTimeSec() {
  if (!puzzleState.startTime) return 0;
  return Math.round((Date.now() - puzzleState.startTime) / 1000);
}

function showAchievementPopup(achievement, delay = 0) {
  const container = document.getElementById('achievement-popup-container');
  if (!container) return;
  setTimeout(() => {
    const popup = document.createElement('div');
    popup.className = `achievement-popup rarity-${achievement.rarity || 'common'}`;
    popup.innerHTML = `
      <div class="achievement-popup-icon">${renderAchievIcon(achievement.icon || '')}</div>
      <div class="achievement-popup-content">
        <div class="achievement-popup-label">Achievement Unlocked!</div>
        <div class="achievement-popup-name">${achievement.name}</div>
        <div class="achievement-popup-desc">${achievement.desc}</div>
      </div>`;
    container.appendChild(popup);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => popup.classList.add('popup-visible'));
    });
    setTimeout(() => {
      popup.classList.add('popup-leaving');
      setTimeout(() => popup.remove(), 350);
    }, 4500);
  }, delay);
}

document.addEventListener('DOMContentLoaded', () => {
  let _insightsModalGameId = null; // tracks which game's insights modal is open
  let _lastAnalysisData = null;   // stores completed game analysis for "Review game" button
  let _insightsModalData = null;  // analysis data currently rendered in the insights (result) modal
  applyBoardSize();
  initTree();
  markClean();
  loadBoardSettings();
  loadGameplaySettings();

  loadAuthConfig();
  loadAuthState();
  initBoard();
  resetEvalBar();
  setStockfishLinesEnabled(state.evalVisible);
  renderStockfishLines([], state.game.turn(), 0);
  if (state.evalVisible) scheduleEvalUpdate();

  // Restore the persisted engine-eval visibility (hidden via the mobile eye
  // toggle or desktop switch). Only act when it was explicitly turned off.
  try {
    if (localStorage.getItem('eval-visible') === 'false') setEvalVisible(false);
  } catch (_) {}

  // Skill level buttons
  document.querySelectorAll('.skill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.skillLevel = btn.dataset.level;
    });
  });

  // Ask question
  document.getElementById('btn-ask-question').addEventListener('click', askQuestion);
  document.getElementById('question-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') askQuestion();
  });

  // Edit comment (pencil)
  // Panel switcher tabs
  document.getElementById('btn-panel-comments').addEventListener('click', () => switchAnalysisPanel('comments'));
  document.getElementById('btn-panel-opening').addEventListener('click',  () => switchAnalysisPanel('opening'));

  // Browse master games modal
  {
    const browseModal = document.getElementById('browse-games-modal');
    document.getElementById('browse-modal-close')?.addEventListener('click', _closeBrowseModal);
    browseModal?.addEventListener('click', e => { if (e.target === browseModal) _closeBrowseModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && browseModal?.style.display !== 'none') _closeBrowseModal();
    });
    ['bmf-result','bmf-move'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => _browseFilter());
    });
  }

  // Expand/collapse long opening name on click
  document.getElementById('ob-name-row').addEventListener('click', () => {
    document.getElementById('ob-name-row').classList.toggle('ob-name-row--expanded');
  });

  // The Q&A thread is shown inside the edit textarea (below the comment) so it
  // can be edited too. Remember exactly what was appended: on save, an
  // untouched Q&A block is stripped back out (the structured node.qa entries
  // remain the source of truth), while an edited one replaces node.qa. Without
  // this, the Q&A text used to get baked into node.comment on every save and
  // then rendered twice — duplicating a little more with each edit.
  let _editQaSnapshot = null;
  // The node being edited — the user can navigate moves while the form is
  // open, so saving against state.currentNode could hit the wrong move.
  let _editingNode = null;

  // After a comment edit/delete on a game that lives in the collection,
  // persist the whole tree immediately so the change survives reload and
  // reaches other devices — no separate "save game" step needed.
  function persistCommentChange() {
    if (state.loadedGameId) {
      saveCurrentToCollection({ silent: true });
    } else {
      _hasUnsavedCommentEdits = true;
    }
  }
  window._persistCommentChange = persistCommentChange;

  document.getElementById('btn-edit-comment').addEventListener('click', () => {
    const node = state.currentNode;
    _editingNode = node;
    document.getElementById('comment-edit-header').value = node.theme || '';
    let bodyValue = node.comment || '';
    _editQaSnapshot = null;
    if (node.qa && node.qa.length > 0) {
      const qaMd = qaToMarkdown(node.qa);
      bodyValue = bodyValue ? bodyValue + '\n\n' + qaMd : qaMd;
      // Compare against the trimmed form: the saved body is trimmed, so a
      // Q&A answer with trailing whitespace must not break the
      // "did the user touch the Q&A block?" check.
      _editQaSnapshot = qaMd.trim();
    }
    document.getElementById('comment-edit-body').value = bodyValue;
    document.getElementById('analysis-result').classList.remove('visible');
    document.getElementById('comment-edit-form').style.display = 'flex';
    if (!window.matchMedia('(hover: none)').matches) document.getElementById('comment-edit-body').focus();
  });

  // Save edited comment
  document.getElementById('btn-save-comment').addEventListener('click', () => {
    const node = _editingNode || state.currentNode;
    const newTheme = document.getElementById('comment-edit-header').value.trim() || null;
    let body = document.getElementById('comment-edit-body').value.trim();
    if (_editQaSnapshot) {
      if (body.endsWith(_editQaSnapshot)) {
        // Q&A block left as-is — keep the structured thread, store only the
        // comment part above it.
        body = body.slice(0, body.length - _editQaSnapshot.length).trim();
      } else {
        // User rewrote or removed the Q&A text — the body now owns it.
        node.qa = [];
      }
    }
    _editQaSnapshot = null;
    _editingNode = null;
    const newComment = body || null;
    node.theme = newTheme;
    node.comment = newComment;
    markDirty();
    document.getElementById('comment-edit-form').style.display = 'none';
    if (node === state.currentNode) {
      if (newComment || newTheme) {
        showComment(newComment, newTheme, null, node.strategicContext || null);
      } else if (node.qa && node.qa.length > 0) {
        document.getElementById('analysis-result').classList.add('visible');
      } else {
        clearAnalysis();
        updateCommentsEmptyState();
      }
      if (node.qa && node.qa.length > 0) renderQaThread(node.qa, node.pendingQa || null);
    }
    updateMoveHistory();
    persistCommentChange();
  });

  // Cancel edit
  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    _editQaSnapshot = null;
    _editingNode = null;
    document.getElementById('comment-edit-form').style.display = 'none';
    const node = state.currentNode;
    if (node.comment || node.theme || (node.qa && node.qa.length > 0) || node.pendingQa) {
      if (node.comment || node.theme) showComment(node.comment, node.theme, null, node.strategicContext || null);
      else document.getElementById('analysis-result').classList.add('visible');
      renderQaThread(node.qa || [], node.pendingQa || null);
    }
  });

  // Delete comment (trash) — show confirmation modal if there is content to delete.
  // Capture the node when the modal opens: keyboard navigation can still move
  // the board underneath it, and the delete must hit the move it was asked for.
  let _deletingNode = null;
  document.getElementById('btn-delete-comment').addEventListener('click', () => {
    const node = state.currentNode;
    if (!node.comment && !node.theme && !(node.qa && node.qa.length > 0)) return;
    _deletingNode = node;
    document.getElementById('delete-comment-modal').style.display = '';
  });

  document.getElementById('btn-delete-comment-confirm').addEventListener('click', () => {
    document.getElementById('delete-comment-modal').style.display = 'none';
    const node = _deletingNode || state.currentNode;
    _deletingNode = null;
    node.comment = null;
    node.theme = null;
    node.strategicContext = null;
    node.qa = [];
    node.pendingQa = null;
    markDirty();
    if (node === state.currentNode) {
      clearAnalysis();
      updateCommentsEmptyState();
    }
    updateMoveHistory();
    persistCommentChange();
  });

  document.getElementById('btn-delete-comment-cancel').addEventListener('click', () => {
    _deletingNode = null;
    document.getElementById('delete-comment-modal').style.display = 'none';
  });

  // Toggle eval bar
  document.getElementById('eval-toggle-input').addEventListener('change', toggleEvalBar);

  // Stockfish lines tool toggle
  (function () {
    const toggle = document.getElementById('stockfish-lines-toggle');
    const body   = document.getElementById('stockfish-lines-body');
    if (!toggle || !body) return;
    let expanded = localStorage.getItem('stockfish-lines-open') !== 'false';
    function applyState() {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      body.classList.toggle('stockfish-lines-collapsed', !expanded);
    }
    applyState();
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      localStorage.setItem('stockfish-lines-open', expanded ? 'true' : 'false');
      applyState();
    });
  })();

  // Mobile engine line collapse (analysis tab) — defaults collapsed for a compact bar
  (function () {
    const toggle = document.getElementById('mob-engine-toggle');
    const body   = document.getElementById('mob-engine-body');
    if (!toggle || !body) return;
    let expanded = localStorage.getItem('mob-engine-open') === 'true';
    function applyState() {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      body.classList.toggle('mob-engine-collapsed', !expanded);
    }
    applyState();
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      localStorage.setItem('mob-engine-open', expanded ? 'true' : 'false');
      applyState();
    });
  })();

  // Mobile eye toggle — hide / reveal the whole engine evaluation
  (function () {
    const eye   = document.getElementById('mob-engine-eye');
    const label = document.getElementById('mob-engine-label');
    if (!eye) return;
    eye.addEventListener('click', () => setEvalVisible(!state.evalVisible));
    // When hidden, tapping the "Engine hidden, tap to reveal" label reveals too.
    if (label) label.addEventListener('click', () => {
      if (!state.evalVisible) setEvalVisible(true);
    });
  })();

  // Game title inline editing
  (function () {
    const titleEl   = document.getElementById('game-title');
    const inputEl   = document.getElementById('game-title-input');
    const editBtn   = document.getElementById('btn-edit-title');

    function startEdit() {
      inputEl.value = state.gameTitle;
      titleEl.style.display = 'none';
      editBtn.style.display = 'none';
      inputEl.style.display = 'block';
      inputEl.focus();
      inputEl.select();
    }

    function commitEdit() {
      const val = inputEl.value.trim();
      if (val) setGameTitle(val);
      inputEl.style.display = 'none';
      titleEl.style.display = '';
      editBtn.style.display = '';
    }

    function cancelEdit() {
      inputEl.style.display = 'none';
      titleEl.style.display = '';
      editBtn.style.display = '';
    }

    editBtn.addEventListener('click', startEdit);
    titleEl.addEventListener('dblclick', startEdit);

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
    });
    inputEl.addEventListener('blur', commitEdit);
  })();

  // Save current game to collection
  const saveCurrentToCollection = ({ title, silent } = {}) => {
    const pathNodes = getMainLineNodes();
    const endNode = pathNodes.length > 0 ? pathNodes[pathNodes.length - 1] : state.root;
    const pgn = generatePgnToNode(endNode);
    if (!pgn) {
      if (!silent) showToast('No moves to save.', 'info');
      return { ok: false, msg: 'No moves to save.' };
    }

    const treeData = serializeTree(state.root);

    const items = getCollection();
    const sig = pgnSignature(pgn);

    // Prefer the exact game this board was loaded from — signature matching
    // alone can pick the wrong copy when duplicates exist, and fails outright
    // once new moves change the signature (which used to create a duplicate
    // instead of updating the loaded game).
    let existing = state.loadedGameId != null
      ? items.find(i => i.id === state.loadedGameId)
      : null;
    if (!existing && sig) {
      existing = items.find(i => (i.sig || pgnSignature(i.pgn)) === sig);
    }
    if (existing) {
      existing.treeData = treeData;
      existing.nodeComments = undefined;
      // Keep the PGN-derived fields in step with the tree so previews,
      // signatures and shares reflect the saved state.
      existing.pgn = pgn;
      existing.sig = sig || existing.sig || null;
      existing.finalFen = endNode?.fen || getFinalFenFromPgn(pgn);
      existing.moveCount = pathNodes.length;
      if (title) existing.title = title;
      // Carry over a fresh full-game analysis (if one was just run) so the
      // saved game keeps showing its stats row / insights.
      if (_lastAnalysisData) existing.analysis = _lastAnalysisData;
      bumpGameUpdatedAt(existing);
      saveCollection(items);
      renderCollection();
      markClean();
      state.loadedGameId = existing.id;
      if (!silent) showToast('Comments saved to collection!', 'success');
      return { ok: true, gameId: existing.id };
    }

    if (items.length >= COLLECTION_MAX_TOTAL_GAMES) {
      const msg = `Collection full (max ${COLLECTION_MAX_TOTAL_GAMES} games). Delete a game to free space.`;
      if (!silent) showToast(msg, 'info');
      return { ok: false, msg };
    }

    const newItem = {
      id: Date.now().toString(),
      title: title ?? state.gameTitle,
      date: new Date().toISOString(),
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      pgn: pgn,
      sig: sig || null,
      finalFen: endNode?.fen || getFinalFenFromPgn(pgn),
      moveCount: pathNodes.length,
      treeData,
      analysis: _lastAnalysisData || null,
      updatedAt: Date.now(),
    };

    items.unshift(newItem);
    saveCollection(items);
    renderCollection();
    markClean();
    state.loadedGameId = newItem.id;
    if (!silent) showToast('Game saved to collection!', 'success');
    return { ok: true, gameId: newItem.id };
  };

  const saveBtn = document.getElementById('btn-save-game');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      requireLoginForCollection(() => {
        const mlNodes = getMainLineNodes();
        const endNode = mlNodes.length > 0 ? mlNodes[mlNodes.length - 1] : state.root;
        const pgn = generatePgnToNode(endNode);
        if (!pgn) { showToast('No moves to save.', 'info'); return; }
        const suggested = state.gameTitle || 'Untitled game';
        window._openCollSaveModal?.(pgn, suggested);
      });
    });
  }

  // Flip board
  document.getElementById('btn-flip').addEventListener('click', () => {
    state.orientation = state.orientation === 'white' ? 'black' : 'white';
    state.board.flip();
    document.getElementById('btn-flip').classList.toggle('is-active', state.orientation === 'black');
    renderBoardDrawings();
    renderMaterialBars('mat-analysis-top', 'mat-analysis-bot', state.game.fen(), state.orientation);
  });


  // ── Unsaved-changes + analysis-running confirmation modals ──────────────────
  // confirmIfUnsaved(onProceed): guards against two conditions before replacing
  // the board:
  //   1. A full-game analysis is running → shows analysis-running-modal first.
  //   2. Unsaved changes exist → shows warn-lose-game-modal.
  // If neither applies, onProceed() is called directly.
  let _pendingUnsavedAction = null;
  let _pendingAnalysisAction = null;

  function closeUnsavedChangesModal() {
    document.getElementById('warn-lose-game-modal').style.display = 'none';
    document.body.style.overflow = '';
    _pendingUnsavedAction = null;
  }

  function closeAnalysisRunningModal() {
    document.getElementById('analysis-running-modal').style.display = 'none';
    document.body.style.overflow = '';
    _pendingAnalysisAction = null;
  }

  function isAnalysisRunning() {
    const btn = document.getElementById('btn-analyze-game');
    return !!(btn && btn.dataset.analysisRunning);
  }

  function confirmIfUnsaved(onProceed) {
    if (isAnalysisRunning()) {
      _pendingAnalysisAction = onProceed;
      document.getElementById('analysis-running-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
      return;
    }
    const hasMoves = state.root && state.root.children.length > 0;
    if (!hasMoves || !hasUnsavedChanges()) {
      onProceed();
      return;
    }
    _pendingUnsavedAction = onProceed;
    document.getElementById('warn-lose-game-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // Save → save to collection, then proceed
  document.getElementById('btn-warn-save').addEventListener('click', () => {
    const action = _pendingUnsavedAction;
    closeUnsavedChangesModal();
    // Navigate to the end of the current line so all moves are captured in the PGN
    if (state.root && state.root.children.length > 0 && state.currentNode === state.root) {
      navigateLast();
    }
    const result = saveCurrentToCollection({ silent: true });
    if (result.ok) {
      showToast('Game saved!', 'success');
      if (action) action();
    } else {
      showToast(result.msg || 'Could not save game.', 'error');
    }
  });

  // Discard → discard changes and proceed
  document.getElementById('btn-warn-continue').addEventListener('click', () => {
    const action = _pendingUnsavedAction;
    closeUnsavedChangesModal();
    markClean();
    if (action) action();
  });

  // Cancel → stay on current board
  document.getElementById('btn-warn-cancel').addEventListener('click', closeUnsavedChangesModal);

  document.getElementById('warn-lose-game-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('warn-lose-game-modal')) closeUnsavedChangesModal();
  });

  // Analysis-running modal: "Cancel analysis" → let action proceed (fetch will be orphaned)
  document.getElementById('btn-analysis-continue').addEventListener('click', () => {
    const action = _pendingAnalysisAction;
    closeAnalysisRunningModal();
    if (action) action();
  });

  // Analysis-running modal: "Stay" → dismiss, keep analysis going
  document.getElementById('btn-analysis-stay').addEventListener('click', closeAnalysisRunningModal);

  document.getElementById('analysis-running-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('analysis-running-modal')) closeAnalysisRunningModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('analysis-running-modal').style.display !== 'none') {
        closeAnalysisRunningModal();
      } else if (document.getElementById('warn-lose-game-modal').style.display !== 'none') {
        closeUnsavedChangesModal();
      }
    }
  });

  // ── New game ────────────────────────────────────────────────────────────────
  function doNewGame() {
    gameCounter++;
    setGameTitle('Chess game ' + gameCounter);
    markClean();
    initTree();
    state.board.start();
    clearAnalysis();
    clearHighlights();
    resetEvalBar();
    updateUI();
    document.getElementById('pgn-input').value = '';
    hideError('pgn-error');
  }

  document.getElementById('btn-reset').addEventListener('click', () => {
    // Only warn when there are moves AND unsaved changes (new moves, variations,
    // annotations, comments, square/arrow highlights, or a renamed title). A game
    // that is already saved with nothing changed since starts a new game directly.
    confirmIfUnsaved(doNewGame);
  });

  document.getElementById('btn-new-game-confirm')?.addEventListener('click', () => {
    document.getElementById('new-game-modal').style.display = 'none';
    document.body.style.overflow = '';
    doNewGame();
  });

  document.getElementById('btn-new-game-cancel')?.addEventListener('click', () => {
    document.getElementById('new-game-modal').style.display = 'none';
    document.body.style.overflow = '';
  });
  document.getElementById('new-game-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('new-game-modal')) {
      document.getElementById('new-game-modal').style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // Navigation buttons
  document.getElementById('btn-first').addEventListener('click', navigateFirst);
  document.getElementById('btn-prev').addEventListener('click', navigatePrev);
  document.getElementById('btn-next').addEventListener('click', navigateNext);
  document.getElementById('btn-last').addEventListener('click', navigateLast);

  // Mobile comment hint: tap to switch to Analysis panel
  document.getElementById('mobile-comment-hint')?.addEventListener('click', () => {
    document.querySelector('#mobile-panel-nav .mpn-btn[data-mpanel="left-comments"]')?.click();
  });
  // Hide hint whenever the user manually switches panels
  document.querySelectorAll('#mobile-panel-nav .mpn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('mobile-comment-hint')?.classList.remove('visible');
    });
  });

  // PGN import modal
  const pgnModal = document.getElementById('pgn-modal');

  function openPgnModal() {
    pgnModal.style.display = 'flex';
    if (!window.matchMedia('(hover: none)').matches) document.getElementById('pgn-input').focus();
  }

  function closePgnModal() {
    pgnModal.style.display = 'none';
    document.getElementById('pgn-input').value = '';
    hideError('pgn-error');
    // reset provider tab
    hideError('pgn-provider-error');
    const gameList = document.getElementById('pgn-game-list');
    if (gameList) { gameList.hidden = true; gameList.innerHTML = ''; }
    const prog = document.getElementById('pgn-provider-progress');
    if (prog) { prog.hidden = true; const bar = prog.querySelector('.import-progress-bar'); if (bar) bar.style.width = '0%'; }
    // reset to paste tab
    document.querySelectorAll('.pgn-import-tab').forEach(t => {
      const active = t.dataset.pane === 'paste';
      t.classList.toggle('pgn-import-tab--active', active);
      t.setAttribute('aria-selected', String(active));
    });
    document.getElementById('pgn-pane-paste').classList.remove('pgn-import-pane--hidden');
    document.getElementById('pgn-pane-provider').classList.add('pgn-import-pane--hidden');
  }

  document.getElementById('btn-open-pgn-modal').addEventListener('click', () => {
    confirmIfUnsaved(openPgnModal);
  });

  // ── Login-required modal ─────────────────────────────────────────────────────
  (function initLoginRequiredModal() {
    const modal = document.getElementById('login-required-modal');
    if (!modal) return;
    function closeIt() { modal.style.display = 'none'; }
    document.getElementById('btn-login-required-cancel')?.addEventListener('click', closeIt);
    modal.addEventListener('click', e => { if (e.target === modal) closeIt(); });
    document.getElementById('btn-login-required-signin')?.addEventListener('click', () => {
      closeIt();
      document.getElementById('btn-login')?.click();
    });
  })();

  // Position builder
  let builderBoard = null;
  let builderSelectedPiece = null; // e.g. 'wQ'
  let builderTrashActive = false;
  const castlingAvailable = { K: false, Q: false, k: false, q: false };
  let builderDragGhost = null;
  let builderDragPiece = null;
  let builderDragSource = null;
  let builderDragActive = false;
  let builderDragStartX = 0;
  let builderDragStartY = 0;
  let builderDragThreshold = false;
  let builderWasDragging = false;
  let builderHoverSquare = null;
  let builderDragInitialized = false;

  function setCastlingCheckbox(key, available) {
    const el = document.getElementById('bc-' + key);
    const wasAvailable = castlingAvailable[key];
    castlingAvailable[key] = available;
    el.disabled = !available;
    if (!available) {
      el.checked = false;
    } else if (!wasAvailable) {
      el.checked = true; // just became available — auto-check
    }
    // if already available: leave user's choice intact
  }

  function updateCastlingCheckboxes() {
    const pos = builderBoard.position();
    const wKe1 = pos['e1'] === 'wK';
    const bKe8 = pos['e8'] === 'bK';
    setCastlingCheckbox('K', wKe1 && pos['h1'] === 'wR');
    setCastlingCheckbox('Q', wKe1 && pos['a1'] === 'wR');
    setCastlingCheckbox('k', bKe8 && pos['h8'] === 'bR');
    setCastlingCheckbox('q', bKe8 && pos['a8'] === 'bR');
  }

  function clearBuilderSelection() {
    builderSelectedPiece = null;
    builderTrashActive = false;
    document.querySelectorAll('.builder-palette-piece.is-selected')
      .forEach(el => el.classList.remove('is-selected'));
    document.getElementById('builder-trash').classList.remove('is-active');
    const boardEl = document.getElementById('builder-board');
    if (boardEl) boardEl.style.cursor = '';
  }

  function buildBuilderPalette() {
    const palette = document.getElementById('builder-palette');
    if (palette.children.length) return; // already built
    const order = ['K', 'Q', 'R', 'B', 'N', 'P'];
    ['w', 'b'].forEach(color => {
      const row = document.createElement('div');
      row.className = 'builder-palette-row';
      order.forEach(type => {
        const piece = color + type;
        const el = document.createElement('div');
        el.className = 'builder-palette-piece';
        el.dataset.piece = piece;
        el.style.backgroundImage = `url(${PIECE_IMAGES[piece]})`;
        row.appendChild(el);
      });
      palette.appendChild(row);
    });
  }

  function buildBuilderFen() {
    const pos = builderBoard.position();
    const piecePlacement = Chessboard.objToFen(pos);
    const side = document.querySelector('input[name="builder-side"]:checked').value;
    const castlingParts = [];
    if (document.getElementById('bc-K').checked) castlingParts.push('K');
    if (document.getElementById('bc-Q').checked) castlingParts.push('Q');
    if (document.getElementById('bc-k').checked) castlingParts.push('k');
    if (document.getElementById('bc-q').checked) castlingParts.push('q');
    const castling = castlingParts.length ? castlingParts.join('') : '-';
    return `${piecePlacement} ${side} ${castling} - 0 1`;
  }

  // Returns an error message if the position is illegal, or null if it is legal.
  // chess.js load()/validate_fen() in this build accept many illegal positions
  // (pawns on the back rank, kings touching, the side not to move left in check),
  // so we validate those cases explicitly here.
  function builderPositionError(fen, pos) {
    const vals = Object.values(pos);
    const whiteKings = vals.filter(p => p === 'wK').length;
    const blackKings = vals.filter(p => p === 'bK').length;
    if (whiteKings === 0 && blackKings === 0) return 'Both kings are missing.';
    if (whiteKings === 0) return 'White king is missing.';
    if (blackKings === 0) return 'Black king is missing.';
    if (whiteKings > 1 || blackKings > 1) return 'Illegal position – there can be only one king per side.';

    // Pawns may not stand on the first or last rank.
    for (const sq of Object.keys(pos)) {
      const piece = pos[sq];
      if (piece && piece[1] === 'P') {
        const rank = sq[1];
        if (rank === '1' || rank === '8') {
          return 'Illegal position – pawns cannot be on the first or last rank.';
        }
      }
    }

    const testGame = new Chess();
    if (!testGame.load(fen)) return 'Illegal position.';

    // The side that just moved (i.e. the side NOT to move) cannot be left in
    // check. Flip the side to move and ask chess.js whether that side is in
    // check — this also rejects positions where the two kings are adjacent.
    const parts = fen.split(' ');
    parts[1] = parts[1] === 'w' ? 'b' : 'w';
    const flipped = new Chess();
    if (!flipped.load(parts.join(' ')) || flipped.in_check()) {
      return 'Illegal position – the side not to move is left in check.';
    }

    return null;
  }

  function validateAndUpdateApplyBtn() {
    const fen = buildBuilderFen();
    const pos = builderBoard.position();
    const applyBtn = document.getElementById('btn-builder-apply');
    const error = builderPositionError(fen, pos);
    if (!error) {
      applyBtn.disabled = false;
      hideError('builder-error');
    } else {
      applyBtn.disabled = true;
      showError('builder-error', error);
    }
  }

  function updateBuilderFen() {
    const fenInput = document.getElementById('builder-fen-input');
    if (!fenInput || document.activeElement === fenInput) return;
    fenInput.value = buildBuilderFen();
  }

  function builderUpdateAfterChange() {
    updateCastlingCheckboxes();
    validateAndUpdateApplyBtn();
    updateBuilderFen();
  }

  function builderGetDropSquare(cx, cy) {
    const el = document.elementFromPoint(cx, cy);
    if (!el) return null;
    return el.closest('#builder-board [data-square]') || null;
  }

  function builderClearHoverHighlight() {
    if (builderHoverSquare) {
      builderHoverSquare.classList.remove('builder-drop-target');
      builderHoverSquare = null;
    }
    const trashEl = document.getElementById('builder-trash');
    if (trashEl) trashEl.classList.remove('is-drop-target');
  }

  function builderRemoveDragGhost() {
    if (builderDragGhost) {
      builderDragGhost.remove();
      builderDragGhost = null;
    }
    builderClearHoverHighlight();
    document.querySelectorAll('#builder-board .builder-drag-source')
      .forEach(el => el.classList.remove('builder-drag-source'));
  }

  function initBuilderPointerDrag() {
    if (builderDragInitialized) return;
    builderDragInitialized = true;

    document.addEventListener('pointerdown', (e) => {
      const pieceEl = e.target.closest('#builder-palette .builder-palette-piece');
      if (pieceEl) {
        builderDragPiece = pieceEl.dataset.piece;
        builderDragSource = 'palette';
        builderDragStartX = e.clientX;
        builderDragStartY = e.clientY;
        builderDragActive = true;
        builderDragThreshold = false;
        return;
      }
      if (builderSelectedPiece || builderTrashActive) return;
      const squareEl = e.target.closest('#builder-board [data-square]');
      if (squareEl && builderBoard) {
        const sq = squareEl.dataset.square;
        const piece = builderBoard.position()[sq];
        if (!piece) return;
        builderDragPiece = piece;
        builderDragSource = sq;
        builderDragStartX = e.clientX;
        builderDragStartY = e.clientY;
        builderDragActive = true;
        builderDragThreshold = false;
      }
    });

    document.addEventListener('pointermove', (e) => {
      if (!builderDragActive) return;
      const dx = Math.abs(e.clientX - builderDragStartX);
      const dy = Math.abs(e.clientY - builderDragStartY);
      if (!builderDragThreshold && dx < 6 && dy < 6) return;

      if (!builderDragThreshold) {
        builderDragThreshold = true;
        builderDragGhost = document.createElement('div');
        builderDragGhost.className = 'builder-drag-ghost';
        builderDragGhost.style.backgroundImage = `url(${PIECE_IMAGES[builderDragPiece]})`;
        document.body.appendChild(builderDragGhost);
        if (builderDragSource !== 'palette') {
          const srcEl = document.querySelector(`#builder-board [data-square="${builderDragSource}"]`);
          if (srcEl) srcEl.classList.add('builder-drag-source');
        }
      }

      const sz = 52;
      builderDragGhost.style.left = (e.clientX - sz / 2) + 'px';
      builderDragGhost.style.top = (e.clientY - sz / 2) + 'px';

      builderClearHoverHighlight();
      const sq = builderGetDropSquare(e.clientX, e.clientY);
      if (sq) {
        sq.classList.add('builder-drop-target');
        builderHoverSquare = sq;
      } else if (builderDragSource !== 'palette') {
        const trashEl = document.getElementById('builder-trash');
        const tr = trashEl.getBoundingClientRect();
        if (e.clientX >= tr.left && e.clientX <= tr.right &&
            e.clientY >= tr.top  && e.clientY <= tr.bottom) {
          trashEl.classList.add('is-drop-target');
        }
      }
    });

    document.addEventListener('pointerup', (e) => {
      if (!builderDragActive) return;
      const wasThreshold = builderDragThreshold;
      const piece = builderDragPiece;
      const source = builderDragSource;
      builderDragActive = false;
      builderDragThreshold = false;
      builderDragPiece = null;
      builderDragSource = null;

      if (!wasThreshold) return;

      builderWasDragging = true;
      setTimeout(() => { builderWasDragging = false; }, 150);

      const targetSqEl = builderGetDropSquare(e.clientX, e.clientY);
      builderRemoveDragGhost();

      if (!builderBoard) return;
      const pos = builderBoard.position();
      if (!targetSqEl) {
        if (source !== 'palette') {
          delete pos[source];
          builderBoard.position(pos, false);
          builderUpdateAfterChange();
        }
        return;
      }
      const target = targetSqEl.dataset.square;
      if (source !== 'palette') delete pos[source];
      pos[target] = piece;
      builderBoard.position(pos, false);
      builderUpdateAfterChange();
    });
  }

  function openPositionBuilder() {
    const modal = document.getElementById('position-builder-modal');
    modal.style.display = 'flex';

    buildBuilderPalette();

    const STANDARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const currentFen = posBuilderPlayMode
      ? (playState.customStartFen || STANDARD_FEN)
      : (state.currentNode ? state.currentNode.fen : STANDARD_FEN);

    document.getElementById('position-builder-title').textContent =
      posBuilderPlayMode ? 'Set Starting Position' : 'Build Position';
    document.getElementById('btn-builder-apply').textContent =
      posBuilderPlayMode ? 'Set as Starting Position' : 'Apply Position';
    const fenParts = currentFen.split(' ');
    const side = fenParts[1] || 'w';
    const castling = fenParts[2] || 'KQkq';

    if (!builderBoard) {
      builderBoard = Chessboard('builder-board', {
        position: currentFen,
        draggable: false,
        pieceTheme: (piece) => PIECE_IMAGES[piece],
      });
    } else {
      builderBoard.position(currentFen, false);
    }

    document.querySelector(`input[name="builder-side"][value="${side}"]`).checked = true;
    // Reset tracker so auto-check fires fresh for the new position
    castlingAvailable.K = castlingAvailable.Q = castlingAvailable.k = castlingAvailable.q = false;
    updateCastlingCheckboxes();

    clearBuilderSelection();
    hideError('builder-error');
    initBuilderPointerDrag();
    validateAndUpdateApplyBtn();
    updateBuilderFen();
  }

  function closePositionBuilder() {
    clearBuilderSelection();
    if (posBuilderPlayMode) {
      posBuilderPlayMode = false;
      document.getElementById('position-builder-title').textContent = 'Build Position';
      document.getElementById('btn-builder-apply').textContent = 'Apply Position';
    }
    document.getElementById('position-builder-modal').style.display = 'none';
  }

  function applyBuilderPosition() {
    const fen = buildBuilderFen();
    if (builderPositionError(fen, builderBoard.position())) return; // button should already be disabled

    if (posBuilderPlayMode) {
      posBuilderPlayMode = false;
      playState.customStartFen = fen;
      updatePlaySetupUI();
      document.getElementById('position-builder-title').textContent = 'Build Position';
      document.getElementById('btn-builder-apply').textContent = 'Apply Position';
      closePositionBuilder();
      return;
    }

    nodeIdCounter = 0;
    state.root = createNode(null, null, fen);
    state.currentNode = state.root;
    state.game.load(fen);
    state.board.position(fen, false);

    clearAnalysis();
    clearHighlights();
    resetEvalBar();
    gameCounter++;
    setGameTitle('Chess game ' + gameCounter);
    markClean();
    updateUI();
    scheduleEvalUpdate();

    closePositionBuilder();
  }

  // Palette piece selection
  document.getElementById('builder-palette').addEventListener('click', e => {
    if (builderWasDragging) return;
    const pieceEl = e.target.closest('.builder-palette-piece');
    if (!pieceEl) return;
    const piece = pieceEl.dataset.piece;
    const boardEl = document.getElementById('builder-board');
    if (builderSelectedPiece === piece) {
      clearBuilderSelection();
    } else {
      clearBuilderSelection();
      builderSelectedPiece = piece;
      pieceEl.classList.add('is-selected');
      boardEl.style.cursor = `url("${PIECE_IMAGES[piece]}") 22 22, crosshair`;
    }
  });

  // Trash bin toggle
  document.getElementById('builder-trash').addEventListener('click', () => {
    if (builderTrashActive) {
      clearBuilderSelection();
    } else {
      clearBuilderSelection();
      builderTrashActive = true;
      document.getElementById('builder-trash').classList.add('is-active');
    }
  });

  // Board click — place or remove piece
  document.getElementById('builder-board').addEventListener('click', e => {
    if (builderWasDragging) return;
    const squareEl = e.target.closest('[data-square]');
    if (!squareEl) return;
    const square = squareEl.dataset.square;
    const pos = builderBoard.position();
    if (builderSelectedPiece) {
      pos[square] = builderSelectedPiece;
      builderBoard.position(pos, false);
      builderUpdateAfterChange();
    } else if (builderTrashActive) {
      delete pos[square];
      builderBoard.position(pos, false);
      builderUpdateAfterChange();
    }
  });

  // Right-click on board square to delete piece
  document.getElementById('builder-board').addEventListener('contextmenu', e => {
    e.preventDefault();
    const squareEl = e.target.closest('[data-square]');
    if (!squareEl) return;
    const square = squareEl.dataset.square;
    const pos = builderBoard.position();
    if (pos[square]) {
      delete pos[square];
      builderBoard.position(pos, false);
      builderUpdateAfterChange();
    }
  });

  document.getElementById('btn-open-position-builder').addEventListener('click', () => {
    confirmIfUnsaved(openPositionBuilder);
  });

  document.getElementById('btn-builder-clear').addEventListener('click', () => {
    builderBoard.position({}, false);
    castlingAvailable.K = castlingAvailable.Q = castlingAvailable.k = castlingAvailable.q = false;
    updateCastlingCheckboxes();
    clearBuilderSelection();
    validateAndUpdateApplyBtn();
    updateBuilderFen();
  });

  document.getElementById('btn-builder-reset').addEventListener('click', () => {
    builderBoard.start(false);
    document.querySelector('input[name="builder-side"][value="w"]').checked = true;
    castlingAvailable.K = castlingAvailable.Q = castlingAvailable.k = castlingAvailable.q = false;
    updateCastlingCheckboxes();
    clearBuilderSelection();
    validateAndUpdateApplyBtn();
    updateBuilderFen();
  });

  document.getElementById('btn-builder-apply').addEventListener('click', applyBuilderPosition);

  document.getElementById('btn-builder-cancel').addEventListener('click', closePositionBuilder);

  document.getElementById('position-builder-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('position-builder-modal')) closePositionBuilder();
  });

  // FEN input bar — load position from pasted FEN
  (function () {
    const fenInput = document.getElementById('builder-fen-input');

    function loadFenFromInput() {
      const fen = fenInput.value.trim();
      if (!fen) return;
      const testGame = new Chess();
      if (!testGame.load(fen)) {
        showError('builder-error', 'Invalid FEN string.');
        return;
      }
      builderBoard.position(fen, false);
      const fenParts = fen.split(' ');
      const side = fenParts[1] || 'w';
      document.querySelector(`input[name="builder-side"][value="${side}"]`).checked = true;
      castlingAvailable.K = castlingAvailable.Q = castlingAvailable.k = castlingAvailable.q = false;
      updateCastlingCheckboxes();
      clearBuilderSelection();
      validateAndUpdateApplyBtn();
    }

    fenInput.addEventListener('change', loadFenFromInput);
    fenInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); loadFenFromInput(); }
    });
  })();

  // Flip board
  document.getElementById('btn-builder-flip').addEventListener('click', () => {
    builderBoard.flip();
  });

  // Re-validate when side or castling changes
  document.querySelectorAll('input[name="builder-side"]').forEach(radio => {
    radio.addEventListener('change', () => {
      validateAndUpdateApplyBtn();
      updateBuilderFen();
    });
  });
  ['bc-K', 'bc-Q', 'bc-k', 'bc-q'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      validateAndUpdateApplyBtn();
      updateBuilderFen();
    });
  });

  document.getElementById('btn-import-pgn').addEventListener('click', () => {
    importPGN();
  });

  document.getElementById('pgn-file-input')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const text = await file.text();
      document.getElementById('pgn-input').value = text.trim();
      importPGN();
    } catch {
      showError('pgn-error', 'Could not read that file. Please try again.');
    }
  });

  document.getElementById('aw-btn-import-pgn').addEventListener('click', () => {
    confirmIfUnsaved(openPgnModal);
  });

  document.getElementById('aw-btn-build-pos').addEventListener('click', () => {
    confirmIfUnsaved(openPositionBuilder);
  });

  document.getElementById('btn-cancel-pgn').addEventListener('click', closePgnModal);

  pgnModal.addEventListener('click', e => {
    if (e.target === pgnModal) closePgnModal();
  });

  document.getElementById('pgn-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) importPGN();
    if (e.key === 'Escape') closePgnModal();
  });

  // ── PGN modal tabs ────────────────────────────────────────────────────────
  document.querySelectorAll('.pgn-import-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const pane = tab.dataset.pane;
      document.querySelectorAll('.pgn-import-tab').forEach(t => {
        const active = t.dataset.pane === pane;
        t.classList.toggle('pgn-import-tab--active', active);
        t.setAttribute('aria-selected', String(active));
      });
      document.getElementById('pgn-pane-paste').classList.toggle('pgn-import-pane--hidden', pane !== 'paste');
      document.getElementById('pgn-pane-provider').classList.toggle('pgn-import-pane--hidden', pane !== 'provider');
    });
  });

  // ── PGN modal: provider import (Lichess) ────────────────────────────────
  async function fetchGamesForAnalysis() {
    const usernameEl = document.getElementById('pgn-lichess-username');
    const username = usernameEl?.value.trim() || '';
    const gameListEl = document.getElementById('pgn-game-list');
    const progressWrap = document.getElementById('pgn-provider-progress');
    const bar = progressWrap?.querySelector('.import-progress-bar');

    hideError('pgn-provider-error');
    if (gameListEl) { gameListEl.hidden = true; gameListEl.innerHTML = ''; }

    if (!username) { showError('pgn-provider-error', 'Please enter a username.'); return; }

    const btn = document.getElementById('pgn-btn-import-lichess');
    btn.disabled = true;
    if (progressWrap) progressWrap.hidden = false;
    if (bar) { bar.style.transition = 'width 400ms ease'; bar.style.width = '40%'; }

    try {
      const url = `/api/import/lichess/${encodeURIComponent(username)}?max=50`;

      const res = await fetch(url, { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError('pgn-provider-error', data.error || 'Import failed. Please try again.');
        return;
      }

      if (bar) { bar.style.transition = 'width 300ms ease'; bar.style.width = '80%'; }

      const games = splitPgnGames(String(data.pgnText || '').trim());
      if (games.length === 0) {
        showError('pgn-provider-error', 'No games found for this username.');
        return;
      }

      const label = document.createElement('div');
      label.className = 'pgn-game-list-label';
      label.textContent = `${games.length} game${games.length !== 1 ? 's' : ''} → pick one to analyze`;
      gameListEl.appendChild(label);

      games.forEach(pgn => {
        const white  = (pgn.match(/\[White\s+"([^"]+)"\]/) || [])[1] || '?';
        const black  = (pgn.match(/\[Black\s+"([^"]+)"\]/) || [])[1] || '?';
        const date   = ((pgn.match(/\[Date\s+"([^"]+)"\]/) || [])[1] || '').replace(/\?/g, '').replace(/\.$/, '');
        const result = (pgn.match(/\[Result\s+"([^"]+)"\]/) || [])[1] || '';

        const item = document.createElement('button');
        item.className = 'pgn-game-item';
        item.type = 'button';
        item.innerHTML =
          `<span class="pgn-game-vs"><strong>${escapeHtml(white)}</strong> vs <strong>${escapeHtml(black)}</strong></span>` +
          `<span class="pgn-game-meta">${escapeHtml([date, result].filter(Boolean).join(' · '))}</span>`;
        item.addEventListener('click', () => {
          if (importPgnString(pgn)) {
            closePgnModal();
          } else {
            showError('pgn-provider-error', 'Could not load that game. Please try another.');
          }
        });
        gameListEl.appendChild(item);
      });

      gameListEl.hidden = false;
      if (bar) { bar.style.transition = 'width 200ms ease'; bar.style.width = '100%'; }
      setTimeout(() => {
        if (progressWrap) progressWrap.hidden = true;
        if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
      }, 400);
    } catch (err) {
      console.error('Provider fetch failed:', err);
      showError('pgn-provider-error', 'Network error. Please check your connection and try again.');
      if (progressWrap) progressWrap.hidden = true;
    } finally {
      btn.disabled = false;
    }
  }

  document.getElementById('pgn-btn-import-lichess').addEventListener('click', () => fetchGamesForAnalysis());

  document.getElementById('pgn-lichess-username').addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchGamesForAnalysis();
    if (e.key === 'Escape') closePgnModal();
  });

  // Context menu actions
  document.getElementById('ctx-copy-pgn').addEventListener('click', () => {
    if (!contextMenuNode) return;
    const pgn = generatePgnToNode(contextMenuNode);
    navigator.clipboard.writeText(pgn).catch(() => {
      // Fallback for environments without clipboard API
      const ta = document.createElement('textarea');
      ta.value = pgn;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    hideContextMenu();
  });

  document.getElementById('ctx-delete-from').addEventListener('click', () => {
    if (!contextMenuNode) return;
    const node = contextMenuNode;
    hideContextMenu();
    deleteFromNode(node);
  });

  document.querySelectorAll('.move-ann-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!contextMenuNode) return;
      const ann = btn.dataset.ann;
      contextMenuNode.annotation = ann || null;
      markDirty();
      hideContextMenu();
      updateMoveHistory();
    });
  });

  // Annotation toolbar buttons
  document.querySelectorAll('.ann-tb-move').forEach(btn => {
    btn.addEventListener('click', () => {
      const node = state.currentNode;
      if (!node || !node.move) return;
      const ann = btn.dataset.ann;
      node.annotation = (node.annotation === ann) ? null : ann;
      markDirty();
      updateMoveHistory();
      updateAnnToolbar();
    });
  });

  document.querySelectorAll('.ann-tb-pos').forEach(btn => {
    btn.addEventListener('click', () => {
      const node = state.currentNode;
      if (!node || !node.move) return;
      const pos = btn.dataset.pos;
      node.posAnnotation = (node.posAnnotation === pos) ? null : pos;
      markDirty();
      updateMoveHistory();
      updateAnnToolbar();
    });
  });

  document.querySelectorAll('.ann-tb-result').forEach(btn => {
    btn.addEventListener('click', () => {
      const node = state.currentNode;
      if (!node || !node.move || node.children.length > 0) return;
      const result = btn.dataset.result;
      node.gameResult = (node.gameResult === result) ? null : result;
      markDirty();
      updateMoveHistory();
      updateAnnToolbar();
    });
  });

  // Drawing color buttons
  function updateDrawingButtons() {
    document.querySelectorAll('.ann-tb-draw').forEach(btn => {
      btn.classList.toggle('ann-tb-active', btn.dataset.drawColor === state.drawingColor);
    });
  }

  document.querySelectorAll('.ann-tb-draw').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.drawColor;
      state.drawingColor = (state.drawingColor === color) ? null : color;
      updateDrawingButtons();
    });
  });

  document.getElementById('btn-clear-drawings').addEventListener('click', () => {
    const node = state.currentNode;
    if (!node) return;
    const hadDrawings = (node.arrows && node.arrows.length > 0) || (node.squareColors && Object.keys(node.squareColors).length > 0);
    node.arrows = [];
    node.squareColors = {};
    if (hadDrawings) markDirty();
    renderBoardDrawings();
  });

  // Initialize drawing button state
  updateDrawingButtons();

  // Right-click drawing on the board (arrow = drag, square highlight = click)
  (function () {
    const container = document.getElementById('board-container');
    let dragFrom = null;
    let dragStartX = 0, dragStartY = 0;

    // Convert a MouseEvent to the chess square under the pointer
    function screenToSquare(e) {
      const rect = container.getBoundingClientRect();
      const xFrac = (e.clientX - rect.left) / rect.width;
      const yFrac = (e.clientY - rect.top)  / rect.height;
      const fileIdx = Math.max(0, Math.min(7, Math.floor(xFrac * 8)));
      const rankIdx = Math.max(0, Math.min(7, Math.floor(yFrac * 8)));
      const flipped = state.orientation === 'black';
      const file = String.fromCharCode(97 + (flipped ? 7 - fileIdx : fileIdx));
      const rank  = String(flipped ? rankIdx + 1 : 8 - rankIdx);
      return file + rank;
    }

    container.addEventListener('contextmenu', e => e.preventDefault(), { capture: true });

    // Cancel an active piece drag on right-click (global, fires before any board handler)
    document.addEventListener('mousedown', e => {
      if (e.button !== 2 || !_pieceIsDragging) return;
      _cancelNextDrop = true;
      e.preventDefault();
      e.stopPropagation();
      // Trigger chessboard.js's window mouseup handler so it calls onDrop immediately
      window.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true, button: 0, buttons: 0,
        clientX: e.clientX, clientY: e.clientY,
      }));
    }, { capture: true });

    container.addEventListener('mousedown', e => {
      if (e.button !== 2) return;
      // Prevent chessboard.js from starting its own drag/selection
      e.preventDefault();
      e.stopPropagation();

      dragFrom = screenToSquare(e);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    }, { capture: true });

    // Live preview while dragging
    container.addEventListener('mousemove', e => {
      if (!(e.buttons & 2) || !dragFrom || !state.drawingColor) return;

      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only show preview arrow if user has dragged far enough (ignore tiny jitters)
      if (dist > 10) {
        const toSq = screenToSquare(e);
        state.arrowPreview = toSq !== dragFrom ? { from: dragFrom, to: toSq, color: state.drawingColor } : null;
      } else {
        state.arrowPreview = null;
      }
      renderBoardDrawings();
    }, { capture: true });

    // Clear preview if mouse leaves the board while dragging
    container.addEventListener('mouseleave', () => {
      if (state.arrowPreview) {
        state.arrowPreview = null;
        renderBoardDrawings();
      }
    });

    document.addEventListener('mouseup', e => {
      if (e.button !== 2 || !dragFrom) return;

      const from = dragFrom;
      dragFrom = null;
      state.arrowPreview = null;

      if (!state.drawingColor) { renderBoardDrawings(); return; }

      const node = state.currentNode;
      if (!node) { renderBoardDrawings(); return; }

      const color = state.drawingColor;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10) {
        // Simple right-click (near same position): Toggle square highlight
        if (node.squareColors[from] === color) {
          delete node.squareColors[from];
        } else {
          node.squareColors[from] = color;
        }
      } else {
        // Drag-and-release: Toggle arrow
        const toSq = screenToSquare(e);
        if (!toSq || toSq === from) {
          renderBoardDrawings();
          return;
        }
        // Toggle arrow (same color: remove; different color: update; none: add)
        const idx = node.arrows.findIndex(a => a.from === from && a.to === toSq);
        if (idx !== -1 && node.arrows[idx].color === color) {
          node.arrows.splice(idx, 1);
        } else if (idx !== -1) {
          node.arrows[idx].color = color;
        } else {
          node.arrows.push({ from, to: toSq, color });
        }
      }

      markDirty();
      renderBoardDrawings();
    });
  })();

  // Annotation toolbar toggle
  (function () {
    const toggle = document.getElementById('ann-toolbar-toggle');
    const body   = document.getElementById('ann-toolbar-body');
    let expanded = localStorage.getItem('ann-toolbar-open') === 'true';
    function applyState() {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      body.classList.toggle('ann-toolbar-collapsed', !expanded);
    }
    applyState();
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      localStorage.setItem('ann-toolbar-open', expanded);
      applyState();
    });
  })();

  // Hide context menu on any outside click or scroll
  document.addEventListener('click', (e) => {
    if (!document.getElementById('move-context-menu').contains(e.target)) {
      hideContextMenu();
    }
  });

  document.addEventListener('scroll', hideContextMenu, true);

  // ---------------------------------------------------------------------------
  // Page navigation
  // ---------------------------------------------------------------------------
  const COLLECTION_KEY = 'chess-coach-collection';
  const COLLECTION_MAX_GAMES_PER_IMPORT = 500;
  const COLLECTION_MAX_TOTAL_GAMES = 200;
  const COLLECTION_BATCH_SIZE = 10;
  let collectionVisibleCount = COLLECTION_BATCH_SIZE;
  let collectionLastQuery = '';
  let collectionFilteredCount = 0;
  // Track in-progress analyses keyed by game id so re-renders don't lose state.
  // Declared here (not at runGameAnalysis) so renderCollection can reference it when
  // switchToPage('collection') runs during initial load on a deep link to #collection.
  const _analysisInProgress = new Set();

  function getPgnHeader(pgn, key) {
    const m = String(pgn || '').match(new RegExp('\\[' + key + '\\s+"([^"]*)"\\]', 'i'));
    return m ? m[1].trim() : '';
  }

  function normalizeSearchText(val) {
    return String(val || '').trim().toLowerCase();
  }

  function itemSearchText(item) {
    // Include the display title + savedAt plus key PGN headers for Elo/date/name searching.
    const pgn = item?.pgn || '';
    const parts = [
      item?.title || '',
      item?.savedAt || '',
      getPgnHeader(pgn, 'White'),
      getPgnHeader(pgn, 'Black'),
      getPgnHeader(pgn, 'WhiteElo'),
      getPgnHeader(pgn, 'BlackElo'),
      getPgnHeader(pgn, 'Date'),
      getPgnHeader(pgn, 'UTCDate'),
      getPgnHeader(pgn, 'Event'),
      getPgnHeader(pgn, 'Site'),
    ].filter(Boolean);
    return normalizeSearchText(parts.join(' • '));
  }

  function getCollection() {
    try {
      const items = JSON.parse(localStorage.getItem(COLLECTION_KEY)) || [];
      let didBackfill = false;
      for (const item of items) {
        if (!item) continue;
        if (!item.finalFen) {
          item.finalFen = getFinalFenFromPgn(item.pgn);
          didBackfill = true;
        }
        // Older games were saved before the analysis payload was persisted.
        // Rebuild stats from the annotations embedded in their tree so the
        // collection stats row / insights modal show up without re-analyzing.
        if (!item.analysis && item.treeData) {
          const recon = reconstructAnalysisFromTreeData(item.treeData);
          if (recon) {
            item.analysis = recon;
            didBackfill = true;
          }
        }
      }
      // Backfill is derived data — persist it locally only, without bumping
      // updatedAt or pushing to the server. A full-array push from here could
      // race the initial server load and clobber fresher data with this
      // device's stale copy.
      if (didBackfill) {
        try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(items)); } catch {}
      }
      return items;
    }
    catch { return []; }
  }

  function saveCollection(items) {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(items));
    syncCollectionToServer();
  }

  // Expose collection API for server-sync functions (defined outside DOMContentLoaded)
  window._collectionAPI = {
    get: getCollection,
    set: (items) => {
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(items));
      renderCollection();
    },
  };

  // Bridge so savePlayGameToCollection() (defined outside DOMContentLoaded) can reach here
  window._playCollectionSave = function(pgn, title) {
    const items = getCollection();
    if (items.length >= COLLECTION_MAX_TOTAL_GAMES) return false;
    const sig = pgnSignature(pgn);
    const existingSigs = buildCollectionSignatureSet(items);
    if (sig && existingSigs.has(sig)) return false;
    const testGame = new Chess();
    testGame.load_pgn(pgn, { sloppy: true });
    const newId = (Date.now() + Math.random()).toString(36);
    items.unshift({
      id: newId,
      title: title || 'Play game',
      pgn,
      sig: sig || null,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      finalFen: testGame.fen(),
      moveCount: testGame.history().length,
      updatedAt: Date.now(),
    });
    saveCollection(items);
    renderCollection();
    playState.savedToCollection = true;
    return newId;
  };

  function setCollectionStatus(message) {
    const el = document.getElementById('collection-import-status');
    if (el) el.textContent = message || '';
  }

  function setProviderStatus(message) {
    const el = document.getElementById('collection-provider-status');
    if (el) el.textContent = message || '';
  }

  function getFinalFenFromPgn(pgn) {
    const game = new Chess();
    if (!game.load_pgn(String(pgn || ''), { sloppy: true })) return null;
    return game.fen();
  }

  function splitPgnGames(pgnTextRaw) {
    const text = String(pgnTextRaw || '').replace(/\r\n/g, '\n').trim();
    if (!text) return [];

    // Heuristic split: blank line(s) followed by a header tag start.
    // Works for multi-game PGN dumps from Lichess and pasted files.
    const parts = text.split(/\n\s*\n(?=\s*\[)/g);
    const games = parts.map(s => s.trim()).filter(Boolean);

    // If it's a movetext-only PGN without headers, it will not split; treat as single game.
    if (games.length === 0) return [];
    return games;
  }

  function isValidSingleGamePgn(pgn) {
    const g = new Chess();
    return !!g.load_pgn(String(pgn || ''), { sloppy: true });
  }

  function pgnSignature(pgn) {
    // Stable identity based on the actual game moves + starting FEN.
    // This avoids duplicates when headers/whitespace differ.
    const g = new Chess();
    if (!g.load_pgn(String(pgn || ''), { sloppy: true })) return null;
    const fen = g.fen();
    // Derive start FEN: if a PGN sets up a position, Chess.js will incorporate it during load_pgn.
    // We can recover the starting position by rewinding with history.
    const moves = g.history({ verbose: true });
    g.reset();
    // If the PGN had a FEN header, Chess.js would not expose it directly; we approximate by replaying
    // moves from the standard start and using the resulting move list as identity.
    // For standard games (the common case), this works well and still de-dupes across header changes.
    const uci = moves.map(m => `${m.from}${m.to}${m.promotion || ''}`).join(' ');
    return `${fen.split(' ').slice(0, 4).join(' ')}|${uci}`;
  }

  function buildCollectionSignatureSet(items) {
    const set = new Set();
    for (const it of (items || [])) {
      const sig = it?.sig || pgnSignature(it?.pgn);
      if (sig) set.add(sig);
    }
    return set;
  }

  function addGamesToCollection(pgnGames, { preferredTitle = null } = {}) {
    const nowLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const items = getCollection();
    const existingSigs = buildCollectionSignatureSet(items);
    let added = 0;
    const addedIds = [];
    let skippedDuplicates = 0;
    let skippedInvalid = 0;
    let skippedLimit = 0;

    for (const pgn of pgnGames.slice(0, COLLECTION_MAX_GAMES_PER_IMPORT)) {
      if (items.length >= COLLECTION_MAX_TOTAL_GAMES) {
        skippedLimit++;
        break;
      }
      const trimmed = String(pgn || '').trim();
      if (!trimmed) continue;
      if (!isValidSingleGamePgn(trimmed)) { skippedInvalid++; continue; }

      const sig = pgnSignature(trimmed);
      if (sig && existingSigs.has(sig)) { skippedDuplicates++; continue; }

      const tmpTitle = preferredTitle || deriveImportTitle(trimmed) || 'Imported game';
      const testGame = new Chess();
      testGame.load_pgn(trimmed, { sloppy: true });
      const moveCount = testGame.history().length;

      const newId = (Date.now() + Math.random()).toString(36);
      items.unshift({
        id: newId,
        title: tmpTitle,
        pgn: trimmed,
        sig: sig || null,
        savedAt: nowLabel,
        finalFen: testGame.fen(),
        moveCount,
        updatedAt: Date.now(),
      });
      addedIds.push(newId);
      if (sig) existingSigs.add(sig);
      added++;
    }

    saveCollection(items);
    return { added, addedIds, skippedDuplicates, skippedInvalid, skippedLimit };
  }

  function renderCollection({ reset = false } = {}) {
    const items = getCollection().slice();
    const q = normalizeSearchText(document.getElementById('collection-search')?.value || '');
    const list = document.getElementById('collection-list');
    const empty = document.getElementById('collection-empty');
    const noMatches = document.getElementById('collection-no-matches');
    const resultsCountEl = document.getElementById('collection-results-count');

    if (reset || q !== collectionLastQuery) {
      collectionVisibleCount = COLLECTION_BATCH_SIZE;
      collectionLastQuery = q;
    }

    const filtered = q ? items.filter(it => itemSearchText(it).includes(q)) : items;
    collectionFilteredCount = filtered.length;
    const visibleItems = filtered.slice(0, collectionVisibleCount);

    if (resultsCountEl) {
      const label = q ? `${filtered.length} match${filtered.length !== 1 ? 'es' : ''}` : `${items.length} game${items.length !== 1 ? 's' : ''}`;
      resultsCountEl.textContent = label;
    }

    if (!items.length) {
      list.innerHTML = '';
      empty.classList.add('visible');
      if (noMatches) noMatches.style.display = 'none';
      return;
    }

    empty.classList.remove('visible');

    if (!filtered.length) {
      list.innerHTML = '';
      if (noMatches) noMatches.style.display = 'flex';
      return;
    }

    if (noMatches) noMatches.style.display = 'none';
    list.innerHTML = visibleItems.map(item => `
      <div class="collection-item" data-id="${item.id}">
        <div class="collection-item-board" data-preview-fen="${encodeURIComponent(getCollectionFinalFen(item) || '')}" aria-hidden="true">${renderCollectionMiniBoard(item)}</div>
        <div class="collection-item-info">
          <span class="collection-item-title">${escapeHtml(item.title || 'Untitled game')}</span>
          <div class="collection-item-meta">
            <span>${item.moveCount} move${item.moveCount !== 1 ? 's' : ''}</span>
            <span>${escapeHtml(item.savedAt || '')}</span>
            <span>${escapeHtml(getPgnHeader(item.pgn, 'Result') || 'Result unknown')}</span>
          </div>
          <span class="collection-item-preview">${escapeHtml(buildCollectionPreview(item))}</span>
          ${item.analysis?.stats ? renderAnalysisStatsRow(item.analysis.stats) : ''}
        </div>
        <div class="collection-item-actions">
          <div class="collection-analyze-wrapper">
            <button class="collection-analyze-btn" data-id="${item.id}" title="Analyze game" ${item.analysis ? 'disabled' : ''}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="2,12 5,8 8,10 11,5 14,7"/>
                <circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
              Analyze
            </button>
            <div class="collection-analyze-progress" data-id="${item.id}" hidden>
              <div class="collection-analyze-progress-bar"></div>
            </div>
          </div>
          <button class="collection-add-btn" data-id="${item.id}" title="Add to a named collection">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
            Add to…
          </button>
          <button class="collection-share-btn" data-id="${item.id}" title="Share game">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
          <button class="btn-secondary collection-load-btn" data-id="${item.id}">Load</button>
          <button class="collection-delete-btn" data-id="${item.id}" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.collection-analyze-btn').forEach(btn => {
      // If already running, button is disabled — no double-start
      if (_analysisInProgress.has(btn.dataset.id)) {
        btn.disabled = true;
        btn.innerHTML = `<span class="collection-analyze-spinner"></span> Analyzing…`;
      }
      btn.addEventListener('click', () => {
        const item = getCollection().find(i => i.id === btn.dataset.id);
        if (!item) return;
        confirmIfUnsaved(() => {
          // Load the game in the analysis tab, navigate to the end, and run live analysis
          document.querySelector('.nav-tab[data-page="analysis"]').click();
          if (item.treeData) {
            restoreFromTreeData(item.treeData);
          } else {
            document.getElementById('pgn-input').value = item.pgn;
            importPGN();
          }
          if (item.title) setGameTitle(item.title);
          markClean();
          state.loadedGameId = item.id;
          navigateLast();
          if (window.innerWidth <= 640) {
            document.querySelector('#mobile-panel-nav .mpn-btn[data-mpanel="right"]')?.click();
          }
          analyzeFullGameLive(item.id);
        });
      });
    });

    list.querySelectorAll('.collection-load-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = getCollection().find(i => i.id === btn.dataset.id);
        if (!item) return;
        confirmIfUnsaved(() => {
          document.querySelector('.nav-tab[data-page="analysis"]').click();
          if (item.treeData) {
            restoreFromTreeData(item.treeData);
          } else {
            document.getElementById('pgn-input').value = item.pgn;
            importPGN();
            if (item.analysis && item.analysis.moves && state.root) {
              applyAnalysisToTree(state.root, item.analysis.moves);
              updateUI();
            }
            if (item.nodeComments && item.nodeComments.length > 0 && state.root) {
              applyNodeCommentsToTree(state.root, item.nodeComments);
              updateUI();
            }
          }
          if (item.title) setGameTitle(item.title);
          markClean();
          state.loadedGameId = item.id;
          if (item.analysis && item.analysis.stats) {
            _insightsModalGameId = item.id;
            showGameInsightsModal(item.analysis);
          }
        });
      });
    });

    list.querySelectorAll('.collection-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        saveCollection(getCollection().filter(i => i.id !== id));
        deleteGameFromServer(id);
        if (state.loadedGameId === id) state.loadedGameId = null;
        renderCollection();
      });
    });

    list.querySelectorAll('.collection-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = getCollection().find(i => i.id === btn.dataset.id);
        if (!item) return;
        window._openAddToCollModal?.(item.id, item.title);
      });
    });

    list.querySelectorAll('.collection-share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = getCollection().find(i => i.id === btn.dataset.id);
        if (!item) return;
        window._shareGameData?.({
          title:    item.title || null,
          pgn:      item.pgn,
          treeData: item.treeData || null,
          analysis: item.analysis || null,
        });
      });
    });

    list.querySelectorAll('.collection-item-board').forEach(boardEl => {
      boardEl.addEventListener('mouseenter', e => {
        const fen = decodeURIComponent(boardEl.dataset.previewFen || '');
        if (!fen) return;
        showPreview(fen, e.clientX, e.clientY);
      });

      boardEl.addEventListener('mousemove', e => {
        const fen = decodeURIComponent(boardEl.dataset.previewFen || '');
        if (!fen) return;
        updatePreviewPosition(e.clientX, e.clientY);
      });

      boardEl.addEventListener('mouseleave', () => {
        hidePreview();
      });
    });

    if (window._collectionHighlightId) {
      const panel = document.getElementById('coll-panel-all');
      if (panel && panel.style.display !== 'none') {
        const hlId = window._collectionHighlightId;
        const el = list.querySelector(`.collection-item[data-id="${hlId}"]`);
        if (el) {
          window._collectionHighlightId = null;
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el.classList.add('collection-item--highlight');
          setTimeout(() => el.classList.remove('collection-item--highlight'), 1800);
        }
      }
    }
  }

  function buildCollectionPreview(item) {
    const white = getPgnHeader(item?.pgn, 'White');
    const black = getPgnHeader(item?.pgn, 'Black');
    const event = getPgnHeader(item?.pgn, 'Event');
    const site = getPgnHeader(item?.pgn, 'Site');
    const date = getPgnHeader(item?.pgn, 'Date') || getPgnHeader(item?.pgn, 'UTCDate');
    const pairing = [white, black].filter(Boolean).join(' vs ');
    return [pairing, event, site, date].filter(Boolean).join(' • ') || 'Saved from the analysis board';
  }

  function getCollectionFinalFen(item) {
    return item?.finalFen || getFinalFenFromPgn(item?.pgn);
  }

  function renderCollectionMiniBoard(item) {
    const fen = getCollectionFinalFen(item);
    if (!fen) return '';

    const boardPart = fen.split(' ')[0];
    const rows = boardPart.split('/');
    const squares = [];
    rows.forEach((row, rankIndex) => {
      let fileIndex = 0;
      for (const char of row) {
        if (/\d/.test(char)) {
          const emptyCount = Number(char);
          for (let i = 0; i < emptyCount; i++) {
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            squares.push(`<span class="collection-mini-square ${isLight ? 'is-light' : 'is-dark'}"></span>`);
            fileIndex++;
          }
        } else {
          const isLight = (rankIndex + fileIndex) % 2 === 0;
          const piece = char === char.toUpperCase() ? `w${char.toUpperCase()}` : `b${char.toUpperCase()}`;
          squares.push(`
            <span class="collection-mini-square ${isLight ? 'is-light' : 'is-dark'}">
              <img class="collection-mini-piece" src="${PIECE_IMAGES[piece]}" alt="" />
            </span>
          `);
          fileIndex++;
        }
      }
    });

    return `<div class="collection-mini-board">${squares.join('')}</div>`;
  }

  function renderMiniBoardHtml(fen) {
    if (!fen) return '';
    const boardPart = fen.split(' ')[0];
    const rows = boardPart.split('/');
    const squares = [];
    rows.forEach((row, rankIndex) => {
      let fileIndex = 0;
      for (const char of row) {
        if (/\d/.test(char)) {
          for (let i = 0; i < Number(char); i++) {
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            squares.push(`<span class="collection-mini-square ${isLight ? 'is-light' : 'is-dark'}"></span>`);
            fileIndex++;
          }
        } else {
          const isLight = (rankIndex + fileIndex) % 2 === 0;
          const piece = char === char.toUpperCase() ? `w${char.toUpperCase()}` : `b${char.toUpperCase()}`;
          squares.push(`<span class="collection-mini-square ${isLight ? 'is-light' : 'is-dark'}"><img class="collection-mini-piece" src="${PIECE_IMAGES[piece]}" alt="" /></span>`);
          fileIndex++;
        }
      }
    });
    return `<div class="collection-mini-board">${squares.join('')}</div>`;
  }

  function renderAnalysisStatsRow(stats) {
    if (!stats) return '';
    const { blunder = 0, mistake = 0, inaccuracy = 0 } = stats;
    const pills = [];
    if (blunder > 0) pills.push(`<span class="analysis-pill analysis-pill--blunder">${blunder} blunder${blunder !== 1 ? 's' : ''}</span>`);
    if (mistake > 0) pills.push(`<span class="analysis-pill analysis-pill--mistake">${mistake} mistake${mistake !== 1 ? 's' : ''}</span>`);
    if (inaccuracy > 0) pills.push(`<span class="analysis-pill analysis-pill--inaccuracy">${inaccuracy} inaccuracy${inaccuracy !== 1 ? 's' : ''}</span>`);
    if (!pills.length) return '';
    return `<div class="analysis-stats-row">${pills.join('')}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Collection imports (bulk PGN + providers)
  // ---------------------------------------------------------------------------
  (function initCollectionImport() {
    const bulkInput = document.getElementById('collection-pgn-bulk-input');
    const fileInput = document.getElementById('collection-pgn-file');
    const btnBulkImport = document.getElementById('btn-collection-import-pgn');
    const btnLichess = document.getElementById('btn-import-lichess');

    if (!btnBulkImport || !btnLichess) return;

    function showImportProgress(id) {
      const wrap = document.getElementById(id);
      if (wrap) { wrap.hidden = false; const bar = wrap.querySelector('.import-progress-bar'); if (bar) bar.style.width = '0%'; }
    }
    function animateImportProgress(id, target, duration) {
      const bar = document.querySelector(`#${id} .import-progress-bar`);
      if (!bar) return;
      bar.style.transition = `width ${duration}ms ease`;
      bar.style.width = target + '%';
    }
    function hideImportProgress(id) {
      const wrap = document.getElementById(id);
      if (wrap) { animateImportProgress(id, 100, 200); setTimeout(() => { if (wrap) wrap.hidden = true; }, 400); }
    }

    async function importBulkFromText(pgnText) {
      hideError('collection-import-error');
      setCollectionStatus('');
      const games = splitPgnGames(pgnText);
      if (games.length === 0) {
        showError('collection-import-error', 'Paste or upload at least one PGN game.');
        return;
      }

      showImportProgress('bulk-import-progress');
      animateImportProgress('bulk-import-progress', 60, 300);
      setCollectionStatus('Importing…');
      const { added, skippedDuplicates, skippedInvalid, skippedLimit } = addGamesToCollection(games);
      renderCollection();
      if (added > 0) {
        const extras = [
          skippedDuplicates ? `${skippedDuplicates} duplicate${skippedDuplicates !== 1 ? 's' : ''} skipped` : null,
          skippedInvalid ? `${skippedInvalid} invalid skipped` : null,
          skippedLimit ? `collection full (max ${COLLECTION_MAX_TOTAL_GAMES})` : null,
        ].filter(Boolean).join(' · ');
        setCollectionStatus(`Imported ${added} game${added !== 1 ? 's' : ''}.${extras ? ' ' + extras + '.' : ''}`);
      } else {
        if (skippedLimit) setCollectionStatus(`Your collection is full (max ${COLLECTION_MAX_TOTAL_GAMES} games).`);
        else setCollectionStatus(skippedDuplicates > 0 ? 'All of those games are already in your collection.' : 'No valid games found.');
      }
      hideImportProgress('bulk-import-progress');
    }

    btnBulkImport.addEventListener('click', async () => {
      const pasted = (bulkInput && bulkInput.value) ? bulkInput.value.trim() : '';
      if (pasted) return importBulkFromText(pasted);

      const files = fileInput?.files?.length ? Array.from(fileInput.files) : null;
      if (!files) {
        showError('collection-import-error', 'Paste PGN text or choose a PGN file first.');
        return;
      }

      hideError('collection-import-error');
      setCollectionStatus('Reading file…');
      try {
        const texts = await Promise.all(files.map(f => f.text()));
        const text = texts.join('\n\n');
        await importBulkFromText(text);
        if (bulkInput) bulkInput.value = '';
        if (fileInput) fileInput.value = '';
      } catch (err) {
        console.error('Bulk PGN file read failed:', err);
        showError('collection-import-error', 'Could not read that file. Please try again.');
        setCollectionStatus('');
      }
    });

    async function importFromProvider() {
      const usernameEl = document.getElementById('lichess-username');
      const username = (usernameEl && usernameEl.value) ? usernameEl.value.trim() : '';
      hideError('collection-provider-error');
      setProviderStatus('');

      // Hide any previous picker
      const pickerEl = document.getElementById('collection-game-picker');
      if (pickerEl) pickerEl.hidden = true;

      if (!username) {
        showError('collection-provider-error', 'Please enter a username.');
        return;
      }

      btnLichess.disabled = true;
      setProviderStatus('Fetching games…');
      showImportProgress('provider-import-progress');
      animateImportProgress('provider-import-progress', 40, 400);

      try {
        const url = `/api/import/lichess/${encodeURIComponent(username)}?max=50`;

        const res = await fetch(url, { credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showError('collection-provider-error', data.error || 'Import failed. Please try again.');
          setProviderStatus('');
          hideImportProgress('provider-import-progress');
          return;
        }

        animateImportProgress('provider-import-progress', 80, 300);
        const pgnText = String(data.pgnText || '').trim();
        const games = splitPgnGames(pgnText);
        if (games.length === 0) {
          setProviderStatus('No games found.');
          hideImportProgress('provider-import-progress');
          return;
        }

        hideImportProgress('provider-import-progress');
        setProviderStatus('');
        showCollectionGamePicker(games);
      } catch (err) {
        console.error('Provider import failed:', err);
        showError('collection-provider-error', 'Network error. Please check your connection and try again.');
        setProviderStatus('');
        hideImportProgress('provider-import-progress');
      } finally {
        btnLichess.disabled = false;
      }
    }

    function showCollectionGamePicker(games) {
      const pickerEl  = document.getElementById('collection-game-picker');
      const listEl    = document.getElementById('coll-game-picker-list');
      const countEl   = document.getElementById('coll-game-picker-count');
      const toggleBtn = document.getElementById('btn-coll-picker-toggle-all');
      const importBtn = document.getElementById('btn-coll-picker-import');
      if (!pickerEl || !listEl) return;

      listEl.innerHTML = '';
      const checkboxes = [];

      games.forEach((pgn, i) => {
        const white  = (pgn.match(/\[White\s+"([^"]+)"\]/) || [])[1] || '?';
        const black  = (pgn.match(/\[Black\s+"([^"]+)"\]/) || [])[1] || '?';
        const date   = ((pgn.match(/\[Date\s+"([^"]+)"\]/) || [])[1] || '').replace(/\?/g, '').replace(/\.$/, '');
        const result = (pgn.match(/\[Result\s+"([^"]+)"\]/) || [])[1] || '';

        const label = document.createElement('label');
        label.className = 'coll-game-picker-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.dataset.idx = i;
        checkboxes.push(cb);
        cb.addEventListener('change', updatePickerState);

        const info = document.createElement('span');
        info.className = 'coll-game-picker-item-info';
        info.innerHTML =
          `<span class="coll-game-picker-vs"><strong>${escapeHtml(white)}</strong> vs <strong>${escapeHtml(black)}</strong></span>` +
          `<span class="coll-game-picker-meta">${escapeHtml([date, result].filter(Boolean).join(' · '))}</span>`;

        label.appendChild(cb);
        label.appendChild(info);
        listEl.appendChild(label);
      });

      function updatePickerState() {
        const total   = checkboxes.length;
        const checked = checkboxes.filter(c => c.checked).length;
        countEl.textContent = `${checked} of ${total} selected`;
        toggleBtn.textContent = checked === total ? 'Deselect all' : 'Select all';
        importBtn.disabled = checked === 0;
        importBtn.textContent = checked === 0
          ? 'Import games'
          : `Import ${checked} game${checked !== 1 ? 's' : ''}`;
      }

      toggleBtn.onclick = () => {
        const allChecked = checkboxes.every(c => c.checked);
        checkboxes.forEach(c => { c.checked = !allChecked; });
        updatePickerState();
      };

      importBtn.onclick = () => {
        const selectedPgns = checkboxes
          .filter(c => c.checked)
          .map(c => games[+c.dataset.idx]);
        const { added, skippedDuplicates, skippedLimit } = addGamesToCollection(selectedPgns, { preferredTitle: null });
        renderCollection();
        pickerEl.hidden = true;
        if (added > 0) {
          const extras = [
            skippedDuplicates ? `${skippedDuplicates} duplicate${skippedDuplicates !== 1 ? 's' : ''} skipped` : null,
            skippedLimit ? `collection full (max ${COLLECTION_MAX_TOTAL_GAMES})` : null,
          ].filter(Boolean).join(' · ');
          setProviderStatus(`Imported ${added} game${added !== 1 ? 's' : ''}.${extras ? ' ' + extras + '.' : ''}`);
        } else {
          if (skippedLimit) setProviderStatus(`Your collection is full (max ${COLLECTION_MAX_TOTAL_GAMES} games).`);
          else setProviderStatus(skippedDuplicates > 0 ? 'All of those games are already in your collection.' : 'No valid games found.');
        }
      };

      updatePickerState();
      pickerEl.hidden = false;
    }

    btnLichess.addEventListener('click', () => importFromProvider());
  })();

  const analysisPage    = document.getElementById('page-analysis');
  const playPage        = document.getElementById('page-play');
  const trainPage       = document.getElementById('page-train');
  const profilePage     = document.getElementById('page-profile');
  const collectionPage  = document.getElementById('page-collection');
  const aboutPage       = document.getElementById('page-about');
  const settingsPage    = document.getElementById('page-settings');

  // previous page before going to profile (for back button)
  let _prevPage = 'analysis';
  // username of user being viewed (null = self profile)
  let _profileTarget = null;

  function switchToPage(page) {
    // Redirect legacy 'about' hash to settings with the about panel active
    if (page === 'about') {
      page = 'settings';
      setTimeout(() => {
        document.querySelector('.settings-sidebar-item[data-settings-section="about"]')?.click();
      }, 50);
    }
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.page === page);
    });
    document.querySelectorAll('.drawer-nav-btn').forEach(t => {
      t.classList.toggle('active', t.dataset.page === page);
    });
    analysisPage.style.display   = page === 'analysis'   ? ''      : 'none';
    playPage.style.display       = page === 'play'       ? ''      : 'none';
    trainPage.style.display      = page === 'train'      ? 'block' : 'none';
    profilePage.style.display    = page === 'profile'    ? 'block' : 'none';
    collectionPage.style.display = page === 'collection' ? 'block' : 'none';
    aboutPage.style.display      = 'none';
    settingsPage.style.display   = page === 'settings'   ? 'block' : 'none';

    document.body.classList.toggle('mobile-board-active', page === 'analysis' || page === 'play');
    document.body.classList.toggle('page-play', page === 'play');

    // Always open a board page aligned to the top. If the page got nudged by
    // input focus / momentum on a previous visit, reset every possible scroller
    // so the board is never stuck shifted upwards.
    if (page === 'analysis' || page === 'play' || page === 'train') {
      const scrollers = [document.scrollingElement, document.body, trainPage, playPage, analysisPage];
      scrollers.forEach(el => { if (el) el.scrollTop = 0; });
    }

    if (page === 'collection') {
      renderCollection({ reset: true });
      window._onCollectionPageOpen?.();
    }
    if (page === 'play') {
      applyBoardSize();
      initPlayBoard();
      if (playState.board) playState.board.resize();
    }
    if (page === 'analysis') {
      applyBoardSize();
      if (state.board) state.board.resize();
    }
    if (page === 'train') {
      const puzzleArena = document.getElementById('puzzle-arena');
      if (puzzleArena) puzzleArena.style.display = '';

      applyBoardSize();
      initPuzzleBoard();
      if (puzzleState.board) puzzleState.board.resize();
      window._loadNextPuzzle?.();
    }
    if (page === 'profile') {
      if (_profileTarget) {
        window._loadOtherProfile?.(_profileTarget);
      } else {
        loadProfilePage();
      }
    }
  }

  function openProfilePage() {
    const currentActive = document.querySelector('.nav-tab.active');
    _prevPage = currentActive ? (currentActive.dataset.page || 'analysis') : 'analysis';
    _profileTarget = null;
    switchToPage('profile');
  }

  function openUserProfile(username) {
    const currentActive = document.querySelector('.nav-tab.active');
    _prevPage = currentActive ? (currentActive.dataset.page || 'analysis') : 'analysis';
    _profileTarget = username;
    switchToPage('profile');
  }

  // ── Mobile chat (play tab) ─────────────────────────────────────────────
  (function initMobilePlayChat() {
    const toggleBtn  = document.getElementById('btn-play-mobile-chat-toggle');
    const chatBar    = document.getElementById('play-mobile-chat-bar');
    const chatInput  = document.getElementById('play-mobile-chat-input');
    const chatSend   = document.getElementById('btn-play-mobile-chat-send');
    if (!toggleBtn || !chatBar) return;

    toggleBtn.addEventListener('click', () => {
      const isVisible = chatBar.style.display === 'flex';
      chatBar.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && chatInput) chatInput.focus();
    });
    if (chatSend) {
      chatSend.addEventListener('click', () => sendPlayChat(chatInput, chatSend));
    }
    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPlayChat(chatInput, chatSend); }
      });
    }
  })();

  // ── Mobile options menu (Import PGN / Build Position) ───────────────────
  (function initMobileOptions() {
    const optBtn  = document.getElementById('btn-mobile-options');
    const optMenu = document.getElementById('mobile-options-menu');
    if (!optBtn || !optMenu) return;

    optBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = optMenu.classList.toggle('open');
      optBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', () => {
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('btn-mobile-flip')?.addEventListener('click', () => {
      document.getElementById('btn-flip')?.click();
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('btn-mobile-reset')?.addEventListener('click', () => {
      document.getElementById('btn-reset')?.click();
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('btn-mobile-import-pgn')?.addEventListener('click', () => {
      document.getElementById('btn-open-pgn-modal')?.click();
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('btn-mobile-build-pos')?.addEventListener('click', () => {
      document.getElementById('btn-open-position-builder')?.click();
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('btn-mobile-annotate')?.addEventListener('click', () => {
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
      const overlay = document.getElementById('mobile-ann-overlay');
      if (overlay) {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
      }
    });

    document.getElementById('btn-mobile-save-game')?.addEventListener('click', () => {
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
      document.dispatchEvent(new CustomEvent('mobile:open-save-modal'));
    });

    document.getElementById('btn-mobile-share-game')?.addEventListener('click', () => {
      optMenu.classList.remove('open');
      optBtn.setAttribute('aria-expanded', 'false');
      document.getElementById('btn-share-analysis-game')?.click();
    });
  })();

  // ── Mobile save-game modal ──────────────────────────────────────────────────
  (function initMobileSaveModal() {
    const overlay    = document.getElementById('mobile-save-modal');
    const input      = document.getElementById('mobile-save-modal-input');
    const errorEl    = document.getElementById('mobile-save-modal-error');
    const confirmBtn = document.getElementById('mobile-save-modal-confirm');
    const cancelBtn  = document.getElementById('mobile-save-modal-cancel');
    if (!overlay || !input) return;

    let autoFillValue = '';

    function openModal() {
      // Suggest a name: use current game title or next "Game N" slot
      const items = getCollection();
      let suggested = state.gameTitle || '';
      if (!suggested || suggested === 'Chess game 1') {
        const nums = items.map(i => { const m = i.title?.match(/^Game\s+(\d+)$/i); return m ? +m[1] : 0; });
        suggested = 'Game ' + ((nums.length ? Math.max(...nums) : 0) + 1);
      }
      autoFillValue = suggested;
      input.value = suggested;
      input.dataset.autofill = 'true';
      if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    document.addEventListener('mobile:open-save-modal', () => {
      requireLoginForCollection(openModal);
    });

    input.addEventListener('focus', () => {
      if (input.dataset.autofill === 'true') {
        input.value = '';
        delete input.dataset.autofill;
      }
    });

    confirmBtn?.addEventListener('click', () => {
      const title = input.value.trim() || autoFillValue;
      const result = saveCurrentToCollection({ title, silent: true });
      if (result.ok) {
        closeModal();
        showPlaySavedToast();
      } else {
        if (errorEl) { errorEl.textContent = result.msg; errorEl.style.display = 'block'; }
      }
    });

    cancelBtn?.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmBtn?.click();
      if (e.key === 'Escape') closeModal();
    });
  })();

  // ── Mobile ask-question overlay ─────────────────────────────────────────────
  (function initMobileAskOverlay() {
    const overlay    = document.getElementById('mobile-ask-overlay');
    const inputField = document.getElementById('mobile-ask-input-field');
    const sendBtn    = document.getElementById('btn-mobile-ask-send');
    const closeBtn   = document.getElementById('btn-close-mobile-ask');
    const triggerBtn = document.getElementById('btn-mobile-ask-trigger');
    if (!overlay || !inputField) return;

    function openOverlay() {
      // Sync active skill level to overlay buttons
      const activeLevel = state.skillLevel || 'beginner';
      overlay.querySelectorAll('.skill-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.level === activeLevel);
      });
      inputField.value = '';
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (!window.matchMedia('(hover: none)').matches) inputField.focus();
      else setTimeout(() => inputField.focus(), 80);
    }

    function closeOverlay() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function sendQuestion() {
      const text = inputField.value.trim();
      if (!text) return;
      // Proxy through the main question input + send button
      const mainInput = document.getElementById('question-input');
      const mainSend  = document.getElementById('btn-ask-question');
      if (mainInput && mainSend) {
        mainInput.value = text;
        mainSend.click();
      }
      closeOverlay();
    }

    triggerBtn?.addEventListener('click', openOverlay);
    closeBtn?.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
    sendBtn?.addEventListener('click', sendQuestion);
    inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendQuestion();
      if (e.key === 'Escape') closeOverlay();
    });
  })();

  // ── Mobile annotation popup ─────────────────────────────────────────────────
  (function initMobileAnnPopup() {
    const overlay  = document.getElementById('mobile-ann-overlay');
    const closeBtn = document.getElementById('btn-mobile-ann-close');
    if (!overlay) return;

    function closePopup() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    closeBtn?.addEventListener('click', closePopup);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closePopup();
    });

    overlay.querySelectorAll('.ann-tb-btn').forEach(btn => {
      btn.addEventListener('click', () => setTimeout(closePopup, 180));
    });
  })();

  // ── Mobile drawer (hamburger menu) ─────────────────────────────────────────
  (function initMobileDrawer() {
    const hamburger = document.getElementById('btn-hamburger');
    const backdrop  = document.getElementById('mobile-drawer-backdrop');
    const drawer    = document.getElementById('mobile-drawer');
    const closeBtn  = document.getElementById('btn-drawer-close');
    if (!hamburger || !drawer) return;

    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    closeBtn?.addEventListener('click', closeDrawer);

    // Swipe left to close
    let touchStartX = 0;
    drawer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    drawer.addEventListener('touchend', e => {
      if (touchStartX - e.changedTouches[0].clientX > 60) closeDrawer();
    }, { passive: true });

    // Drawer nav → switchToPage
    drawer.querySelectorAll('.drawer-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (!page) return;
        const leavingPlay = document.getElementById('page-play')?.style.display !== 'none';
        closeDrawer();
        if (leavingPlay && page !== 'play' && playHasMoves() && !playState.savedToCollection) {
          playRequestSaveBeforeLeaving(() => { try { history.pushState({ page }, '', '#' + page); } catch(e){} switchToPage(page); });
          return;
        }
        try { history.pushState({ page }, '', '#' + page); } catch(e) {}
        switchToPage(page);
      });
    });

    // Auth buttons delegate to hidden header buttons
    document.getElementById('btn-drawer-login')?.addEventListener('click', () => {
      closeDrawer();
      document.getElementById('btn-login')?.click();
    });
    document.getElementById('btn-drawer-signup')?.addEventListener('click', () => {
      closeDrawer();
      document.getElementById('btn-signup')?.click();
    });
    document.getElementById('btn-drawer-logout')?.addEventListener('click', () => {
      closeDrawer();
      document.getElementById('btn-logout')?.click();
    });


  })();

  // ── Analysis panel tabs (Moves / Analysis / Opening) ────────────────────────
  (function initAnalysisTabs() {
    const tabBar     = document.getElementById('analysis-tab-bar');
    const mobileNav  = document.getElementById('mobile-panel-nav');
    const rightPanel = document.querySelector('#page-analysis .right-panel');
    const leftPanel  = document.querySelector('#page-analysis .left-panel');
    if (!rightPanel || !leftPanel) return;

    function activateTab(panel) {
      if (tabBar) tabBar.querySelectorAll('.analysis-tab').forEach(t => {
        const on = t.dataset.panel === panel;
        t.classList.toggle('analysis-tab-active', on);
        t.setAttribute('aria-selected', on);
      });
      rightPanel.classList.toggle('panel-active', panel === 'right');
      leftPanel.classList.toggle('panel-active',  panel === 'left');
    }

    if (tabBar) tabBar.addEventListener('click', e => {
      const tab = e.target.closest('.analysis-tab');
      if (tab) activateTab(tab.dataset.panel);
    });

    // ── Compact 3-section mobile nav (replaces bottom tab bar + sub-tabs) ──
    const MP_ORDER = ['right', 'left-comments', 'left-opening'];
    let currentMpanel = 'left-comments';

    function activateMobilePanel(mpanel) {
      currentMpanel = mpanel;
      if (mobileNav) {
        mobileNav.querySelectorAll('.mpn-btn').forEach(b => {
          const on = b.dataset.mpanel === mpanel;
          b.classList.toggle('mpn-btn--active', on);
          b.setAttribute('aria-selected', String(on));
        });
      }
      activateTab(mpanel === 'right' ? 'right' : 'left');
      if (mpanel !== 'right') switchAnalysisPanel(mpanel === 'left-opening' ? 'opening' : 'comments');
      if (mpanel === 'left-comments') {
        const body = document.querySelector('#comments-subpanel .subpanel-body');
        if (body) body.scrollTop = 0;
      }
    }

    if (mobileNav) {
      mobileNav.addEventListener('click', e => {
        const btn = e.target.closest('.mpn-btn');
        if (btn) activateMobilePanel(btn.dataset.mpanel);
      });

      // Swipe left/right on panel area to navigate sections
      const pageEl = document.getElementById('page-analysis');
      let _sx = 0, _sy = 0;
      pageEl.addEventListener('touchstart', e => {
        _sx = e.touches[0].clientX;
        _sy = e.touches[0].clientY;
      }, { passive: true });
      pageEl.addEventListener('touchend', e => {
        if (!document.body.classList.contains('mobile-board-active')) return;
        const dx = e.changedTouches[0].clientX - _sx;
        const dy = e.changedTouches[0].clientY - _sy;
        if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        const idx = MP_ORDER.indexOf(currentMpanel);
        if (dx < 0 && idx < MP_ORDER.length - 1) activateMobilePanel(MP_ORDER[idx + 1]);
        else if (dx > 0 && idx > 0) activateMobilePanel(MP_ORDER[idx - 1]);
      }, { passive: true });
    }

    // Default: show Analysis panel on mobile
    activateMobilePanel('left-comments');
  })();

  const _validPages = ['analysis','play','train','collection','about','settings','profile'];
  const _rawInitial = location.hash.slice(1);
  const _initialPage = _validPages.includes(_rawInitial) ? (_rawInitial === 'about' ? 'settings' : _rawInitial) : 'analysis';
  try { history.replaceState({ page: _initialPage }, '', '#' + _initialPage); } catch(e) {}
  switchToPage(_initialPage);

  window.addEventListener('popstate', e => {
    const page = (e.state && _validPages.includes(e.state.page)) ? e.state.page : 'analysis';
    const leavingPlay = document.getElementById('page-play')?.style.display !== 'none';
    if (leavingPlay && page !== 'play' && playHasMoves() && !playState.savedToCollection) {
      playRequestSaveBeforeLeaving(() => switchToPage(page));
      return;
    }
    switchToPage(page);
  });

  // Mirror play character info into the mobile opponent bar via MutationObserver
  function _mirrorTextEl(srcId, dstId) {
    const src = document.getElementById(srcId);
    const dst = document.getElementById(dstId);
    if (!src || !dst) return;
    dst.textContent = src.textContent;
    new MutationObserver(() => { dst.textContent = src.textContent; })
      .observe(src, { childList: true, characterData: true, subtree: true });
  }
  _mirrorTextEl('play-character-name', 'play-mobile-opp-name-m');
  _mirrorTextEl('play-speech-text',   'play-mobile-opp-speech-m');

  // Mobile opponent bar expands to show the full chat log when its header is tapped
  document.getElementById('play-mobile-opp-head')?.addEventListener('click', () => togglePlayOppLog());

  // Mirror avatar (innerHTML to copy the piece icon img element)
  const _avatarSrc = document.getElementById('play-character-avatar');
  const _avatarDst = document.getElementById('play-mobile-opp-avatar-m');
  if (_avatarSrc && _avatarDst) {
    _avatarDst.innerHTML = _avatarSrc.innerHTML;
    new MutationObserver(() => {
      _avatarDst.innerHTML = _avatarSrc.innerHTML;
      const cls = Array.from(_avatarSrc.classList).find(c => c.startsWith('persona-color-'));
      if (cls) _avatarDst.className = `play-mobile-opp-avatar ${cls}`;
    }).observe(_avatarSrc, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const page = tab.dataset.page;
      const leavingPlay = document.getElementById('page-play')?.style.display !== 'none';

      if (leavingPlay && page !== 'play' && playHasMoves() && !playState.savedToCollection) {
        playRequestSaveBeforeLeaving(() => { try { history.pushState({ page }, '', '#' + page); } catch(e){} switchToPage(page); });
        return;
      }
      try { history.pushState({ page }, '', '#' + page); } catch(e) {}
      switchToPage(page);
    });
  });

  // beforeunload: warn when closing browser tab with an unsaved play game, or
  // with comment edits on a game that isn't in the collection (collection
  // games auto-persist, so they never trigger this).
  window.addEventListener('beforeunload', e => {
    const onPlayPage = document.getElementById('page-play')?.style.display !== 'none';
    const unsavedPlay = onPlayPage && playHasMoves() && !playState.savedToCollection;
    const unsavedComments = _hasUnsavedCommentEdits && hasUnsavedChanges();
    if (unsavedPlay || unsavedComments) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Resize boards when browser tab becomes visible again.
  // Only resize each board if its page is currently shown — calling resize() on a
  // hidden element makes chessboard.js measure a 0-width container and render a
  // black/collapsed board.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const analysisVisible = analysisPage?.style.display !== 'none';
      const trainVisible    = trainPage?.style.display !== 'none';
      const playVisible     = playPage?.style.display !== 'none';
      if (analysisVisible) {
        applyBoardSize();
        if (state.board) state.board.resize();
      }
      if (playVisible && playState.board) playState.board.resize();
      if (trainVisible) {
        applyBoardSize();
        if (puzzleState.board) puzzleState.board.resize();
      }
    }
  });

  // Collection search
  (function initCollectionSearch() {
    const input = document.getElementById('collection-search');
    const clearBtn = document.getElementById('collection-search-clear');
    if (!input || !clearBtn) return;

    input.addEventListener('input', () => renderCollection({ reset: true }));
    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      renderCollection({ reset: true });
    });
  })();

  (function initCollectionInfiniteScroll() {
    if (!collectionPage) return;

    collectionPage.addEventListener('scroll', () => {
      if (collectionPage.style.display === 'none') return;
      if (collectionVisibleCount >= collectionFilteredCount) return;

      const threshold = 180;
      const nearBottom = collectionPage.scrollTop + collectionPage.clientHeight >= collectionPage.scrollHeight - threshold;
      if (!nearBottom) return;

      collectionVisibleCount += COLLECTION_BATCH_SIZE;
      renderCollection();
    });
  })();

  (function initCollectionImportToggle() {
    const toggleBtn = document.getElementById('btn-collection-import-toggle');
    const modal = document.getElementById('collection-import-modal');
    const closeBtn = document.getElementById('btn-close-collection-import');
    if (!toggleBtn || !modal || !closeBtn) return;

    function openModal() {
      modal.style.display = 'flex';
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const firstInput = modal.querySelector('#collection-pgn-bulk-input');
        if (firstInput && !window.matchMedia('(hover: none)').matches) firstInput.focus();
      }, 50);
    }

    function closeModal() {
      modal.style.display = 'none';
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display !== 'none') closeModal(); });
  })();

  (function initInsightsModal() {
    const modal = document.getElementById('game-insights-modal');
    const btnClose = document.getElementById('btn-close-insights');
    const btnOk = document.getElementById('btn-insights-ok');
    if (!modal) return;
    function closeInsights() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      _insightsModalGameId = null;
    }
    if (btnClose) btnClose.addEventListener('click', closeInsights);
    if (btnOk) {
      btnOk.addEventListener('click', () => {
        const firstIdx = btnOk._reviewFirstIdx;
        closeInsights();
        if (typeof firstIdx === 'number') {
          const nodes = getMainLineNodes();
          if (nodes[firstIdx]) navigateTo(nodes[firstIdx]);
        }
      });
    }
    modal.addEventListener('click', e => { if (e.target === modal) closeInsights(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display !== 'none') closeInsights(); });

    const btnShare = document.getElementById('btn-insights-share');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        if (!state.root || state.root.children.length === 0) { showToast('No game to share.', 'info'); return; }
        const mainLineNodes = [];
        let n = state.root;
        while (n.children.length > 0) { n = n.children[0]; mainLineNodes.push(n); }
        const pgn = generatePgnToNode(mainLineNodes[mainLineNodes.length - 1]);
        if (!pgn) { showToast('No game to share.', 'info'); return; }
        window._shareGameData({
          title:    state.gameTitle || null,
          pgn,
          treeData: serializeTree(state.root),
          analysis: _insightsModalData || _lastAnalysisData || null,
        }, { showCard: true });
      });
    }
  })();

  document.getElementById('collection-empty-play-btn')?.addEventListener('click', () => {
    document.querySelector('.nav-tab[data-page="play"]')?.click();
  });
  document.getElementById('collection-empty-import-btn')?.addEventListener('click', () => {
    document.getElementById('btn-collection-import-toggle')?.click();
  });

  // Re-measure and re-init boards on window resize.
  // Skip each board if its page is hidden — rebuilding a board while its
  // container has display:none makes chessboard.js measure 0px and produce a
  // black/collapsed result. switchToPage() handles the deferred resize when
  // the user navigates back to analysis.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const analysisVisible = analysisPage?.style.display !== 'none';
      const trainVisible    = trainPage?.style.display !== 'none';
      if (analysisVisible) {
        applyBoardSize();
        const fen = state.game.fen();
        document.getElementById('board').innerHTML = '';
        initBoard();
        state.board.position(fen, false);
      } else if (trainVisible) {
        applyBoardSize();
      }
      if (playState.board) {
        const playFen = playState.game.fen();
        applyBoardSize();
        playState.board.resize();
        playState.board.position(playFen, false);
      }
      if (trainVisible && puzzleState.board) {
        puzzleState.board.resize();
      }
    }, 150);
  });

  // Keyboard navigation (arrow keys when not typing)
  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT') return;
    // Play page: arrow keys navigate move history
    const playPage = document.getElementById('page-play');
    if (playPage && playPage.style.display !== 'none') {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); playBrowsePrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); playBrowseNext(); }
      return;
    }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); navigatePrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); navigateNext(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const n = state.currentNode.children.length;
      if (n > 1) { _pendingChildIdx = (_pendingChildIdx - 1 + n) % n; updateVariationStrip(); }
      else navigateFirst();
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = state.currentNode.children.length;
      if (n > 1) { _pendingChildIdx = (_pendingChildIdx + 1) % n; updateVariationStrip(); }
      else navigateLast();
    }
  });

  // ---------------------------------------------------------------------------
  // Auth modal
  // ---------------------------------------------------------------------------
  (function initAuth() {
    const modal        = document.getElementById('auth-modal');
    const btnLogin     = document.getElementById('btn-login');
    const btnSignup    = document.getElementById('btn-signup');
    const btnClose     = document.getElementById('btn-close-auth');
    const tabs         = document.querySelectorAll('.auth-tab');
    const formLogin    = document.getElementById('auth-form-login');
    const formSignup   = document.getElementById('auth-form-signup');
    const titleEl      = document.getElementById('auth-modal-title');
    const subtitleEl   = document.getElementById('auth-subtitle');

    function equalizeFormHeights() {
      const wrap = formLogin.parentElement;
      if (!wrap || wrap.dataset.heightSet) return;
      wrap.dataset.heightSet = '1';
      const prevLogin = formLogin.style.display;
      const prevSignup = formSignup.style.display;
      formLogin.style.display = '';
      formSignup.style.display = '';
      const maxH = Math.max(formLogin.offsetHeight, formSignup.offsetHeight);
      formLogin.style.display = prevLogin;
      formSignup.style.display = prevSignup;
      if (maxH > 0) wrap.style.minHeight = maxH + 'px';
    }

    function openModal(tab) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      equalizeFormHeights();
      renderGoogleButton();
      switchTab(tab);
    }

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
        formLogin.style.display = '';
        formSignup.style.display = 'none';
        titleEl.textContent = 'Welcome back';
        subtitleEl.textContent = 'Sign in to your account';
      } else {
        formLogin.style.display = 'none';
        formSignup.style.display = '';
        titleEl.textContent = 'Create an account';
        subtitleEl.textContent = 'Join Chess Explain for free';
      }
      clearErrors();
    }

    function clearErrors() {
      document.querySelectorAll('.auth-error').forEach(el => { el.style.display = 'none'; el.textContent = ''; });
      document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('input-error'));
    }

    function showError(errorElId, msg) {
      const el = document.getElementById(errorElId);
      if (el) { el.textContent = msg; el.style.display = ''; }
    }

    function validateEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    }

    // Open / close
    btnLogin.addEventListener('click', () => openModal('login'));
    btnSignup.addEventListener('click', () => openModal('signup'));
    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display !== 'none') closeModal(); });

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.authTab));
    });

    // Password visibility toggles
    document.querySelectorAll('.auth-eye-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.querySelector('.eye-closed').style.display = isHidden ? 'none' : '';
        btn.querySelector('.eye-open').style.display  = isHidden ? ''     : 'none';
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
      return score; // 0-5
    }

    signupPasswordInput.addEventListener('input', () => {
      const pw = signupPasswordInput.value;
      if (!pw) { strengthFill.style.width = '0'; strengthLabel.textContent = ''; return; }
      const score = measureStrength(pw);
      const pct   = Math.min(100, score * 20) + '%';
      const colors = ['#ef4444','#f97316','#eab308','#22c55e','#10b981','#10b981'];
      const labels = ['','Too weak','Weak','Fair','Good','Strong'];
      strengthFill.style.width = pct;
      strengthFill.style.background = colors[score];
      strengthLabel.textContent = labels[score];
    });

    // Login form submit
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
        updateAuthUI(data.user, data.calls);
        closeModal();
        loadUserDataFromServer();
      } catch { showError('login-error', 'Network error. Please try again.'); }
      finally { submitBtn.disabled = false; submitBtn.textContent = 'Log in'; }
    });

    // Sign up form submit
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
        updateAuthUI(data.user, data.calls);
        closeModal();
        syncAccountPanel(data.user, data.calls);
      } catch { showError('signup-error', 'Network error. Please try again.'); }
      finally { submitBtn.disabled = false; submitBtn.textContent = 'Create account'; }
    });

    // Logout
    async function doLogout() {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      try { localStorage.removeItem('chess-coach-collection'); } catch {}
      window.location.reload();
    }

    const logoutModal = document.getElementById('logout-confirm-modal');
    document.getElementById('btn-logout').addEventListener('click', () => {
      logoutModal.style.display = '';
    });
    document.getElementById('btn-logout-confirm').addEventListener('click', doLogout);
    document.getElementById('btn-logout-cancel').addEventListener('click', () => {
      logoutModal.style.display = 'none';
    });
    logoutModal.addEventListener('click', e => {
      if (e.target === logoutModal) logoutModal.style.display = 'none';
    });

    // ── Forgot password ──
    const forgotPanel  = document.getElementById('auth-forgot-panel');
    const forgotForm   = document.getElementById('auth-form-forgot');
    const forgotSent   = document.getElementById('auth-forgot-sent');
    const forgotBack   = document.getElementById('btn-forgot-back');
    const forgotBackSent = document.getElementById('btn-forgot-back-sent');
    const socialRow    = document.querySelector('.auth-social');
    const dividerRow   = document.querySelector('.auth-divider');
    const tabsRow      = document.querySelector('.auth-tabs');

    function showForgotPanel() {
      tabsRow.style.display = 'none';
      socialRow.style.display = 'none';
      dividerRow.style.display = 'none';
      forgotPanel.style.display = '';
      forgotForm.style.display = '';
      forgotSent.style.display = 'none';
      document.querySelectorAll('.auth-form').forEach(f => { f.style.display = 'none'; });
      titleEl.textContent  = 'Forgot password?';
      subtitleEl.textContent = '';
      setTimeout(() => {
        const inp = document.getElementById('forgot-email');
        if (inp) inp.focus();
      }, 50);
    }

    function hideForgotPanel(tab = 'login') {
      forgotPanel.style.display = 'none';
      tabsRow.style.display = '';
      socialRow.style.display = '';
      dividerRow.style.display = '';
      document.getElementById('forgot-email').value = '';
      document.getElementById('forgot-error').style.display = 'none';
      switchTab(tab);
    }

    document.getElementById('link-forgot-password').addEventListener('click', e => {
      e.preventDefault();
      const emailVal = document.getElementById('login-email').value.trim();
      if (emailVal) document.getElementById('forgot-email').value = emailVal;
      showForgotPanel();
    });

    if (forgotBack)    forgotBack.addEventListener('click',    () => hideForgotPanel('login'));
    if (forgotBackSent) forgotBackSent.addEventListener('click', () => hideForgotPanel('login'));

    forgotForm.addEventListener('submit', async e => {
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
        // Always show sent notice — even on rate-limit or server error, to avoid enumeration
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

    // Verify email modal — close and resend
    document.getElementById('btn-close-verify-email').addEventListener('click', hideEmailUnverifiedModal);
    document.getElementById('verify-email-modal').addEventListener('click', e => {
      if (e.target === document.getElementById('verify-email-modal')) hideEmailUnverifiedModal();
    });
    document.getElementById('btn-resend-verification').addEventListener('click', async () => {
      const btn  = document.getElementById('btn-resend-verification');
      const note = document.getElementById('verify-email-modal-note');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const resp = await fetch('/api/auth/resend-verification', { method: 'POST', credentials: 'same-origin' });
        note.textContent = resp.ok ? 'Sent! Check your inbox.' : 'Failed to send. Please try again later.';
      } catch {
        note.textContent = 'Failed to send. Please try again later.';
      }
      note.style.display = '';
      btn.textContent = 'Resend verification email';
      btn.disabled = false;
    });

    // Upgrade modal — close
    document.getElementById('btn-close-upgrade').addEventListener('click', hideUpgradeModal);
    document.getElementById('upgrade-modal').addEventListener('click', e => {
      if (e.target === document.getElementById('upgrade-modal')) hideUpgradeModal();
    });

    // Upgrade modal — billing toggle
    document.getElementById('btn-billing-monthly').addEventListener('click', () => _setUpgradeBillingInterval('monthly'));
    document.getElementById('btn-billing-annual').addEventListener('click', () => _setUpgradeBillingInterval('annual'));

    // Upgrade modal — checkout
    document.getElementById('btn-upgrade-checkout').addEventListener('click', async () => {
      const btn = document.getElementById('btn-upgrade-checkout');
      const interval = _upgradeInterval;
      const plan = _upgradePlan;
      const fallbackLabel = btn.textContent || 'Upgrade';
      btn.disabled = true;
      btn.textContent = 'Opening checkout…';
      try {
        const resp = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interval, plan }),
        });
        const data = await resp.json();
        if (data.url) { window.ccTrack?.('begin_checkout', { plan, interval }); window.location.href = data.url; }
        else { btn.disabled = false; btn.textContent = fallbackLabel; showToast(data.error || 'Could not start checkout.', 'error'); }
      } catch { btn.disabled = false; btn.textContent = fallbackLabel; }
    });

    // Upgrade modal — login/signup links inside modal
    document.getElementById('upgrade-login-link').addEventListener('click', e => {
      e.preventDefault(); hideUpgradeModal(); openModal('login');
    });
    document.getElementById('upgrade-signup-link').addEventListener('click', e => {
      e.preventDefault(); hideUpgradeModal(); openModal('signup');
    });

    // ── Google Sign In ──
    const btnGoogle = document.getElementById('btn-auth-google');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        if (!window.google?.accounts?.id) {
          showToast('Google Sign-In is not configured yet. Please use email/password.', 'info');
          return;
        }
        window.google.accounts.id.prompt();
      });
    }

  })();

  // ---------------------------------------------------------------------------
  // Reset-password modal (opened when URL has ?action=reset&token=...)
  // ---------------------------------------------------------------------------
  (function initResetModal() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const token  = params.get('token');

    // Handle email verification result redirects
    const notice = params.get('notice');
    if (notice === 'verify_ok') {
      showToast('Email verified successfully!', 'success', 4000);
      loadAuthState(); // refresh user to update emailVerified flag
    } else if (notice === 'verify_invalid') {
      showToast('Verification link is invalid or expired. Please request a new one.', 'error', 5000);
    }

    // Clean query string from URL without reload
    if (action || notice) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }

    if (action !== 'reset' || !token) return;

    const modal      = document.getElementById('reset-modal');
    const form       = document.getElementById('reset-password-form');
    const errEl      = document.getElementById('reset-error');
    const fillEl     = document.getElementById('reset-strength-fill');
    const labelEl    = document.getElementById('reset-strength-label');
    const newPwInput = document.getElementById('reset-password-new');

    if (!modal || !form) return;

    function measureStrength(pw) {
      let s = 0;
      if (pw.length >= 8)  s++;
      if (pw.length >= 12) s++;
      if (/[A-Z]/.test(pw)) s++;
      if (/[0-9]/.test(pw)) s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      return s;
    }

    newPwInput.addEventListener('input', () => {
      const pw = newPwInput.value;
      if (!pw) { fillEl.style.width = '0'; labelEl.textContent = ''; return; }
      const score = measureStrength(pw);
      fillEl.style.width = Math.min(100, score * 20) + '%';
      fillEl.style.background = ['#ef4444','#ef4444','#f97316','#eab308','#22c55e','#10b981'][score];
      labelEl.textContent = ['','Too weak','Weak','Fair','Good','Strong'][score];
    });

    // Password visibility toggles in reset modal
    modal.querySelectorAll('.auth-eye-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.querySelector('.eye-closed').style.display = isHidden ? 'none' : '';
        btn.querySelector('.eye-open').style.display   = isHidden ? ''     : 'none';
      });
    });

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => newPwInput.focus(), 80);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      errEl.style.display = 'none';
      const newPassword     = newPwInput.value;
      const confirmPassword = document.getElementById('reset-password-confirm').value;

      if (newPassword.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.style.display = '';
        return;
      }
      if (newPassword !== confirmPassword) {
        errEl.textContent = 'Passwords do not match.';
        errEl.style.display = '';
        return;
      }

      const btn = form.querySelector('.auth-submit');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        const resp = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ token, newPassword }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          errEl.textContent = data.error || 'Password reset failed.';
          errEl.style.display = '';
          return;
        }
        modal.style.display = 'none';
        document.body.style.overflow = '';
        updateAuthUI(data.user, data.calls);
        syncAccountPanel(data.user, data.calls);
        showToast('Password updated successfully!', 'success', 4000);
      } catch {
        errEl.textContent = 'Network error. Please try again.';
        errEl.style.display = '';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Set new password';
      }
    });
  })();

  // ---------------------------------------------------------------------------
  // Email verification banner
  // ---------------------------------------------------------------------------
  (function initVerifyBanner() {
    const banner   = document.getElementById('verify-banner');
    const resendBtn = document.getElementById('btn-resend-verification');
    const dismissBtn = document.getElementById('btn-dismiss-verify-banner');

    if (!banner) return;

    dismissBtn.addEventListener('click', () => {
      banner.style.display = 'none';
    });

    resendBtn.addEventListener('click', async () => {
      resendBtn.disabled = true;
      resendBtn.textContent = 'Sending…';
      try {
        const resp = await fetch('/api/auth/resend-verification', {
          method: 'POST',
          credentials: 'same-origin',
        });
        const data = await resp.json();
        if (resp.ok) {
          showToast('Verification email sent! Check your inbox.', 'success', 4000);
          banner.style.display = 'none';
        } else {
          showToast(data.error || 'Could not send email. Try again later.', 'error');
        }
      } catch {
        showToast('Network error. Please try again.', 'error');
      } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend email';
      }
    });
  })();

  // ---------------------------------------------------------------------------
  // Play page — event wiring
  // ---------------------------------------------------------------------------
  (function initPlayPage() {
    // Persona selection
    document.querySelectorAll('.persona-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        playState.persona = card.dataset.persona;
        document.getElementById('btn-start-game').disabled = false;
      });
    });

    // Color selection
    document.querySelectorAll('.play-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.play-color-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        playState.userColor = btn.dataset.color;
      });
    });

    // Start game
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      if (!playState.persona) return;
      startPlayGame();
    });

    // Set starting position (opens position builder in play mode)
    document.getElementById('btn-play-set-position')?.addEventListener('click', () => {
      posBuilderPlayMode = true;
      openPositionBuilder();
    });

    // Reset starting position back to standard
    document.getElementById('btn-play-reset-position')?.addEventListener('click', () => {
      playState.customStartFen = null;
      updatePlaySetupUI();
    });

    // Resign — show confirmation modal
    document.getElementById('btn-play-resign')?.addEventListener('click', () => {
      if (!playState.active) return;
      playResign();
    });

    // Resign (mobile button-bar) — same confirmation modal
    document.getElementById('btn-play-mobile-resign')?.addEventListener('click', () => {
      if (!playState.active) return;
      playResign();
    });

    // New game (from game panel) — offer to save first
    document.getElementById('btn-play-new')?.addEventListener('click', () => {
      if (playHasMoves() && !playState.savedToCollection) {
        playRequestSaveBeforeLeaving(() => playReturnToSetup());
      } else {
        playReturnToSetup();
      }
    });

    // Save game button (in-game)
    document.getElementById('btn-play-save-game')?.addEventListener('click', () => {
      if (!playHasMoves()) return;
      requireLoginForCollection(() => {
        const saved = savePlayGameToCollection(playState.gameTitle || playDefaultTitle());
        if (saved) {
          window._collectionHighlightId = saved;
          try { history.pushState({ page: 'collection' }, '', '#collection'); } catch(e) {}
          switchToPage('collection');
        }
        playReturnToSetup();
      });
    });

    // Flip board
    document.getElementById('play-btn-flip')?.addEventListener('click', () => {
      if (!playState.board) return;
      playState.orientation = playState.orientation === 'white' ? 'black' : 'white';
      playState.board.orientation(playState.orientation);
      renderMaterialBars('mat-play-top', 'mat-play-bot', playState.game.fen(), playState.orientation);
    });

    document.getElementById('play-btn-prev')?.addEventListener('click', playBrowsePrev);
    document.getElementById('play-btn-next')?.addEventListener('click', playBrowseNext);
    document.getElementById('play-btn-jump-current')?.addEventListener('click', playJumpToCurrent);
    document.getElementById('play-btn-undo')?.addEventListener('click', playUndoMove);

    // ── Chat with opponent ──
    document.getElementById('btn-play-chat-send')?.addEventListener('click', sendPlayChat);
    document.getElementById('play-chat-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPlayChat(); }
    });

    // ── Ask the coach (Q&A about the current position) ──
    document.getElementById('btn-play-ask')?.addEventListener('click', () => askPlayQuestion());
    document.getElementById('play-question-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askPlayQuestion(); }
    });
    document.getElementById('play-ask-suggestions')?.addEventListener('click', e => {
      const chip = e.target.closest('.play-ask-chip');
      if (chip) askPlayQuestion(chip.textContent);
    });
    document.getElementById('btn-play-mobile-ask-toggle')?.addEventListener('click', openPlayAskSheet);
    document.getElementById('btn-play-ask-close')?.addEventListener('click', closePlayAskSheet);
    document.getElementById('play-ask-backdrop')?.addEventListener('click', closePlayAskSheet);

    // ── Resign confirmation modal ──
    document.getElementById('btn-play-resign-confirm')?.addEventListener('click', () => {
      document.getElementById('play-resign-modal').style.display = 'none';
      playDoResign();
    });
    document.getElementById('btn-play-resign-cancel')?.addEventListener('click', () => {
      document.getElementById('play-resign-modal').style.display = 'none';
    });
    document.getElementById('play-resign-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('play-resign-modal'))
        document.getElementById('play-resign-modal').style.display = 'none';
    });

    // ── Game over modal ──
    document.getElementById('btn-play-over-rematch')?.addEventListener('click', () => playRematch());
    document.getElementById('btn-play-over-save')?.addEventListener('click', () => {
      requireLoginForCollection(() => {
        const title = document.getElementById('play-over-game-title')?.value.trim() || playDefaultTitle();
        const saved = savePlayGameToCollection(title);
        document.getElementById('play-game-over-modal').style.display = 'none';
        if (saved) {
          window._collectionHighlightId = saved;
          try { history.pushState({ page: 'collection' }, '', '#collection'); } catch(e) {}
          switchToPage('collection');
        }
        playReturnToSetup();
      });
    });
    document.getElementById('btn-play-over-analyze')?.addEventListener('click', () => {
      document.getElementById('play-game-over-modal').style.display = 'none';
      const pgn = playGeneratePgn();
      if (pgn && importPgnString(pgn)) {
        const title = document.getElementById('play-over-game-title')?.value.trim() || playDefaultTitle();
        setGameTitle(title);
        try { history.pushState({ page: 'analysis' }, '', '#analysis'); } catch(e) {}
        switchToPage('analysis');
        setTimeout(() => window._analyzeFullGameLive?.(), 150);
      }
      playReturnToSetup();
    });
    document.getElementById('btn-play-over-skip')?.addEventListener('click', () => {
      document.getElementById('play-game-over-modal').style.display = 'none';
      playReturnToSetup();
    });

    // ── Save-before-leaving modal ──
    document.getElementById('btn-play-save-and-go')?.addEventListener('click', () => {
      requireLoginForCollection(() => {
        const modal = document.getElementById('play-save-modal');
        const title = document.getElementById('play-save-game-title')?.value.trim() || playDefaultTitle();
        const saved = savePlayGameToCollection(title);
        modal.style.display = 'none';
        if (saved) window._collectionHighlightId = saved;
        if (modal._onLeave) { const fn = modal._onLeave; modal._onLeave = null; fn(); }
        playReturnToSetup();
      });
    });
    document.getElementById('btn-play-discard-and-go')?.addEventListener('click', () => {
      const modal = document.getElementById('play-save-modal');
      modal.style.display = 'none';
      if (modal._onLeave) { const fn = modal._onLeave; modal._onLeave = null; fn(); }
      playReturnToSetup();
    });
    document.getElementById('btn-play-save-cancel')?.addEventListener('click', () => {
      const modal = document.getElementById('play-save-modal');
      modal._onLeave = null;
      modal.style.display = 'none';
    });
    document.getElementById('play-save-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('play-save-modal')) {
        document.getElementById('play-save-modal')._onLeave = null;
        document.getElementById('play-save-modal').style.display = 'none';
      }
    });

    // ── Keyboard: Escape closes play modals ──
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      ['play-resign-modal', 'play-game-over-modal', 'play-save-modal'].forEach(id => {
        const m = document.getElementById(id);
        if (m && m.style.display !== 'none') {
          if (id === 'play-save-modal') m._onLeave = null;
          m.style.display = 'none';
        }
      });
    });
  })();

  // ---------------------------------------------------------------------------
  // Game Analysis (Collection tab) — background, saves to localStorage
  // ---------------------------------------------------------------------------

  function showGameInsightsModal(analysisData, { pendingAiIndices = null, aiEnabled = true } = {}) {
    const modal = document.getElementById('game-insights-modal');
    const content = document.getElementById('insights-content');
    if (!modal || !content) return;

    _insightsModalData = analysisData;
    const { stats = {}, moves = [] } = analysisData;
    const { blunder = 0, mistake = 0, inaccuracy = 0, correct = 0,
            whiteAccuracy, blackAccuracy } = stats;
    const fmtAcc = v => typeof v === 'number' ? v + '%' : '—';

    const statsHtml = `
      <div class="insights-stats-grid">
        <div class="insights-stat insights-stat--blunder"><span class="insights-stat-num">${blunder}</span><span class="insights-stat-label">Blunders</span></div>
        <div class="insights-stat insights-stat--mistake"><span class="insights-stat-num">${mistake}</span><span class="insights-stat-label">Mistakes</span></div>
        <div class="insights-stat insights-stat--inaccuracy"><span class="insights-stat-num">${inaccuracy}</span><span class="insights-stat-label">Inaccuracies</span></div>
        <div class="insights-stat insights-stat--correct"><span class="insights-stat-num">${correct}</span><span class="insights-stat-label">Correct</span></div>
        <div class="insights-stat insights-stat--accuracy"><span class="insights-stat-num">${fmtAcc(whiteAccuracy)}</span><span class="insights-stat-label">White acc.</span></div>
        <div class="insights-stat insights-stat--accuracy insights-stat--black-acc"><span class="insights-stat-num">${fmtAcc(blackAccuracy)}</span><span class="insights-stat-label">Black acc.</span></div>
      </div>`;

    // Eval chart — always shown when there are enough moves
    const chartSvg = renderEvalChart(moves);
    const chartHtml = chartSvg
      ? `<div class="eval-chart-container">\
<div class="eval-chart-labels"><span>White</span><span>Black</span></div>\
${chartSvg}</div>`
      : '';

    // Show top significant moments (up to 5, sorted by severity then chronology)
    const keyMoments = moves
      .map((d, idx) => ({ ...d, idx }))
      .filter(d => d && ['blunder', 'mistake', 'inaccuracy'].includes(d.classification))
      .sort((a, b) => {
        const pri = { blunder: 3, mistake: 2, inaccuracy: 1 };
        const diff = (pri[b.classification] || 0) - (pri[a.classification] || 0);
        return diff !== 0 ? diff : (b.cpLoss || 0) - (a.cpLoss || 0);
      })
      .slice(0, 5);

    const annLabel = { great: 'Excellent', inaccuracy: 'Inaccuracy', mistake: 'Mistake', blunder: 'Blunder' };

    const momentsHtml = keyMoments.map(m => {
      const ann = CLASSIFICATION_ANN[m.classification] || '◆';
      const label = annLabel[m.classification] || m.classification;
      const color = m.color || 'w';
      const mn = m.moveNumber || '';
      const moveStr = color === 'w' ? `${mn}. ${m.san}${ann}` : `${mn}... ${m.san}${ann}`;
      const boardHtml = m.fenAfter ? renderMiniBoardHtml(m.fenAfter) : '';
      const isAiPending = pendingAiIndices && pendingAiIndices.has(m.idx);
      const isNeg = ['blunder', 'mistake', 'inaccuracy'].includes(m.classification);
      const cpBadge = isNeg && m.cpLoss > 0
        ? `<span class="key-moment-cploss">−${m.cpLoss}cp</span>`
        : '';
      let commentHtml;
      if (m.aiComment) {
        commentHtml = `<div class="key-moment-comment">${DOMPurify.sanitize(marked.parse(m.aiComment))}</div>`;
      } else if (!aiEnabled) {
        commentHtml = `<p class="key-moment-comment key-moment-comment--disabled">AI commentary unavailable. Monthly limit reached.</p>`;
      } else if (isAiPending) {
        commentHtml = `<div class="key-moment-loading"><span class="key-moment-loading-dots"><span></span><span></span><span></span></span><span class="key-moment-loading-text">Loading commentary…</span></div>`;
      } else {
        commentHtml = '';
      }
      return `<div class="key-moment-card key-moment-${escapeHtml(m.classification)}" data-move-idx="${m.idx}" role="button" tabindex="0" title="Jump to move ${escapeHtml(moveStr)}">
        <div class="key-moment-header">
          <span class="key-moment-ann key-moment-ann--${escapeHtml(m.classification)}">${escapeHtml(ann)}</span>
          <span class="key-moment-move">${escapeHtml(moveStr)}</span>
          <span class="key-moment-type">${escapeHtml(label)}</span>
          ${cpBadge}
          <span class="key-moment-goto" aria-hidden="true">→</span>
        </div>
        <div class="key-moment-body">
          <div class="key-moment-board">${boardHtml}</div>
          <div class="key-moment-comment-area">${commentHtml}</div>
        </div>
      </div>`;
    }).join('');

    content.innerHTML = chartHtml + statsHtml + (keyMoments.length ? `<div class="insights-section-title">Key moments</div><div class="insights-moments">${momentsHtml}</div>` : '');

    // Overlay perfectly-round dots on the eval chart (desktop only for interaction)
    const chartContainer = content.querySelector('.eval-chart-container');
    if (chartContainer) attachChartDots(chartContainer, modal);

    attachKeyMomentBoardZoom();

    // Key moment cards: click to navigate to that move
    content.querySelectorAll('.key-moment-card[data-move-idx]').forEach(card => {
      const handler = () => {
        const idx = parseInt(card.dataset.moveIdx, 10);
        const nodes = getMainLineNodes();
        if (!isNaN(idx) && nodes[idx]) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
          _insightsModalGameId = null;
          navigateTo(nodes[idx]);
        }
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
    });

    // Eval chart: click position → jump to that move
    const chartEl = content.querySelector('.eval-chart[data-move-count]');
    if (chartEl) {
      const moveCount = parseInt(chartEl.dataset.moveCount, 10);
      chartEl.addEventListener('click', e => {
        const rect = chartEl.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const idx = Math.min(moveCount - 1, Math.max(0, Math.floor(ratio * moveCount)));
        const nodes = getMainLineNodes();
        if (nodes[idx]) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
          _insightsModalGameId = null;
          navigateTo(nodes[idx]);
        }
      });
    }

    // Update the "Start reviewing" button text based on what the game contains
    const btnOk = document.getElementById('btn-insights-ok');
    const chronoMistakes = moves
      .map((d, idx) => ({ ...d, idx }))
      .filter(d => d && ['blunder', 'mistake', 'inaccuracy'].includes(d.classification))
      .sort((a, b) => a.idx - b.idx);
    if (btnOk) {
      btnOk.textContent = chronoMistakes.length > 0 ? 'Review first mistake →' : 'Start reviewing →';
      btnOk._reviewFirstIdx = chronoMistakes.length > 0 ? chronoMistakes[0].idx : null;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function attachChartDots(chartContainer, modal) {
    const chartEl = chartContainer.querySelector('.eval-chart[data-markers]');
    if (!chartEl) return;
    let markers;
    try { markers = JSON.parse(chartEl.dataset.markers); } catch (e) { return; }
    if (!markers.length) return;

    const isTouch = window.matchMedia('(hover: none)').matches;

    markers.forEach(m => {
      const dot = document.createElement('span');
      dot.className = `chart-dot chart-dot--${m.cls}`;
      dot.style.left = m.xPct.toFixed(2) + '%';
      dot.style.top = m.yPct.toFixed(2) + '%';

      if (!isTouch) {
        if (m.fen) {
          dot.addEventListener('mouseenter', e => showPreview(m.fen, e.clientX, e.clientY));
          dot.addEventListener('mousemove', e => updatePreviewPosition(e.clientX, e.clientY));
          dot.addEventListener('mouseleave', hidePreview);
        }
        dot.addEventListener('click', e => {
          e.stopPropagation();
          hidePreview();
          const nodes = getMainLineNodes();
          if (!isNaN(m.moveIdx) && nodes[m.moveIdx]) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            _insightsModalGameId = null;
            navigateTo(nodes[m.moveIdx]);
          }
        });
      }

      chartContainer.appendChild(dot);
    });
  }

  function attachKeyMomentBoardZoom() {
    document.querySelectorAll('.key-moment-board').forEach(boardEl => {
      let zoomEl = null;
      boardEl.addEventListener('mouseenter', () => {
        const miniBoard = boardEl.querySelector('.collection-mini-board');
        if (!miniBoard) return;
        const rect = boardEl.getBoundingClientRect();
        zoomEl = document.createElement('div');
        zoomEl.className = 'key-moment-zoom-overlay';
        zoomEl.innerHTML = miniBoard.outerHTML;
        let top = rect.top;
        if (top + 250 > window.innerHeight - 20) top = Math.max(20, rect.bottom - 250);
        zoomEl.style.top = `${top}px`;
        zoomEl.style.left = `${rect.left}px`;
        document.body.appendChild(zoomEl);
      });
      boardEl.addEventListener('mouseleave', () => {
        zoomEl?.remove();
        zoomEl = null;
      });
    });
  }

  function refreshInsightsModalIfOpen(gameId, movesData, stats, pendingAiIndices, aiEnabled) {
    if (_insightsModalGameId !== gameId) return;
    const modal = document.getElementById('game-insights-modal');
    if (!modal || modal.style.display === 'none') return;
    showGameInsightsModal({ stats, moves: movesData }, { pendingAiIndices, aiEnabled });
  }

  function updateInsightsModalComment(gameId, moveIdx, comment) {
    if (_insightsModalGameId !== gameId) return;
    const card = document.querySelector(`.key-moment-card[data-move-idx="${moveIdx}"]`);
    if (!card) return;
    const area = card.querySelector('.key-moment-comment-area');
    if (!area) return;
    area.innerHTML = `<div class="key-moment-comment">${DOMPurify.sanitize(marked.parse(comment))}</div>`;
  }

  async function runGameAnalysis(item) {
    if (_analysisInProgress.has(item.id)) return;
    _analysisInProgress.add(item.id);

    // Update the button for this specific item to show a spinner
    function setAnalyzeBtnState(loading, hasAnalysis) {
      const btn = document.querySelector(`.collection-analyze-btn[data-id="${item.id}"]`);
      const progressEl = document.querySelector(`.collection-analyze-progress[data-id="${item.id}"]`);
      if (!btn) return;
      if (loading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="collection-analyze-spinner"></span> Analyzing…`;
        if (progressEl) {
          progressEl.hidden = false;
          const bar = progressEl.querySelector('.collection-analyze-progress-bar');
          if (bar) bar.style.width = '0%';
        }
      } else {
        if (progressEl) progressEl.hidden = true;
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,12 5,8 8,10 11,5 14,7"/><circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg> Analyze`;
        btn.disabled = hasAnalysis;
      }
    }

    setAnalyzeBtnState(true, false);

    try {
      const resp = await fetch('/api/collection/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn: item.pgn }),
        credentials: 'same-origin',
      });

      if (!resp.ok) {
        _analysisInProgress.delete(item.id);
        setAnalyzeBtnState(false, false);
        if (resp.status === 403 || resp.status === 429 || resp.status === 503) {
          const errData = await resp.json().catch(() => ({}));
          if (errData.error === 'email_unverified') showEmailUnverifiedError(null);
          else if (errData.error === 'limit_reached') showUpgradeModal(errData);
        }
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      const movesData = [];
      let pendingAiIndices = null; // set after stockfish_done

      const persistAnalysis = (stats) => {
        const items = getCollection();
        const gameItem = items.find(i => i.id === item.id);
        if (gameItem) {
          gameItem.analysis = { moves: movesData, stats };
          bumpGameUpdatedAt(gameItem);
          saveCollection(items);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            let evt;
            try { evt = JSON.parse(line.slice(6)); } catch { continue; }

            if (evt.type === 'latency') {
              showTrafficNotice();

            } else if (evt.type === 'move') {
              movesData[evt.moveIndex] = {
                classification: evt.classification,
                bestMove: evt.bestMove,
                uci: evt.uci,
                san: evt.san,
                cpLoss: evt.cpLoss,
                evalBeforeW: evt.evalBeforeW,
                evalAfterW: evt.evalAfterW,
                accuracy: evt.accuracy,
                fenBefore: evt.fenBefore,
                fenAfter: evt.fenAfter,
                color: evt.color,
                moveNumber: evt.moveNumber,
              };
              if (item.moveCount > 0) {
                const progressEl = document.querySelector(`.collection-analyze-progress[data-id="${item.id}"]`);
                const bar = progressEl?.querySelector('.collection-analyze-progress-bar');
                if (bar) bar.style.width = Math.min(100, Math.round((evt.moveIndex + 1) / item.moveCount * 100)) + '%';
              }
            } else if (evt.type === 'stockfish_done') {
              // Stockfish analysis complete — save immediately and unblock UI.
              persistAnalysis(evt.stats);
              pendingAiIndices = new Set(evt.aiEnabled ? (evt.keyMomentIndices || []) : []);
              _analysisInProgress.delete(item.id);
              setAnalyzeBtnState(false, true);
              renderCollection();
              // Surface why AI comments are absent when key moments were skipped by the gate.
              if ((evt.keyMomentIndices || []).length > 0 && !evt.aiEnabled) {
                if (evt.aiStatus === 'unverified') {
                  showToast('Verify your email to unlock AI coaching comments on your key moves.', 'info', 5000);
                } else if (evt.aiStatus === 'limit_reached') {
                  showToast("You've used your AI analyses this month. Stockfish review is still free.", 'info', 5000);
                }
              }
              // If the insights modal is open for this game, refresh it with loading states.
              refreshInsightsModalIfOpen(item.id, movesData, evt.stats, pendingAiIndices, evt.aiEnabled);
            } else if (evt.type === 'ai_comment') {
              if (movesData[evt.moveIndex]) {
                movesData[evt.moveIndex].aiComment = evt.comment;
                movesData[evt.moveIndex].aiTheme = evt.theme;
                if (pendingAiIndices) pendingAiIndices.delete(evt.moveIndex);
              }
              // Persist updated AI comment to localStorage.
              const stored = getCollection();
              const gameItem = stored.find(i => i.id === item.id);
              if (gameItem && gameItem.analysis) {
                gameItem.analysis.moves = movesData;
                bumpGameUpdatedAt(gameItem);
                saveCollection(stored);
              }
              // Update the insights modal live if it's open for this game.
              updateInsightsModalComment(item.id, evt.moveIndex, evt.comment);
            } else if (evt.type === 'done') {
              // Final event — ensure everything is persisted.
              persistAnalysis(evt.stats);
              if (pendingAiIndices) pendingAiIndices.clear();
              refreshInsightsModalIfOpen(item.id, movesData, evt.stats, new Set(), true);
            }
          }
        }
      }
    } catch (err) {
      // silently ignore abort/network errors
    }

    _analysisInProgress.delete(item.id);
    // Re-check current stored state to show correct label
    const stored = getCollection().find(i => i.id === item.id);
    setAnalyzeBtnState(false, !!(stored && stored.analysis));
    renderCollection();
  }

  // ---------------------------------------------------------------------------
  // Full-game live analysis — annotates all moves in the analysis tab in real time
  // ---------------------------------------------------------------------------
  async function analyzeFullGameLive(collectionItemId = null) {
    const btn = document.getElementById('btn-analyze-game');
    if (btn && btn.dataset.analysisRunning) return;

    // Collect main-line nodes (excluding root)
    const mainLineNodes = [];
    let n = state.root;
    while (n.children.length > 0) {
      n = n.children[0];
      mainLineNodes.push(n);
    }

    if (mainLineNodes.length === 0) return;

    const progressWrap = document.getElementById('analyze-game-progress');
    const progressBar = document.getElementById('analyze-game-progress-bar');
    const liveStatsEl = document.getElementById('analysis-live-stats');

    if (btn) {
      btn.disabled = true;
      btn.dataset.analysisRunning = '1';
      btn.innerHTML = `<span class="collection-analyze-spinner"></span> Analyzing…`;
    }
    if (progressWrap) { progressWrap.style.display = ''; }
    if (progressBar)  { progressBar.style.width = '0%'; }
    if (liveStatsEl)  { liveStatsEl.style.display = ''; }

    // Live accuracy and classification counters updated per-move
    const liveStats = { correct: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
    const liveAccW = [], liveAccB = [];
    const liveEvals = []; // centipawn values (white's perspective) for live chart

    function updateLiveStats() {
      const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
      const wEl = document.getElementById('live-acc-white');
      const bEl = document.getElementById('live-acc-black');
      const wAcc = avg(liveAccW), bAcc = avg(liveAccB);
      if (wEl) wEl.textContent = wAcc !== null ? wAcc + '%' : '—';
      if (bEl) bEl.textContent = bAcc !== null ? bAcc + '%' : '—';
      for (const [type, count] of Object.entries(liveStats)) {
        const el = document.getElementById('live-cnt-' + type);
        if (!el) continue;
        if (count > 0) {
          el.style.display = '';
          const sp = el.querySelector('span');
          if (sp) sp.textContent = count;
        } else {
          el.style.display = 'none';
        }
      }
      // Update live eval chart
      const chartWrap = document.getElementById('live-eval-chart-wrap');
      if (chartWrap && liveEvals.length >= 2) {
        chartWrap.innerHTML = renderLiveEvalChart(liveEvals);
      }
    }

    const _beforeUnloadGuard = e => { e.preventDefault(); };
    window.addEventListener('beforeunload', _beforeUnloadGuard);

    const pgn = generatePgnToNode(mainLineNodes[mainLineNodes.length - 1]);

    try {
      const resp = await fetch('/api/collection/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn }),
        credentials: 'same-origin',
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (errData.error === 'email_unverified') showEmailUnverifiedError('error-msg');
        else if (errData.error === 'limit_reached') showUpgradeModal(errData);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      const movesData = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);

          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            let evt;
            try { evt = JSON.parse(line.slice(6)); } catch { continue; }

            if (evt.type === 'latency') {
              showTrafficNotice();

            } else if (evt.type === 'move') {
              const node = mainLineNodes[evt.moveIndex];
              if (node) {
                const ann = CLASSIFICATION_ANN[evt.classification] || '';
                const prevAnn = node.annotation || '';
                if (ann && ann !== prevAnn) {
                  node.annotation = ann;
                  _newlyAnnotatedNodeIds.add(node.id);
                  setTimeout(() => _newlyAnnotatedNodeIds.delete(node.id), 500);
                }
                movesData[evt.moveIndex] = { ...evt };
                if (progressBar) {
                  progressBar.style.width = Math.min(100, Math.round((evt.moveIndex + 1) / mainLineNodes.length * 100)) + '%';
                }

                // Update live counters and eval chart
                if (evt.classification) liveStats[evt.classification] = (liveStats[evt.classification] || 0) + 1;
                if (evt.accuracy !== undefined) {
                  if (evt.color === 'w') liveAccW.push(evt.accuracy);
                  else liveAccB.push(evt.accuracy);
                }
                // Seed starting eval on the first move, then track each move's eval
                if (evt.moveIndex === 0 && evt.evalBeforeW !== undefined && liveEvals.length === 0) {
                  liveEvals.push(evt.evalBeforeW);
                }
                if (evt.evalAfterW !== undefined) liveEvals.push(evt.evalAfterW);
                updateLiveStats();

                updateMoveHistory();
              }
            } else if (evt.type === 'ai_comment') {
              // Legacy single-event path (kept for backward compat)
              const node = mainLineNodes[evt.moveIndex];
              if (node && evt.comment) {
                node.comment = evt.comment;
                node.theme = evt.theme || null;
                if (movesData[evt.moveIndex]) {
                  movesData[evt.moveIndex].aiComment = evt.comment;
                  movesData[evt.moveIndex].aiTheme = evt.theme;
                }
                if (node.id === state.currentNode.id) showComment(node.comment, node.theme, node.id);
                updateMoveHistory();
              }

            } else if (evt.type === 'ai_comment_start') {
              // Streaming path: initialise node comment buffer and show placeholder
              const node = mainLineNodes[evt.moveIndex];
              if (node) {
                node.comment = '';
                if (node.id === state.currentNode.id) {
                  document.getElementById('analysis-card-title').textContent = 'Analysis';
                  document.getElementById('theme-badge').style.display = 'none';
                  document.getElementById('strategic-context').style.display = 'none';
                  document.getElementById('qa-thread').innerHTML = '';
                  const expEl = document.getElementById('explanation-text');
                  if (expEl) expEl.textContent = '';
                  document.getElementById('analysis-result').classList.add('visible');
                }
              }

            } else if (evt.type === 'ai_comment_chunk') {
              const node = mainLineNodes[evt.moveIndex];
              if (node && evt.text) {
                node.comment += evt.text;
                // Live-update explanation panel if the user is viewing this node
                if (node.id === state.currentNode.id) {
                  const expEl = document.getElementById('explanation-text');
                  if (expEl) expEl.textContent = node.comment;
                }
              }

            } else if (evt.type === 'ai_comment_done') {
              const node = mainLineNodes[evt.moveIndex];
              if (node) {
                node.comment = evt.comment;
                if (movesData[evt.moveIndex]) movesData[evt.moveIndex].aiComment = evt.comment;
                // Final render with full markdown
                if (node.id === state.currentNode.id) showComment(node.comment, null, node.id);
                updateMoveHistory();
              }

            } else if (evt.type === 'stockfish_done' || evt.type === 'done') {
              // Surface why AI coaching comments are absent — but only when there
              // were key moments that would have received one (a clean game with no
              // inaccuracies legitimately has nothing to comment on, so stay quiet).
              if (evt.type === 'stockfish_done' && (evt.keyMomentIndices || []).length > 0) {
                if (evt.aiStatus === 'unverified') {
                  showToast('Verify your email to unlock AI coaching comments on your key moves.', 'info', 5000);
                } else if (evt.aiStatus === 'limit_reached') {
                  showToast("You've used your AI analyses this month. Stockfish review is still free.", 'info', 5000);
                }
              }
              _lastAnalysisData = { moves: movesData, stats: evt.stats || {} };
              if (collectionItemId) {
                const items = getCollection();
                const gameItem = items.find(i => i.id === collectionItemId);
                if (gameItem) {
                  gameItem.analysis = { moves: movesData, stats: evt.stats };
                  saveCollection(items);
                  renderCollection();
                }
              } else {
                // Analysis results (move annotations + AI comments) are not auto-saved
                // for unsaved games — mark dirty so the user is prompted to save.
                markDirty();
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('analyzeFullGameLive error:', err);
    } finally {
      window.removeEventListener('beforeunload', _beforeUnloadGuard);
      if (liveStatsEl) liveStatsEl.style.display = 'none';
      if (btn) {
        delete btn.dataset.analysisRunning;
        const hasMovesNow = state.root.children.length > 0;
        btn.disabled = !hasMovesNow;
        const svgIcon = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,12 5,8 8,10 11,5 14,7"/><circle cx="14" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg>`;
        if (_lastAnalysisData) {
          btn.dataset.mode = 'review';
          btn.innerHTML = `${svgIcon} Review game`;
        } else {
          btn.innerHTML = `${svgIcon} Analyze game`;
        }
      }
      if (progressWrap) progressWrap.style.display = 'none';
    }
  }

  // Expose so it can be called from outside DOMContentLoaded (e.g. collection load)
  window._analyzeFullGameLive = analyzeFullGameLive;

  // Reset the cached full-game analysis. Called when a new/different game is
  // loaded into the analysis tab so stale analysis from a previous game is not
  // attached when this one is saved.
  window._resetLastAnalysisData = () => { _lastAnalysisData = null; };

  // Wire up the Analyze Game button in the analysis tab right panel
  const analyzeGameBtn = document.getElementById('btn-analyze-game');
  if (analyzeGameBtn) {
    analyzeGameBtn.addEventListener('click', () => {
      if (analyzeGameBtn.dataset.mode === 'review' && _lastAnalysisData) {
        _insightsModalGameId = null;
        showGameInsightsModal(_lastAnalysisData);
      } else {
        analyzeFullGameLive();
      }
    });
  }

  (function initSettingsPage() {
    const COLOR_PRESETS = [
      { light: '#e8d8ba', dark: '#4e7249' },
      { light: '#f0d9b5', dark: '#b58863' },
      { light: '#dee3e6', dark: '#8ca2ad' },
      { light: '#cdd6e0', dark: '#6b8299' },
      { light: '#d8e8f0', dark: '#4a7fa8' },
      { light: '#b0bec5', dark: '#37474f' },
      { light: '#f0d5d5', dark: '#a04060' },
      { light: '#c8e6c9', dark: '#2e7d32' },
    ];

    function syncColorSwatches() {
      const swatches = document.querySelectorAll('.color-scheme-swatch');
      swatches.forEach(sw => {
        const match =
          sw.dataset.light.toLowerCase() === boardSettings.lightSquare.toLowerCase() &&
          sw.dataset.dark.toLowerCase()  === boardSettings.darkSquare.toLowerCase();
        sw.classList.toggle('active', match);
      });
    }

    function syncPieceSetCards() {
      document.querySelectorAll('.piece-set-card').forEach(card => {
        card.classList.toggle('active', card.dataset.pieceSet === boardSettings.pieceSet);
      });
    }

    function syncToggles() {
      const rc = document.getElementById('toggle-rounded-corners');
      const ma = document.getElementById('toggle-move-animation');
      const hl = document.getElementById('toggle-highlight-legal');
      const sn = document.getElementById('toggle-show-notation');
      const ms = document.getElementById('toggle-move-sounds');
      const ar = document.getElementById('toggle-move-arrow');
      const fn = document.getElementById('toggle-figurine-notation');
      if (rc) rc.checked = boardSettings.roundedCorners;
      if (ma) ma.checked = boardSettings.moveAnimation;
      if (hl) hl.checked = boardSettings.highlightLegal;
      if (sn) sn.checked = boardSettings.showNotation;
      if (ms) ms.checked = boardSettings.soundEnabled;
      if (ar) ar.checked = boardSettings.showMoveArrow;
      if (fn) fn.checked = boardSettings.figurineNotation;
    }

    function syncColorPickers() {
      const lp = document.getElementById('color-light-picker');
      const dp = document.getElementById('color-dark-picker');
      if (lp) lp.value = boardSettings.lightSquare;
      if (dp) dp.value = boardSettings.darkSquare;
    }

    function syncAll() {
      syncColorSwatches();
      syncPieceSetCards();
      syncToggles();
      syncColorPickers();
    }

    document.querySelectorAll('.color-scheme-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        boardSettings.lightSquare = sw.dataset.light;
        boardSettings.darkSquare  = sw.dataset.dark;
        applyBoardSettings();
        syncAll();
      });
    });

    const lightPicker = document.getElementById('color-light-picker');
    const darkPicker  = document.getElementById('color-dark-picker');
    if (lightPicker) {
      lightPicker.addEventListener('input', () => {
        boardSettings.lightSquare = lightPicker.value;
        applyBoardSettings();
        syncColorSwatches();
      });
    }
    if (darkPicker) {
      darkPicker.addEventListener('input', () => {
        boardSettings.darkSquare = darkPicker.value;
        applyBoardSettings();
        syncColorSwatches();
      });
    }

    document.querySelectorAll('.piece-set-card').forEach(card => {
      card.addEventListener('click', () => {
        boardSettings.pieceSet = card.dataset.pieceSet;
        applyBoardSettings();
        syncPieceSetCards();
      });
    });

    const toggleRounded = document.getElementById('toggle-rounded-corners');
    const toggleAnim    = document.getElementById('toggle-move-animation');
    const toggleHighlight = document.getElementById('toggle-highlight-legal');
    const toggleNotation  = document.getElementById('toggle-show-notation');

    if (toggleRounded) {
      toggleRounded.addEventListener('change', () => {
        boardSettings.roundedCorners = toggleRounded.checked;
        applyBoardSettings();
      });
    }
    if (toggleAnim) {
      toggleAnim.addEventListener('change', () => {
        boardSettings.moveAnimation = toggleAnim.checked;
        applyBoardSettings();
      });
    }
    if (toggleHighlight) {
      toggleHighlight.addEventListener('change', () => {
        boardSettings.highlightLegal = toggleHighlight.checked;
        applyBoardSettings();
      });
    }
    if (toggleNotation) {
      toggleNotation.addEventListener('change', () => {
        boardSettings.showNotation = toggleNotation.checked;
        applyBoardSettings();
      });
    }

    const toggleSounds = document.getElementById('toggle-move-sounds');
    if (toggleSounds) {
      toggleSounds.addEventListener('change', () => {
        boardSettings.soundEnabled = toggleSounds.checked;
        applyBoardSettings();
      });
    }

    const toggleArrow = document.getElementById('toggle-move-arrow');
    if (toggleArrow) {
      toggleArrow.addEventListener('change', () => {
        boardSettings.showMoveArrow = toggleArrow.checked;
        applyBoardSettings();
      });
    }

    const toggleFigurine = document.getElementById('toggle-figurine-notation');
    if (toggleFigurine) {
      toggleFigurine.addEventListener('change', () => {
        boardSettings.figurineNotation = toggleFigurine.checked;
        applyBoardSettings();
        updateMoveHistory();
        renderPlayMoveHistory();
        if (typeof updateOTMoveList === 'function') updateOTMoveList();
        if (typeof updateOTMoveListDrill === 'function') updateOTMoveListDrill();
      });
    }

    syncAll();
    window._syncBoardSettingsPanel = syncAll;
  })();

  // ---------------------------------------------------------------------------
  // Gameplay settings panel
  // ---------------------------------------------------------------------------
  (function initGameplaySettings() {
    function syncGameplayPanel() {
      const aq = document.getElementById('toggle-auto-queen');
      if (aq) aq.checked = gameplaySettings.autoQueenPromotion;
    }

    const toggleAutoQueen = document.getElementById('toggle-auto-queen');
    if (toggleAutoQueen) {
      toggleAutoQueen.addEventListener('change', () => {
        gameplaySettings.autoQueenPromotion = toggleAutoQueen.checked;
        saveGameplaySettings();
      });
    }

    syncGameplayPanel();

    // Expose combined sync for loadUserDataFromServer
    window._syncSettingsPanels = () => {
      if (window._syncBoardSettingsPanel) window._syncBoardSettingsPanel();
      syncGameplayPanel();
    };
  })();

  // ---------------------------------------------------------------------------
  // Settings sidebar navigation
  // ---------------------------------------------------------------------------
  (function initSettingsSidebar() {
    const sidebarItems = document.querySelectorAll('.settings-sidebar-item');
    const panels = document.querySelectorAll('.settings-panel');

    function showPanel(section) {
      sidebarItems.forEach(item => item.classList.toggle('active', item.dataset.settingsSection === section));
      panels.forEach(panel => {
        panel.style.display = panel.id === `settings-panel-${section}` ? '' : 'none';
      });
      document.querySelector('.settings-main')?.scrollTo({ top: 0, behavior: 'instant' });
      // Sync account panel with current auth state when switching to it
      if (section === 'account' || section === 'security') {
        syncAccountPanel(authState.user, authState.calls);
      }
    }

    sidebarItems.forEach(item => {
      item.addEventListener('click', () => showPanel(item.dataset.settingsSection));
    });
  })();

  // ---------------------------------------------------------------------------
  // Account settings panel handlers
  // ---------------------------------------------------------------------------
  (function initAccountSettings() {
    // Login/signup buttons inside account panel
    const acctBtnLogin  = document.getElementById('account-btn-login');
    const acctBtnSignup = document.getElementById('account-btn-signup');
    const secBtnLogin   = document.getElementById('security-btn-login');

    function openAuthFromSettings(tab) {
      // Navigate to analysis page first so auth modal is accessible
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.page === 'analysis'));
      document.querySelectorAll('[id^="page-"]').forEach(p => { p.style.display = 'none'; });
      document.getElementById('page-analysis').style.display = '';
      // Open auth modal
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.querySelectorAll('.auth-tab').forEach(t => {
          const active = t.dataset.authTab === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', String(active));
        });
        document.getElementById('auth-form-login').style.display = tab === 'login' ? '' : 'none';
        document.getElementById('auth-form-signup').style.display = tab === 'signup' ? '' : 'none';
      }
    }

    if (acctBtnLogin)  acctBtnLogin.addEventListener('click',  () => openAuthFromSettings('login'));
    if (acctBtnSignup) acctBtnSignup.addEventListener('click', () => openAuthFromSettings('signup'));
    if (secBtnLogin)   secBtnLogin.addEventListener('click',   () => openAuthFromSettings('login'));

    // Change username form
    const cuEditBtn   = document.getElementById('btn-username-edit');
    const cuEditor    = document.getElementById('username-editor');
    const cuForm      = document.getElementById('change-username-form');
    const cuCancelBtn = document.getElementById('btn-username-cancel');

    function closeUsernameEditor() {
      if (cuEditor) cuEditor.style.display = 'none';
      if (cuForm) {
        cuForm.reset();
        const errEl = document.getElementById('cu-error');
        if (errEl) errEl.style.display = 'none';
      }
    }

    if (cuEditBtn && cuEditor) {
      cuEditBtn.addEventListener('click', () => {
        const isOpen = cuEditor.style.display !== 'none';
        if (isOpen) { closeUsernameEditor(); return; }
        cuEditor.style.display = '';
        const input = document.getElementById('cu-new');
        if (input) {
          input.value = authState.user?.username || '';
          input.focus();
          input.select();
        }
      });
    }
    if (cuCancelBtn) cuCancelBtn.addEventListener('click', closeUsernameEditor);

    if (cuForm) {
      cuForm.addEventListener('submit', async e => {
        e.preventDefault();
        const errEl = document.getElementById('cu-error');
        errEl.style.display = 'none';

        const username = document.getElementById('cu-new').value.trim();
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
          errEl.textContent = 'Username must be 3–30 letters, numbers, or underscores.';
          errEl.style.display = '';
          return;
        }
        if (username === authState.user?.username) {
          errEl.textContent = 'That is already your username.';
          errEl.style.display = '';
          return;
        }

        const submitBtn = cuForm.querySelector('.security-submit');
        submitBtn.disabled = true;
        try {
          const resp = await fetch('/api/auth/change-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ username }),
          });
          const data = await resp.json();
          if (!resp.ok) {
            errEl.textContent = data.error || 'Failed to change username.';
            errEl.style.display = '';
          } else {
            closeUsernameEditor();
            updateAuthUI({ ...authState.user, ...data.user }, authState.calls);
            showToast('Username updated', 'success');
          }
        } catch {
          errEl.textContent = 'Network error. Please try again.';
          errEl.style.display = '';
        } finally {
          submitBtn.disabled = false;
        }
      });
    }

    // Change password form
    const cpForm = document.getElementById('change-password-form');
    if (cpForm) {
      cpForm.addEventListener('submit', async e => {
        e.preventDefault();
        const errEl = document.getElementById('cp-error');
        const okEl  = document.getElementById('cp-success');
        errEl.style.display = 'none';
        okEl.style.display  = 'none';

        const currentPassword = document.getElementById('cp-current').value;
        const newPassword     = document.getElementById('cp-new').value;
        const confirm         = document.getElementById('cp-confirm').value;

        if (newPassword !== confirm) {
          errEl.textContent = 'New passwords do not match.';
          errEl.style.display = '';
          return;
        }

        const submitBtn = cpForm.querySelector('.security-submit');
        submitBtn.disabled = true;
        try {
          const resp = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ currentPassword, newPassword }),
          });
          const data = await resp.json();
          if (!resp.ok) { errEl.textContent = data.error || 'Failed.'; errEl.style.display = ''; }
          else { okEl.style.display = ''; cpForm.reset(); }
        } catch { errEl.textContent = 'Network error.'; errEl.style.display = ''; }
        finally { submitBtn.disabled = false; }
      });
    }

    // Delete account flow
    const deleteOpenBtn    = document.getElementById('btn-delete-account-open');
    const deleteModal      = document.getElementById('delete-account-modal');
    const deleteConfirmBtn = document.getElementById('btn-delete-account-confirm');
    const deleteCancelBtn  = document.getElementById('btn-delete-account-cancel');
    const deleteErrEl      = document.getElementById('delete-account-error');

    if (deleteOpenBtn) {
      deleteOpenBtn.addEventListener('click', () => {
        document.getElementById('delete-account-password').value = '';
        if (deleteErrEl) { deleteErrEl.style.display = 'none'; }
        deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    }
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
    if (deleteConfirmBtn) {
      deleteConfirmBtn.addEventListener('click', async () => {
        const pw = document.getElementById('delete-account-password').value;
        if (!pw) { deleteErrEl.textContent = 'Enter your password.'; deleteErrEl.style.display = ''; return; }
        deleteConfirmBtn.disabled = true;
        try {
          const resp = await fetch('/api/auth/account', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ password: pw }),
          });
          const data = await resp.json();
          if (!resp.ok) { deleteErrEl.textContent = data.error || 'Failed.'; deleteErrEl.style.display = ''; }
          else {
            deleteModal.style.display = 'none';
            document.body.style.overflow = '';
            updateAuthUI(null, null);
            await loadAuthState();
          }
        } catch { deleteErrEl.textContent = 'Network error.'; deleteErrEl.style.display = ''; }
        finally { deleteConfirmBtn.disabled = false; }
      });
    }
  })();

  // ---------------------------------------------------------------------------
  // Contact form
  // ---------------------------------------------------------------------------
  (function initContactForm() {
    const form       = document.getElementById('contact-form');
    const errorEl    = document.getElementById('contact-error');
    const successEl  = document.getElementById('contact-success');
    const submitBtn  = document.getElementById('btn-contact-submit');
    const msgInput   = document.getElementById('contact-message');
    const charCount  = document.getElementById('contact-char-count');

    if (!form) return;

    msgInput?.addEventListener('input', () => {
      if (charCount) charCount.textContent = msgInput.value.length;
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errorEl)   { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (successEl) { successEl.style.display = 'none'; }

      const name    = document.getElementById('contact-name').value.trim();
      const email   = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value.trim();
      const website = form.querySelector('[name="website"]').value; // honeypot

      if (!name || name.length < 2) {
        if (errorEl) { errorEl.textContent = 'Please enter your name.'; errorEl.style.display = ''; }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) { errorEl.textContent = 'Please enter a valid email address.'; errorEl.style.display = ''; }
        return;
      }
      if (!subject) {
        if (errorEl) { errorEl.textContent = 'Please select a subject.'; errorEl.style.display = ''; }
        return;
      }
      if (message.length < 20) {
        if (errorEl) { errorEl.textContent = 'Please write at least 20 characters.'; errorEl.style.display = ''; }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      try {
        const resp = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ name, email, subject, message, website }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          if (errorEl) { errorEl.textContent = data.error || 'Failed to send message.'; errorEl.style.display = ''; }
        } else {
          form.reset();
          if (charCount) charCount.textContent = '0';
          if (successEl) successEl.style.display = '';
        }
      } catch {
        if (errorEl) { errorEl.textContent = 'Network error. Please try again.'; errorEl.style.display = ''; }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      }
    });
  })();

  // Settings > About contact form
  (function initSettingsContactForm() {
    const form      = document.getElementById('settings-contact-form');
    const errorEl   = document.getElementById('sc-error');
    const successEl = document.getElementById('sc-success');
    const submitBtn = document.getElementById('btn-sc-submit');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errorEl)   { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (successEl) { successEl.style.display = 'none'; }
      const name    = document.getElementById('sc-name').value.trim();
      const email   = document.getElementById('sc-email').value.trim();
      const subject = document.getElementById('sc-subject').value;
      const message = document.getElementById('sc-message').value.trim();
      const website = form.querySelector('[name="website"]').value;
      if (!name || name.length < 2)                             { if (errorEl) { errorEl.textContent = 'Please enter your name.'; errorEl.style.display = ''; } return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))          { if (errorEl) { errorEl.textContent = 'Please enter a valid email.'; errorEl.style.display = ''; } return; }
      if (!subject)                                             { if (errorEl) { errorEl.textContent = 'Please select a subject.'; errorEl.style.display = ''; } return; }
      if (message.length < 20)                                  { if (errorEl) { errorEl.textContent = 'Message must be at least 20 characters.'; errorEl.style.display = ''; } return; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      try {
        const resp = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ name, email, subject, message, website }) });
        const data = await resp.json();
        if (!resp.ok) { if (errorEl) { errorEl.textContent = data.error || 'Failed to send.'; errorEl.style.display = ''; } }
        else          { form.reset(); if (successEl) successEl.style.display = ''; }
      } catch { if (errorEl) { errorEl.textContent = 'Network error.'; errorEl.style.display = ''; } }
      finally { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; } }
    });
  })();

  // Restore a master game passed via localStorage from the opening panel.
  // Key format: ce_game_<base36timestamp>, written by _openMasterGame().
  (() => {
    const key = new URLSearchParams(window.location.search).get('g');
    if (!key || !/^ce_game_[a-z0-9]+$/.test(key)) return;
    history.replaceState({}, '', '/');
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      localStorage.removeItem(key);
      const { pgn, uciMoves } = JSON.parse(raw);
      if (!pgn || !pgn.includes('[')) return;
      importPgnString(pgn);
      // Navigate to the position the user was viewing in the previous tab.
      if (Array.isArray(uciMoves) && uciMoves.length > 0) {
        let node = state.root;
        for (const uci of uciMoves) {
          const next = node.children.find(c => c.move && c.move.uci === uci);
          if (!next) break;
          node = next;
        }
        if (node !== state.root) navigateTo(node);
      }
    } catch {}
  })();

  // ---------------------------------------------------------------------------
  // Header username → Profile page
  // ---------------------------------------------------------------------------
  document.getElementById('header-username')?.addEventListener('click', () => {
    openProfilePage();
  });

  // ---------------------------------------------------------------------------
  // Puzzle / Train page init
  // ---------------------------------------------------------------------------
  (function initTrainPage() {

    document.getElementById('btn-puzzle-next')?.addEventListener('click', () => {
      localStorage.removeItem('chess_current_puzzle');
      loadNextPuzzle();
    });

    document.getElementById('btn-puzzle-giveup')?.addEventListener('click', () => {
      if (puzzleState.loadingNext) return;
      localStorage.removeItem('chess_current_puzzle');
      if (!puzzleState.solved && puzzleState.wrongAttempts > 0 && puzzleState.puzzle) {
        recordPuzzleAttempt(false, puzzleTimeSec());
      }
      loadNextPuzzle();
    });

    document.getElementById('btn-puzzle-retry')?.addEventListener('click', () => {
      retryPuzzle();
    });

    document.getElementById('btn-puzzle-ask')?.addEventListener('click', () => {
      askPuzzleQuestion();
    });

    document.getElementById('puzzle-ask-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') askPuzzleQuestion();
    });

    // ── Board init ──────────────────────────────────────────────────────────
    function initPuzzleBoard() {
      if (puzzleState.board) {
        puzzleState.board.resize();
        return;
      }
      const boardEl = document.getElementById('puzzle-board');
      if (!boardEl) return;

      // Both the train page AND the puzzle arena must be visible so chessboard.js
      // can read the container's pixel dimensions. Make both visible (off-screen)
      // before init, then restore their display state.
      const arenaEl = document.getElementById('puzzle-arena');
      const trainWasHidden = trainPage && trainPage.style.display === 'none';
      const arenaWasHidden = arenaEl && arenaEl.style.display === 'none';

      if (trainWasHidden) { trainPage.style.visibility = 'hidden'; trainPage.style.display = 'block'; }
      if (arenaWasHidden) { arenaEl.style.visibility  = 'hidden'; arenaEl.style.display  = 'flex'; }

      puzzleState.board = Chessboard('puzzle-board', {
        position: 'start',
        draggable: true,
        orientation: 'white',
        pieceTheme: (piece) => PIECE_IMAGES[piece],
        onDragStart: puzzleOnDragStart,
        onDrop: puzzleOnDrop,
        onSnapEnd: puzzleOnSnapEnd,
      });

      if (arenaWasHidden) { arenaEl.style.display  = 'none'; arenaEl.style.visibility  = ''; }
      if (trainWasHidden) { trainPage.style.display = 'none'; trainPage.style.visibility = ''; }

      document.getElementById('puzzle-board')?.addEventListener('click', (e) => {
        const sq = e.target.closest('[data-square]');
        if (sq) puzzleOnSquareClick(sq.dataset.square);
      });
    }

    // Mobile result-sheet state — declared here (before the direct-load bootstrap
    // below) so loadNextPuzzle()/detachPuzzleSheetDismiss() don't hit the TDZ.
    let _sheetOutsideHandler = null;
    let _sheetTouch = null;

    // expose so switchToPage can call it
    window._initPuzzleBoard = initPuzzleBoard;
    window._loadNextPuzzle  = () => loadNextPuzzle();

    // If the train page was already active when this IIFE ran (direct #train URL
    // load), switchToPage ran before these callbacks were registered — bootstrap now.
    if (trainPage && trainPage.style.display !== 'none') {
      applyBoardSize();
      initPuzzleBoard();
      if (puzzleState.board) puzzleState.board.resize();
      loadNextPuzzle();
    }

    // ── Drag & click handlers ──────────────────────────────────────────────
    let _pSelectedSq = null;
    let _pLegalTargets = [];
    let _pDropHandledClick = false;
    let _pPendingMove = null;

    function puzzleOnDragStart(src, piece) {
      if (!puzzleIsUserTurn() || puzzleState.solved) return false;
      if (puzzleState.puzzle === null) return false;
      const turn = puzzleState.game.turn();
      const uColor = puzzleState.userColor === 'white' ? 'w' : 'b';
      if (turn !== uColor) return false;
      if ((turn === 'w' && piece.startsWith('b')) || (turn === 'b' && piece.startsWith('w'))) return false;
      _pieceIsDragging = true;
      clearPuzzleHighlights();
      _pSelectedSq = src;
      _pLegalTargets = puzzleState.game.moves({ square: src, verbose: true }).map(m => m.to);
      $(`#puzzle-board [data-square="${src}"]`).addClass('highlight-selected');
      _pLegalTargets.forEach(sq => $(`#puzzle-board [data-square="${sq}"]`).addClass('highlight-legal'));
      return true;
    }

    function puzzleOnDrop(src, tgt) {
      _pieceIsDragging = false;
      if (_cancelNextDrop) {
        _cancelNextDrop = false;
        _pPendingMove = null;
        clearPuzzleHighlights();
        _pSelectedSq = null;
        _pLegalTargets = [];
        return 'snapback';
      }
      _pDropHandledClick = true;
      setTimeout(() => { _pDropHandledClick = false; }, 50);
      clearPuzzleHighlights();
      if (tgt === 'offboard') return 'snapback';
      const g = puzzleState.game;
      const promo = _needsPromotion(g, src, tgt) ? 'q' : undefined;
      const mv = g.move({ from: src, to: tgt, promotion: promo });
      if (!mv) return 'snapback';
      g.undo();
      // Store move for puzzleOnSnapEnd — don't call board.position mid-drag to avoid double-piece
      _pPendingMove = { src, tgt, promo };
    }

    function puzzleOnSnapEnd() {
      _pieceIsDragging = false;
      if (_pPendingMove) {
        const { src, tgt, promo } = _pPendingMove;
        _pPendingMove = null;
        handlePuzzleMove(src, tgt, promo, true);
        return;
      }
      if (puzzleState.board && puzzleState.game) {
        puzzleState.board.position(puzzleState.game.fen(), false);
      }
    }

    function puzzleOnSquareClick(sq) {
      if (_pDropHandledClick) return;
      if (!puzzleIsUserTurn() || puzzleState.solved || !puzzleState.puzzle) return;
      const turn = puzzleState.game.turn();
      const uColor = puzzleState.userColor === 'white' ? 'w' : 'b';
      if (turn !== uColor) return;

      const piece = puzzleState.game.get(sq);
      if (_pSelectedSq && _pLegalTargets.includes(sq)) {
        const from = _pSelectedSq;
        _pSelectedSq = null;
        _pLegalTargets = [];
        clearPuzzleHighlights();
        const promo = _needsPromotion(puzzleState.game, from, sq) ? 'q' : undefined;
        handlePuzzleMove(from, sq, promo);
        return;
      }
      clearPuzzleHighlights();
      if (piece && ((turn === 'w' && piece.color === 'w') || (turn === 'b' && piece.color === 'b'))) {
        _pSelectedSq = sq;
        _pLegalTargets = puzzleState.game.moves({ square: sq, verbose: true }).map(m => m.to);
        $(`#puzzle-board [data-square="${sq}"]`).addClass('highlight-selected');
        _pLegalTargets.forEach(s => $(`#puzzle-board [data-square="${s}"]`).addClass('highlight-legal'));
      } else {
        _pSelectedSq = null;
        _pLegalTargets = [];
      }
    }

    function _needsPromotion(g, from, to) {
      const piece = g.get(from);
      return piece && piece.type === 'p' && (to[1] === '8' || to[1] === '1');
    }

    function clearPuzzleHighlights() {
      $('#puzzle-board [data-square]').removeClass('highlight-selected highlight-legal highlight-check');
    }

    function updatePuzzleCheckHighlight() {
      $('#puzzle-board [data-square]').removeClass('highlight-check');
      if (puzzleState.game && puzzleState.game.in_check()) {
        const turn = puzzleState.game.turn();
        const board = puzzleState.game.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === 'k' && piece.color === turn) {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;
              $(`#puzzle-board [data-square="${file}${rank}"]`).addClass('highlight-check');
            }
          }
        }
      }
    }

    // ── Core puzzle logic ──────────────────────────────────────────────────
    async function handlePuzzleMove(from, to, promo, fromDrag = false) {
      if (!puzzleState.puzzle || puzzleState.solved || puzzleState.validating) return;
      if (!puzzleIsUserTurn()) return;

      const correctUci = puzzleState.puzzle.solution[puzzleState.currentStep];
      const playedUci  = from + to + (promo || '');

      const g = puzzleState.game;
      const fenBeforeMove = g.fen();
      const mv = g.move({ from, to, promotion: promo });
      if (!mv) return;
      const moveSan = mv.san;

      if (playedUci === correctUci) {
        puzzleState.currentStep++;
        puzzleState.board.position(g.fen(), !fromDrag);
        updatePuzzleCheckHighlight();
        hideHintBox();

        if (puzzleState.currentStep >= puzzleState.puzzle.solution.length) {
          onPuzzleSolved();
        } else {
          setPuzzleTurnText('wait');
          setTimeout(() => playOpponentMove(), 600);
        }
      } else {
        // Undo the move, then ask Stockfish if it's an equally good alternative
        g.undo();
        puzzleState.validating = true;
        setPuzzleTurnText('wait', 'Checking your move…');

        let isEquivalent = false;
        try {
          const resp = await fetch('/api/puzzles/validate-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ fen: fenBeforeMove, playedUci }),
          });
          const data = await resp.json();
          if (data.highLatency) showTrafficNotice();
          isEquivalent = !!data.equivalent;
        } catch {}

        puzzleState.validating = false;

        if (isEquivalent) {
          // Accept the alternative — re-apply move and mark solved
          g.move({ from, to, promotion: promo });
          puzzleState.board.position(g.fen(), !fromDrag);
          updatePuzzleCheckHighlight();
          hideHintBox();
          onPuzzleSolved('Great find! That also wins!');
        } else {
          const isFirstWrong = puzzleState.wrongAttempts === 0;
          puzzleState.wrongAttempts++;
          puzzleState.usedHint = true;
          puzzleState.board.position(g.fen(), false);
          updatePuzzleCheckHighlight();
          shakePuzzleBoard();
          setPuzzleTurnText('wrong', 'Not the best move…');
          showPuzzleWhyButton(moveSan, fenBeforeMove);
          if (isFirstWrong && !puzzleState.attemptRecorded) {
            puzzleState.attemptRecorded = true;
            recordPuzzleAttempt(false, puzzleTimeSec());
          }
        }
      }
    }

    function playOpponentMove() {
      const oppUci = puzzleState.puzzle.solution[puzzleState.currentStep];
      if (!oppUci) { onPuzzleSolved(); return; }

      const from = oppUci.slice(0, 2);
      const to   = oppUci.slice(2, 4);
      const promo = oppUci.length === 5 ? oppUci[4] : undefined;
      puzzleState.game.move({ from, to, promotion: promo });
      puzzleState.board.position(puzzleState.game.fen(), true);
      updatePuzzleCheckHighlight();
      puzzleState.currentStep++;

      if (puzzleState.currentStep >= puzzleState.puzzle.solution.length) {
        onPuzzleSolved();
      } else {
        setPuzzleTurnText('user');
      }
    }

    function onPuzzleSolved(msg) {
      puzzleState.solved = true;
      flashCorrectBoard();
      setPuzzleTurnText('correct', msg || 'Excellent!');

      const timeSec = puzzleTimeSec();
      if (!puzzleState.attemptRecorded) {
        puzzleState.attemptRecorded = true;
        recordPuzzleAttempt(true, timeSec);
      } else {
        showPuzzleResult(true, null, null, puzzleState.stats.currentStreak, [], 0, puzzleState.stats.dailyStreak || 0, false);
      }
    }

    function showPuzzleWhyButton(moveSan, fen) {
      const wrap = document.getElementById('puzzle-why-wrap');
      const btn  = document.getElementById('btn-puzzle-why');
      if (!wrap || !btn) return;
      // Replace button to clear any previous listener
      const fresh = btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh, btn);
      fresh.addEventListener('click', () => {
        wrap.style.display = 'none';
        fetchPuzzleHint(moveSan, fen);
      });
      wrap.style.display = '';
    }

    async function fetchPuzzleHint(moveSan, fen) {
      const hintLoading = document.getElementById('puzzle-hint-loading');
      const hintBox = document.getElementById('puzzle-hint-box');
      if (hintBox) hintBox.style.display = 'none';
      if (hintLoading) hintLoading.style.display = '';

      try {
        const resp = await fetch('/api/puzzles/hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ fen, moveSan }),
        });

        if (resp.status === 401 || resp.status === 403 || resp.status === 429 || resp.status === 503) {
          const errData = await resp.json().catch(() => ({}));
          if (hintLoading) hintLoading.style.display = 'none';
          if (errData.error === 'email_unverified') {
            showEmailUnverifiedError('error-msg');
          } else if (errData.error === 'limit_reached') {
            showUpgradeModal(errData);
          } else if (errData.error === 'login_required') {
            showHintBox('Create a free account to get AI hints.');
          } else if (errData.error === 'global_limit') {
            showHintBox('Service temporarily unavailable. Please try again later.');
          } else {
            showHintBox('Too many requests. Please wait a moment and try again.');
          }
          return;
        }

        const data = await resp.json();
        if (data.highLatency) showTrafficNotice();
        if (hintLoading) hintLoading.style.display = 'none';
        if (data.answer) {
          showHintBox(data.answer);
        } else {
          showHintBox('That move doesn\'t improve your position. Look for a stronger continuation.');
        }
      } catch {
        if (hintLoading) hintLoading.style.display = 'none';
        showHintBox('That move doesn\'t improve your position. Look for a stronger continuation.');
      }
    }

    function renderPuzzleMarkdown(text) {
      let s = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      // Bold and italic
      s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      // Process lines: bullet lists and paragraphs
      const lines = s.split('\n');
      let html = '', inList = false;
      for (const raw of lines) {
        const line = raw.trim();
        if (/^[-•]\s+/.test(line)) {
          if (!inList) { html += '<ul>'; inList = true; }
          html += '<li>' + line.replace(/^[-•]\s+/, '') + '</li>';
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          if (line) html += '<p>' + line + '</p>';
        }
      }
      if (inList) html += '</ul>';
      return html;
    }

    let _lastHintText = '';

    function showHintBox(text) {
      const box = document.getElementById('puzzle-hint-box');
      const el  = document.getElementById('puzzle-hint-text');
      if (el) el.innerHTML = renderPuzzleMarkdown(text);
      if (box) box.style.display = '';
      _lastHintText = text;
    }

    function hideHintBox() {
      const box = document.getElementById('puzzle-hint-box');
      const loading = document.getElementById('puzzle-hint-loading');
      const whyWrap = document.getElementById('puzzle-why-wrap');
      if (box) box.style.display = 'none';
      if (loading) loading.style.display = 'none';
      if (whyWrap) whyWrap.style.display = 'none';
    }

    function retryPuzzle() {
      if (!puzzleState.puzzle) return;
      hideHintBox();
      // Reset game back to position after trigger move
      const g = new Chess(puzzleState.puzzle.fen);
      const trigger = puzzleState.puzzle.triggerMove;
      g.move({ from: trigger.slice(0, 2), to: trigger.slice(2, 4), promotion: trigger[4] });
      puzzleState.game = g;
      puzzleState.currentStep = 0;
      puzzleState.board.position(g.fen(), false);
      updatePuzzleCheckHighlight();
      setPuzzleTurnText('user');
    }

    async function recordPuzzleAttempt(solved, timeSec) {
      if (!authState.user) {
        // Guest: show result without elo tracking
        showPuzzleResult(solved, null, null, null, []);
        updatePuzzleStatsDisplay();
        return;
      }
      try {
        const resp = await fetch('/api/puzzles/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            puzzleId: puzzleState.puzzle.id,
            solved,
            timeTaken: timeSec || puzzleTimeSec(),
            usedHint: puzzleState.usedHint,
            wrongAttempts: puzzleState.wrongAttempts,
          }),
        });
        const data = await resp.json();
        if (resp.ok) {
          puzzleState.stats = {
            puzzleElo:        data.newElo,
            puzzlesSolved:    data.puzzlesSolved,
            currentStreak:    data.streak,
            puzzlesAttempted: data.puzzlesAttempted ?? (puzzleState.stats.puzzlesAttempted || 0) + 1,
            dailyStreak:      data.dailyStreak || puzzleState.stats.dailyStreak || 0,
            dailyStreakBest:  data.dailyStreakBest || puzzleState.stats.dailyStreakBest || 0,
          };
          updatePuzzleStatsDisplay();
          showPuzzleResult(solved, data.eloChange, data.newElo, data.streak, data.achievements || [], data.dailyStreak || 0, data.isFirstToday || false);
          if (data.achievements && data.achievements.length > 0) {
            data.achievements.forEach((ach, i) => showAchievementPopup(ach, i * 800 + 600));
          }
        } else {
          showPuzzleResult(solved, null, null, null, [], 0, 0, false);
        }
      } catch {
        showPuzzleResult(solved, null, null, null, [], 0, 0, false);
      }
    }

    function showPuzzleResult(solved, eloChange, newElo, streak, achievements, dailyStreak, isFirstToday) {
      const panel  = document.getElementById('puzzle-result-panel');
      const icon   = document.getElementById('puzzle-result-icon');
      const title  = document.getElementById('puzzle-result-title');
      const eloCh  = document.getElementById('puzzle-elo-change');
      if (!panel) return;

      icon.innerHTML = solved
        ? `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`
        : `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
      title.className = 'puzzle-result-title ' + (solved ? 'result-correct' : 'result-wrong');
      title.textContent = solved ? 'Brilliant!' : 'Keep trying!';

      let eloHtml = '';
      if (eloChange !== null && newElo !== null) {
        const sign = eloChange >= 0 ? '+' : '';
        const cls  = eloChange >= 0 ? 'elo-gain' : 'elo-loss';
        eloHtml += `Rating: <strong>${newElo}</strong> (<span class="${cls}">${sign}${eloChange}</span>)`;
      } else if (authState.user && puzzleState.stats.puzzleElo === null) {
        eloHtml += `${puzzleState.stats.puzzlesAttempted || '?'}/10 puzzles to establish rating`;
      } else if (!authState.user) {
        eloHtml += solved ? 'Sign in to track your rating' : '';
      }
      eloCh.innerHTML = eloHtml;

      // Reveal themes now that the puzzle is over
      const themesRow = document.getElementById('puzzle-themes-row');
      if (themesRow && puzzleState.puzzle && puzzleState.puzzle.themes) {
        themesRow.innerHTML = puzzleState.puzzle.themes.map(t =>
          `<span class="puzzle-theme-tag">${escapeHtml(t.replace(/([A-Z])/g, ' $1').trim())}</span>`
        ).join('');
      }

      hideHintBox();
      panel.style.display = '';
      // Start expanded; enable swipe-down / tap-outside dismissal (mobile only).
      expandPuzzleSheet();
      attachPuzzleSheetDismiss();

      // Show ask input only on failure
      const askWrap = document.getElementById('puzzle-ask-wrap');
      if (askWrap) {
        if (!solved) {
          askWrap.style.display = '';
          const askInput = document.getElementById('puzzle-ask-input');
          const askResponse = document.getElementById('puzzle-ask-response');
          if (askInput) { askInput.value = ''; askInput.disabled = false; }
          if (askResponse) askResponse.innerHTML = '';
          const askBtn = document.getElementById('btn-puzzle-ask');
          if (askBtn) askBtn.disabled = false;
        } else {
          askWrap.style.display = 'none';
        }
      }

      if (solved) localStorage.removeItem('chess_current_puzzle');
    }

    async function askPuzzleQuestion() {
      const input = document.getElementById('puzzle-ask-input');
      const question = input?.value.trim();
      if (!question) return;

      const sendBtn = document.getElementById('btn-puzzle-ask');
      const responseEl = document.getElementById('puzzle-ask-response');
      if (!responseEl) return;
      if (question.length > AI_MSG_MAX_LEN.ask) {
        responseEl.textContent = 'Message too long';
        return;
      }

      input.value = '';
      input.disabled = true;
      if (sendBtn) sendBtn.disabled = true;
      responseEl.innerHTML = '<span class="qa-status">Thinking…</span>';

      const fen = puzzleState.game ? puzzleState.game.fen() : (puzzleState.puzzle?.fen || '');
      const themes = puzzleState.puzzle?.themes || [];
      const existingAnalysis = themes.length
        ? 'Puzzle themes: ' + themes.map(t => t.replace(/([A-Z])/g, ' $1').trim()).join(', ')
        : null;

      try {
        const response = await fetch('/api/ask/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            fen,
            question,
            skillLevel: state.skillLevel,
            lastMoveSan: null,
            existingAnalysis,
            uciMoves: [],
            history: [],
          }),
        });

        if (response.status === 403 || response.status === 429 || response.status === 503) {
          const errData = await response.json().catch(() => ({}));
          responseEl.innerHTML = '';
          if (errData.error === 'email_unverified') {
            showEmailUnverifiedError('error-msg');
          } else if (errData.error === 'limit_reached') {
            showUpgradeModal(errData);
          } else if (errData.error === 'global_limit') {
            responseEl.textContent = 'Service temporarily unavailable. Please try again later.';
          } else {
            responseEl.textContent = 'Too many requests. Please wait a moment and try again.';
          }
          input.disabled = false;
          if (sendBtn) sendBtn.disabled = false;
          return;
        }

        if (!response.ok) {
          responseEl.textContent = 'Could not get an answer. Try again.';
          input.disabled = false;
          if (sendBtn) sendBtn.disabled = false;
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        let accumulated = '';
        let streaming = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            let evt;
            try { evt = JSON.parse(line.slice(6)); } catch { continue; }
            if (evt.type === 'latency') {
              showTrafficNotice();
            } else if (evt.type === 'chunk') {
              if (!streaming) {
                streaming = true;
                responseEl.innerHTML = '';
              }
              accumulated += evt.text;
              responseEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(accumulated)));
            } else if (evt.type === 'done' && evt.answer) {
              responseEl.innerHTML = DOMPurify.sanitize(marked.parse(preventMarkdownMoveList(evt.answer)));
            } else if (evt.type === 'error') {
              responseEl.textContent = evt.message || 'Could not get an answer. Try again.';
            }
          }
        }

        if (!streaming) responseEl.innerHTML = '';
      } catch (err) {
        responseEl.textContent = 'Could not get an answer. Try again.';
        console.error('askPuzzleQuestion failed:', err);
      } finally {
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
      }
    }

    function updatePuzzleStatsDisplay() {
      const s = puzzleState.stats;
      const eloEl    = document.getElementById('puzzle-elo-val');
      const streakEl = document.getElementById('puzzle-streak-val');
      const solvedEl = document.getElementById('puzzle-solved-val');

      const streak = s.currentStreak || 0;
      if (eloEl) eloEl.textContent = s.puzzleElo !== null ? s.puzzleElo : '?';
      if (streakEl) streakEl.textContent = streak;
      if (solvedEl) solvedEl.textContent = s.puzzlesSolved || 0;

      const accuracyEl = document.getElementById('puzzle-accuracy-val');
      if (accuracyEl) {
        const attempted = s.puzzlesAttempted || 0;
        accuracyEl.textContent = attempted > 0
          ? Math.round(((s.puzzlesSolved || 0) / attempted) * 100) + '%'
          : '—';
      }
    }

    function setPuzzleTurnText(state, msg) {
      const dot  = document.getElementById('puzzle-turn-dot');
      const text = document.getElementById('puzzle-turn-text');
      if (!dot || !text) return;
      dot.className = 'puzzle-turn-dot';
      if (state === 'user') {
        const col = puzzleState.userColor;
        dot.classList.add(col === 'white' ? 'dot-white' : 'dot-black');
        text.textContent = msg || `Your turn (${col})`;
      } else if (state === 'correct') {
        dot.classList.add('dot-correct');
        text.textContent = msg || 'Correct!';
      } else if (state === 'wrong') {
        dot.classList.add('dot-wrong');
        text.textContent = msg || 'Incorrect!';
      } else if (state === 'wait') {
        dot.classList.add('dot-wait');
        text.textContent = msg || 'Opponent is thinking…';
      } else {
        text.textContent = msg || 'Find the best move!';
      }
    }

    function shakePuzzleBoard() {
      const wrap = document.querySelector('.puzzle-board-wrap');
      if (!wrap) return;
      wrap.classList.remove('shake');
      void wrap.offsetWidth;
      wrap.classList.add('shake');
      setTimeout(() => wrap.classList.remove('shake'), 450);
    }

    function flashCorrectBoard() {
      const wrap = document.querySelector('.puzzle-board-wrap');
      if (!wrap) return;
      wrap.classList.remove('flash-correct');
      void wrap.offsetWidth;
      wrap.classList.add('flash-correct');
      setTimeout(() => wrap.classList.remove('flash-correct'), 1700);
      spawnPuzzleParticles(wrap);
    }

    function spawnPuzzleParticles(wrap) {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = Math.min(rect.width, rect.height) * 0.58;
      const colors = ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#34d399', '#a3e635'];
      const count = 24;

      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'puzzle-particle';

        const angle = (i / count) * 360 + (Math.random() - 0.5) * (360 / count * 0.9);
        const dist = maxR * (0.35 + Math.random() * 0.75);
        const size = 5 + Math.random() * 9;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isCircle = Math.random() > 0.35;
        const dur = 680 + Math.random() * 480;
        const delay = Math.random() * 90;
        const rad = angle * Math.PI / 180;

        el.style.cssText =
          `left:${cx}px;top:${cy}px;` +
          `width:${size}px;height:${size}px;` +
          `background:${color};` +
          `border-radius:${isCircle ? '50%' : '3px'};` +
          `--tx:${(Math.cos(rad) * dist).toFixed(1)}px;` +
          `--ty:${(Math.sin(rad) * dist).toFixed(1)}px;` +
          `--dur:${dur}ms;--delay:${delay}ms;`;

        document.body.appendChild(el);
        setTimeout(() => el.remove(), dur + delay + 60);
      }
    }

    // ── Mobile result sheet: swipe-down / tap-outside collapses it to a slim
    //    bottom bar that keeps the "Next Puzzle" button reachable ────────────
    function puzzleSheetIsMobile() {
      return window.matchMedia('(max-width: 680px)').matches;
    }

    function expandPuzzleSheet() {
      const panel = document.getElementById('puzzle-result-panel');
      if (!panel) return;
      panel.classList.remove('sheet-collapsed');
      panel.style.transform = '';
      panel.style.transition = '';
    }

    function collapsePuzzleSheet() {
      const panel = document.getElementById('puzzle-result-panel');
      if (!panel) return;
      panel.style.transform = '';
      panel.style.transition = '';
      panel.classList.add('sheet-collapsed');
      detachPuzzleSheetDismiss();
    }

    function _onSheetTouchStart(e) {
      const panel = document.getElementById('puzzle-result-panel');
      if (!panel || e.touches.length !== 1 || panel.scrollTop > 0) { _sheetTouch = null; return; }
      _sheetTouch = { y0: e.touches[0].clientY, dy: 0 };
    }
    function _onSheetTouchMove(e) {
      if (!_sheetTouch) return;
      const dy = e.touches[0].clientY - _sheetTouch.y0;
      if (dy <= 0) { _sheetTouch.dy = 0; return; }
      _sheetTouch.dy = dy;
      const panel = document.getElementById('puzzle-result-panel');
      panel.style.transition = 'none';
      panel.style.transform = `translateY(${dy}px)`;
      e.preventDefault(); // keep the page from scrolling while dragging the sheet
    }
    function _onSheetTouchEnd() {
      if (!_sheetTouch) return;
      const dy = _sheetTouch.dy;
      _sheetTouch = null;
      const panel = document.getElementById('puzzle-result-panel');
      if (!panel) return;
      panel.style.transition = '';
      if (dy > 70) collapsePuzzleSheet();
      else panel.style.transform = '';
    }

    function attachPuzzleSheetDismiss() {
      detachPuzzleSheetDismiss();
      if (!puzzleSheetIsMobile()) return;
      const panel = document.getElementById('puzzle-result-panel');
      if (!panel) return;

      _sheetOutsideHandler = (e) => {
        if (panel.classList.contains('sheet-collapsed')) return;
        if (!panel.contains(e.target)) collapsePuzzleSheet();
      };
      // Defer so the move/tap that solved the puzzle doesn't instantly close it.
      setTimeout(() => {
        if (_sheetOutsideHandler) document.addEventListener('pointerdown', _sheetOutsideHandler, true);
      }, 0);

      panel.addEventListener('touchstart', _onSheetTouchStart, { passive: true });
      panel.addEventListener('touchmove', _onSheetTouchMove, { passive: false });
      panel.addEventListener('touchend', _onSheetTouchEnd);
    }

    function detachPuzzleSheetDismiss() {
      const panel = document.getElementById('puzzle-result-panel');
      if (_sheetOutsideHandler) {
        document.removeEventListener('pointerdown', _sheetOutsideHandler, true);
        _sheetOutsideHandler = null;
      }
      if (panel) {
        panel.removeEventListener('touchstart', _onSheetTouchStart);
        panel.removeEventListener('touchmove', _onSheetTouchMove);
        panel.removeEventListener('touchend', _onSheetTouchEnd);
      }
      _sheetTouch = null;
    }

    // ── Load next puzzle ────────────────────────────────────────────────────
    async function loadNextPuzzle() {
      if (puzzleState.loadingNext) return;
      puzzleState.loadingNext = true;

      const loading = document.getElementById('puzzle-loading');
      const result  = document.getElementById('puzzle-result-panel');

      if (loading) loading.style.display = '';
      if (result) result.style.display = 'none';
      expandPuzzleSheet();
      detachPuzzleSheetDismiss();
      hideHintBox();

      // Restore persisted puzzle if available
      try {
        const saved = localStorage.getItem('chess_current_puzzle');
        if (saved) {
          const savedData = JSON.parse(saved);
          if (savedData && savedData.id) {
            puzzleState.loadingNext = false;
            setupPuzzle(savedData);
            return;
          }
        }
      } catch {}

      try {
        const resp = await fetch('/api/puzzles/next', { credentials: 'same-origin' });
        const data = await resp.json();

        if (!resp.ok || !data.id) {
          if (loading) loading.style.display = 'none';
          setPuzzleTurnText('default', data.error || 'Could not load puzzle. Try again.');
          puzzleState.loadingNext = false;
          return;
        }

        setupPuzzle(data);
      } catch (err) {
        if (loading) loading.style.display = 'none';
        setPuzzleTurnText('default', 'Network error. Please try again.');
      } finally {
        puzzleState.loadingNext = false;
      }
    }

    function setupPuzzle(data) {
      const loading = document.getElementById('puzzle-loading');
      if (loading) loading.style.display = 'none';

      // Determine user color: opposite of who plays the trigger move
      const fenSide = data.fen.split(' ')[1]; // 'w' or 'b'
      const userColor = fenSide === 'w' ? 'black' : 'white';

      // Build game state: start at FEN, apply trigger move
      const g = new Chess(data.fen);
      const trigger = data.triggerMove;
      const trigMv = g.move({ from: trigger.slice(0, 2), to: trigger.slice(2, 4), promotion: trigger[4] || undefined });
      if (!trigMv) {
        setPuzzleTurnText('default', 'Invalid puzzle. Loading next…');
        setTimeout(loadNextPuzzle, 1000);
        return;
      }

      puzzleState.puzzle       = data;
      puzzleState.game         = g;
      puzzleState.userColor    = userColor;
      puzzleState.currentStep  = 0;
      puzzleState.solved       = false;
      puzzleState.validating   = false;
      puzzleState.usedHint        = false;
      puzzleState.wrongAttempts   = 0;
      puzzleState.attemptRecorded = false;
      puzzleState.startTime       = Date.now();

      // Orient board
      puzzleState.board.orientation(userColor);
      puzzleState.board.position(g.fen(), false);
      updatePuzzleCheckHighlight();

      // Store themes for reveal after solving — don't show them upfront (spoiler)
      const themesRow = document.getElementById('puzzle-themes-row');
      if (themesRow) themesRow.innerHTML = '';

      setPuzzleTurnText('user');
      const rPanel = document.getElementById('puzzle-result-panel');
      if (rPanel) rPanel.style.display = 'none';
      const askWrap = document.getElementById('puzzle-ask-wrap');
      if (askWrap) askWrap.style.display = 'none';
      hideHintBox();

      localStorage.setItem('chess_current_puzzle', JSON.stringify(data));
    }

    // ── Load stats on init ─────────────────────────────────────────────────
    async function loadPuzzleStats() {
      try {
        const resp = await fetch('/api/puzzles/stats', { credentials: 'same-origin' });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.guest) return;
        puzzleState.stats = {
          puzzleElo:        data.puzzleElo,
          puzzlesSolved:    data.puzzlesSolved,
          currentStreak:    data.currentStreak,
          puzzlesAttempted: data.puzzlesAttempted,
          dailyStreak:      data.dailyStreak || 0,
          dailyStreakBest:  data.dailyStreakBest || 0,
        };
        // Update drawer gamification
        const drawerStreakBadge = document.getElementById('drawer-streak-badge');
        const drawerStreakVal   = document.getElementById('drawer-streak-val');
        if (data.dailyStreak > 0 && drawerStreakBadge) {
          drawerStreakBadge.style.display = '';
          if (drawerStreakVal) drawerStreakVal.textContent = data.dailyStreak;
        }
        updatePuzzleStatsDisplay();
      } catch {}
    }

    loadPuzzleStats();

  })(); // end initTrainPage

  // Expose initPuzzleBoard for switchToPage
  function initPuzzleBoard() {
    if (window._initPuzzleBoard) window._initPuzzleBoard();
  }

  // ---------------------------------------------------------------------------
  // Avatar upload (Settings > Profile)
  // ---------------------------------------------------------------------------
  (function initAvatarUpload() {
    const fileInput = document.getElementById('avatar-file-input');
    const removeBtn = document.getElementById('btn-remove-avatar');
    const statusEl  = document.getElementById('avatar-upload-status');

    function renderAvatar(avatarUrl, username) {
      const preview = document.getElementById('account-avatar-preview');
      const profileAvatarEl = document.getElementById('profile-avatar');
      const headerAvatarEl = document.getElementById('header-avatar');
      const targets = [preview, profileAvatarEl, headerAvatarEl].filter(Boolean);
      targets.forEach(el => {
        if (avatarUrl) {
          const img = document.createElement('img');
          img.src = avatarUrl;
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          el.replaceChildren(img);
        } else {
          const span = document.createElement('span');
          span.textContent = (username || '?')[0].toUpperCase();
          el.replaceChildren(span);
        }
      });
      if (removeBtn) removeBtn.style.display = avatarUrl ? '' : 'none';
      if (authState.user) authState.user.avatarUrl = avatarUrl || null;
    }

    function showStatus(msg, isError) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'account-avatar-status' + (isError ? ' account-avatar-status--error' : ' account-avatar-status--ok');
      statusEl.style.display = '';
      clearTimeout(statusEl._hideTimer);
      statusEl._hideTimer = setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
    }

    // Decodes with createImageBitmap (memory-efficient, no DOM img element needed),
    // then renders to OffscreenCanvas and tries decreasing quality levels until
    // the result fits within maxBytes. Throws on decode failure so callers can
    // surface a clear error rather than silently uploading the raw file.
    async function compressToBlob(file, maxDim, maxBytes) {
      let bitmap;
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        throw new Error('Could not decode image. Please try a different file.');
      }
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const w = Math.round(bitmap.width * scale) || 1;
      const h = Math.round(bitmap.height * scale) || 1;
      const canvas = new OffscreenCanvas(w, h);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      for (const q of [0.85, 0.72, 0.58, 0.42]) {
        const blob = await canvas.convertToBlob({ type: 'image/webp', quality: q });
        if (blob && blob.size <= maxBytes) return blob;
      }
      throw new Error('Image is too large to compress. Please try a smaller image.');
    }

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        fileInput.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          showStatus('Please select an image file.', true);
          return;
        }
        if (file.size > 30 * 1024 * 1024) {
          showStatus('Image must be under 30 MB.', true);
          return;
        }

        // Compress to 512×512 WebP, max 4 MB, before uploading
        let blob;
        try {
          blob = await compressToBlob(file, 512, 4 * 1024 * 1024);
        } catch (err) {
          showStatus(err.message, true);
          return;
        }

        // Immediate local preview from compressed blob
        const previewUrl = URL.createObjectURL(blob);
        [
          document.getElementById('account-avatar-preview'),
          document.getElementById('profile-avatar'),
        ].filter(Boolean).forEach(el => {
          const img = document.createElement('img');
          img.src = previewUrl;
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          el.replaceChildren(img);
        });
        if (removeBtn) removeBtn.style.display = '';

        // Disable label while uploading
        const uploadLabel = document.querySelector('label[for="avatar-file-input"]');
        if (uploadLabel) uploadLabel.classList.add('account-avatar-btn--loading');

        try {
          const form = new FormData();
          form.append('avatar', blob, 'avatar.webp');
          const resp = await fetch('/api/user/avatar', {
            method: 'POST',
            credentials: 'same-origin',
            body: form,
          });
          const data = await resp.json();
          URL.revokeObjectURL(previewUrl);
          if (resp.ok) {
            renderAvatar(data.avatarUrl, authState.user?.username);
            showStatus('Profile picture updated.', false);
          } else {
            showStatus(data.error || 'Upload failed.', true);
            renderAvatar(authState.user?.avatarUrl, authState.user?.username);
          }
        } catch {
          URL.revokeObjectURL(previewUrl);
          showStatus('Upload failed. Please try again.', true);
          renderAvatar(authState.user?.avatarUrl, authState.user?.username);
        } finally {
          if (uploadLabel) uploadLabel.classList.remove('account-avatar-btn--loading');
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', async () => {
        try {
          const resp = await fetch('/api/user/avatar', {
            method: 'DELETE',
            credentials: 'same-origin',
          });
          if (resp.ok) {
            renderAvatar(null, authState.user?.username);
            showStatus('Profile picture removed.', false);
          } else {
            const data = await resp.json();
            showStatus(data.error || 'Failed to remove.', true);
          }
        } catch {
          showStatus('Failed to remove. Please try again.', true);
        }
      });
    }
  })();

  // ---------------------------------------------------------------------------
  // Profile page
  // ---------------------------------------------------------------------------

  const ACHIEV_INITIAL_VISIBLE = 8;

  function setupAchievExpand(grid, toggleBtn) {
    const cards = grid.querySelectorAll('.profile-achiev-card');
    if (cards.length <= ACHIEV_INITIAL_VISIBLE) {
      if (toggleBtn) toggleBtn.style.display = 'none';
      return;
    }
    const extra = cards.length - ACHIEV_INITIAL_VISIBLE;
    for (let i = ACHIEV_INITIAL_VISIBLE; i < cards.length; i++) {
      cards[i].classList.add('achiev-hidden');
    }
    if (!toggleBtn) return;
    toggleBtn.textContent = `Show ${extra} more`;
    toggleBtn.dataset.expanded = 'false';
    toggleBtn.style.display = '';
    toggleBtn.onclick = () => {
      const expanding = toggleBtn.dataset.expanded !== 'true';
      for (let i = ACHIEV_INITIAL_VISIBLE; i < cards.length; i++) {
        cards[i].classList.toggle('achiev-hidden', !expanding);
      }
      toggleBtn.dataset.expanded = expanding ? 'true' : 'false';
      toggleBtn.textContent = expanding ? 'Show less' : `Show ${extra} more`;
    };
  }

  (function initProfilePage() {

    document.getElementById('btn-profile-back')?.addEventListener('click', () => {
      if (_profileTarget) {
        _profileTarget = null;
        window._loadProfilePage?.();
      } else {
        switchToPage(_prevPage || 'analysis');
      }
    });

    document.getElementById('btn-profile-signup')?.addEventListener('click', () => {
      switchToPage('analysis');
      setTimeout(() => document.getElementById('btn-signup')?.click(), 100);
    });

    async function loadProfilePage() {
      const guestMsg = document.getElementById('profile-guest-msg');
      const statsSection = document.getElementById('profile-stats-section');
      const achievSection = document.getElementById('profile-achievements-section');
      const histSection = document.getElementById('profile-history-section');
      const header = document.querySelector('.profile-header-section');

      if (!authState.user) {
        if (guestMsg) guestMsg.style.display = '';
        if (statsSection) statsSection.style.display = 'none';
        if (achievSection) achievSection.style.display = 'none';
        if (histSection) histSection.style.display = 'none';
        ['profile-graph-section', 'profile-milestones-section'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        if (header) header.style.display = 'none';
        return;
      }

      if (guestMsg) guestMsg.style.display = 'none';
      if (statsSection) statsSection.style.display = '';
      if (achievSection) achievSection.style.display = '';
      if (histSection) histSection.style.display = '';
      if (header) header.style.display = '';

      // Set basic user info
      const avatarEl = document.getElementById('profile-avatar');
      const usernameEl = document.getElementById('profile-username-display');
      const planEl = document.getElementById('profile-plan-badge-display');
      const joinedEl = document.getElementById('profile-joined-display');

      if (avatarEl) {
        if (authState.user.avatarUrl) {
          const img = document.createElement('img');
          img.src = authState.user.avatarUrl;
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          avatarEl.replaceChildren(img);
        } else {
          const span = document.createElement('span');
          span.textContent = (authState.user.username || '?')[0].toUpperCase();
          avatarEl.replaceChildren(span);
        }
      }
      if (usernameEl) usernameEl.textContent = authState.user.username || '';
      if (planEl) {
        const isPaid = authState.user.plan === 'pro' || authState.user.plan === 'premium';
        planEl.textContent = authState.user.plan === 'pro' ? 'Pro' : authState.user.plan === 'premium' ? 'Premium' : '';
        planEl.className = 'profile-plan-badge' + (isPaid ? ' badge-premium' : '');
        planEl.style.display = isPaid ? '' : 'none';
      }

      try {
        const resp = await fetch('/api/puzzles/profile', { credentials: 'same-origin' });
        if (!resp.ok) return;
        const data = await resp.json();

        // Sync fresh avatarUrl from profile API
        if (avatarEl && data.user.avatarUrl != null) {
          if (data.user.avatarUrl) {
            const img = document.createElement('img');
            img.src = data.user.avatarUrl;
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            avatarEl.replaceChildren(img);
          } else {
            const span = document.createElement('span');
            span.textContent = (authState.user.username || '?')[0].toUpperCase();
            avatarEl.replaceChildren(span);
          }
        }

        if (joinedEl && data.user.createdAt) {
          const d = new Date(data.user.createdAt * 1000);
          joinedEl.textContent = 'Member since ' + d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        // Stats
        const s = data.stats;
        const accuracy = s.puzzlesAttempted > 0
          ? Math.round((s.puzzlesSolved / s.puzzlesAttempted) * 100) + '%'
          : '—';
        document.getElementById('profile-stat-elo').textContent = s.puzzleElo !== null ? s.puzzleElo : '?';
        document.getElementById('profile-stat-solved').textContent = s.puzzlesSolved;
        document.getElementById('profile-stat-best-streak').textContent = s.dailyStreakBest || 0;
        document.getElementById('profile-stat-daily-streak').textContent = s.dailyStreak || 0;
        document.getElementById('profile-stat-accuracy').textContent = accuracy;

        // Rating graph
        const graphSection = document.getElementById('profile-graph-section');
        if (graphSection) {
          graphSection.style.display = '';
          loadRatingGraph(data.user.createdAt);
        }

        // Milestones
        const msSection = document.getElementById('profile-milestones-section');
        if (msSection) {
          msSection.style.display = '';
          renderMilestones(s);
        }

        // Leaderboard
        loadLeaderboard('rating');

        // Achievements
        const earnedIds = new Set(data.achievements.map(a => a.id));
        const grid = document.getElementById('profile-achievements-grid');
        const countEl = document.getElementById('profile-achiev-count');
        if (countEl) countEl.textContent = `${data.achievements.length}/${data.allAchievements.length}`;
        if (grid) {
          grid.innerHTML = data.allAchievements.map(a => {
            const earned = earnedIds.has(a.id);
            return `<div class="profile-achiev-card ${earned ? 'earned rarity-' + escapeHtml(a.rarity || 'common') : 'locked'}" title="${escapeHtml(a.desc || '')}">
              <div class="profile-achiev-icon">${renderAchievIcon(a.icon || '')}</div>
              <div>
                <div class="profile-achiev-name">${escapeHtml(a.name || '')}</div>
                <div class="profile-achiev-desc">${escapeHtml(a.desc || '')}</div>
              </div>
            </div>`;
          }).join('');
          setupAchievExpand(grid, document.getElementById('btn-achievements-toggle'));
        }

        // Recent history
        renderRecentHistory(data.recentAttempts, true);
      } catch (err) {
        console.error('[profile]', err);
      }
    }

    // Renders the recent-attempts list. `isSelf` controls the empty-state copy.
    function renderRecentHistory(attempts, isSelf) {
      const histEl = document.getElementById('profile-history');
      if (!histEl) return;
      attempts = attempts || [];
      if (attempts.length === 0) {
        histEl.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem">${
          isSelf ? 'No puzzles solved yet. Start training!' : 'No puzzles solved yet.'
        }</p>`;
        return;
      }
      const shown = attempts.slice(0, 5);
      const remaining = attempts.length - shown.length;
      histEl.innerHTML = shown.map(a => {
        const change = Math.round(a.eloAfter - a.eloBefore);
        const sign = change >= 0 ? '+' : '';
        const changeCls = change >= 0 ? 'gain' : 'loss';
        const themes = a.themes.map(t => `<span class="profile-history-tag">${escapeHtml(t)}</span>`).join('');
        const timeStr = a.timeTaken ? `${a.timeTaken}s` : '';
        return `<div class="profile-history-item">
          <div class="profile-history-icon ${a.solved ? 'phi-correct' : 'phi-wrong'}">${a.solved
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
          }</div>
          <div style="flex:1;min-width:0">
            <div class="profile-history-themes">${themes}</div>
          </div>
          <div class="profile-history-rating">Puzzle ${a.puzzleRating || '?'}</div>
          <div class="profile-history-time">${timeStr}</div>
          <div class="profile-history-elo-change ${changeCls}">${sign}${change}</div>
        </div>`;
      }).join('') + (remaining > 0 ? `
        <div class="profile-history-more">
          <div class="profile-history-more-dots">
            <span class="phm-dot phm-dot-1"></span>
            <span class="phm-dot phm-dot-2"></span>
            <span class="phm-dot phm-dot-3"></span>
          </div>
          <div class="profile-history-more-label">+${remaining} more</div>
        </div>` : '');
    }

    // ── Rating graph ──────────────────────────────────────────────────────────
    async function loadRatingGraph(createdAt, providedHistory) {
      const canvas   = document.getElementById('rating-graph-canvas');
      const emptyEl  = document.getElementById('rating-graph-empty');
      if (!canvas) return;
      try {
        let history = providedHistory;
        if (!history) {
          const resp = await fetch('/api/puzzles/history', { credentials: 'same-origin' });
          if (!resp.ok) return;
          ({ history } = await resp.json());
        }
        if (!history || history.length < 5) {
          canvas.style.display = 'none';
          if (emptyEl) {
            if (providedHistory) {
              emptyEl.textContent = 'Not enough rating history yet.';
            } else {
              const isNewAccount = createdAt && (Date.now() / 1000 - createdAt) < 2 * 24 * 3600;
              emptyEl.textContent = isNewAccount
                ? 'Your account is new. Solve some puzzles to start building your rating history.'
                : 'Solve at least 5 puzzles to see your rating history.';
            }
            emptyEl.style.display = '';
          }
          return;
        }
        if (emptyEl) emptyEl.style.display = 'none';
        canvas.style.display = '';
        renderRatingGraph(canvas, history);
      } catch {}
    }

    function renderRatingGraph(canvas, history) {
      const dpr  = window.devicePixelRatio || 1;
      const W    = canvas.offsetWidth  || 400;
      const H    = canvas.offsetHeight || 180;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const ctx  = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const elos  = history.map(p => p.elo);
      const minE  = Math.min(...elos) - 30;
      const maxE  = Math.max(...elos) + 30;
      const pad   = { top: 20, right: 16, bottom: 32, left: 52 };
      const gw    = W - pad.left - pad.right;
      const gh    = H - pad.top  - pad.bottom;

      function xFor(i)   { return pad.left + (i / (history.length - 1)) * gw; }
      function yFor(elo) { return pad.top  + (1 - (elo - minE) / (maxE - minE)) * gh; }

      const isDark   = document.documentElement.dataset.theme !== 'light';
      const gridClr  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      const textClr  = isDark ? '#6b7585'               : '#8a96a8';
      const lineClr  = '#10b981';
      const dotSolve = '#10b981';
      const dotFail  = '#ef4444';

      // Grid lines + Y labels
      const steps = 4;
      ctx.font      = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = textClr;
      for (let i = 0; i <= steps; i++) {
        const elo = minE + (maxE - minE) * (i / steps);
        const y   = yFor(elo);
        ctx.strokeStyle = gridClr;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
        ctx.fillText(Math.round(elo), pad.left - 6, y + 4);
      }

      // X labels (first / middle / last dates)
      ctx.textAlign = 'center';
      const labelIdxs = [0, Math.floor((history.length - 1) / 2), history.length - 1];
      labelIdxs.forEach(i => {
        const d = new Date(history[i].ts * 1000);
        const lbl = (d.getMonth() + 1) + '/' + d.getDate();
        ctx.fillText(lbl, xFor(i), H - pad.bottom + 16);
      });

      // Line
      ctx.beginPath();
      ctx.strokeStyle = lineClr;
      ctx.lineWidth   = 2;
      ctx.lineJoin    = 'round';
      history.forEach((p, i) => {
        if (i === 0) ctx.moveTo(xFor(i), yFor(p.elo));
        else         ctx.lineTo(xFor(i), yFor(p.elo));
      });
      ctx.stroke();

      // Gradient fill under line
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gh);
      grad.addColorStop(0,   'rgba(16,185,129,0.18)');
      grad.addColorStop(1,   'rgba(16,185,129,0)');
      ctx.beginPath();
      history.forEach((p, i) => {
        if (i === 0) ctx.moveTo(xFor(i), yFor(p.elo));
        else         ctx.lineTo(xFor(i), yFor(p.elo));
      });
      ctx.lineTo(xFor(history.length - 1), pad.top + gh);
      ctx.lineTo(xFor(0), pad.top + gh);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Dots (only show if not too many points)
      if (history.length <= 40) {
        history.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(xFor(i), yFor(p.elo), 3, 0, Math.PI * 2);
          ctx.fillStyle = p.solved ? dotSolve : dotFail;
          ctx.fill();
        });
      }
    }

    // ── Milestones ────────────────────────────────────────────────────────────
    function renderMilestones(stats) {
      const el = document.getElementById('profile-milestones');
      if (!el) return;
      const elo     = stats.puzzleElo   || 0;
      const solved  = stats.puzzlesSolved || 0;
      const dStreak = stats.dailyStreakBest || 0;

      const items = [
        { label: 'Rating 1000',  value: elo,     target: 1000,  unit: 'rating',  icon: renderAchievIcon('arrow-up') },
        { label: 'Rating 1200',  value: elo,     target: 1200,  unit: 'rating',  icon: renderAchievIcon('chevrons-up') },
        { label: 'Rating 1500',  value: elo,     target: 1500,  unit: 'rating',  icon: renderAchievIcon('gem') },
        { label: '10 puzzles',   value: solved,  target: 10,    unit: 'solved',  icon: renderAchievIcon('target') },
        { label: '50 puzzles',   value: solved,  target: 50,    unit: 'solved',  icon: PIECE_SVGS.knight },
        { label: '100 puzzles',  value: solved,  target: 100,   unit: 'solved',  icon: PIECE_SVGS.rook },
        { label: '7-day streak', value: dStreak, target: 7,     unit: 'days',    icon: renderAchievIcon('flame') },
        { label: '30-day streak',value: dStreak, target: 30,    unit: 'days',    icon: renderAchievIcon('flame') },
      ];

      // Show the next 3 incomplete milestones
      const pending = items.filter(m => m.value < m.target);
      const shown   = pending.slice(0, 3);

      if (shown.length === 0) {
        el.innerHTML = '<p class="milestone-all-done">All milestones complete. You\'re on fire!</p>';
        return;
      }

      el.innerHTML = shown.map(m => {
        const pct = Math.min(100, Math.round((m.value / m.target) * 100));
        return `<div class="milestone-item">
          <div class="milestone-header">
            <span class="milestone-icon">${m.icon}</span>
            <span class="milestone-label">${m.label}</span>
            <span class="milestone-progress-text">${m.value} / ${m.target}</span>
          </div>
          <div class="milestone-bar-wrap">
            <div class="milestone-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>`;
      }).join('');
    }

    // ── Leaderboard ───────────────────────────────────────────────────────────
    let _currentLbTab = 'rating';

    async function loadLeaderboard(tab) {
      _currentLbTab = tab || 'rating';
      const list = document.getElementById('leaderboard-list');
      if (!list) return;

      // Update tab buttons
      document.querySelectorAll('.lb-tab').forEach(btn => {
        const active = btn.dataset.lbTab === _currentLbTab;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active);
      });

      list.innerHTML = '<div class="leaderboard-loading">Loading…</div>';
      try {
        const resp = await fetch(`/api/leaderboard?tab=${_currentLbTab}`, { credentials: 'same-origin' });
        if (!resp.ok) { list.innerHTML = '<div class="leaderboard-error">Could not load leaderboard.</div>'; return; }
        const data = await resp.json();
        if (!data.entries || data.entries.length === 0) {
          list.innerHTML = '<div class="leaderboard-empty">No entries yet. Be the first!</div>';
          return;
        }
        const units = { rating: '', solved: ' puzzles', xp: ' XP', streak: ' days' };
        const unit  = units[_currentLbTab] || '';
        const me    = authState.user ? authState.user.username : null;
        const buildEntry = (e, isHint = false) => {
          const isMe = me && e.username === me;
          const safeUser = escapeHtml(e.username || '?');
          const safeAvatar = e.avatarUrl ? escapeHtml(e.avatarUrl) : null;
          const medalMap = { 1: '🥇', 2: '🥈', 3: '🥉' };
          const rank  = parseInt(e.rank, 10);
          const medal = medalMap[rank] || `<span class="lb-rank-num">${rank}</span>`;
          const avatarHtml = safeAvatar
            ? `<img src="${safeAvatar}" class="lb-avatar" alt="" aria-hidden="true">`
            : `<div class="lb-avatar lb-avatar-initial">${escapeHtml((e.username || '?')[0].toUpperCase())}</div>`;
          const classes = ['leaderboard-entry', isMe ? 'lb-entry-me' : '', isHint ? 'lb-entry-hint' : ''].filter(Boolean).join(' ');
          return `<div class="${classes}" data-lb-username="${safeUser}" role="button" tabindex="0" aria-label="View ${safeUser}&#x27;s profile">
            <span class="lb-medal">${medal}</span>
            ${avatarHtml}
            <span class="lb-username">${safeUser}</span>
            <span class="lb-value">${escapeHtml(e.value.toLocaleString())}${unit}</span>
          </div>`;
        };
        let html = data.entries.map(e => buildEntry(e)).join('');
        if (data.myEntry) {
          html += `<div class="lb-my-position-divider">· · ·</div>`;
          html += buildEntry(data.myEntry, true);
        }
        list.innerHTML = html;
      } catch {
        list.innerHTML = '<div class="leaderboard-error">Could not load leaderboard.</div>';
      }
    }

    // Leaderboard tab click handlers
    document.getElementById('leaderboard-tabs')?.addEventListener('click', e => {
      const btn = e.target.closest('.lb-tab');
      if (btn && btn.dataset.lbTab) loadLeaderboard(btn.dataset.lbTab);
    });

    // Leaderboard entry click → open that user's profile
    document.getElementById('leaderboard-list')?.addEventListener('click', e => {
      const entry = e.target.closest('[data-lb-username]');
      if (!entry) return;
      const username = entry.dataset.lbUsername;
      if (username) openUserProfile(username);
    });
    document.getElementById('leaderboard-list')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const entry = e.target.closest('[data-lb-username]');
        if (entry) { e.preventDefault(); openUserProfile(entry.dataset.lbUsername); }
      }
    });

    window._loadProfilePage = loadProfilePage;
    // Expose render helpers so the other-user profile (in a separate IIFE) can reuse them.
    window._profileRenderHelpers = { loadRatingGraph, renderMilestones, renderRecentHistory };

  })();

  function loadProfilePage() {
    if (window._loadProfilePage) window._loadProfilePage();
  }

  // ── Named Collections Hub ─────────────────────────────────────────────────
  // Drives the My Collections, Community, and Save-to-Collection modal features.
  // Backend: /api/collections (collections.js route). DB tables: collections, collection_games.
  (function initNamedCollections() {

    // ── API helper ──────────────────────────────────────────────────────────
    async function apiColl(method, path, body) {
      const opts = { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const resp = await fetch('/api/collections' + path, opts);
      const data = await resp.json();
      if (!resp.ok) {
        const err = new Error(data.error || 'Request failed');
        err.data = data;
        err.status = resp.status;
        throw err;
      }
      return data;
    }

    // ── Open auth modal helper ──────────────────────────────────────────────
    function openAuthModal(tab) {
      const authModal = document.getElementById('auth-modal');
      if (!authModal) return;
      authModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.querySelector(`.auth-tab[data-auth-tab="${tab}"]`)?.click();
    }

    // ── Shared state ────────────────────────────────────────────────────────
    let _myColls      = null;   // cached array of user's named collections; null = not loaded
    let _addedColls   = null;   // cached array of community collections the user has added
    let _currentCollId = null;  // ID of the named collection currently open in detail view
    let _currentPubCollId = null; // ID of public collection open in public detail view
    let _commPage     = 1;      // current community pagination page
    let _commTotal    = 0;
    let _commSort     = 'recent'; // 'recent' | 'popular'
    let _editingCollId = null;  // null = create, string = edit
    let _deletingCollId = null;

    // ── Bookmark ("add to my collections") icon markup ──────────────────────
    const ADD_ICON_PLUS  = '<svg class="coll-add-icon-add" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    const ADD_ICON_CHECK = '<svg class="coll-add-icon-added" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    const ADDS_ICON      = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2a2 2 0 0 0-2 2v18l8-5.6 8 5.6V4a2 2 0 0 0-2-2z"/></svg>';

    // ── Formatting helper ───────────────────────────────────────────────────
    function fmtDate(ts) {
      if (!ts) return '';
      return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // ── Render a collection card (shared by My Collections and Community) ───
    function renderCollCard(col, isPublic) {
      const cnt = col.game_count || 0;
      const pubBadge = col.is_published
        ? '<span class="coll-card-vis coll-card-vis--public">Public</span>'
        : (isPublic ? '' : '<span class="coll-card-vis">Private</span>');
      const authorLine = isPublic
        ? `<span class="coll-card-author">by ${escapeHtml(col.username || '')}</span>`
        : '';
      const desc = col.description
        ? `<p class="coll-card-desc">${escapeHtml(col.description)}</p>`
        : '';
      const cover = col.banner_url
        ? `<div class="coll-card-cover coll-card-cover--banner" aria-hidden="true"><img src="${escapeHtml(col.banner_url)}" alt="" loading="lazy"></div>`
        : `<div class="coll-card-cover coll-card-cover--empty" aria-hidden="true"><img class="piece-icon piece-icon--lg" src="./images/chess_bold_black_pawn.png" alt="" aria-hidden="true"></div>`;
      const addCount = col.add_count || 0;
      const addsBadge = isPublic
        ? `<span class="coll-card-adds" title="Added by ${addCount} ${addCount === 1 ? 'person' : 'people'}">${ADDS_ICON}<span class="coll-card-adds-num">${addCount}</span></span>`
        : '';
      // "Add to my collections" toggle — public cards only, hidden on the user's own.
      const addBtn = (isPublic && !col.is_owner)
        ? `<button class="coll-card-add-btn${col.is_added ? ' is-added' : ''}" data-coll-id="${col.id}" type="button" aria-pressed="${col.is_added ? 'true' : 'false'}" title="${col.is_added ? 'Remove from my collections' : 'Add to my collections'}">
            ${ADD_ICON_PLUS}${ADD_ICON_CHECK}<span class="coll-card-add-label">${col.is_added ? 'Added' : 'Add'}</span>
          </button>`
        : '';
      const footDate = isPublic ? (col.published_at || col.updated_at) : col.updated_at;
      return `
        <div class="coll-card" data-coll-id="${col.id}" tabindex="0" role="button" aria-label="${escapeHtml(col.name)}">
          ${cover}
          <div class="coll-card-body">
            <span class="coll-card-name">${escapeHtml(col.name)}</span>
            <div class="coll-card-meta">
              ${pubBadge}${authorLine}
              <span class="coll-card-game-count">${cnt} game${cnt !== 1 ? 's' : ''}</span>
              ${addsBadge}
            </div>
            ${desc}
            <div class="coll-card-footer">
              <span class="coll-card-updated">${fmtDate(footDate)}</span>
              ${addBtn}
            </div>
          </div>
        </div>`;
    }

    // ── Add / remove a community collection from the user's library ──────────
    function setAddBtnState(btn, added) {
      if (!btn) return;
      btn.classList.toggle('is-added', !!added);
      btn.setAttribute('aria-pressed', added ? 'true' : 'false');
      btn.title = added ? 'Remove from my collections' : 'Add to my collections';
      const label = btn.querySelector('.coll-card-add-label');
      if (label) label.textContent = added ? 'Added' : 'Add';
    }

    // Reflect a new add-state/count across every place the collection is shown.
    function applyAddState(collId, added, addCount) {
      document.querySelectorAll(`.coll-card-add-btn[data-coll-id="${collId}"]`)
        .forEach(b => setAddBtnState(b, added));
      if (typeof addCount === 'number') {
        document.querySelectorAll(`.coll-card[data-coll-id="${collId}"] .coll-card-adds-num`)
          .forEach(el => { el.textContent = addCount; });
      }
      if (_currentPubCollId === collId) {
        const pubBtn   = document.getElementById('btn-coll-public-add');
        const pubLabel = document.getElementById('btn-coll-public-add-label');
        const pubCount = document.getElementById('coll-public-add-count');
        if (pubBtn)   { pubBtn.classList.toggle('is-added', !!added); pubBtn.setAttribute('aria-pressed', added ? 'true' : 'false'); }
        if (pubLabel) pubLabel.textContent = added ? 'Added to my collections' : 'Add to my collections';
        if (pubCount && typeof addCount === 'number') pubCount.textContent = addCount;
      }
    }

    async function toggleAdd(collId, currentlyAdded, btnEl) {
      if (!authState.user) { openAuthModal('login'); return; }
      if (btnEl) btnEl.disabled = true;
      try {
        const data = currentlyAdded
          ? await apiColl('DELETE', `/public/${collId}/add`)
          : await apiColl('POST', `/public/${collId}/add`);
        applyAddState(collId, data.added, data.add_count);
        _addedColls = null; // invalidate saved-section cache
        showToast(data.added ? 'Added to your collections.' : 'Removed from your collections.', 'success');
        // If the saved section is currently visible, refresh it live.
        const addedSection = document.getElementById('coll-added-section');
        if (addedSection && addedSection.style.display !== 'none' && panelMine && panelMine.style.display !== 'none') {
          loadAddedColls(true);
        }
      } catch (err) {
        showToast(err.message || 'Action failed.', 'error');
      } finally {
        if (btnEl) btnEl.disabled = false;
      }
    }

    // Wire up the inline add buttons inside a freshly-rendered card grid.
    function wireCardAddButtons(gridEl) {
      if (!gridEl) return;
      gridEl.querySelectorAll('.coll-card-add-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          toggleAdd(btn.dataset.collId, btn.classList.contains('is-added'), btn);
        });
        btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
      });
    }

    // ── Hub / Detail visibility ─────────────────────────────────────────────
    const hub            = document.getElementById('coll-hub');
    const detailView     = document.getElementById('coll-detail');
    const pubDetailView  = document.getElementById('coll-public-detail');

    function showHub(tab) {
      if (hub) hub.style.display = '';
      if (detailView)    detailView.style.display    = 'none';
      if (pubDetailView) pubDetailView.style.display = 'none';
      if (tab) showTab(tab);
    }
    function showDetail() {
      if (hub) hub.style.display = 'none';
      if (detailView)    detailView.style.display    = '';
      if (pubDetailView) pubDetailView.style.display = 'none';
    }
    function showPubDetail() {
      if (hub) hub.style.display = 'none';
      if (detailView)    detailView.style.display    = 'none';
      if (pubDetailView) pubDetailView.style.display = '';
    }

    // ── Tab switching ───────────────────────────────────────────────────────
    const panelMine = document.getElementById('coll-panel-mine');
    const panelAll  = document.getElementById('coll-panel-all');
    const panelComm = document.getElementById('coll-panel-community');

    function showTab(tab) {
      document.querySelectorAll('[data-coll-tab]').forEach(btn => {
        const active = btn.dataset.collTab === tab;
        btn.classList.toggle('coll-hub-tab--active', active);
        btn.setAttribute('aria-selected', String(active));
      });
      if (panelMine) panelMine.style.display = tab === 'mine'      ? ''     : 'none';
      if (panelAll)  panelAll.style.display  = tab === 'all'       ? ''     : 'none';
      if (panelComm) panelComm.style.display = tab === 'community' ? ''     : 'none';

      if (tab === 'mine')      loadMyColls();
      if (tab === 'all')       renderCollection({ reset: true });
      if (tab === 'community') loadCommunity(true);
    }

    document.querySelectorAll('[data-coll-tab]').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.collTab));
    });

    // Back buttons
    document.getElementById('btn-coll-detail-back')?.addEventListener('click', () => showHub('mine'));
    document.getElementById('btn-coll-public-back')?.addEventListener('click', () => showHub('community'));

    // ── My Collections panel ────────────────────────────────────────────────
    async function loadMyColls(force) {
      const authEl  = document.getElementById('coll-mine-auth');
      const guestEl = document.getElementById('coll-mine-guest');
      if (!authState.user) {
        if (authEl)  authEl.style.display  = 'none';
        if (guestEl) guestEl.style.display = '';
        return;
      }
      if (authEl)  authEl.style.display  = '';
      if (guestEl) guestEl.style.display = 'none';

      loadAddedColls(force);

      if (_myColls !== null && !force) { renderMyColls(); return; }

      try {
        const data = await apiColl('GET', '');
        _myColls = data.collections || [];
        renderMyColls();
      } catch {
        const grid = document.getElementById('coll-cards-grid');
        if (grid) grid.innerHTML = '<p style="color:var(--text-muted);padding:1rem">Failed to load collections.</p>';
      }
    }

    function renderMyColls() {
      const grid  = document.getElementById('coll-cards-grid');
      const empty = document.getElementById('coll-cards-empty');
      // The empty state has its own "Create collection" CTA, so hide the toolbar's
      // duplicate "New Collection" button while it is showing.
      const toolbar = document.querySelector('#coll-mine-auth .coll-mine-toolbar');
      if (!grid) return;
      if (!_myColls || _myColls.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = '';
        if (toolbar) toolbar.style.display = 'none';
        return;
      }
      if (empty) empty.style.display = 'none';
      if (toolbar) toolbar.style.display = '';
      grid.innerHTML = _myColls.map(c => renderCollCard(c, false)).join('');
      grid.querySelectorAll('.coll-card').forEach(card => {
        card.addEventListener('click', () => openCollDetail(card.dataset.collId));
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCollDetail(card.dataset.collId); }
        });
      });
    }

    // ── Saved-from-community section (inside My Collections) ─────────────────
    async function loadAddedColls(force) {
      if (!authState.user) return;
      if (_addedColls !== null && !force) { renderAddedColls(); return; }
      try {
        const data = await apiColl('GET', '/added');
        _addedColls = data.collections || [];
        renderAddedColls();
      } catch {
        _addedColls = [];
        renderAddedColls();
      }
    }

    function renderAddedColls() {
      const section = document.getElementById('coll-added-section');
      const grid    = document.getElementById('coll-added-grid');
      if (!section || !grid) return;
      if (!_addedColls || _addedColls.length === 0) {
        section.style.display = 'none';
        grid.innerHTML = '';
        return;
      }
      section.style.display = '';
      grid.innerHTML = _addedColls.map(c => renderCollCard({ ...c, is_added: 1 }, true)).join('');
      grid.querySelectorAll('.coll-card').forEach(card => {
        card.addEventListener('click', () => openPubCollDetail(card.dataset.collId));
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPubCollDetail(card.dataset.collId); }
        });
      });
      wireCardAddButtons(grid);
    }

    // "New Collection" buttons (toolbar + empty-state)
    document.getElementById('btn-coll-new')?.addEventListener('click', () => openCreateModal(null));
    document.getElementById('btn-coll-new-empty')?.addEventListener('click', () => openCreateModal(null));

    // Guest sign-in / sign-up buttons
    document.getElementById('btn-coll-signin')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btn-coll-signup')?.addEventListener('click', () => openAuthModal('signup'));

    // ── Collection detail view ──────────────────────────────────────────────
    async function openCollDetail(collId) {
      _currentCollId = collId;
      showDetail();

      // Reset UI
      const nameEl    = document.getElementById('coll-detail-name');
      const descEl    = document.getElementById('coll-detail-desc');
      const statsEl   = document.getElementById('coll-detail-stats');
      const shareRow  = document.getElementById('coll-detail-share-row');
      const gamesEl   = document.getElementById('coll-detail-games');
      const emptyEl   = document.getElementById('coll-detail-empty');
      if (nameEl)   nameEl.textContent  = '…';
      if (statsEl)  statsEl.textContent = '';
      if (shareRow) shareRow.style.display = 'none';
      if (gamesEl)  gamesEl.innerHTML   = '';
      if (emptyEl)  emptyEl.style.display = 'none';

      try {
        const data  = await apiColl('GET', `/${collId}`);
        const col   = data.collection;
        const games = data.games || [];

        if (nameEl) nameEl.textContent = col.name;
        if (descEl) {
          if (col.description) { descEl.textContent = col.description; descEl.style.display = ''; }
          else { descEl.style.display = 'none'; }
        }
        if (statsEl) statsEl.textContent =
          `${games.length} game${games.length !== 1 ? 's' : ''} · Updated ${fmtDate(col.updated_at)}`;

        const badge = document.getElementById('coll-detail-vis-badge');
        if (badge) {
          badge.textContent = col.is_published ? 'Public' : 'Private';
          badge.className = 'coll-detail-vis-badge' + (col.is_published ? ' coll-detail-vis-badge--public' : '');
        }

        const publishBtn   = document.getElementById('btn-coll-detail-publish');
        const publishLabel = document.getElementById('btn-coll-detail-publish-label');
        if (publishBtn && publishLabel) {
          publishLabel.textContent = col.is_published ? 'Unpublish' : 'Publish';
          publishBtn.classList.toggle('is-published', !!col.is_published);
          publishBtn.dataset.published = col.is_published ? '1' : '0';
        }

        if (col.is_published && shareRow) {
          const shareUrl = document.getElementById('coll-detail-share-url');
          const url = `${location.origin}/app#coll-public-${collId}`;
          if (shareUrl) shareUrl.textContent = url;
          shareRow.style.display = '';
        }

        const bannerEl = document.getElementById('coll-detail-banner');
        if (bannerEl) {
          if (col.banner_url) {
            bannerEl.innerHTML = `<img src="${escapeHtml(col.banner_url)}" alt="">`;
            bannerEl.style.display = '';
          } else {
            bannerEl.innerHTML = '';
            bannerEl.style.display = 'none';
          }
        }

        renderDetailGames(games, col);
      } catch {
        showToast('Failed to load collection.', 'error');
        showHub('mine');
      }
    }

    function renderDetailGames(games, col) {
      const container = document.getElementById('coll-detail-games');
      const emptyEl   = document.getElementById('coll-detail-empty');
      if (!container) return;

      if (games.length === 0) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = '';
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';

      container.innerHTML = games.map(g => {
        const gItem = { pgn: g.pgn };
        const previewFen = encodeURIComponent(getCollectionFinalFen(gItem) || '');
        const result = getPgnHeader(g.pgn, 'Result') || '';
        return `
        <div class="collection-item">
          <div class="collection-item-board" data-preview-fen="${previewFen}" aria-hidden="true">${renderCollectionMiniBoard(gItem)}</div>
          <div class="collection-item-info">
            <span class="collection-item-title">${escapeHtml(g.title || 'Untitled game')}</span>
            <div class="collection-item-meta">
              <span>${g.moveCount || 0} move${g.moveCount !== 1 ? 's' : ''}</span>
              <span>${escapeHtml(g.savedAt || '')}</span>
              ${result ? `<span>${escapeHtml(result)}</span>` : ''}
            </div>
            <span class="collection-item-preview">${escapeHtml(buildCollectionPreview(gItem))}</span>
          </div>
          <div class="collection-item-actions">
            <button class="collection-share-btn collection-detail-share" data-game-id="${g.id}" title="Share game">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button class="btn-secondary collection-detail-load" data-game-id="${g.id}">Load</button>
            <button class="collection-delete-btn collection-detail-remove" data-game-id="${g.id}" title="Remove from collection"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>`;
      }).join('');

      container.querySelectorAll('.collection-detail-load').forEach(btn => {
        btn.addEventListener('click', () => {
          const game = games.find(g => g.id === btn.dataset.gameId);
          if (!game || !game.pgn) return;
          confirmIfUnsaved(() => {
            // Restore the full tree (comments, Q&A, drawings) when available —
            // loading just the PGN would silently drop every saved comment.
            if (game.treeData) {
              restoreFromTreeData(game.treeData);
            } else {
              document.getElementById('pgn-input').value = game.pgn;
              importPGN();
            }
            if (game.title) setGameTitle(game.title);
            markClean();
            // These are the user's own games, so edits made after loading can
            // persist straight back to the matching All-Games entry.
            const inCollection = (window._collectionAPI?.get() || []).some(i => i.id === game.id);
            state.loadedGameId = inCollection ? game.id : null;
            switchToPage('analysis');
          });
        });
      });

      container.querySelectorAll('.collection-detail-share').forEach(btn => {
        btn.addEventListener('click', () => {
          const game = games.find(g => g.id === btn.dataset.gameId);
          if (!game || !game.pgn) return;
          window._shareGameData?.({
            title:    game.title || null,
            pgn:      game.pgn,
            treeData: game.treeData || null,
            analysis: game.analysis || null,
          });
        });
      });

      container.querySelectorAll('.collection-detail-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const gameId = btn.dataset.gameId;
          try {
            await apiColl('DELETE', `/${col.id}/games/${gameId}`);
            const remaining = games.filter(g => g.id !== gameId);
            _myColls = null;
            renderDetailGames(remaining, col);
            const statsEl = document.getElementById('coll-detail-stats');
            if (statsEl) statsEl.textContent =
              `${remaining.length} game${remaining.length !== 1 ? 's' : ''} · Updated ${fmtDate(col.updated_at)}`;
          } catch {
            showToast('Failed to remove game.', 'error');
          }
        });
      });

      container.querySelectorAll('.collection-item-board').forEach(boardEl => {
        boardEl.addEventListener('mouseenter', e => {
          const fen = decodeURIComponent(boardEl.dataset.previewFen || '');
          if (!fen) return;
          showPreview(fen, e.clientX, e.clientY);
        });
        boardEl.addEventListener('mousemove', e => {
          const fen = decodeURIComponent(boardEl.dataset.previewFen || '');
          if (!fen) return;
          updatePreviewPosition(e.clientX, e.clientY);
        });
        boardEl.addEventListener('mouseleave', () => hidePreview());
      });
    }

    // Edit / Publish / Delete buttons in detail header
    document.getElementById('btn-coll-detail-edit')?.addEventListener('click', () => {
      if (!_currentCollId || !_myColls) return;
      const col = _myColls.find(c => c.id === _currentCollId);
      if (col) openCreateModal(col);
    });

    // ── Publish confirmation modal ───────────────────────────────────────────
    const publishModal     = document.getElementById('coll-publish-modal');
    const publishNameEl    = document.getElementById('coll-publish-name');
    const publishConfBtn   = document.getElementById('btn-coll-publish-confirm');

    function closePublishModal() {
      if (publishModal) { publishModal.style.display = 'none'; document.body.style.overflow = ''; }
    }
    document.getElementById('btn-coll-publish-close')?.addEventListener('click', closePublishModal);
    document.getElementById('btn-coll-publish-cancel')?.addEventListener('click', closePublishModal);
    publishModal?.addEventListener('click', e => { if (e.target === publishModal) closePublishModal(); });

    publishConfBtn?.addEventListener('click', async () => {
      if (!_currentCollId) return;
      if (publishConfBtn) publishConfBtn.disabled = true;
      try {
        await apiColl('PUT', `/${_currentCollId}/publish`, { published: true });
        _myColls = null;
        closePublishModal();
        openCollDetail(_currentCollId);
      } catch (err) {
        if (err.status === 429 && err.data?.retryAfter) {
          showToast(`${err.message} Try again in about ${fmtCooldown(err.data.retryAfter)}.`, 'error');
          closePublishModal();
        } else {
          showToast(err.message || 'Failed to publish collection.', 'error');
        }
      } finally {
        if (publishConfBtn) publishConfBtn.disabled = false;
      }
    });

    // Human-friendly "X hours / minutes" from a seconds value.
    function fmtCooldown(seconds) {
      const mins  = Math.ceil(seconds / 60);
      if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''}`;
      const hours = Math.ceil(mins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    document.getElementById('btn-coll-detail-publish')?.addEventListener('click', async () => {
      if (!_currentCollId) return;
      const btn = document.getElementById('btn-coll-detail-publish');
      const isPublished = btn?.dataset.published === '1';
      if (!isPublished) {
        // Publishing: show confirmation dialog
        const col = _myColls?.find(c => c.id === _currentCollId);
        if (publishNameEl) publishNameEl.textContent = col?.name || 'this collection';
        if (publishModal) { publishModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
        return;
      }
      // Unpublishing: do it immediately (no confirmation needed)
      try {
        await apiColl('PUT', `/${_currentCollId}/publish`, { published: false });
        _myColls = null;
        openCollDetail(_currentCollId);
      } catch {
        showToast('Failed to unpublish collection.', 'error');
      }
    });

    document.getElementById('btn-coll-detail-delete')?.addEventListener('click', () => {
      if (!_currentCollId || !_myColls) return;
      const col = _myColls.find(c => c.id === _currentCollId);
      if (col) openDeleteModal(col);
    });

    document.getElementById('btn-coll-copy-link')?.addEventListener('click', () => {
      const url = document.getElementById('coll-detail-share-url')?.textContent;
      if (!url) return;
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copied!', 'success'))
        .catch(() => showToast('Copy failed.', 'error'));
    });

    // ── Community panel ─────────────────────────────────────────────────────
    async function loadCommunity(reset) {
      if (reset) { _commPage = 1; _commTotal = 0; }
      const grid     = document.getElementById('coll-community-grid');
      const emptyEl  = document.getElementById('coll-community-empty');
      const loadingEl = document.getElementById('coll-community-loading');
      const moreEl   = document.getElementById('coll-community-load-more');
      if (!grid) return;

      if (loadingEl) loadingEl.style.display = reset ? '' : 'none';
      if (moreEl)    moreEl.style.display    = 'none';
      if (reset)     grid.innerHTML          = '';

      try {
        const data = await apiColl('GET', `/public?page=${_commPage}&sort=${_commSort}`);
        const cols  = data.collections || [];
        _commTotal  = data.total || 0;

        if (loadingEl) loadingEl.style.display = 'none';
        if (cols.length === 0 && reset) {
          if (emptyEl) emptyEl.style.display = '';
          return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        cols.forEach(c => {
          const tmp = document.createElement('div');
          tmp.innerHTML = renderCollCard(c, true);
          const card = tmp.firstElementChild;
          card.addEventListener('click', () => openPubCollDetail(c.id));
          card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPubCollDetail(c.id); }
          });
          grid.appendChild(card);
        });
        wireCardAddButtons(grid);

        if (_commTotal > _commPage * (data.limit || 24)) {
          if (moreEl) moreEl.style.display = '';
        }
      } catch {
        if (loadingEl) loadingEl.style.display = 'none';
      }
    }

    // Sort toggle (Newest / Most added)
    document.querySelectorAll('[data-coll-sort]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sort = btn.dataset.collSort === 'popular' ? 'popular' : 'recent';
        if (sort === _commSort) return;
        _commSort = sort;
        document.querySelectorAll('[data-coll-sort]').forEach(b => {
          const active = b.dataset.collSort === sort;
          b.classList.toggle('coll-sort-btn--active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        loadCommunity(true);
      });
    });

    document.getElementById('btn-coll-load-more')?.addEventListener('click', () => {
      _commPage++;
      loadCommunity(false);
    });

    // ── Public collection detail ────────────────────────────────────────────
    function setPubAddBtn(added, addCount) {
      const btn   = document.getElementById('btn-coll-public-add');
      const label = document.getElementById('btn-coll-public-add-label');
      const count = document.getElementById('coll-public-add-count');
      if (btn)   { btn.classList.toggle('is-added', !!added); btn.setAttribute('aria-pressed', added ? 'true' : 'false'); }
      if (label) label.textContent = added ? 'Added to my collections' : 'Add to my collections';
      if (count && typeof addCount === 'number') count.textContent = addCount;
    }

    document.getElementById('btn-coll-public-add')?.addEventListener('click', function () {
      const collId = this.dataset.collId;
      if (!collId) return;
      toggleAdd(collId, this.classList.contains('is-added'), this);
    });

    async function openPubCollDetail(collId) {
      showPubDetail();
      _currentPubCollId = collId;
      const nameEl    = document.getElementById('coll-public-name');
      const authorEl  = document.getElementById('coll-public-author');
      const descEl    = document.getElementById('coll-public-desc');
      const statsEl   = document.getElementById('coll-public-stats');
      const gamesEl   = document.getElementById('coll-public-games');
      const loadingEl = document.getElementById('coll-public-loading');
      const addBtn    = document.getElementById('btn-coll-public-add');

      if (nameEl)    nameEl.textContent   = '…';
      if (authorEl)  authorEl.textContent = '';
      if (gamesEl)   gamesEl.innerHTML    = '';
      if (loadingEl) loadingEl.style.display = '';
      if (addBtn)    addBtn.style.display  = 'none';

      try {
        const data  = await apiColl('GET', `/public/${collId}`);
        const col   = data.collection;
        const games = data.games || [];

        if (nameEl)   nameEl.textContent   = col.name;
        if (authorEl) authorEl.textContent = `by ${col.username}`;
        if (descEl) {
          if (col.description) { descEl.textContent = col.description; descEl.style.display = ''; }
          else { descEl.style.display = 'none'; }
        }

        const pubBannerEl = document.getElementById('coll-public-banner');
        if (pubBannerEl) {
          if (col.banner_url) {
            pubBannerEl.innerHTML = `<img src="${escapeHtml(col.banner_url)}" alt="">`;
            pubBannerEl.style.display = '';
          } else {
            pubBannerEl.innerHTML = '';
            pubBannerEl.style.display = 'none';
          }
        }

        if (statsEl)  statsEl.textContent  = `${games.length} game${games.length !== 1 ? 's' : ''}`;
        if (loadingEl) loadingEl.style.display = 'none';

        // Add-to-my-collections button (hidden on the user's own collection)
        if (addBtn) {
          if (col.is_owner) {
            addBtn.style.display = 'none';
          } else {
            addBtn.style.display = '';
            addBtn.dataset.collId = collId;
            setPubAddBtn(!!col.is_added, col.add_count || 0);
          }
        }

        if (gamesEl) {
          if (games.length === 0) {
            gamesEl.innerHTML = '<p style="color:var(--text-muted);padding:1rem">No games in this collection.</p>';
          } else {
            gamesEl.innerHTML = games.map(g => {
              const gItem = { pgn: g.pgn };
              const previewFen = encodeURIComponent(getCollectionFinalFen(gItem) || '');
              const result = getPgnHeader(g.pgn, 'Result') || '';
              return `
              <div class="collection-item">
                <div class="collection-item-board" data-preview-fen="${previewFen}" aria-hidden="true">${renderCollectionMiniBoard(gItem)}</div>
                <div class="collection-item-info">
                  <span class="collection-item-title">${escapeHtml(g.title || 'Untitled game')}</span>
                  <div class="collection-item-meta">
                    <span>${g.moveCount || 0} move${g.moveCount !== 1 ? 's' : ''}</span>
                    <span>${escapeHtml(g.savedAt || '')}</span>
                    ${result ? `<span>${escapeHtml(result)}</span>` : ''}
                  </div>
                  <span class="collection-item-preview">${escapeHtml(buildCollectionPreview(gItem))}</span>
                </div>
                <div class="collection-item-actions">
                  <button class="collection-share-btn coll-pub-game-share" data-pgn="${encodeURIComponent(g.pgn || '')}" data-title="${encodeURIComponent(g.title || '')}" title="Share game">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                  <button class="btn-secondary coll-pub-game-load" data-pgn="${encodeURIComponent(g.pgn || '')}">Load</button>
                </div>
              </div>`;
            }).join('');

            gamesEl.querySelectorAll('.coll-pub-game-load').forEach(btn => {
              btn.addEventListener('click', () => {
                const pgn = decodeURIComponent(btn.dataset.pgn || '');
                if (!pgn) return;
                confirmIfUnsaved(() => {
                  document.getElementById('pgn-input').value = pgn;
                  importPGN();
                  switchToPage('analysis');
                });
              });
            });

            gamesEl.querySelectorAll('.coll-pub-game-share').forEach(btn => {
              btn.addEventListener('click', () => {
                const pgn   = decodeURIComponent(btn.dataset.pgn   || '');
                const title = decodeURIComponent(btn.dataset.title || '');
                if (!pgn) return;
                window._shareGameData?.({ title: title || null, pgn, nodeComments: [], analysis: null });
              });
            });

            gamesEl.querySelectorAll('.collection-item-board').forEach(boardEl => {
              boardEl.addEventListener('mouseenter', e => {
                const fen = decodeURIComponent(boardEl.dataset.previewFen || '');
                if (!fen) return;
                showPreview(fen, e.clientX, e.clientY);
              });
              boardEl.addEventListener('mousemove', e => {
                const fen = decodeURIComponent(boardEl.dataset.previewFen || '');
                if (!fen) return;
                updatePreviewPosition(e.clientX, e.clientY);
              });
              boardEl.addEventListener('mouseleave', () => hidePreview());
            });
          }
        }
      } catch {
        if (loadingEl) loadingEl.style.display = 'none';
        showToast('Failed to load collection.', 'error');
        showHub('community');
      }
    }

    // ── Create / Edit Collection modal ──────────────────────────────────────
    const createModal   = document.getElementById('coll-create-modal');
    const createTitleEl = document.getElementById('coll-create-modal-title');
    const createNameEl  = document.getElementById('coll-create-name');
    const createDescEl  = document.getElementById('coll-create-desc');
    const createErrEl   = document.getElementById('coll-create-error');
    const createConfBtn = document.getElementById('btn-coll-create-confirm');

    function openCreateModal(col) {
      _editingCollId = col ? col.id : null;
      if (createTitleEl) createTitleEl.textContent = col ? 'Edit Collection' : 'New Collection';
      if (createConfBtn) createConfBtn.textContent  = col ? 'Save' : 'Create';
      if (createNameEl)  createNameEl.value  = col ? col.name : '';
      if (createDescEl)  createDescEl.value  = col ? (col.description || '') : '';
      if (createErrEl)  { createErrEl.textContent = ''; createErrEl.style.display = 'none'; }

      const bannerSection   = document.getElementById('coll-banner-section');
      const bannerPreview   = document.getElementById('coll-banner-preview');
      const removeBannerBtn = document.getElementById('btn-coll-banner-remove');
      if (bannerSection) bannerSection.style.display = col ? '' : 'none';
      if (bannerPreview) {
        if (col && col.banner_url) {
          bannerPreview.innerHTML = `<img src="${escapeHtml(col.banner_url)}" alt="">`;
        } else {
          bannerPreview.innerHTML = '';
        }
      }
      if (removeBannerBtn) removeBannerBtn.style.display = (col && col.banner_url) ? '' : 'none';
      if (createModal)  { createModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
      requestAnimationFrame(() => createNameEl?.focus());
    }

    function closeCreateModal() {
      if (createModal) { createModal.style.display = 'none'; document.body.style.overflow = ''; }
      _editingCollId = null;
    }

    document.getElementById('btn-coll-create-close')?.addEventListener('click', closeCreateModal);
    document.getElementById('btn-coll-create-cancel')?.addEventListener('click', closeCreateModal);
    createModal?.addEventListener('click', e => { if (e.target === createModal) closeCreateModal(); });

    // ── Banner upload / remove ──────────────────────────────────────────────
    document.getElementById('coll-banner-file')?.addEventListener('change', async (e) => {
      if (!_editingCollId) return;
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = '';
      const formData = new FormData();
      formData.append('banner', file);
      try {
        const resp = await fetch(`/api/collections/${_editingCollId}/banner`, {
          method: 'POST',
          credentials: 'same-origin',
          body: formData,
        });
        let data = {};
        try { data = await resp.json(); } catch {}
        if (!resp.ok) throw new Error(data.error || (resp.status === 413 ? 'Image is too large (max 5 MB)' : 'Upload failed'));
        if (_myColls) {
          const idx = _myColls.findIndex(c => c.id === _editingCollId);
          if (idx !== -1) _myColls[idx].banner_url = data.bannerUrl;
        }
        const bannerPreview   = document.getElementById('coll-banner-preview');
        const removeBannerBtn = document.getElementById('btn-coll-banner-remove');
        if (bannerPreview) bannerPreview.innerHTML = `<img src="${escapeHtml(data.bannerUrl)}" alt="">`;
        if (removeBannerBtn) removeBannerBtn.style.display = '';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('btn-coll-banner-remove')?.addEventListener('click', async () => {
      if (!_editingCollId) return;
      try {
        await apiColl('DELETE', `/${_editingCollId}/banner`);
        if (_myColls) {
          const idx = _myColls.findIndex(c => c.id === _editingCollId);
          if (idx !== -1) _myColls[idx].banner_url = null;
        }
        const bannerPreview   = document.getElementById('coll-banner-preview');
        const removeBannerBtn = document.getElementById('btn-coll-banner-remove');
        if (bannerPreview) bannerPreview.innerHTML = '';
        if (removeBannerBtn) removeBannerBtn.style.display = 'none';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    createConfBtn?.addEventListener('click', async () => {
      const name = createNameEl?.value.trim() || '';
      const desc = createDescEl?.value.trim() || '';
      if (!name) {
        if (createErrEl) { createErrEl.textContent = 'Name is required.'; createErrEl.style.display = ''; }
        return;
      }
      if (createConfBtn) createConfBtn.disabled = true;
      try {
        if (_editingCollId) {
          const data = await apiColl('PUT', `/${_editingCollId}`, { name, description: desc });
          if (_myColls) {
            const idx = _myColls.findIndex(c => c.id === _editingCollId);
            if (idx !== -1) _myColls[idx] = data.collection;
          }
          closeCreateModal();
          openCollDetail(_editingCollId);
        } else {
          await apiColl('POST', '', { name, description: desc });
          _myColls = null;
          closeCreateModal();
          loadMyColls(true);
        }
      } catch (err) {
        if (createErrEl) { createErrEl.textContent = err.message; createErrEl.style.display = ''; }
      } finally {
        if (createConfBtn) createConfBtn.disabled = false;
      }
    });

    createNameEl?.addEventListener('keydown', e => { if (e.key === 'Enter') createConfBtn?.click(); });

    // ── Delete Collection modal ─────────────────────────────────────────────
    const deleteModal   = document.getElementById('coll-delete-modal');
    const deleteNameEl  = document.getElementById('coll-delete-name');
    const deleteConfBtn = document.getElementById('btn-coll-delete-confirm');

    function openDeleteModal(col) {
      _deletingCollId = col.id;
      if (deleteNameEl) deleteNameEl.textContent = col.name;
      if (deleteModal)  { deleteModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    }

    function closeDeleteModal() {
      if (deleteModal) { deleteModal.style.display = 'none'; document.body.style.overflow = ''; }
      _deletingCollId = null;
    }

    document.getElementById('btn-coll-delete-cancel')?.addEventListener('click', closeDeleteModal);
    deleteModal?.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

    deleteConfBtn?.addEventListener('click', async () => {
      if (!_deletingCollId) return;
      if (deleteConfBtn) deleteConfBtn.disabled = true;
      try {
        await apiColl('DELETE', `/${_deletingCollId}`);
        _myColls = null;
        closeDeleteModal();
        showHub('mine');
        loadMyColls(true);
      } catch {
        showToast('Failed to delete collection.', 'error');
      } finally {
        if (deleteConfBtn) deleteConfBtn.disabled = false;
      }
    });

    // ── Save Game modal ─────────────────────────────────────────────────────
    // Shown when the user clicks "Save" on the analysis page.
    // Lets the user set a title and optionally assign the game to named collections.
    const saveModal      = document.getElementById('coll-save-modal');
    const saveTitleEl    = document.getElementById('coll-save-title-input');
    const saveListEl     = document.getElementById('coll-save-list');
    const saveCollWrapEl = document.getElementById('coll-save-collections-wrap');
    const saveLoginHint  = document.getElementById('coll-save-login-hint');
    const saveConfBtn    = document.getElementById('btn-coll-save-confirm');
    const saveCancelBtn  = document.getElementById('btn-coll-save-cancel');

    let _savePendingIds    = new Set();  // collection IDs checked in the save modal
    let _savePendingPgn    = null;       // PGN of the game being saved
    let _savePendingGameId = null;       // set when adding an already-saved game to collections

    async function openCollSaveModal(pgn, suggestedTitle, existingGameId) {
      if (!saveModal) return;
      _savePendingPgn    = pgn;
      _savePendingGameId = existingGameId || null;
      _savePendingIds    = new Set();

      const titleRow = saveModal.querySelector('.coll-save-title-row');
      const modalTitle = document.getElementById('coll-save-modal-title');
      const confirmText = document.getElementById('btn-coll-save-confirm');

      if (_savePendingGameId) {
        // "Add to collection" mode — game already saved, just pick collections
        if (titleRow)     titleRow.style.display     = 'none';
        if (modalTitle)   modalTitle.textContent      = 'Add to collections';
        if (confirmText)  confirmText.textContent     = 'Add to collections';
      } else {
        if (titleRow)     titleRow.style.display     = '';
        if (modalTitle)   modalTitle.textContent      = 'Save Game';
        if (confirmText)  confirmText.textContent     = 'Save game';
        if (saveTitleEl)  saveTitleEl.value           = suggestedTitle || '';
      }

      if (authState.user) {
        if (saveCollWrapEl) saveCollWrapEl.style.display = '';
        if (saveLoginHint)  saveLoginHint.style.display  = 'none';
        if (saveListEl)     saveListEl.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem">Loading…</span>';
        try {
          if (_myColls === null) {
            const data = await apiColl('GET', '');
            _myColls = data.collections || [];
          }
          renderSaveList(_myColls);
        } catch {
          if (saveListEl) saveListEl.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem">Failed to load collections.</span>';
        }
      } else {
        if (saveCollWrapEl) saveCollWrapEl.style.display = 'none';
        if (saveLoginHint)  saveLoginHint.style.display  = '';
      }

      saveModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (!_savePendingGameId) requestAnimationFrame(() => saveTitleEl?.focus());
    }

    function renderSaveList(cols) {
      if (!saveListEl) return;
      if (!cols || cols.length === 0) {
        saveListEl.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem">No collections yet. Create one below.</span>';
        return;
      }
      saveListEl.innerHTML = cols.map(c => `
        <div class="coll-save-item${_savePendingIds.has(c.id) ? ' is-checked' : ''}"
             data-coll-id="${c.id}" role="checkbox" aria-checked="${_savePendingIds.has(c.id)}" tabindex="0">
          <span class="coll-save-item-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span class="coll-save-item-name">${escapeHtml(c.name)}</span>
          <span class="coll-save-item-count">${c.game_count || 0}</span>
        </div>`).join('');

      saveListEl.querySelectorAll('.coll-save-item').forEach(item => {
        const toggle = () => {
          const id = item.dataset.collId;
          if (_savePendingIds.has(id)) {
            _savePendingIds.delete(id);
            item.classList.remove('is-checked');
            item.setAttribute('aria-checked', 'false');
          } else {
            _savePendingIds.add(id);
            item.classList.add('is-checked');
            item.setAttribute('aria-checked', 'true');
          }
        };
        item.addEventListener('click', toggle);
        item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      });
    }

    function closeCollSaveModal() {
      if (saveModal) { saveModal.style.display = 'none'; document.body.style.overflow = ''; }
      _savePendingIds    = new Set();
      _savePendingPgn    = null;
      _savePendingGameId = null;
      // Restore modal title row visibility for next open
      const titleRow = saveModal?.querySelector('.coll-save-title-row');
      if (titleRow) titleRow.style.display = '';
    }

    document.getElementById('btn-coll-save-close')?.addEventListener('click', closeCollSaveModal);
    saveCancelBtn?.addEventListener('click', closeCollSaveModal);
    saveModal?.addEventListener('click', e => { if (e.target === saveModal) closeCollSaveModal(); });

    saveConfBtn?.addEventListener('click', async () => {
      if (saveConfBtn) saveConfBtn.disabled = true;
      try {
        if (_savePendingGameId) {
          // "Add to collection" mode — game already saved, just link to collections
          if (_savePendingIds.size > 0 && authState.user) {
            await Promise.all([..._savePendingIds].map(cid =>
              apiColl('POST', `/${cid}/games`, { gameId: _savePendingGameId }).catch(() => {})
            ));
            _myColls = null;
            showToast('Added to collections!', 'success');
          } else {
            showToast('No collections selected.', 'info');
          }
          closeCollSaveModal();
        } else {
          const title = saveTitleEl?.value.trim() || 'Untitled game';
          const result = saveCurrentToCollection({ title, silent: true });
          if (!result.ok) {
            showToast(result.msg || 'Failed to save.', 'error');
            return;
          }
          if (result.gameId && _savePendingIds.size > 0 && authState.user) {
            // Ensure the game is on the server before linking it to named collections
            await syncCollectionToServer({ immediate: true });
            await Promise.all([..._savePendingIds].map(cid =>
              apiColl('POST', `/${cid}/games`, { gameId: result.gameId }).catch(() => {})
            ));
            _myColls = null;
          }
          closeCollSaveModal();
          showToast('Game saved!', 'success');
        }
      } finally {
        if (saveConfBtn) saveConfBtn.disabled = false;
      }
    });

    saveTitleEl?.addEventListener('keydown', e => { if (e.key === 'Enter') saveConfBtn?.click(); });

    // "New collection…" inside save modal — close modal, open create modal
    document.getElementById('btn-coll-save-create-new')?.addEventListener('click', () => {
      const pgn   = _savePendingPgn;
      const title = saveTitleEl?.value.trim();
      closeCollSaveModal();
      openCreateModal(null);
      // After the collection is created the user can re-open the save flow
      if (pgn) setTimeout(() => openCollSaveModal(pgn, title), 500);
    });

    // Sign-in link inside save modal
    document.getElementById('coll-save-login-link')?.addEventListener('click', e => {
      e.preventDefault();
      closeCollSaveModal();
      openAuthModal('login');
    });

    // ── Expose globals ──────────────────────────────────────────────────────

    // Called by window._openCollSaveModal (hooked into the save button handler above)
    window._openCollSaveModal = openCollSaveModal;

    // Called by "Add to…" buttons in the All Games list
    window._openAddToCollModal = function(gameId, title) {
      openCollSaveModal(null, title, gameId);
    };

    // Called by switchToPage when navigating to the collection page
    window._onCollectionPageOpen = function() {
      if (hub) hub.style.display = '';
      if (detailView)    detailView.style.display    = 'none';
      if (pubDetailView) pubDetailView.style.display = 'none';
      // Drop cached lists so a different (or signed-out) user never sees stale data.
      _myColls = null;
      _addedColls = null;
      // While auth hasn't resolved yet, default to 'mine' so loadMyColls() can show
      // the appropriate state (guest prompt or spinner) rather than an empty "All Games".
      // Once auth is confirmed, show 'all' for guests (their local saved games live there).
      const defaultTab = window._collectionHighlightId ? 'all'
        : (!authState.loaded || authState.user) ? 'mine' : 'all';
      showTab(defaultTab);
    };

    // If collection page was already active when this code ran (e.g. page refresh on #collection),
    // initialize it now since switchToPage ran before _onCollectionPageOpen was defined.
    if (collectionPage && collectionPage.style.display !== 'none') {
      window._onCollectionPageOpen();
    }

    // ── Hash-based deep links (e.g. #coll-public-<id>) ──────────────────────
    function handleHash(overrideHash) {
      // overrideHash is used on initial load because history.replaceState has
      // already overwritten location.hash with the page name by this point.
      const h = typeof overrideHash === 'string' ? overrideHash : location.hash;
      const m = h.match(/^#coll-public-([a-z0-9]+)$/i);
      if (m) { switchToPage('collection'); openPubCollDetail(m[1]); }
    }
    handleHash('#' + _rawInitial);
    window.addEventListener('hashchange', handleHash);

    // ── Collection detail import ──────────────────────────────────────────────
    (function initCollDetailImport() {
      const modal       = document.getElementById('cd-import-modal');
      const openBtn     = document.getElementById('btn-coll-detail-import');
      const closeBtn    = document.getElementById('btn-cd-import-close');
      const bulkInput   = document.getElementById('cd-pgn-bulk-input');
      const fileInput   = document.getElementById('cd-pgn-file');
      const bulkBtn     = document.getElementById('btn-cd-import-pgn');
      const lichessBtn  = document.getElementById('btn-cd-import-lichess');

      if (!modal || !openBtn) return;

      function openModal() {
        if (!_currentCollId) return;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
      function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (bulkInput) bulkInput.value = '';
        if (fileInput) fileInput.value = '';
        ['cd-import-status', 'cd-import-error', 'cd-provider-status', 'cd-provider-error'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = '';
        });
      }

      openBtn.addEventListener('click', openModal);
      closeBtn?.addEventListener('click', closeModal);
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

      function showProgress(id) {
        const wrap = document.getElementById(id);
        if (wrap) { wrap.hidden = false; const bar = wrap.querySelector('.import-progress-bar'); if (bar) bar.style.width = '0%'; }
      }
      function animateProgress(id, target, duration) {
        const bar = document.querySelector(`#${id} .import-progress-bar`);
        if (!bar) return;
        bar.style.transition = `width ${duration}ms ease`;
        bar.style.width = target + '%';
      }
      function hideProgress(id) {
        const wrap = document.getElementById(id);
        if (wrap) { animateProgress(id, 100, 200); setTimeout(() => { if (wrap) wrap.hidden = true; }, 400); }
      }

      async function importGamesIntoCollection(pgnGames, { statusEl, errorEl, progressId } = {}) {
        if (!_currentCollId) return { added: 0 };
        if (!authState.user) {
          if (errorEl) errorEl.textContent = 'Sign in to import games into a collection.';
          return { added: 0 };
        }

        const { added, addedIds, skippedDuplicates, skippedInvalid, skippedLimit } = addGamesToCollection(pgnGames);

        if (added > 0) {
          try {
            await syncCollectionToServer({ immediate: true });
            await Promise.all(addedIds.map(gameId =>
              apiColl('POST', `/${_currentCollId}/games`, { gameId }).catch(() => {})
            ));
            _myColls = null;
            await openCollDetail(_currentCollId);
          } catch (err) {
            console.error('Failed to link games to collection:', err);
          }
        }

        if (progressId) hideProgress(progressId);

        const extras = [
          skippedDuplicates ? `${skippedDuplicates} duplicate${skippedDuplicates !== 1 ? 's' : ''} skipped` : null,
          skippedInvalid    ? `${skippedInvalid} invalid skipped`                                            : null,
          skippedLimit      ? 'collection full'                                                               : null,
        ].filter(Boolean).join(' · ');

        if (statusEl) {
          if (added > 0) {
            statusEl.textContent = `Imported ${added} game${added !== 1 ? 's' : ''}.${extras ? ' ' + extras + '.' : ''}`;
          } else if (skippedLimit) {
            statusEl.textContent = 'Your collection is full.';
          } else {
            statusEl.textContent = skippedDuplicates > 0
              ? 'All of those games are already in your collection.'
              : 'No valid games found.';
          }
        }

        return { added };
      }

      async function importBulk(pgnText) {
        const statusEl = document.getElementById('cd-import-status');
        const errorEl  = document.getElementById('cd-import-error');
        if (errorEl)  errorEl.textContent  = '';
        if (statusEl) statusEl.textContent = '';

        const games = splitPgnGames(pgnText);
        if (games.length === 0) {
          if (errorEl) errorEl.textContent = 'Paste or upload at least one PGN game.';
          return;
        }

        showProgress('cd-bulk-progress');
        animateProgress('cd-bulk-progress', 60, 300);
        if (statusEl) statusEl.textContent = 'Importing…';

        await importGamesIntoCollection(games, { statusEl, errorEl, progressId: 'cd-bulk-progress' });
      }

      bulkBtn?.addEventListener('click', async () => {
        const pasted = bulkInput?.value.trim();
        if (pasted) { await importBulk(pasted); return; }

        const files = fileInput?.files?.length ? Array.from(fileInput.files) : null;
        if (!files) {
          const errorEl = document.getElementById('cd-import-error');
          if (errorEl) errorEl.textContent = 'Paste PGN text or choose a PGN file first.';
          return;
        }

        try {
          const texts = await Promise.all(files.map(f => f.text()));
          await importBulk(texts.join('\n\n'));
          if (bulkInput) bulkInput.value = '';
          if (fileInput) fileInput.value = '';
        } catch {
          const errorEl = document.getElementById('cd-import-error');
          if (errorEl) errorEl.textContent = 'Could not read that file. Please try again.';
        }
      });

      async function importFromProvider() {
        const usernameEl = document.getElementById('cd-lichess-username');
        const username   = usernameEl?.value.trim() || '';
        const statusEl   = document.getElementById('cd-provider-status');
        const errorEl    = document.getElementById('cd-provider-error');
        if (errorEl)  errorEl.textContent  = '';
        if (statusEl) statusEl.textContent = '';

        if (!username) {
          if (errorEl) errorEl.textContent = 'Please enter a username.';
          return;
        }

        if (lichessBtn) lichessBtn.disabled = true;
        if (statusEl) statusEl.textContent = 'Fetching games…';
        showProgress('cd-provider-progress');
        animateProgress('cd-provider-progress', 40, 400);

        try {
          const url = `/api/import/lichess/${encodeURIComponent(username)}?max=50`;

          const res  = await fetch(url, { credentials: 'same-origin' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (errorEl)  errorEl.textContent  = data.error || 'Import failed. Please try again.';
            if (statusEl) statusEl.textContent = '';
            hideProgress('cd-provider-progress');
            return;
          }

          animateProgress('cd-provider-progress', 80, 300);
          const pgnText = String(data.pgnText || '').trim();
          const games   = splitPgnGames(pgnText);
          if (games.length === 0) {
            if (statusEl) statusEl.textContent = 'No games found.';
            hideProgress('cd-provider-progress');
            return;
          }

          await importGamesIntoCollection(games, { statusEl, errorEl, progressId: 'cd-provider-progress' });
        } catch (err) {
          console.error('Provider import into collection failed:', err);
          if (errorEl)  errorEl.textContent  = 'Network error. Please check your connection and try again.';
          if (statusEl) statusEl.textContent = '';
          hideProgress('cd-provider-progress');
        } finally {
          if (lichessBtn) lichessBtn.disabled = false;
        }
      }

      lichessBtn?.addEventListener('click', () => importFromProvider());
    })();

  })();  // end initNamedCollections

  // ── Social: profiles, bio, friends, search ───────────────────────────────
  (function initSocialFeatures() {

    // ── Helpers ───────────────────────────────────────────────────────────
    function makeAvatar(avatarUrl, username, cls) {
      const el = document.createElement('div');
      el.className = cls || 'social-avatar';
      if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl; img.alt = ''; img.setAttribute('aria-hidden', 'true');
        el.appendChild(img);
      } else {
        el.textContent = (username || '?')[0].toUpperCase();
      }
      return el;
    }

    function escHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    async function apiFriends(method, path, body) {
      const opts = { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const resp = await fetch('/api/friends' + path, opts);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Request failed');
      return data;
    }

    // ── Notification badge ─────────────────────────────────────────────────
    const friendBadgeEl = document.getElementById('header-friend-badge');

    async function refreshFriendBadge() {
      if (!authState.user) { if (friendBadgeEl) friendBadgeEl.style.display = 'none'; return; }
      try {
        const data = await apiFriends('GET', '/requests');
        const count = (data.received || []).length;
        if (friendBadgeEl) {
          friendBadgeEl.style.display = count > 0 ? '' : 'none';
          friendBadgeEl.textContent   = count > 9 ? '9+' : String(count);
        }
      } catch {}
    }
    window._refreshFriendBadge = refreshFriendBadge;

    // ── Bio editor (own profile) ───────────────────────────────────────────
    const bioSection    = document.getElementById('profile-bio-section');
    const bioView       = document.getElementById('profile-bio-view');
    const bioText       = document.getElementById('profile-bio-text');
    const bioEditBtn    = document.getElementById('btn-bio-edit');
    const bioAddBtn     = document.getElementById('btn-bio-add');
    const bioEditorWrap = document.getElementById('profile-bio-editor-wrap');
    const bioTextarea   = document.getElementById('profile-bio-textarea');
    const bioCharcount  = document.getElementById('profile-bio-charcount');
    const bioCancelBtn  = document.getElementById('btn-bio-cancel');
    const bioSaveBtn    = document.getElementById('btn-bio-save');

    let _currentBio = null; // cached bio for self

    function showBioView(bio, isSelf) {
      if (!bioSection) return;
      if (!isSelf && !bio) { bioSection.style.display = 'none'; return; }
      bioSection.style.display = '';
      if (bioText)    bioText.textContent = bio || '';
      if (bioEditBtn) bioEditBtn.style.display = (isSelf && bio) ? '' : 'none';
      if (bioAddBtn)  bioAddBtn.style.display  = (isSelf && !bio) ? '' : 'none';
      if (bioView)    { bioView.style.display = ''; bioView.classList.toggle('has-bio', !!bio); }
      if (bioEditorWrap) bioEditorWrap.style.display = 'none';
      _currentBio = bio;
    }

    function openBioEditor() {
      if (!bioSection) return;
      bioSection.style.display = '';
      if (bioView)        bioView.style.display = 'none';
      if (bioEditorWrap)  bioEditorWrap.style.display = '';
      if (bioTextarea)    bioTextarea.value = _currentBio || '';
      updateBioCharcount();
      bioTextarea?.focus();
    }

    function closeBioEditor() {
      if (bioView)        bioView.style.display = '';
      if (bioEditorWrap)  bioEditorWrap.style.display = 'none';
    }

    function updateBioCharcount() {
      if (!bioTextarea || !bioCharcount) return;
      const len = bioTextarea.value.length;
      bioCharcount.textContent = `${len} / 280`;
      bioCharcount.classList.toggle('profile-bio-charcount--warn', len > 250);
    }

    bioTextarea?.addEventListener('input', updateBioCharcount);

    bioEditBtn?.addEventListener('click', openBioEditor);
    bioAddBtn?.addEventListener('click',  openBioEditor);
    bioCancelBtn?.addEventListener('click', closeBioEditor);

    bioSaveBtn?.addEventListener('click', async () => {
      if (!bioTextarea || !bioSaveBtn) return;
      const newBio = bioTextarea.value.trim().slice(0, 280) || null;
      bioSaveBtn.disabled = true;
      bioSaveBtn.textContent = 'Saving…';
      try {
        const resp = await fetch('/api/user/bio', {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio: newBio }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed');
        _currentBio = data.bio;
        showBioView(data.bio, true);
        showToast('Bio saved.', 'success', 2500);
      } catch (err) {
        showToast(err.message || 'Failed to save bio.', 'error');
        closeBioEditor();
      } finally {
        bioSaveBtn.disabled = false;
        bioSaveBtn.textContent = 'Save';
      }
    });

    // ── Friend action button ───────────────────────────────────────────────
    const friendActionEl = document.getElementById('profile-friend-action');
    const friendActionBtn = document.getElementById('btn-friend-action');
    let _currentFriendTarget = null;
    let _currentFriendStatus = 'none';

    function renderFriendBtn(status) {
      if (!friendActionBtn) return;
      _currentFriendStatus = status;
      friendActionBtn.dataset.status = status;
      switch (status) {
        case 'none':
          friendActionBtn.textContent = 'Add Friend';
          friendActionBtn.className = 'btn-friend btn-friend--add';
          friendActionBtn.disabled = false;
          break;
        case 'pending_sent':
          friendActionBtn.textContent = 'Request Sent';
          friendActionBtn.className = 'btn-friend btn-friend--pending';
          friendActionBtn.disabled = false;
          break;
        case 'pending_received':
          friendActionBtn.textContent = 'Accept Request';
          friendActionBtn.className = 'btn-friend btn-friend--accept';
          friendActionBtn.disabled = false;
          break;
        case 'friends':
          friendActionBtn.textContent = 'Friends ✓';
          friendActionBtn.className = 'btn-friend btn-friend--friends';
          friendActionBtn.disabled = false;
          break;
        default:
          friendActionBtn.style.display = 'none';
          return;
      }
      friendActionBtn.style.display = '';
    }

    friendActionBtn?.addEventListener('click', async () => {
      if (!_currentFriendTarget || !authState.user) {
        if (!authState.user) {
          showToast('Log in to add friends.', 'info');
          return;
        }
        return;
      }

      try {
        friendActionBtn.disabled = true;
        if (_currentFriendStatus === 'none') {
          const data = await apiFriends('POST', '/request', { username: _currentFriendTarget });
          renderFriendBtn(data.status || 'pending_sent');
          showToast('Friend request sent!', 'success', 2500);
        } else if (_currentFriendStatus === 'pending_sent') {
          // Cancel request
          await apiFriends('DELETE', '/' + encodeURIComponent(_currentFriendTarget));
          renderFriendBtn('none');
          showToast('Request cancelled.', 'info', 2000);
        } else if (_currentFriendStatus === 'pending_received') {
          await apiFriends('POST', '/accept', { username: _currentFriendTarget });
          renderFriendBtn('friends');
          refreshFriendBadge();
          showToast(`You and ${_currentFriendTarget} are now friends!`, 'success', 3000);
        } else if (_currentFriendStatus === 'friends') {
          await apiFriends('DELETE', '/' + encodeURIComponent(_currentFriendTarget));
          renderFriendBtn('none');
          showToast('Removed from friends.', 'info', 2000);
        }
      } catch (err) {
        showToast(err.message || 'Action failed.', 'error');
        friendActionBtn.disabled = false;
      }
    });

    // ── Other user profile ─────────────────────────────────────────────────
    const SELF_ONLY_IDS = [
      'profile-leaderboard-section',
      'profile-friends-section',
    ];
    // Shown for both self and other users (rendered from each profile's own data).
    const SHARED_PROFILE_IDS = [
      'profile-graph-section', 'profile-milestones-section', 'profile-history-section',
    ];
    const OTHER_ONLY_IDS = [
      'profile-pub-collections-section',
    ];

    async function loadOtherProfile(username) {
      // Show self-only sections hidden, other-only visible
      SELF_ONLY_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      OTHER_ONLY_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
      });
      // Hide shared sections until this user's data loads, to avoid flashing stale data.
      SHARED_PROFILE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });

      const guestMsg = document.getElementById('profile-guest-msg');
      if (guestMsg) guestMsg.style.display = 'none';

      if (friendActionEl) friendActionEl.style.display = '';
      _currentFriendTarget = username;
      renderFriendBtn('none');

      // Reset header
      const avatarEl   = document.getElementById('profile-avatar');
      const usernameEl = document.getElementById('profile-username-display');
      const planEl     = document.getElementById('profile-plan-badge-display');
      const joinedEl   = document.getElementById('profile-joined-display');
      const friendCountEl = document.getElementById('profile-friend-count');
      const statsSection  = document.getElementById('profile-stats-section');
      const achievSection = document.getElementById('profile-achievements-section');

      if (usernameEl) usernameEl.textContent = username;
      if (avatarEl) { const sp = document.createElement('span'); sp.textContent = username[0].toUpperCase(); avatarEl.replaceChildren(sp); }
      if (planEl) { planEl.textContent = ''; planEl.className = 'profile-plan-badge'; planEl.style.display = 'none'; }
      if (joinedEl) joinedEl.textContent = '';
      if (friendCountEl) friendCountEl.style.display = 'none';
      if (statsSection) statsSection.style.display = 'none';
      if (achievSection) achievSection.style.display = 'none';
      if (bioSection) bioSection.style.display = 'none';

      const pubColSection = document.getElementById('profile-pub-collections-section');
      if (pubColSection) pubColSection.style.display = 'none';

      try {
        const resp = await fetch('/api/profiles/' + encodeURIComponent(username), { credentials: 'same-origin' });
        if (!resp.ok) {
          if (resp.status === 404) showToast('User not found.', 'error');
          else showToast('Failed to load profile.', 'error');
          if (typeof openProfilePage === 'function') { _profileTarget = null; openProfilePage(); } else switchToPage(_prevPage || 'analysis');
          return;
        }
        const data = await resp.json();

        // Avatar
        if (avatarEl) {
          if (data.user.avatarUrl) {
            const img = document.createElement('img'); img.src = data.user.avatarUrl; img.alt = ''; img.setAttribute('aria-hidden','true');
            avatarEl.replaceChildren(img);
          } else {
            const sp = document.createElement('span'); sp.textContent = (data.user.username || '?')[0].toUpperCase();
            avatarEl.replaceChildren(sp);
          }
        }
        if (usernameEl) usernameEl.textContent = data.user.username;
        if (planEl) {
          const isPaidProfile = data.user.plan === 'pro' || data.user.plan === 'premium';
          planEl.textContent = data.user.plan === 'pro' ? 'Pro' : data.user.plan === 'premium' ? 'Premium' : '';
          planEl.className = 'profile-plan-badge' + (isPaidProfile ? ' badge-premium' : '');
          planEl.style.display = isPaidProfile ? '' : 'none';
        }
        if (joinedEl && data.user.createdAt) {
          const d = new Date(data.user.createdAt * 1000);
          joinedEl.textContent = 'Joined ' + d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        if (friendCountEl && data.user.friendCount > 0) {
          friendCountEl.textContent = `${data.user.friendCount} ${data.user.friendCount === 1 ? 'friend' : 'friends'}`;
          friendCountEl.style.display = '';
        }

        // Bio
        showBioView(data.user.bio, false);

        // Friend action
        renderFriendBtn(data.friendshipStatus === 'self' ? null : data.friendshipStatus);
        if (data.friendshipStatus === 'self') {
          if (friendActionEl) friendActionEl.style.display = 'none';
        }

        // Stats
        if (statsSection && data.stats) {
          statsSection.style.display = '';
          const s = data.stats;
          const accuracy = s.puzzlesAttempted > 0
            ? Math.round((s.puzzlesSolved / s.puzzlesAttempted) * 100) + '%'
            : '—';
          document.getElementById('profile-stat-elo').textContent    = s.puzzleElo !== null ? s.puzzleElo : '?';
          document.getElementById('profile-stat-solved').textContent = s.puzzlesSolved;
          document.getElementById('profile-stat-best-streak').textContent  = s.dailyStreakBest || 0;
          document.getElementById('profile-stat-daily-streak').textContent = '—';
          document.getElementById('profile-stat-accuracy').textContent = accuracy;
        }

        // Rating history, milestones, recent history (rendered from this user's data)
        const helpers = window._profileRenderHelpers || {};
        const graphSection = document.getElementById('profile-graph-section');
        const msSection    = document.getElementById('profile-milestones-section');
        const histSection  = document.getElementById('profile-history-section');
        if (data.stats) {
          if (graphSection) { graphSection.style.display = ''; helpers.loadRatingGraph?.(data.user.createdAt, data.ratingHistory || []); }
          if (msSection)    { msSection.style.display = '';    helpers.renderMilestones?.(data.stats); }
          if (histSection)  { histSection.style.display = '';  helpers.renderRecentHistory?.(data.recentAttempts, false); }
        } else {
          [graphSection, msSection, histSection].forEach(el => { if (el) el.style.display = 'none'; });
        }

        // Achievements
        if (achievSection) {
          achievSection.style.display = data.achievements.length > 0 ? '' : 'none';
          const grid     = document.getElementById('profile-achievements-grid');
          const countEl  = document.getElementById('profile-achiev-count');
          if (countEl) countEl.textContent = '';
          if (grid) {
            grid.innerHTML = data.achievements.map(a =>
              `<div class="profile-achiev-card earned rarity-${escHtml(a.rarity || 'common')}" title="${escHtml(a.desc || '')}">
                <div class="profile-achiev-icon">${renderAchievIcon(a.icon || '')}</div>
                <div>
                  <div class="profile-achiev-name">${escHtml(a.name || '')}</div>
                  <div class="profile-achiev-desc">${escHtml(a.desc || '')}</div>
                </div>
              </div>`
            ).join('');
            setupAchievExpand(grid, document.getElementById('btn-achievements-toggle'));
          }
        }

        // Public collections
        if (pubColSection) {
          if (data.collections.length > 0) {
            pubColSection.style.display = '';
            const listEl = document.getElementById('pub-collections-list');
            if (listEl) {
              listEl.innerHTML = data.collections.map(c =>
                `<div class="pub-coll-card">
                  <div class="pub-coll-name">${escHtml(c.name)}</div>
                  ${c.description ? `<div class="pub-coll-desc">${escHtml(c.description)}</div>` : ''}
                </div>`
              ).join('');
            }
          }
        }

      } catch (err) {
        console.error('[loadOtherProfile]', err);
        showToast('Failed to load profile.', 'error');
      }
    }

    window._loadOtherProfile = loadOtherProfile;

    // ── Self profile: reset sections when entering self mode ───────────────
    const origLoadProfilePage = window._loadProfilePage;
    window._loadProfilePage = async function() {
      // Restore self-only sections, hide other-only
      SELF_ONLY_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
      });
      OTHER_ONLY_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      if (friendActionEl) friendActionEl.style.display = 'none';
      _currentFriendTarget = null;

      if (origLoadProfilePage) await origLoadProfilePage();

      // Bio for self
      if (authState.user) {
        try {
          const resp = await fetch('/api/puzzles/profile', { credentials: 'same-origin' });
          if (resp.ok) {
            const data = await resp.json();
            showBioView(data.user.bio || null, true);
          }
        } catch {}
        // Friends section
        loadFriendsSection();
      }
    };

    // ── Friends section (self profile) ─────────────────────────────────────
    const friendsSection     = document.getElementById('profile-friends-section');
    const friendsList        = document.getElementById('friends-list');
    const friendsEmpty       = document.getElementById('friends-empty');
    const friendRequestsWrap = document.getElementById('friend-requests-wrap');
    const friendRequestsList = document.getElementById('friend-requests-list');

    async function loadFriendsSection() {
      if (!friendsSection || !authState.user) return;
      friendsSection.style.display = '';

      try {
        const [friendsData, requestsData] = await Promise.all([
          apiFriends('GET', '/'),
          apiFriends('GET', '/requests'),
        ]);

        // Pending received requests
        const received = requestsData.received || [];
        if (friendRequestsWrap && friendRequestsList) {
          if (received.length > 0) {
            friendRequestsWrap.style.display = '';
            friendRequestsList.innerHTML = received.map(r =>
              `<div class="friend-request-card" data-username="${escHtml(r.username)}">
                <div class="friend-request-avatar">${r.avatarUrl ? `<img src="${escHtml(r.avatarUrl)}" alt="" aria-hidden="true">` : escHtml((r.username || '?')[0].toUpperCase())}</div>
                <div class="friend-request-info">
                  <button class="friend-request-name" data-open-profile="${escHtml(r.username)}">${escHtml(r.username)}</button>
                </div>
                <div class="friend-request-btns">
                  <button class="btn-friend-req-accept" data-username="${escHtml(r.username)}" title="Accept">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    Accept
                  </button>
                  <button class="btn-friend-req-decline" data-username="${escHtml(r.username)}" title="Decline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Decline
                  </button>
                </div>
              </div>`
            ).join('');
          } else {
            friendRequestsWrap.style.display = 'none';
          }
        }

        // Friends list
        const friends = friendsData.friends || [];
        if (friendsList) {
          if (friends.length === 0) {
            friendsList.innerHTML = '';
            if (friendsEmpty) friendsEmpty.style.display = '';
          } else {
            if (friendsEmpty) friendsEmpty.style.display = 'none';
            friendsList.innerHTML = friends.map(f =>
              `<div class="friend-card" data-username="${escHtml(f.username)}" role="button" tabindex="0" aria-label="View ${escHtml(f.username)}'s profile">
                <div class="friend-card-avatar">${f.avatarUrl ? `<img src="${escHtml(f.avatarUrl)}" alt="" aria-hidden="true">` : escHtml((f.username || '?')[0].toUpperCase())}</div>
                <div class="friend-card-info">
                  <div class="friend-card-name">${escHtml(f.username)}</div>
                  ${f.puzzleElo ? `<div class="friend-card-elo">${f.puzzleElo} Rating</div>` : ''}
                  ${f.bio ? `<div class="friend-card-bio">${escHtml(f.bio.slice(0, 60))}${f.bio.length > 60 ? '…' : ''}</div>` : ''}
                </div>
                <button class="friend-card-remove" data-remove="${escHtml(f.username)}" title="Remove friend" aria-label="Remove ${escHtml(f.username)} from friends">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>`
            ).join('');
          }
        }

        // Update badge
        refreshFriendBadge();

      } catch (err) {
        console.error('[loadFriendsSection]', err);
      }
    }

    // Friends section event delegation
    document.getElementById('profile-friends-section')?.addEventListener('click', async e => {
      // Accept request
      const acceptBtn = e.target.closest('.btn-friend-req-accept');
      if (acceptBtn) {
        const username = acceptBtn.dataset.username;
        acceptBtn.disabled = true;
        try {
          await apiFriends('POST', '/accept', { username });
          showToast(`You and ${username} are now friends!`, 'success', 3000);
          loadFriendsSection();
        } catch (err) { showToast(err.message, 'error'); acceptBtn.disabled = false; }
        return;
      }

      // Decline request
      const declineBtn = e.target.closest('.btn-friend-req-decline');
      if (declineBtn) {
        const username = declineBtn.dataset.username;
        declineBtn.disabled = true;
        try {
          await apiFriends('DELETE', '/' + encodeURIComponent(username));
          loadFriendsSection();
        } catch (err) { showToast(err.message, 'error'); declineBtn.disabled = false; }
        return;
      }

      // Remove friend
      const removeBtn = e.target.closest('.friend-card-remove');
      if (removeBtn) {
        const username = removeBtn.dataset.remove;
        if (!confirm(`Remove ${username} from your friends?`)) return;
        try {
          await apiFriends('DELETE', '/' + encodeURIComponent(username));
          showToast('Friend removed.', 'info', 2000);
          loadFriendsSection();
        } catch (err) { showToast(err.message, 'error'); }
        return;
      }

      // Open profile name link
      const nameBtn = e.target.closest('[data-open-profile]');
      if (nameBtn) { openUserProfile(nameBtn.dataset.openProfile); return; }

      // Click on friend card → view profile
      const friendCard = e.target.closest('.friend-card');
      if (friendCard && !e.target.closest('.friend-card-remove')) {
        openUserProfile(friendCard.dataset.username);
      }
    });

    document.getElementById('profile-friends-section')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.friend-card');
        if (card) { e.preventDefault(); openUserProfile(card.dataset.username); }
      }
    });

    // ── Find Players search modal ──────────────────────────────────────────
    const searchModal   = document.getElementById('user-search-modal');
    const searchInput   = document.getElementById('user-search-input');
    const searchResults = document.getElementById('user-search-results');

    function openSearchModal() {
      if (!searchModal) return;
      searchModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput?.focus(), 50);
    }

    function closeSearchModal() {
      if (!searchModal) return;
      searchModal.style.display = 'none';
      document.body.style.overflow = '';
      if (searchInput)   searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '';
    }

    document.getElementById('btn-find-players')?.addEventListener('click', openSearchModal);
    document.getElementById('btn-search-modal-close')?.addEventListener('click', closeSearchModal);
    searchModal?.addEventListener('click', e => { if (e.target === searchModal) closeSearchModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && searchModal?.style.display !== 'none') closeSearchModal(); });

    let _searchTimeout = null;
    searchInput?.addEventListener('input', () => {
      clearTimeout(_searchTimeout);
      const q = searchInput.value.trim();
      if (!q) { if (searchResults) searchResults.innerHTML = ''; return; }
      if (searchResults) searchResults.innerHTML = '<div class="search-result-loading">Searching…</div>';
      _searchTimeout = setTimeout(() => doSearch(q), 280);
    });

    async function doSearch(q) {
      try {
        const resp = await fetch('/api/profiles/search?q=' + encodeURIComponent(q), { credentials: 'same-origin' });
        const data = await resp.json();
        if (!searchResults) return;
        if (!data.users || data.users.length === 0) {
          searchResults.innerHTML = '<div class="search-result-empty">No players found.</div>';
          return;
        }
        searchResults.innerHTML = data.users.map(u => {
          const statusMap = {
            self: '',
            friends: '<span class="search-result-badge search-result-badge--friends">Friends</span>',
            pending_sent: '<span class="search-result-badge search-result-badge--pending">Request sent</span>',
            pending_received: '<span class="search-result-badge search-result-badge--received">Wants to connect</span>',
          };
          const badge = statusMap[u.friendshipStatus] || '';
          return `<div class="search-result-item" data-username="${escHtml(u.username)}" role="button" tabindex="0">
            <div class="search-result-avatar">${u.avatarUrl ? `<img src="${escHtml(u.avatarUrl)}" alt="" aria-hidden="true">` : escHtml((u.username || '?')[0].toUpperCase())}</div>
            <div class="search-result-info">
              <div class="search-result-name">${escHtml(u.username)}</div>
              ${u.puzzleElo ? `<div class="search-result-elo">${u.puzzleElo} Rating</div>` : ''}
            </div>
            ${badge}
          </div>`;
        }).join('');
      } catch {
        if (searchResults) searchResults.innerHTML = '<div class="search-result-empty">Search failed.</div>';
      }
    }

    searchResults?.addEventListener('click', e => {
      const item = e.target.closest('.search-result-item');
      if (!item) return;
      const username = item.dataset.username;
      closeSearchModal();
      openUserProfile(username);
    });
    searchResults?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.search-result-item');
        if (item) { e.preventDefault(); closeSearchModal(); openUserProfile(item.dataset.username); }
      }
    });

  })();  // end initSocialFeatures

// ── Game share modal ───────────────────────────────────────────────────────
(function initShareModal() {
  const modal       = document.getElementById('share-game-modal');
  const loadingEl   = document.getElementById('share-loading');
  const linkRowEl   = document.getElementById('share-link-row');
  const linkInput   = document.getElementById('share-link-input');
  const linkDisplay = document.getElementById('share-link-display');
  const errorEl     = document.getElementById('share-error');
  const copyBtn     = document.getElementById('btn-share-copy');
  const closeBtn    = document.getElementById('btn-share-modal-close');
  const plyRow      = document.getElementById('share-ply-row');
  const plyCheck    = document.getElementById('share-ply-check');

  let _pendingPly = null;
  let _pendingShowCard = false;

  function setShareUrl(url) {
    if (linkInput)   { linkInput.value = url; }
    if (linkDisplay) { linkDisplay.href = url; linkDisplay.textContent = url; }
  }

  // Build the share URL from a base origin/token, adding query params for the
  // (optional) starting ply and the "show result card on open" flag.
  function buildShareUrl(base) {
    const params = new URLSearchParams();
    if (_pendingPly !== null && plyCheck?.checked) params.set('ply', _pendingPly);
    if (_pendingShowCard) params.set('card', '1');
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function openShareModal(currentPly, showCard) {
    if (!modal) return;
    _pendingShowCard = !!showCard;
    _pendingPly = (typeof currentPly === 'number' && currentPly > 0) ? currentPly : null;
    if (plyRow)    { plyRow.style.display = _pendingPly !== null ? '' : 'none'; }
    if (plyCheck)  { plyCheck.checked = false; }
    if (loadingEl) { loadingEl.style.display = ''; }
    if (linkRowEl) { linkRowEl.style.display  = 'none'; }
    if (errorEl)   { errorEl.style.display    = 'none'; errorEl.textContent = ''; }
    setShareUrl('');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeShareModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeShareModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.style.display !== 'none') closeShareModal();
  });

  copyBtn?.addEventListener('click', () => {
    const url = linkInput?.value;
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { if (copyBtn) copyBtn.textContent = orig; }, 2000);
      })
      .catch(() => showToast('Copy failed. Please select and copy manually.', 'error'));
  });

  plyCheck?.addEventListener('change', () => {
    if (!linkInput?.value) return;
    setShareUrl(buildShareUrl(linkInput.value.split('?')[0]));
  });

  async function shareGameData(gameData, opts) {
    const currentPly = opts?.currentPly ?? null;
    openShareModal(currentPly, opts?.showCard);
    try {
      const resp = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || 'Failed to create share link');
      setShareUrl(buildShareUrl(`${window.location.origin}/share/${data.token}`));
      if (loadingEl) { loadingEl.style.display = 'none'; }
      if (linkRowEl) { linkRowEl.style.display  = ''; }
    } catch (err) {
      if (loadingEl) { loadingEl.style.display = 'none'; }
      if (errorEl)   { errorEl.textContent = err.message || 'Failed to create share link.'; errorEl.style.display = ''; }
    }
  }

  window._shareGameData = shareGameData;

  // Analysis tab share button
  document.getElementById('btn-share-analysis-game')?.addEventListener('click', () => {
    if (!state.root || state.root.children.length === 0) { showToast('No moves to share.', 'info'); return; }
    const mainLineNodes = [];
    let n = state.root;
    while (n.children.length > 0) { n = n.children[0]; mainLineNodes.push(n); }
    const pgn = generatePgnToNode(mainLineNodes[mainLineNodes.length - 1]);
    if (!pgn) { showToast('No moves to share.', 'info'); return; }
    let depth = 0, cur = state.currentNode;
    while (cur && cur.parent) { depth++; cur = cur.parent; }
    shareGameData({
      title:        state.gameTitle || null,
      pgn,
      treeData:     serializeTree(state.root),
      analysis:     _lastAnalysisData || null,
    }, { currentPly: depth });
  });
})();

// ── Detect /share/:token path and load shared game ─────────────────────────
{
  const _shareMatch = window.location.pathname.match(/^\/share\/([a-f0-9]{20})$/);
  if (_shareMatch) {
    const _shareToken = _shareMatch[1];
    const _shareParams = new URLSearchParams(window.location.search);
    const _sharePly = parseInt(_shareParams.get('ply'), 10) || 0;
    const _shareShowCard = _shareParams.get('card') === '1';
    switchToPage('analysis');
    try { history.replaceState({ page: 'analysis' }, '', '/app#analysis'); } catch(e) {}
    setTimeout(async () => {
      try {
        const resp = await fetch(`/api/share/${_shareToken}`);
        if (!resp.ok) { showToast('Share link not found or expired.', 'error'); return; }
        const { game } = await resp.json();
        if (!game || !game.pgn) { showToast('Invalid share data.', 'error'); return; }
        confirmIfUnsaved(() => {
          if (game.treeData) {
            restoreFromTreeData(game.treeData);
          } else {
            document.getElementById('pgn-input').value = game.pgn;
            importPGN();
            if (game.analysis && Array.isArray(game.analysis.moves) && game.analysis.moves.length > 0 && state.root) {
              applyAnalysisToTree(state.root, game.analysis.moves);
              updateUI();
            }
            if (game.nodeComments && game.nodeComments.length > 0 && state.root) {
              applyNodeCommentsToTree(state.root, game.nodeComments);
              updateUI();
            }
          }
          if (game.title) setGameTitle(game.title);
          markClean();
          // Navigate to the shared position so the full board state — comment,
          // Q&A thread, drawings and move highlights — renders immediately,
          // instead of only after the user steps through moves. When no ply is
          // given, re-navigate to the current node (end of the main line that
          // import/restore left us on) to force that same full render.
          const target = _sharePly > 0 && state.root
            ? _mainlineNodeAtPly(state.root, _sharePly)
            : state.currentNode;
          if (target) navigateTo(target);
          showToast(`Viewing shared game: ${game.title || 'Untitled'}`, 'success', 4000);
          // When the link was shared from the result card, open it first so the
          // recipient lands on the game summary before stepping through moves.
          if (_shareShowCard && game.analysis &&
              Array.isArray(game.analysis.moves) && game.analysis.moves.length > 0) {
            setTimeout(() => showGameInsightsModal(game.analysis), 250);
          }
        });
      } catch {
        showToast('Failed to load shared game.', 'error');
      }
    }, 150);
  }
}

// ── Piece drag halo ────────────────────────────────────────────────────────
(function initDragHalo() {
  const halo = document.createElement('div');
  halo.id = 'piece-drag-halo';
  document.body.appendChild(halo);

  let active = false;

  function squareSize() {
    const sq = document.querySelector('.square-55d63');
    return sq ? sq.offsetWidth : 60;
  }

  document.addEventListener('pointerdown', function(e) {
    if (e.pointerType !== 'touch') return;
    if (!e.target.classList.contains('piece-417db')) return;
    if (!e.target.closest('.square-55d63')) return;
    active = true;
    const sz = Math.round(squareSize() * 1.65);
    halo.style.width = sz + 'px';
    halo.style.height = sz + 'px';
    halo.style.left = e.clientX + 'px';
    halo.style.top = e.clientY + 'px';
    halo.style.display = 'block';
  }, { capture: true });

  document.addEventListener('pointermove', function(e) {
    if (!active) return;
    halo.style.left = e.clientX + 'px';
    halo.style.top = e.clientY + 'px';
  });

  function end() {
    if (!active) return;
    active = false;
    halo.style.display = 'none';
  }

  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
})();

});  // end DOMContentLoaded
