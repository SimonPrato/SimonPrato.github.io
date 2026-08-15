// Runs synchronously in <head> — sets theme before first paint to prevent FOUC
(function () {
  // Signal that JS is running (landing page keeps .reveal content visible without JS)
  document.documentElement.classList.remove('no-js');
  var saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch (e) {}
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

// Wires up the settings checkbox and mobile drawer button once the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  var checkbox = document.getElementById('toggle-light-mode');
  var drawerBtn = document.getElementById('btn-drawer-theme');
  var root = document.documentElement;

  function isLight() {
    return root.hasAttribute('data-theme');
  }

  function apply(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    if (checkbox) checkbox.checked = theme === 'light';
  }

  function toggle() {
    var next = isLight() ? 'dark' : 'light';
    try { localStorage.setItem('theme', next); } catch (e) {}
    apply(next);
  }

  var saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch (e) {}
  apply(saved);

  if (checkbox) {
    checkbox.addEventListener('change', function () {
      var next = checkbox.checked ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      apply(next);
    });
  }

  if (drawerBtn) drawerBtn.addEventListener('click', toggle);
});
