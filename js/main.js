import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const viewer =
  document.getElementById("hero-viewer");

if (viewer) {
  initHeroViewer(viewer);
}

function initHeroViewer(container) {
  const rootPath =
    document.body.dataset.root || "./";

  const modelUrl =
    container.dataset.model ||
    `${rootPath}public/models/model.glb`;

  /*
    MAIN과 ABOUT에서 공통으로 사용할
    모델의 처음 방향
  */
  const initialRotationX =
    THREE.MathUtils.degToRad(10);

  const initialRotationY =
    THREE.MathUtils.degToRad(-50);

  /*
    데스크톱에서 마우스를 따라 움직이는
    최대 회전 범위
  */
  const maxRotation =
    THREE.MathUtils.degToRad(12);

  /*
    숫자가 작을수록 모델이
    마우스를 천천히 따라갑니다.
  */
  const followSpeed = 0.85;

  const scene =
    new THREE.Scene();

  const initialWidth =
    container.clientWidth || 1;

  const initialHeight =
    container.clientHeight || 1;

  const camera =
    new THREE.PerspectiveCamera(
      35,
      initialWidth / initialHeight,
      0.1,
      100
    );

  camera.position.set(
    0,
    0.15,
    6
  );

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  renderer.setSize(
    initialWidth,
    initialHeight
  );

  renderer.setClearColor(
    0x000000,
    0
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure =
    1.15;

  container.append(
    renderer.domElement
  );

  const controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );

  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;

  controls.minPolarAngle =
    Math.PI * 0.25;

  controls.maxPolarAngle =
    Math.PI * 0.75;

  addLights(scene);

  const loader =
    new GLTFLoader();

  let modelRoot = null;

  /*
    GLB 모델의 원래 크기를 저장합니다.
    화면 크기가 바뀔 때 이 값을 기준으로
    비율을 유지하며 다시 축소합니다.
  */
  let modelBaseDimension = 1;

  let animationFrameId = 0;
  let modelIsFitted = false;

  /*
    자동 회전 후 초기 카메라 위치로
    돌아오기 위한 값입니다.
  */
  const initialCameraPosition =
    new THREE.Vector3();

  const initialControlsTarget =
    new THREE.Vector3();

  const pointerRotation = {
    x: 0,
    y: 0
  };

  const currentRotation = {
    x: 0,
    y: 0
  };

  /*
    마우스를 정밀하게 사용할 수 있는
    데스크톱 환경만 마우스 반응을 적용합니다.
  */
  const desktopQuery =
    window.matchMedia(
      "(min-width: 681px) and (hover: hover) and (pointer: fine)"
    );

  function isDesktopInteraction() {
    return desktopQuery.matches;
  }

  function resetRotationValues() {
    pointerRotation.x = 0;
    pointerRotation.y = 0;

    currentRotation.x = 0;
    currentRotation.y = 0;
  }

  function applyInitialModelRotation() {
    if (!modelRoot) return;

    modelRoot.rotation.set(
      initialRotationX,
      initialRotationY,
      0
    );
  }

  function resetCameraView() {
    if (!modelIsFitted) return;

    camera.position.copy(
      initialCameraPosition
    );

    controls.target.copy(
      initialControlsTarget
    );

    camera.lookAt(
      initialControlsTarget
    );

    controls.update();
  }

  function updateInteractionMode({
    resetCamera = false
  } = {}) {
    const isDesktop =
      isDesktopInteraction();

    resetRotationValues();
    applyInitialModelRotation();

    if (resetCamera) {
      resetCameraView();
    }

    if (isDesktop) {
      /*
        MAIN 데스크톱

        OrbitControls 자동 회전 비활성화
        드래그 회전 비활성화
        마우스 위치에 따른 모델 회전 사용
      */
      controls.autoRotate = false;
      controls.enableRotate = false;

      return;
    }

    /*
      MAIN 모바일·터치 환경

      기존 자동 회전을 유지합니다.
    */
    controls.autoRotate = true;
    controls.enableRotate = true;
    controls.autoRotateSpeed = 0.55;
  }

  updateInteractionMode();

  loader.load(
    modelUrl,

    (gltf) => {
      modelRoot =
        gltf.scene;

      prepareModel(
        modelRoot
      );

      scene.add(
        modelRoot
      );

      /*
        모델의 중심, 카메라 위치,
        원래 크기를 계산합니다.
      */
      modelBaseDimension =
        fitModelToView(
          modelRoot,
          camera,
          controls,
          container,
          "main"
        );

      /*
        MAIN과 ABOUT의 초기 방향을
        동일하게 적용합니다.
      */
      applyInitialModelRotation();

      initialCameraPosition.copy(
        camera.position
      );

      initialControlsTarget.copy(
        controls.target
      );

      modelIsFitted = true;

      updateInteractionMode({
        resetCamera: true
      });
    },

    undefined,

    (error) => {
      console.error(
        `MAIN 모델을 불러오지 못했습니다: ${modelUrl}`,
        error
      );
    }
  );

  function handlePointerMove(event) {
    if (!isDesktopInteraction()) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    if (
      !rect.width ||
      !rect.height
    ) {
      return;
    }

    const normalizedX =
      (
        (event.clientX - rect.left) /
        rect.width
      ) * 2 - 1;

    const normalizedY =
      (
        (event.clientY - rect.top) /
        rect.height
      ) * 2 - 1;

    /*
      좌우 이동은 Y축 회전
    */
    pointerRotation.y =
      normalizedX *
      maxRotation;

    /*
      상하 이동은 X축 회전

      세로 회전은 좌우보다 작게 적용합니다.
    */
    pointerRotation.x =
      normalizedY *
      maxRotation *
      0.35;
  }

  function resetPointerRotation() {
    if (!isDesktopInteraction()) {
      return;
    }

    /*
      현재값을 바로 바꾸지 않고 목표값만 0으로 만들어
      모델이 부드럽게 원래 방향으로 돌아갑니다.
    */
    pointerRotation.x = 0;
    pointerRotation.y = 0;
  }

  function handleInteractionChange() {
    updateInteractionMode({
      resetCamera: true
    });
  }

  function handlePageShow() {
    /*
      다른 페이지에서 돌아오거나
      브라우저 뒤로 가기로 복원될 때
      회전 상태를 다시 설정합니다.
    */
    updateInteractionMode({
      resetCamera: true
    });

    resize();
  }

  container.addEventListener(
    "pointermove",
    handlePointerMove
  );

  container.addEventListener(
    "pointerleave",
    resetPointerRotation
  );

  desktopQuery.addEventListener?.(
    "change",
    handleInteractionChange
  );

  window.addEventListener(
    "pageshow",
    handlePageShow
  );

  const clock =
    new THREE.Clock();

  function render() {
    const delta =
      Math.min(
        clock.getDelta(),
        0.1
      );

    const elapsed =
      clock.elapsedTime;

    /*
      모바일 자동 회전과 damping을 위해
      매 프레임 업데이트합니다.
    */
    controls.update(delta);

    if (
      modelRoot &&
      isDesktopInteraction()
    ) {
      const smoothing =
        1 -
        Math.exp(
          -followSpeed * delta
        );

      currentRotation.x +=
        (
          pointerRotation.x -
          currentRotation.x
        ) * smoothing;

      currentRotation.y +=
        (
          pointerRotation.y -
          currentRotation.y
        ) * smoothing;

      /*
        완전히 정지한 느낌을 줄이기 위한
        아주 약한 좌우 움직임입니다.
      */
      const idleRotation =
        Math.sin(
          elapsed * 0.35
        ) *
        THREE.MathUtils.degToRad(1.2);

      modelRoot.rotation.x =
        initialRotationX +
        currentRotation.x;

      modelRoot.rotation.y =
        initialRotationY +
        currentRotation.y +
        idleRotation;
    }

    renderer.render(
      scene,
      camera
    );

    animationFrameId =
      requestAnimationFrame(
        render
      );
  }

  function resize() {
    const width =
      container.clientWidth;

    const height =
      container.clientHeight;

    if (
      !width ||
      !height
    ) {
      return;
    }

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.setSize(
      width,
      height
    );

    /*
      화면이 작아지면 모델도 같은 비율로
      부드럽게 작아집니다.
    */
    if (modelRoot) {
      updateResponsiveModelScale(
        modelRoot,
        container,
        modelBaseDimension,
        "main"
      );
    }
  }

  const resizeObserver =
    new ResizeObserver(
      resize
    );

  resizeObserver.observe(
    container
  );

  window.addEventListener(
    "beforeunload",

    () => {
      cancelAnimationFrame(
        animationFrameId
      );

      resizeObserver.disconnect();

      container.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      container.removeEventListener(
        "pointerleave",
        resetPointerRotation
      );

      desktopQuery.removeEventListener?.(
        "change",
        handleInteractionChange
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );

      controls.dispose();
      renderer.dispose();
    },

    { once: true }
  );

  render();
}

