import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const viewer =
  document.getElementById("detail-viewer");

if (viewer) {
  initAboutViewer(viewer);
}

function initAboutViewer(container) {
  const rootPath =
    document.body.dataset.root || "../";

  const modelUrl =
    container.dataset.model ||
    `${rootPath}public/models/model.glb`;

  /*
    MAIN 페이지와 동일한 초기 방향
  */
  const initialRotationX =
    THREE.MathUtils.degToRad(10);

  const initialRotationY =
    THREE.MathUtils.degToRad(-50);

  const scene =
    new THREE.Scene();

  const initialWidth =
    container.clientWidth || 1;

  const initialHeight =
    container.clientHeight || 1;

  const camera =
    new THREE.PerspectiveCamera(
      34,
      initialWidth / initialHeight,
      0.1,
      100
    );

  camera.position.set(
    0,
    0.2,
    5.6
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
    1.1;

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

  /*
    ABOUT에서는 PC와 모바일 모두
    자동 회전을 유지합니다.
  */
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.42;

  controls.minPolarAngle =
    Math.PI * 0.22;

  controls.maxPolarAngle =
    Math.PI * 0.78;

  addLights(scene);


  const loader =
    new GLTFLoader();

  let modelRoot = null;

  /*
    GLB 원본 크기를 저장하여
    화면 크기가 바뀔 때 재사용합니다.
  */
  let modelBaseDimension = 1;

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

      modelBaseDimension =
        fitModelToView(
          modelRoot,
          camera,
          controls,
          container,
          "about"
        );

      modelRoot.rotation.set(
        initialRotationX,
        initialRotationY,
        0
      );
    },

    undefined,

    (error) => {
      console.error(
        `ABOUT 모델을 불러오지 못했습니다: ${modelUrl}`,
        error
      );
    }
  );

  let animationFrameId = 0;

  const clock =
    new THREE.Clock();

  function render() {
    const delta =
      Math.min(
        clock.getDelta(),
        0.1
      );

    /*
      damping과 자동 회전을 적용합니다.
    */
    controls.update(delta);

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
      컨테이너 크기가 변경될 때마다
      모델 크기도 비율을 유지하며 다시 계산합니다.
    */
    if (modelRoot) {
      updateResponsiveModelScale(
        modelRoot,
        container,
        modelBaseDimension,
        "about"
      );
    }
  }

  function handlePageShow() {
    /*
      뒤로 가기로 ABOUT 페이지가 복원되어도
      렌더러 크기를 다시 맞춥니다.
    */
    controls.autoRotate = true;
    controls.enableRotate = true;

    resize();
  }

  const resizeObserver =
    new ResizeObserver(
      resize
    );

  resizeObserver.observe(
    container
  );

  window.addEventListener(
    "pageshow",
    handlePageShow
  );

  window.addEventListener(
    "beforeunload",

    () => {
      cancelAnimationFrame(
        animationFrameId
      );

      resizeObserver.disconnect();

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
      0x1a1a1a,
      2.3
    );

  scene.add(
    hemisphere
  );

  const key =
    new THREE.DirectionalLight(
      0xffffff,
      4.2
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
      0xa9bdff,
      1.8
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
      2.4
    );

  rim.position.set(
    0,
    4,
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
    원래 GLB 크기를 정확하게 측정하기 위해
    최초 스케일을 1로 맞춥니다.
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
    5.6
  );

  camera.lookAt(
    fittedCenter
  );

  controls.update();

  return baseDimension;
}

function updateResponsiveModelScale(model, container, baseDimension, pageType = "about") { if (!model || !baseDimension) { return; } const width = container.clientWidth || 1; const height = container.clientHeight || 1; const viewportWidth = window.innerWidth; /* 가로와 세로 중 작은 값을 기준으로 기본 모델 크기를 계산합니다. */ const shortestSide = Math.min(width, height); let targetSize; if (pageType === "main") { targetSize = THREE.MathUtils.clamp(shortestSide * 0.0045, 1.3, 3.1); } else { targetSize = THREE.MathUtils.clamp(shortestSide * 0.0042, 1.15, 2.85); /* ABOUT 페이지에서만 961px~1500px 구간의 모델을 축소합니다. 1501px 이상과 960px 이하 크기는 기존 크기를 그대로 유지합니다. */ if (viewportWidth > 960 && viewportWidth <= 1500) { targetSize *= 0.82; } } const scale = targetSize / baseDimension; model.scale.setScalar(scale); }

