(function initializeGlobalNavigation() {
  const script = document.currentScript;
  const root = script?.dataset.root || "./";
  const currentSection = script?.dataset.section || "";
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
      <img src="${root}assets/images/logo-procyclean.png"
        alt="PRO-CYCLEAN">
      <img src="${root}assets/images/logo-lamhess-blanc.png"
        alt="Laboratoire LAMHESS">
    `;
    document.body.prepend(brandLogos);
  }

  if (isActivityPage) {
    const main = document.querySelector("main");
    if (main && !main.querySelector(":scope > .activity-return-link")) {
      const individualActivity =
        currentPath.includes("/activites/individuel/");
      const returnLink = document.createElement("a");
      returnLink.className = "activity-return-link";
      returnLink.href = individualActivity
        ? `${root}activites/individuel/index.html`
        : `${root}activites/index.html`;
      returnLink.textContent = "← Revenir aux activités";
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

  const menuButton = document.createElement("button");
  menuButton.className = "global-menu-button";
  menuButton.type = "button";
  menuButton.setAttribute("aria-label", "Ouvrir le menu principal");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "☰";

  const overlay = document.createElement("div");
  overlay.className = "global-menu-overlay";

  const drawer = document.createElement("aside");
  drawer.className = "global-navigation";
  drawer.setAttribute("aria-label", "Navigation principale");
  drawer.setAttribute("aria-hidden", "true");

  const links = [
    ["home", "🏠", "Accueil", `${root}index.html`],
    ["activities", "⚡", "Activités", `${root}activites/index.html`],
    [
      "resources",
      "📖",
      "Ressources pédagogiques",
      `${root}ressources-pedagogiques/index.html`
    ],
    [
      "share",
      "📤",
      "Partager l’application",
      `${root}partager/index.html`
    ]
  ];

  drawer.innerHTML = `
    <div class="global-menu-header">
      <span class="global-menu-brand">
        <img src="${root}assets/images/logo-procyclean.png" alt="">
        <span>PRO-CYCLEAN</span>
      </span>
      <button class="global-menu-close" type="button"
        aria-label="Fermer le menu">×</button>
    </div>
    <nav>
      ${links.map(([id, icon, label, href]) => `
        <a href="${href}" ${currentSection === id ? 'aria-current="page"' : ""}>
          <span class="menu-icon" aria-hidden="true">${icon}</span>
          <span>${label}</span>
        </a>
      `).join("")}
    </nav>
  `;

  document.body.prepend(overlay, drawer, menuButton);
  const closeButton = drawer.querySelector(".global-menu-close");

  if (!document.querySelector("footer")) {
    const siteFooter = document.createElement("footer");
    siteFooter.className = "global-site-footer";

    const footerMessage = document.createElement("p");
    footerMessage.textContent =
      "Rouler fort, rester sain, s'engager pour demain";

    siteFooter.append(footerMessage);
    document.body.append(siteFooter);
  }

  function openMenu() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("global-menu-open");
    closeButton.focus();
  }

  function closeMenu() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("global-menu-open");
    menuButton.focus();
  }

  menuButton.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("open")) {
      closeMenu();
    }
  });
})();