function addLights(scene) {
  const hemisphere =
    new THREE.HemisphereLight(
      0xffffff,
      0x222222,
      2.2
    );

  scene.add(
    hemisphere
  );

  const key =
    new THREE.DirectionalLight(
      0xffffff,
      4
    );

  key.position.set(
    4,
    5,
    5
  );

  scene.add(
    key
  );

  const fill =
    new THREE.DirectionalLight(
      0x9bbcff,
      2
    );

  fill.position.set(
    -4,
    1,
    3
  );

  scene.add(
    fill
  );

  const rim =
    new THREE.DirectionalLight(
      0xffffff,
      2.5
    );

  rim.position.set(
    0,
    3,
    -5
  );

  scene.add(
    rim
  );
}

function prepareModel(model) {
  model.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    object.castShadow = false;
    object.receiveShadow = false;

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      material.side =
        THREE.DoubleSide;

      material.needsUpdate =
        true;
    });
  });
}

function fitModelToView(
  model,
  camera,
  controls,
  container,
  pageType
) {
  /*
    스케일을 계산하기 전에
    모델 원본 크기를 측정합니다.
  */
  model.scale.setScalar(1);

  const box =
    new THREE.Box3().setFromObject(
      model
    );

  const center =
    box.getCenter(
      new THREE.Vector3()
    );

  const size =
    box.getSize(
      new THREE.Vector3()
    );

  /*
    모델 중심을 원점에 배치합니다.
  */
  model.position.sub(
    center
  );

  const baseDimension =
    Math.max(
      size.x,
      size.y,
      size.z
    ) || 1;

  updateResponsiveModelScale(
    model,
    container,
    baseDimension,
    pageType
  );

  const fittedBox =
    new THREE.Box3().setFromObject(
      model
    );

  const fittedCenter =
    fittedBox.getCenter(
      new THREE.Vector3()
    );

  controls.target.copy(
    fittedCenter
  );

  camera.position.set(
    0,
    fittedCenter.y + 0.15,
    6
  );

  camera.lookAt(
    fittedCenter
  );

  controls.update();

  return baseDimension;
}


