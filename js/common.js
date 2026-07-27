const rootPath = document.body.dataset.root || "./";
const currentPage = document.body.dataset.page || "home";

const menuItems = [
  { key: "home", label: "HOME", href: `${rootPath}index.html` },
  { key: "about", label: "ABOUT", href: `${rootPath}page/about.html` },
  { key: "archive", label: "ARCHIVE", href: `${rootPath}page/archive.html` },
  { key: "contact", label: "CONTACT", href: `${rootPath}page/contact.html` }
];

function createCommonLayout() {
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

  const footer = document.createElement("footer");
  footer.textContent = "© 2026 portfolio. ALL RIGHTS RESERVED.";

  document.body.prepend(nav);
  document.body.append(footer);

  initMobileMenu(nav);
}

function initMobileMenu(nav) {
  const menuToggle = nav.querySelector(".menu-toggle");
  const navMenu = nav.querySelector(".nav-menu");
  const mobileMenuQuery = window.matchMedia("(max-width: 600px)");

  function closeMobileMenu() {
    menuToggle?.classList.remove("active");
    navMenu?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "메뉴 열기");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("open") ?? false;

    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  navMenu?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  mobileMenuQuery.addEventListener?.("change", (event) => {
    if (!event.matches) closeMobileMenu();
  });

  document.addEventListener("click", (event) => {
    if (!mobileMenuQuery.matches) return;
    if (!navMenu?.classList.contains("open")) return;
    if (!event.target.closest(".nav")) closeMobileMenu();
  });
}

createCommonLayout();
