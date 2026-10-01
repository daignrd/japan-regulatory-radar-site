// Brief pages: point at a claim and its Japanese passage lights up beside it.
// Without this script the numbered links still jump to each passage.
(() => {
  const pane = document.querySelector(".evidence");
  if (!pane) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const passages = new Map(
    [...pane.querySelectorAll(".passage")].map((el) => [el.dataset.passage, el]),
  );
  const claims = [...document.querySelectorAll(".claim")].filter((el) => el.dataset.passage);
  let active = null;
  pane.dataset.enhanced = "";

  // The pane only scrolls on its own when it sits beside the brief (wide screens).
  const paneScrolls = () =>
    getComputedStyle(pane).position === "sticky" && pane.scrollHeight > pane.clientHeight + 1;

  // Scroll the pane, never the page, until the passage sits in the part of the pane on screen.
  const reveal = (el) => {
    const box = pane.getBoundingClientRect();
    const top = Math.max(box.top, 0) + 12;
    const bottom = Math.min(box.bottom, window.innerHeight) - 12;
    const rect = el.getBoundingClientRect();
    if (rect.top >= top && rect.bottom <= bottom) return;
    pane.scrollBy({ top: rect.top - top, behavior: reduce.matches ? "auto" : "smooth" });
  };

  const show = (number, scroll = true) => {
    if (!passages.has(number)) return;
    if (number !== active) {
      active = number;
      for (const claim of claims) claim.toggleAttribute("data-active", claim.dataset.passage === number);
      for (const [key, el] of passages) el.toggleAttribute("data-active", key === number);
    }
    if (scroll && paneScrolls()) reveal(passages.get(number));
  };

  for (const claim of claims) {
    claim.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") show(claim.dataset.passage);
    });
    claim.addEventListener("focusin", () => show(claim.dataset.passage));
  }
  for (const [number, el] of passages) {
    el.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") show(number, false);
    });
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a.mark[href^="#p"]');
    if (!link) return;
    const number = link.getAttribute("href").slice(2);
    if (!paneScrolls()) {
      show(number, false);
      return;
    }
    event.preventDefault();
    show(number);
    history.replaceState(null, "", `#p${number}`);
    passages.get(number)?.focus({ preventScroll: true });
  });

  const fromHash = location.hash.match(/^#p(\d+)$/);
  if (fromHash) show(fromHash[1]);
})();
