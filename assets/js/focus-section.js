(() => {
  const logoUrl = new URL('../images/mai-logo-circle.png?v=6', document.currentScript.src).href;
  function applyUnifiedLogo() {
    // Static headers already use the shared logo. Do not insert a duplicate.
    if (document.querySelector('.tcm-unified-logo, .logo-mark img')) return;
    let brand = document.querySelector('a.brand');
    if (!brand) {
      brand = document.createElement('a');
      brand.href = new URL('../../index.html', logoUrl).href;
      brand.className = 'tcm-lesson-home';
      document.body.prepend(brand);
    }
    brand.classList.add('tcm-brand');
    brand.setAttribute('aria-label', 'Tiếng Trung Cô Mai');
    const image = document.createElement('img');
    image.className = 'tcm-unified-logo';
    image.src = logoUrl;
    image.alt = 'Tiếng Trung Cô Mai';
    image.width = image.height = 64;
    brand.replaceChildren(image);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyUnifiedLogo, {once:true});
  } else {
    applyUnifiedLogo();
  }

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
