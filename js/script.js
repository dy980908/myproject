import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

  /* =========================================================
     기본 설정
  ========================================================= */

  const ROOT_PATH = document.body.dataset.root || "./";
  const DEFAULT_HERO_MODEL_URL = `${ROOT_PATH}public/models/model.glb`;

  const ABOUT_CONTENT = {
    title: "Flower Floating Island",
    desc: "Delicate blossoms flourish among lush moss and translucent crystals atop weathered stone. A graceful composition celebrating the timeless elegance of nature in bloom."
  };

  const CARDS = [
    {
      id: "card-01",
      title: "Ice Floating Island",
      desc: "Translucent ice crystals emerge from frost-covered stone, surrounded by delicate winter flora. A peaceful composition inspired by the quiet elegance of frozen landscapes."
    },
    {
      id: "card-02",
      title: "Forest Floating Island",
      desc: "Verdant moss, blooming wildflowers, and natural quartz flourish across ancient stone. A timeless celebration of nature's harmony and organic growth."
    },
    {
      id: "card-03",
      title: "Desert Floating Island",
      desc: "Amber crystals rise from sculpted sandstone alongside resilient desert botanicals. A warm, tranquil landscape shaped by time, sunlight, and wind."
    },
    {
      id: "card-04",
      title: "Ocean Floating Island",
      desc: "Sea-glass crystals, coastal vegetation, and gentle blossoms grow across weathered rock. A light, refreshing composition inspired by the calm beauty of the shoreline."
    }
  ];

  const aboutTitle = document.getElementById("about-title");
  const aboutDesc = document.getElementById("about-desc");

  if (aboutTitle) {
    aboutTitle.textContent = ABOUT_CONTENT.title;
  }

  if (aboutDesc) {
    aboutDesc.textContent = ABOUT_CONTENT.desc;
  }


  /* =========================================================
     페이지 전체 드래그·드롭 방지
  ========================================================= */

  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  window.addEventListener("drop", (event) => {
    event.preventDefault();
  });


  /* =========================================================
     ARCHIVE 카드 생성
  ========================================================= */

  function renderArchiveCards() {
    const grid = document.getElementById("archive-grid");

    CARDS.forEach((card) => {
      const article = document.createElement("article");

      article.className = "archive-card";

      article.innerHTML = `
        <div class="card-image-wrap">
          <div class="card-placeholder">
            <div class="placeholder-orb"></div>
          </div>

          <div class="card-controls">
            <button
              class="card-image-button"
              type="button"
            >
              + Image
            </button>
          </div>

          <input
            id="img-input-${card.id}"
            type="file"
            accept="image/*"
            hidden
          />
        </div>

        <div class="card-body">
          <h3 class="card-title">${card.title}</h3>
          <p class="card-desc">${card.desc}</p>
        </div>
      `;

      const wrap = article.querySelector(".card-image-wrap");
      const input = article.querySelector("input");
      const button = article.querySelector(".card-image-button");

      button.addEventListener("click", (event) => {
        event.stopPropagation();
        input.click();
      });

      input.addEventListener("change", () => {
        const file = input.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
          alert("이미지 파일만 업로드할 수 있습니다.");
          input.value = "";
          return;
        }

        const oldImage = wrap.querySelector("img");

        if (oldImage?.dataset.objectUrl) {
          URL.revokeObjectURL(oldImage.dataset.objectUrl);
        }

        const url = URL.createObjectURL(file);
        const image = document.createElement("img");

        image.src = url;
        image.alt = card.title;
        image.dataset.objectUrl = url;

        wrap.querySelector(".card-placeholder")?.remove();
        oldImage?.remove();

        wrap.prepend(image);

        button.textContent = "↻ Replace";
        input.value = "";
      });

      grid.appendChild(article);
    });
  }
  if (document.getElementById("archive-grid")) {
    renderArchiveCards();
  }
  /* =========================================================
     3D VIEWER 생성
  ========================================================= */

  function createViewer(containerId, options = {}) {
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`3D 컨테이너를 찾을 수 없습니다: ${containerId}`);
      return null;
    }

    const input = container.querySelector(".model-input");
    const overlay = container.querySelector(".drop-overlay");
    const replaceButton = container.querySelector(".viewer-action");

    const isHeroViewer = containerId === "hero-viewer";

    const mobileQuery = window.matchMedia(
      "(max-width: 680px)"
    );

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    function isMobileMode() {
      return mobileQuery.matches;
    }


    /* =======================================================
       THREE 기본 장면
    ======================================================= */

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.set(0, 0.4, 6.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.prepend(renderer.domElement);


    /* =======================================================
       카메라 컨트롤
    ======================================================= */

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
  } else {
    camera.position.z = 6.5;
    camera.position.y = 0.4;
  }

  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
}

    const resizeObserver =
      new ResizeObserver(resize);

    resizeObserver.observe(container);


    /* =======================================================
       히어로 기본 모델 불러오기
    ======================================================= */

    if (isHeroViewer) {
      loadDefaultModel(DEFAULT_HERO_MODEL_URL);
    }


    /* =======================================================
       애니메이션 실행
    ======================================================= */

    animate();


    /* =======================================================
       Viewer 제거 함수
    ======================================================= */

    return {
      resize,

      destroy() {
        resizeObserver.disconnect();

        if (isHeroViewer) {
          container.removeEventListener(
            "pointermove",
            handlePointerMove
          );

          container.removeEventListener(
            "pointerleave",
            handlePointerLeave
          );

          mobileQuery.removeEventListener?.(
            "change",
            updateViewerMode
          );

          reducedMotionQuery.removeEventListener?.(
            "change",
            updateViewerMode
          );
        }

        container.removeEventListener(
          "click",
          handleContainerClick
        );

        replaceButton?.removeEventListener(
          "click",
          handleReplaceClick
        );

        input?.removeEventListener(
          "change",
          handleInputChange
        );

        container.removeEventListener(
          "dragover",
          handleDragOver
        );

        container.removeEventListener(
          "dragleave",
          handleDragLeave
        );

        container.removeEventListener(
          "drop",
          handleDrop
        );

        controls.dispose();
        renderer.dispose();

        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
        }
      }
    };
  }


  /* =========================================================
     Viewer 실행
  ========================================================= */

  if (document.getElementById("hero-viewer")) {
    createViewer("hero-viewer", {
      targetSize: 2.4
    });
  }

  if (document.getElementById("detail-viewer")) {
    createViewer("detail-viewer", {
      targetSize: 2.2
    });
  }


  /* =========================================================
     CONTACT 링크 설정
  ========================================================= */

  const CONTACT_CONFIG = {
    instagram: {
      storageKey: "nowb_instagram_url",
      promptText:
        "Instagram 링크 또는 아이디를 입력하세요",

      normalize(value) {
        const trimmed = value.trim();

        if (!trimmed) return "";

        if (/^https?:\/\//i.test(trimmed)) {
          return trimmed;
        }

        const username = trimmed
          .replace(/^@/, "")
          .replace(/^instagram\.com\//i, "");

        return `https://www.instagram.com/${username.replace(
          /\/+$/,
          ""
        )}/`;
      }
    },

    email: {
      storageKey: "nowb_email",
      promptText: "이메일 주소를 입력하세요",

      normalize(value) {
        const trimmed = value.trim();

        if (!trimmed) return "";

        return trimmed.replace(
          /^mailto:/i,
          ""
        );
      }
    }
  };

  function askAndSave(type) {
    const config = CONTACT_CONFIG[type];

    const current =
      localStorage.getItem(config.storageKey) ||
      "";

    const value = window.prompt(
      config.promptText,
      current
    );

    if (value === null) return null;

    const normalized =
      config.normalize(value);

    if (!normalized) {
      alert("올바른 값을 입력해 주세요.");
      return null;
    }

    if (type === "email") {
      const basicEmailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !basicEmailPattern.test(normalized)
      ) {
        alert(
          "올바른 이메일 주소를 입력해 주세요."
        );

        return null;
      }
    }

    localStorage.setItem(
      config.storageKey,
      normalized
    );

    return normalized;
  }

  function navigateContact(type, value) {
    if (type === "email") {
      window.location.href =
        `mailto:${value}`;
    } else {
      window.open(
        value,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  document
    .getElementById("instagram-link")
    ?.addEventListener("click", () => {
      const stored =
        localStorage.getItem(
          CONTACT_CONFIG.instagram.storageKey
        ) ||
        askAndSave("instagram");

      if (stored) {
        navigateContact(
          "instagram",
          stored
        );
      }
    });

  document
    .getElementById("email-link")
    ?.addEventListener("click", () => {
      const stored =
        localStorage.getItem(
          CONTACT_CONFIG.email.storageKey
        ) ||
        askAndSave("email");

      if (stored) {
        navigateContact(
          "email",
          stored
        );
      }
    });

  document
    .querySelectorAll(".edit-link")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const type = button.dataset.edit;
          const config = CONTACT_CONFIG[type];

          if (!config) return;

          localStorage.removeItem(
            config.storageKey
          );

          askAndSave(type);
        }
      );
    });
