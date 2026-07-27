(() => {
  "use strict";

  const rootPath = document.body.dataset.root || "./";
  const currentPage = document.body.dataset.page || "home";

  const menuItems = [
    { key: "home", label: "HOME", href: `${rootPath}index.html` },
    { key: "about", label: "ABOUT", href: `${rootPath}page/about.html` },
    { key: "archive", label: "ARCHIVE", href: `${rootPath}page/archive.html` },
    { key: "contact", label: "CONTACT", href: `${rootPath}page/contact.html` }
  ];

  function createNavigation() {
    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.setAttribute("aria-label", "주요 메뉴");

    nav.innerHTML = `
      <button
        class="menu-toggle"
        type="button"
        aria-label="메뉴 열기"
        aria-expanded="false"
        aria-controls="nav-menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <a class="logo" href="${rootPath}index.html" aria-label="홈으로 이동">
        <img src="${rootPath}public/images/logo.png" alt="logo" />
      </a>

      <ul id="nav-menu" class="nav-menu">
        ${menuItems.map((item) => `
          <li>
            <a
              class="nav-link${item.key === currentPage ? " active" : ""}"
              href="${item.href}"
              ${item.key === currentPage ? 'aria-current="page"' : ""}
            >
              ${item.label}
            </a>
          </li>
        `).join("")}
      </ul>
    `;

    document.body.prepend(nav);
    initMobileMenu(nav);
  }

  function createFooter() {
    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.textContent = `© ${new Date().getFullYear()} portfolio. ALL RIGHTS RESERVED.`;
    document.body.append(footer);
  }

  function initMobileMenu(nav) {
    const toggle = nav.querySelector(".menu-toggle");
    const menu = nav.querySelector(".nav-menu");
    const mobileQuery = window.matchMedia("(max-width: 600px)");

    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.classList.remove("active");
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "메뉴 열기");
    }

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");

      toggle.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
    });

    menu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches || !menu.classList.contains("open")) return;
      if (!event.target.closest(".nav")) closeMenu();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    mobileQuery.addEventListener?.("change", (event) => {
      if (!event.matches) closeMenu();
    });
  }

  function initCommonLayout() {
    createNavigation();
    createFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommonLayout, { once: true });
  } else {
    initCommonLayout();
  }
})();
