(() => {
  "use strict";

  /**
   * =========================================================
   * 공용 보조 스크립트
   *
   * nav, footer, 모바일 메뉴는 common.js에서 담당합니다.
   * Three.js 관련 기능은 main.js에서 담당합니다.
   * =========================================================
   */

  const body = document.body;

  if (!body) {
    console.error("[script.js] body 요소를 찾을 수 없습니다.");
    return;
  }

  /**
   * =========================================================
   * 외부 링크 보안 속성
   * =========================================================
   */

  function initExternalLinks() {
    const externalLinks = document.querySelectorAll(
      'a[target="_blank"]'
    );

    externalLinks.forEach((link) => {
      const currentRel = link
        .getAttribute("rel")
        ?.split(/\s+/)
        .filter(Boolean) || [];

      const relValues = new Set(currentRel);

      relValues.add("noopener");
      relValues.add("noreferrer");

      link.setAttribute(
        "rel",
        [...relValues].join(" ")
      );
    });
  }

  /**
   * =========================================================
   * 페이지 내부 앵커 부드러운 이동
   * =========================================================
   */

  function initSmoothAnchorLinks() {
    const anchorLinks = document.querySelectorAll(
      'a[href^="#"]:not([href="#"])'
    );

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href) {
          return;
        }

        let target;

        try {
          target = document.querySelector(href);
        } catch (error) {
          console.warn(
            `[script.js] 유효하지 않은 앵커입니다: ${href}`,
            error
          );

          return;
        }

        if (!target) {
          return;
        }

        event.preventDefault();

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        target.scrollIntoView({
          behavior: prefersReducedMotion
            ? "auto"
            : "smooth",
          block: "start"
        });

        if (
          target instanceof HTMLElement &&
          !target.hasAttribute("tabindex")
        ) {
          target.setAttribute("tabindex", "-1");
          target.focus({
            preventScroll: true
          });

          target.addEventListener(
            "blur",
            () => {
              target.removeAttribute("tabindex");
            },
            {
              once: true
            }
          );
        }

        window.history.pushState(
          null,
          "",
          href
        );
      });
    });
  }

  /**
   * =========================================================
   * 이미지 로드 실패 처리
   * =========================================================
   */

  function initImageFallbacks() {
    const images = document.querySelectorAll("img");

    images.forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          image.classList.add("is-image-error");

          console.warn(
            `[script.js] 이미지를 불러오지 못했습니다: ${image.src}`
          );
        },
        {
          once: true
        }
      );
    });
  }

  /**
   * =========================================================
   * 키보드 사용자 포커스 표시
   * =========================================================
   */

  function initKeyboardFocus() {
    function handleFirstTab(event) {
      if (event.key !== "Tab") {
        return;
      }

      body.classList.add("is-keyboard-user");

      window.removeEventListener(
        "keydown",
        handleFirstTab
      );

      window.addEventListener(
        "pointerdown",
        handlePointerInput,
        {
          once: true
        }
      );
    }

    function handlePointerInput() {
      body.classList.remove("is-keyboard-user");

      window.addEventListener(
        "keydown",
        handleFirstTab
      );
    }

    window.addEventListener(
      "keydown",
      handleFirstTab
    );
  }

  /**
   * =========================================================
   * 현재 페이지 준비 상태 표시
   * =========================================================
   */

  function markPageReady() {
    requestAnimationFrame(() => {
      body.classList.add("is-page-ready");
    });
  }

  /**
   * =========================================================
   * 초기화
   * =========================================================
   */

  function initCommonScripts() {
    if (body.dataset.scriptInitialized === "true") {
      return;
    }

    body.dataset.scriptInitialized = "true";

    initExternalLinks();
    initSmoothAnchorLinks();
    initImageFallbacks();
    initKeyboardFocus();
    markPageReady();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initCommonScripts,
      {
        once: true
      }
    );
  } else {
    initCommonScripts();
  }
})();