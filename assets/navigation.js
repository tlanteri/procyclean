(function initializeGlobalNavigation() {
  const script = document.currentScript;
  const root = script?.dataset.root || "./";
  const currentSection = script?.dataset.section || "";
  const mobileBackground = document.createElement("div");
  mobileBackground.className = "site-mobile-background";
  mobileBackground.setAttribute("aria-hidden", "true");
  document.body.prepend(mobileBackground);
  const currentPath = window.location.pathname.replace(/\/+/g, "/");
  const isActivitiesCatalog =
    /\/activites\/(?:individuel\/)?(?:index\.html)?$/.test(currentPath);
  const isActivityPage =
    currentPath.includes("/activites/") && !isActivitiesCatalog;

  if (!document.querySelector(".institutional-header, .brand-logos")) {
    const brandLogos = document.createElement("header");
    brandLogos.className = "brand-logos";
    brandLogos.setAttribute("aria-label", "Partenaires du projet");
    brandLogos.innerHTML = `
      <img src="${root}assets/images/logo-ffc.png"
        alt="Fédération Française de Cyclisme">
      <img src="${root}assets/images/Logo_UCA.png"
        alt="Université Côte d’Azur">
      <img src="${root}assets/images/logo-procyclean.png"
        alt="PRO-CYCLEAN">
      <img src="${root}assets/images/logo-lamhess-blanc.png"
        alt="Laboratoire LAMHESS">
    `;
    document.body.prepend(brandLogos);
  }

  if (isActivityPage) {
    document.body.classList.add("activity-page");
    const main = document.querySelector("main");
    if (main && !main.querySelector(":scope > .activity-return-link")) {
      const individualActivity =
        currentPath.includes("/activites/individuel/");
      const returnLink = document.createElement("a");
      returnLink.className = "activity-return-link";
      returnLink.href = individualActivity
        ? `${root}activites/individuel/index.html`
        : `${root}activites/index.html`;
      returnLink.textContent = "← Retour";
      main.prepend(returnLink);

      main.querySelectorAll("a").forEach((link) => {
        if (
          link !== returnLink &&
          !link.closest(".global-navigation") &&
          /^←?\s*retour\b/i.test(link.textContent.trim())
        ) {
          link.remove();
        }
      });
    }
  }

  if (currentPath.includes("/activites/individuel/") && isActivityPage) {
    document.body.classList.add("individual-activity-page");
    const main = document.querySelector("main");
    if (main && !main.querySelector(":scope > .activity-overall-progress")) {
      const progress = document.createElement("div");
      progress.className = "activity-overall-progress";
      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-label", "Progression dans l’activité");
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.innerHTML = '<span class="activity-overall-progress-bar"></span>';

      const activityHeader = main.querySelector(":scope > .activity-header");
      if (activityHeader) activityHeader.after(progress);
      else {
        const returnLink = main.querySelector(":scope > .activity-return-link");
        if (returnLink) returnLink.after(progress);
        else main.prepend(progress);
      }

      let lastValue = 4;
      let externallyManaged = false;
      let updateQueued = false;
      const isVisible = (element) => {
        if (!element || element.closest("[hidden]")) return false;
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      };
      const setProgress = (value) => {
        const safeValue = Math.max(4, Math.min(100, Math.round(value)));
        lastValue = Math.max(lastValue, safeValue);
        progress.setAttribute("aria-valuenow", String(lastValue));
        progress.querySelector(".activity-overall-progress-bar").style.width =
          `${lastValue}%`;
        progress.classList.toggle("complete", lastValue === 100);
      };
      const readProgress = () => {
        if (externallyManaged) return setProgress(lastValue);
        const completed = [
          "#final", "#activity-final", "#completed", "#completed-screen",
          "#conclusion", "#closed-screen", "#end-screen", "#final-guidance-screen"
        ].some((selector) => isVisible(document.querySelector(selector)));
        if (completed) return setProgress(100);

        const bars = [...document.querySelectorAll(
          "#progress-bar, #medication-progress, .progress-track > span, .progress > span, .quiz-progress > span"
        )].filter((bar) => !bar.closest(".activity-overall-progress") && isVisible(bar));
        for (const bar of bars) {
          const value = Number.parseFloat(bar.style.width);
          if (Number.isFinite(value) && value > 0) return setProgress(value);
        }

        const visibleSections = [...main.querySelectorAll("section[id]")].filter(isVisible);
        const visibleText = visibleSections.map((section) => section.textContent).join(" ");
        const fractions = [...visibleText.matchAll(/(\d+)\s*(?:\/|sur)\s*(\d+)/gi)]
          .map((match) => [Number(match[1]), Number(match[2])])
          .filter(([, total]) => total > 1);
        if (fractions.length) {
          const [current, total] = fractions[0];
          return setProgress((current / total) * 92);
        }

        const allSections = [...main.querySelectorAll(":scope > section[id]")];
        const activeIndex = allSections.findIndex(isVisible);
        if (activeIndex >= 0 && allSections.length > 1) {
          return setProgress(5 + (activeIndex / (allSections.length - 1)) * 90);
        }
        setProgress(lastValue);
      };
      const queueUpdate = () => {
        if (updateQueued) return;
        updateQueued = true;
        window.requestAnimationFrame(() => {
          updateQueued = false;
          readProgress();
        });
      };
      new MutationObserver(queueUpdate).observe(main, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ["hidden", "style", "class"]
      });
      window.addEventListener("procyclean:activity-progress", (event) => {
        const value = Number(event.detail?.value);
        if (!Number.isFinite(value)) return;
        externallyManaged = true;
        setProgress(value);
      });
      main.addEventListener("click", (event) => {
        if (event.target.closest("#restart, [id^='restart-'], [data-action='restart']")) {
          lastValue = 4;
          externallyManaged = false;
          progress.querySelector(".activity-overall-progress-bar").style.width = "4%";
          window.setTimeout(queueUpdate, 0);
        }
      });
      window.addEventListener("load", queueUpdate);
      queueUpdate();
    }
  }

  const passivePanelSelector = [
    ".destination-card", ".audience-card", ".resource-document",
    ".screen", ".panel", ".journey-panel", ".game-panel", ".quiz-shell",
    ".scenario-card", ".case", ".notice", ".explanation-card",
    ".guidance-card", ".take-home-card", ".reflex-card", ".criterion",
    ".match-card", ".feedback", ".summary-list article", ".final-points p",
    ".final-grid section", ".summary p", ".result-summary > div",
    ".session-summary article", ".category-results article",
    ".comparison article", ".lock-feedback article", ".source-feedback",
    ".definition-result", ".nuance", ".warning", ".final-message",
    ".take-home", ".discovery", ".resource-document"
  ].join(",");
  let decorationQueued = false;
  function decoratePassivePanels() {
    decorationQueued = false;
    document.querySelectorAll(passivePanelSelector).forEach((panel, index) => {
      const containsAction = Boolean(panel.querySelector(
        "button, a, input, select, textarea, [role='button']"
      ));
      panel.classList.toggle("passive-color-shapes", !containsAction && !isActivityPage);
      panel.dataset.shapeColor = String((index % 4) + 1);
    });
  }
  function queuePanelDecoration() {
    if (decorationQueued) return;
    decorationQueued = true;
    window.requestAnimationFrame(decoratePassivePanels);
  }
  new MutationObserver(queuePanelDecoration).observe(document.body, {
    subtree: true,
    childList: true
  });
  queuePanelDecoration();

  const links = [
    ["home", "Accueil", `${root}index.html`],
    ["activities", "Activités", `${root}activites/index.html`],
    ["resources", "Ressources pédagogiques", `${root}ressources-pedagogiques/index.html`],
    ["share", "Partager l’application", `${root}partager/index.html`]
  ];
  const linkMarkup = links.map(([id, label, href]) =>
    `<a href="${href}" ${currentSection === id ? 'aria-current="page"' : ""}>${label}</a>`
  ).join("");
  const topbar = document.createElement("div");
  topbar.className = "topbar global-topbar";
  topbar.innerHTML = `
    <a class="wordmark" href="${root}index.html" aria-label="PRO-CYCLEAN, accueil">
      <img src="${root}assets/images/logo-procyclean.png" alt="">
      <span class="wordmark-copy">PRO-CYCLEAN<span>Le cyclisme, avec les bons réflexes.</span></span>
    </a>
    <nav class="desktop-nav" aria-label="Navigation principale">${linkMarkup}</nav>
    <details class="mobile-menu"><summary>Menu <span aria-hidden="true">☰</span></summary>
      <nav aria-label="Navigation mobile">${linkMarkup}</nav>
    </details>`;
  document.body.prepend(topbar);
  document.body.classList.add("has-topbar");
  const menu = topbar.querySelector(".mobile-menu");
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) menu.open = false;
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
  if (!document.querySelector("footer")) {
    const siteFooter = document.createElement("footer");
    siteFooter.className = "global-site-footer";

    const footerMessage = document.createElement("p");
    footerMessage.textContent =
      "Rouler fort, rester sain, s'engager pour demain";

    siteFooter.append(footerMessage);
    document.body.append(siteFooter);
  }

})();