function updateResponsiveModelScale(
  model,
  container,
  baseDimension
) {
  if (!model || !baseDimension) {
    return;
  }

  const viewportWidth =
    window.innerWidth;

  let targetSize;

  /*
    1600px 이상
    현재 데스크톱 기본 크기 유지
  */
  if (viewportWidth >= 1600) {
    targetSize = 3.1;
  }

  /*
    1400px 이상 ~ 1599px 이하
    기본 크기보다 살짝 축소
  */
  else if (viewportWidth >= 1400) {
    targetSize = 2.85;
  }

  /*
    1200px 이상 ~ 1399px 이하
    모델 크기 추가 축소
  */
  else if (viewportWidth >= 1200) {
    targetSize = 2.55;
  }

  /*
    750px 이상 ~ 1199px 이하
    태블릿·작은 노트북 구간

    모델이 잘리지 않도록
    비교적 크게 축소
  */
  else if (viewportWidth >= 750) {
    targetSize = 2.1;
  }

  /*
    601px 이상 ~ 749px 이하
    태블릿과 모바일 사이 구간
  */
  else if (viewportWidth > 600) {
    targetSize = 1.75;
  }

  /*
    451px 이상 ~ 600px 이하
    일반 모바일
  */
  else if (viewportWidth > 450) {
    targetSize = 1.45;
  }

  /*
    381px 이상 ~ 450px 이하
    작은 모바일
  */
  else if (viewportWidth > 380) {
    targetSize = 1.25;
  }

  /*
    380px 이하
    매우 작은 모바일
  */
  else {
    targetSize = 1.08;
  }

  /*
    X, Y, Z에 같은 값을 적용하여
    모델의 원본 비율을 유지합니다.
  */
  const scale =
    targetSize / baseDimension;

  model.scale.setScalar(scale);
}