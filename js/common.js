(() => {
  "use strict";

  /**
   * =========================================================
   * 공용 설정
   * =========================================================
   */

  const body = document.body;

  if (!body) {
    console.error("[common.js] body 요소를 찾을 수 없습니다.");
    return;
  }

  const rootPath = body.dataset.root || "./";
  const currentPage = body.dataset.page || "home";

  const menuItems = [
    {
      key: "home",
      label: "HOME",
      href: `${rootPath}index.html`
    },
    {
      key: "about",
      label: "ABOUT",
      href: `${rootPath}page/about.html`
    },
    {
      key: "PROJECTS",
      label: "PROJECTS",
      href: `${rootPath}page/archive.html`
    },
    {
      key: "contact",
      label: "CONTACT",
      href: `${rootPath}page/contact.html`
    }
  ];

  /**
   * =========================================================
   * 공용 내비게이션 생성
   * =========================================================
   */

  function createNavigation() {
    const existingNav = document.querySelector(".nav");

    // common.js가 중복 실행되어도 nav가 두 개 생기지 않도록 처리
    if (existingNav) {
      return existingNav;
    }

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
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <a
        class="logo"
        href="${rootPath}index.html"
        aria-label="홈으로 이동"
      >
        <img
          src="${rootPath}public/images/logo.png"
          alt="Design in Connection"
        />
      </a>

      <ul id="nav-menu" class="nav-menu">
        ${menuItems
          .map((item) => {
            const isActive = item.key === currentPage;

            return `
              <li class="nav-item">
                <a
                  class="nav-link${isActive ? " active" : ""}"
                  href="${item.href}"
                  ${isActive ? 'aria-current="page"' : ""}
                >
                  ${item.label}
                </a>
              </li>
            `;
          })
          .join("")}
      </ul>
    `;

    body.prepend(nav);

    return nav;
  }

  /**
   * =========================================================
   * 공용 footer 생성
   * =========================================================
   */

  function createFooter() {
    const existingFooter = document.querySelector(".footer");

    // 중복 생성 방지
    if (existingFooter) {
      return existingFooter;
    }

    const footer = document.createElement("footer");

    // CSS의 .footer 선택자와 일치하도록 클래스 지정
    footer.className = "footer";

    footer.innerHTML = `
      <p class="footer-copy">
        &copy; ${new Date().getFullYear()} portfolio.
        ALL RIGHTS RESERVED.
      </p>
    `;

    body.append(footer);

    return footer;
  }

  /**
   * =========================================================
   * 모바일 메뉴
   * =========================================================
   */

  function initMobileMenu(nav) {
    if (!nav) {
      return;
    }

    const menuToggle = nav.querySelector(".menu-toggle");
    const navMenu = nav.querySelector(".nav-menu");
    const navLinks = nav.querySelectorAll(".nav-link");

    const mobileMenuQuery = window.matchMedia(
      "(max-width: 600px)"
    );

    if (!menuToggle || !navMenu) {
      console.warn(
        "[common.js] 모바일 메뉴 요소를 찾을 수 없습니다."
      );

      return;
    }

    function openMobileMenu() {
      menuToggle.classList.add("active");
      navMenu.classList.add("open");

      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "메뉴 닫기");
    }

    function closeMobileMenu() {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "메뉴 열기");
    }

    function toggleMobileMenu() {
      const isOpen = navMenu.classList.contains("open");

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMobileMenu();
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", (event) => {
      if (!mobileMenuQuery.matches) {
        return;
      }

      if (!navMenu.classList.contains("open")) {
        return;
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      if (!event.target.closest(".nav")) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    function handleMediaChange(event) {
      if (!event.matches) {
        closeMobileMenu();
      }
    }

    if (typeof mobileMenuQuery.addEventListener === "function") {
      mobileMenuQuery.addEventListener(
        "change",
        handleMediaChange
      );
    } else if (
      typeof mobileMenuQuery.addListener === "function"
    ) {
      // 구형 Safari 대응
      mobileMenuQuery.addListener(handleMediaChange);
    }
  }

  /**
   * =========================================================
   * 프로젝트 페이지 상단 이동 버튼
   * =========================================================
   */

  function initProjectTools() {
    const tools = document.querySelector(".project-tools");

    if (!tools) {
      return;
    }

    const topButton = tools.querySelector(
      "[data-scroll-top]"
    );

    if (!topButton) {
      return;
    }

    function updateTopButton() {
      const shouldHide = window.scrollY < 160;

      topButton.classList.toggle(
        "is-hidden",
        shouldHide
      );
    }

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    topButton.addEventListener("click", scrollToTop);

    window.addEventListener(
      "scroll",
      updateTopButton,
      {
        passive: true
      }
    );

    updateTopButton();
  }

  /**
   * =========================================================
   * 공용 레이아웃 초기화
   * =========================================================
   */

  function initCommonLayout() {
    // 전체 공용 레이아웃 중복 초기화 방지
    if (body.dataset.commonInitialized === "true") {
      return;
    }

    body.dataset.commonInitialized = "true";

    const nav = createNavigation();

    createFooter();
    initMobileMenu(nav);
    initProjectTools();
  }

  /**
   * HTML 파싱 완료 후 실행
   */
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initCommonLayout,
      {
        once: true
      }
    );
  } else {
    initCommonLayout();
  }
})();