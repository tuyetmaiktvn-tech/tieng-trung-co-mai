(() => {
  const focusId = new URLSearchParams(location.search).get("focus");
  if (!focusId) return;

  let attempts = 0;
  function showFocusedSection() {
    const target = document.getElementById(focusId);
    if (!target && attempts++ < 120) {
      requestAnimationFrame(showFocusedSection);
      return;
    }
    if (!target) return;

    document.body.classList.add("section-focus-mode");
    document.querySelectorAll("main section").forEach(section => {
      section.hidden = section !== target && !section.contains(target);
    });
    document.querySelectorAll(".hero,.lesson-nav,.lesson-sticky-nav-v32").forEach(element => {
      element.hidden = true;
    });
    target.hidden = false;
    target.scrollIntoView({block:"start"});
  }

  showFocusedSection();
})();
