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


  function initProjectTools() { const tools = document.querySelector(".project-tools"); if (!tools) { return; } const topButton = tools.querySelector("[data-scroll-top]"); let lastScrollY = window.scrollY; function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); } function updateTopButton() { if (!topButton) { return; } const shouldHide = window.scrollY < 160; topButton.classList.toggle( "is-hidden", shouldHide ); } topButton?.addEventListener( "click", scrollToTop ); window.addEventListener( "scroll", () => { lastScrollY = window.scrollY; updateTopButton(); }, { passive: true } ); updateTopButton(); } function initCommonLayout() { createNavigation(); createFooter(); initProjectTools(); }

  
  function initCommonLayout() {
    createNavigation();
    createFooter();
  }

<<<<<<< HEAD
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommonLayout, { once: true });
=======
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotateSpeed = 0.5;

    function updateViewerMode() {
      if (!isHeroViewer) {
        controls.autoRotate = true;
        controls.enableRotate = true;
        return;
      }

      if (isMobileMode()) {
        // 모바일: 기존처럼 자동 회전
        controls.autoRotate = !reducedMotionQuery.matches;
        controls.enableRotate = true;
      } else {
        // PC: 자동 회전 제거, 마우스 추적 회전
        controls.autoRotate = false;
        controls.enableRotate = false;
      }
    }

    updateViewerMode();


    /* =======================================================
       조명
    ======================================================= */

    scene.add(
      new THREE.AmbientLight(0xffffff, 0.85)
    );

    const keyLight = new THREE.DirectionalLight(
      0xfffdf5,
      2
    );

    keyLight.position.set(-3, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);

    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0xf0f4ff,
      0.8
    );

    fillLight.position.set(4, 2, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      0xffffff,
      0.9
    );

    rimLight.position.set(0, 4, -8);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(
      0xfff8f0,
      0.2
    );

    bounceLight.position.set(0, -5, 3);
    scene.add(bounceLight);

    scene.add(
      new THREE.HemisphereLight(
        0xffffff,
        0xf5f5f5,
        0.7
      )
    );

    const crystalLight = new THREE.PointLight(
      0xffffff,
      0.8,
      6
    );

    crystalLight.position.set(1, 2, 2);
    scene.add(crystalLight);





    /* =======================================================
       Viewer 상태
    ======================================================= */

   let activeModel = null;
    let uploadedModelBaseY = 0;
    let hasUploadedModel = false;
    let currentObjectUrl = null;

    const pointerRotation = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0
    };


    /* =======================================================
       PC 마우스 방향 회전
    ======================================================= */

    function handlePointerMove(event) {
      if (!isHeroViewer || isMobileMode()) return;

      const rect = container.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) return;

      const normalizedX =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

      const normalizedY =
        ((event.clientY - rect.top) / rect.height) * 2 - 1;

      // 좌우 회전 강도
      pointerRotation.targetY = normalizedX * 0.56;

      // 상하 회전 강도
      pointerRotation.targetX = normalizedY * 0.24;
    }

    function handlePointerLeave() {
      if (!isHeroViewer || isMobileMode()) return;

      // 히어로 밖으로 나가면 정면 복귀
      pointerRotation.targetX = 0;
      pointerRotation.targetY = 0;
    }

    if (isHeroViewer) {
      container.addEventListener(
        "pointermove",
        handlePointerMove
      );

      container.addEventListener(
        "pointerleave",
        handlePointerLeave
      );

      mobileQuery.addEventListener?.(
        "change",
        updateViewerMode
      );

      reducedMotionQuery.addEventListener?.(
        "change",
        updateViewerMode
      );
    }



    /* =======================================================
       모델 로더
    ======================================================= */

    const loader = new GLTFLoader();


    /* =======================================================
       모델 크기 및 위치 정리
    ======================================================= */

    function normalizeModel(model) {
      const rawBox =
        new THREE.Box3().setFromObject(model);

      const rawSize =
        rawBox.getSize(new THREE.Vector3());

      const maxDimension = Math.max(
        rawSize.x,
        rawSize.y,
        rawSize.z
      );

      if (
        !Number.isFinite(maxDimension) ||
        maxDimension <= 0
      ) {
        throw new Error(
          "유효한 모델 크기를 계산할 수 없습니다."
        );
      }

      const scale =
        (options.targetSize || 2.2) / maxDimension;

      model.scale.setScalar(scale);
      model.updateMatrixWorld(true);

      const scaledBox =
        new THREE.Box3().setFromObject(model);

      const center =
        scaledBox.getCenter(new THREE.Vector3());

      const size =
        scaledBox.getSize(new THREE.Vector3());

      uploadedModelBaseY = -center.y;

      model.position.set(
        -center.x,
        uploadedModelBaseY,
        -center.z
      );

      model.traverse((child) => {
        if (!child.isMesh) return;

        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          if (!material) return;

          if ("roughness" in material) {
            material.roughness = Math.min(
              1,
              material.roughness * 1.05
            );
          }

          if ("envMapIntensity" in material) {
            material.envMapIntensity = 1.6;
          }

          material.needsUpdate = true;
        });
      });

      console.log("[GLB 모델 로드 완료]", {
        center,
        size,
        baseY: uploadedModelBaseY
      });
    }


    /* =======================================================
       기존 모델 제거
    ======================================================= */

    function removeActiveModel() {
      if (!activeModel) return;

      scene.remove(activeModel);

      activeModel.traverse?.((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }

        if (!child.material) return;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          if (!material) return;

          Object.values(material).forEach((value) => {
            if (value?.isTexture) {
              value.dispose();
            }
          });

          material.dispose?.();
        });
      });
    }


    /* =======================================================
       모델 적용
    ======================================================= */

    function applyLoadedModel(model) {
      normalizeModel(model);
      removeActiveModel();

      activeModel = model;
      scene.add(activeModel);

      hasUploadedModel = true;

      overlay?.classList.add("hidden");
      replaceButton?.classList.add("visible");
    }


    /* =======================================================
       기본 model.glb 자동 로드
    ======================================================= */

    function loadDefaultModel(url) {
      loader.load(
        url,

        (gltf) => {
          try {
            const model =
              gltf.scene || gltf.scenes?.[0];

            if (!model) {
              throw new Error(
                "모델 장면을 찾지 못했습니다."
              );
            }

            applyLoadedModel(model);
          } catch (error) {
            console.error(
              "기본 3D 모델 처리 오류:",
              error
            );
          }
        },

        undefined,

        (error) => {
          console.error(
            `기본 모델을 불러오지 못했습니다: ${url}`,
            error
          );

          console.warn(
            "HTML 파일과 같은 폴더에 model.glb 파일이 있는지 확인하세요."
          );
        }
      );
    }


    /* =======================================================
       사용자가 선택한 GLB/GLTF 로드
    ======================================================= */

    function loadModelFile(file) {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      if (!["glb", "gltf"].includes(extension)) {
        alert(
          ".glb 또는 .gltf 파일만 업로드할 수 있습니다."
        );
        return;
      }

      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }

      currentObjectUrl =
        URL.createObjectURL(file);

      loader.load(
        currentObjectUrl,

        (gltf) => {
          try {
            const model =
              gltf.scene || gltf.scenes?.[0];

            if (!model) {
              throw new Error(
                "모델 장면을 찾지 못했습니다."
              );
            }

            applyLoadedModel(model);
          } catch (error) {
            console.error(error);

            alert(
              "3D 모델 처리에 실패했습니다. 다른 GLB/GLTF 파일을 사용해 주세요."
            );
          }
        },

        undefined,

        (error) => {
          console.error(error);

          alert(
            "3D 모델을 불러오지 못했습니다. 파일 형식이나 포함 리소스를 확인해 주세요."
          );
        }
      );
    }


    /* =======================================================
       파일 선택 버튼
    ======================================================= */

    function openFilePicker() {
      input?.click();
    }

    function handleContainerClick(event) {
      if (hasUploadedModel) return;
      if (event.target.closest("button")) return;

      openFilePicker();
    }

    function handleReplaceClick(event) {
      event.stopPropagation();
      openFilePicker();
    }

    function handleInputChange() {
      const file = input?.files?.[0];

      if (file) {
        loadModelFile(file);
      }

      if (input) {
        input.value = "";
      }
    }

    container.addEventListener(
      "click",
      handleContainerClick
    );

    replaceButton?.addEventListener(
      "click",
      handleReplaceClick
    );

    input?.addEventListener(
      "change",
      handleInputChange
    );


    /* =======================================================
       파일 드래그 앤 드롭
    ======================================================= */

    function handleDragOver(event) {
      event.preventDefault();

      if (!hasUploadedModel && overlay) {
        overlay.style.background =
          "rgba(255,255,255,0.18)";
      }
    }

    function handleDragLeave() {
      if (overlay) {
        overlay.style.background = "";
      }
    }

    function handleDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      if (overlay) {
        overlay.style.background = "";
      }

      const file =
        event.dataTransfer?.files?.[0];

      if (file) {
        loadModelFile(file);
      }
    }

    container.addEventListener(
      "dragover",
      handleDragOver
    );

    container.addEventListener(
      "dragleave",
      handleDragLeave
    );

    container.addEventListener(
      "drop",
      handleDrop
    );


    /* =======================================================
       애니메이션
    ======================================================= */

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      if (activeModel) {
        const baseY = hasUploadedModel
          ? uploadedModelBaseY
          : 0;

        // 기존 위아래 부유 움직임
        activeModel.position.y =
          baseY +
          Math.sin(elapsed * 0.52) * 0.14 +
          Math.sin(elapsed * 0.27) * 0.04;

        if (isHeroViewer && !isMobileMode()) {
          /*
           * PC 히어로
           * 자동 회전하지 않고 마우스 방향으로 회전
           */

          pointerRotation.currentX +=
            (
              pointerRotation.targetX -
              pointerRotation.currentX
            ) * 0.065;

          pointerRotation.currentY +=
            (
              pointerRotation.targetY -
              pointerRotation.currentY
            ) * 0.065;

          activeModel.rotation.x =
            pointerRotation.currentX;

          activeModel.rotation.y =
            pointerRotation.currentY;

          activeModel.rotation.z =
            -pointerRotation.currentY * 0.04;
        } else {
          /*
           * 모바일 히어로 및 ABOUT
           * OrbitControls의 autoRotate 사용
           */

          activeModel.rotation.x =
            Math.sin(elapsed * 0.31) * 0.06;

          activeModel.rotation.z =
            Math.sin(elapsed * 0.19) * 0.025;
        }
      }

      crystalLight.position.x =
        Math.sin(elapsed * 0.7) * 1.5 + 1;

      crystalLight.intensity =
        0.72 +
        Math.sin(elapsed * 1.4) * 0.12;

      controls.update();
      renderer.render(scene, camera);
    }


    /* =======================================================
       반응형 크기 조절
    ======================================================= */

   function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width <= 0 || height <= 0) return;

  const isSmallMobile = width <= 460;

  camera.aspect = width / height;

  /*
   * 작은 모바일에서는 카메라를 조금 뒤로 보내
   * 3D 오브젝트 좌우 잘림을 방지
   */
  if (isSmallMobile) {
    camera.position.z = isHeroViewer ? 7.8 : 7.3;
    camera.position.y = isHeroViewer ? 0.25 : 0.35;
>>>>>>> f95f45cd335bc4e0dbe4ae0004ff3e7f39270bb4
  } else {
    initCommonLayout();
  }
})();
