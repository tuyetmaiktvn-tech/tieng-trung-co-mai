(() => {
  function applyUnifiedLogo() {
    let brand = document.querySelector('a.brand[href="../index.html"]');
    const isInserted = !brand;
    if (!brand) {
      brand = document.createElement("a");
      brand.href = "../index.html";
      brand.className = "tcm-lesson-home";
      document.body.prepend(brand);
    }
    brand.setAttribute("aria-label", "Tiếng Trung Cô Mai – về trang chủ");
    brand.innerHTML = '<span class="tcm-unified-logo">梅</span>';

    const style = document.createElement("style");
    style.textContent = `
      .tcm-unified-logo{
        width:68px;height:68px;border-radius:50%;display:grid;place-items:center;
        color:#fff;background:linear-gradient(145deg,#d97845,#bf5f32);
        box-shadow:0 12px 28px rgba(191,95,50,.24);
        font:800 42px/1 "Microsoft YaHei","Noto Sans SC",sans-serif;
      }
      .tcm-lesson-home{position:absolute;left:24px;top:22px;z-index:90;text-decoration:none}
      @media(max-width:680px){
        .tcm-unified-logo{width:58px;height:58px;font-size:35px}
        .tcm-lesson-home{left:14px;top:14px}
      }
    `;
    document.head.appendChild(style);
    if (!isInserted) brand.style.fontSize = "0";
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
