/**
 * Fallback for browsers without CSS `sibling-index()` (Chrome < 138, Safari < 26.2,
 * Firefox < 154). Mirrors the `order` rules in app/(frontend)/mobile-interleave.css,
 * which stay the single source of truth for the pattern (--interleave-lead/-gap).
 *
 * Rendered as a tiny inline script: modern browsers bail out on the first line
 * (no request, no bundle, no hydration cost); old ones set inline `order` on the
 * mobile layout and keep it in sync when items are added (infinite scroll,
 * client navigation, CMS-driven sidebar changes).
 */
const SCRIPT = `
(function () {
  if (window.CSS && CSS.supports && CSS.supports('order: sibling-index()')) return;
  var shell = document.querySelector('.layout-shell');
  if (!shell || !window.matchMedia) return;
  var mq = window.matchMedia('(max-width: 47.99rem)');
  var END = 2147483647;
  var queued = false;

  function items(parent, skip) {
    var list = [];
    for (var i = skip; i < parent.children.length; i++) {
      var el = parent.children[i];
      if (el.hasAttribute('data-interleave-end')) el.style.order = mq.matches ? END : '';
      else list.push(el);
    }
    return list;
  }

  function apply() {
    queued = false;
    var root = shell.querySelector('[data-mobile-interleave]');
    var aside = shell.querySelector('.layout-aside-items');
    var enabled = mq.matches && root;
    var cs = getComputedStyle(shell);
    var lead = parseInt(cs.getPropertyValue('--interleave-lead'), 10) || 2;
    var gap = parseInt(cs.getPropertyValue('--interleave-gap'), 10) || 1;
    var skip = root ? parseInt(root.style.getPropertyValue('--interleave-skip'), 10) || 0 : 0;

    var main = root ? items(root, skip) : [];
    var side = aside ? items(aside, 0) : [];

    main.forEach(function (el, idx) {
      var n = idx + 1;
      var before = Math.max(0, Math.floor((n - lead - 1) / gap) + 1);
      el.style.order = enabled ? n + before : '';
    });
    side.forEach(function (el, idx) {
      el.style.order = enabled ? lead + idx * (gap + 1) + 1 : '';
    });
    // Sentinels outside the root (e.g. the shorts listing's) stay last too.
    shell.querySelectorAll('[data-interleave-end]').forEach(function (el) {
      el.style.order = enabled ? END : '';
    });
  }

  function schedule() {
    if (queued) return;
    queued = true;
    setTimeout(apply, 0);
  }

  new MutationObserver(schedule).observe(shell, { childList: true, subtree: true });
  if (mq.addEventListener) mq.addEventListener('change', schedule);
  else if (mq.addListener) mq.addListener(schedule);
  apply();
})();
`;

export default function MobileInterleaveFallback() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
