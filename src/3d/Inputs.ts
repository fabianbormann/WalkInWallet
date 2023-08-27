import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  KeyboardEventTypes,
  MeshBuilder,
  Nullable,
  PickingInfo,
  PointerEventTypes,
  Scene,
  TouchCamera,
  UniversalCamera,
  Vector3,
} from '@babylonjs/core';

export const hasTouchScreen = () => {
  let touchScreen = false;
  if ('maxTouchPoints' in navigator) {
    touchScreen = navigator.maxTouchPoints > 0;
  } else {
    const mediaQuery =
      typeof window.matchMedia === 'function' && matchMedia('(pointer:coarse)');
    if (mediaQuery && mediaQuery.media === '(pointer:coarse)') {
      touchScreen = !!mediaQuery.matches;
    } else if ('orientation' in window) {
      touchScreen = true;
    } else {
      const userAgent = (navigator as any).userAgent;
      touchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(userAgent) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
    }
  }
  return touchScreen;
};

export const moveToPickedObject = (
  pickInfo: Nullable<PickingInfo>,
  camera: UniversalCamera | TouchCamera
) => {
  if (!pickInfo) return;

  if (
    (pickInfo.hit && pickInfo.pickedMesh?.name?.startsWith('Collider#')) ||
    (pickInfo.pickedMesh &&
      (pickInfo.pickedMesh.name.startsWith('Painting#') ||
        pickInfo.pickedMesh.name.includes('Door#')))
  ) {
    const screenWidth = Math.max(window.screen.width, window.innerWidth);
    let distance = 80;

    if (screenWidth > 800) {
      distance = 55;
    } else if (screenWidth > 360) {
      distance = 80 - (25 / 440) * (screenWidth - 360);
    }

    if (pickInfo.pickedMesh.name.includes('right')) {
      let meshPosition = pickInfo.pickedMesh.absolutePosition;
      camera.position.x = meshPosition.x - distance;
      camera.position.z = meshPosition.z;
    } else if (pickInfo.pickedMesh.name.includes('top')) {
      let meshPosition = pickInfo.pickedMesh.absolutePosition;
      camera.position.x = meshPosition.x;
      camera.position.z = meshPosition.z - distance;
    } else if (pickInfo.pickedMesh.name.includes('bottom')) {
      let meshPosition = pickInfo.pickedMesh.absolutePosition;
      camera.position.x = meshPosition.x;
      camera.position.z = meshPosition.z + distance;
    } else if (pickInfo.pickedMesh.name.includes('left')) {
      let meshPosition = pickInfo.pickedMesh.absolutePosition;
      camera.position.x = meshPosition.x + distance;
      camera.position.z = meshPosition.z;
    }

    camera.setTarget(pickInfo.pickedMesh.absolutePosition);
  }
};

const triggerEnterMeshAction = (scene: Scene, source: AbstractMesh) => {
  const collider = scene.getMeshByName('collider');
  if (collider) {
    collider.metadata = {
      collidedMesh: source,
    };
  }
};

const createBoundingBox = (meshes: Array<AbstractMesh>, scene: Scene) => {
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let minZ = Number.MAX_VALUE;
  let maxX = -Number.MAX_VALUE;
  let maxY = -Number.MAX_VALUE;
  let maxZ = -Number.MAX_VALUE;

  for (const mesh of meshes) {
    const meshBoundingInfo = mesh.getBoundingInfo();
    const meshMin = meshBoundingInfo.boundingBox.minimum;
    const meshMax = meshBoundingInfo.boundingBox.maximum;

    minX = Math.min(minX, meshMin.x);
    minY = Math.min(minY, meshMin.y);
    minZ = Math.min(minZ, meshMin.z);
    maxX = Math.max(maxX, meshMax.x);
    maxY = Math.max(maxY, meshMax.y);
    maxZ = Math.max(maxZ, meshMax.z);
  }

  const boundingBoxCenter = new Vector3(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  );
  const boundingBoxWidth = maxX - minX;
  const boundingBoxHeight = maxY - minY;
  const boundingBoxDepth = maxZ - minZ;

  const boundingBoxMesh = MeshBuilder.CreateBox(
    'BoundingBox',
    {
      width: boundingBoxWidth,
      height: boundingBoxHeight,
      depth: boundingBoxDepth,
    },
    scene
  );

  boundingBoxMesh.position = boundingBoxCenter;
  //boundingBoxMesh.isVisible = false;
  return boundingBoxMesh;
};

export const registerEnterMeshAction = (
  scene: Scene,
  meshes: Array<AbstractMesh>,
  onEnter?: Function
) => {
  let mesh: AbstractMesh;
  if (meshes.length === 0) return;
  if (meshes.length === 1) {
    mesh = meshes[0];
  } else {
    mesh = createBoundingBox(meshes, scene);
  }

  mesh.actionManager = new ActionManager(scene);
  const enterAction = new ExecuteCodeAction(
    {
      trigger: ActionManager.OnIntersectionEnterTrigger,
      parameter: { mesh: scene.getMeshByName('collider') },
    },
    () => {
      triggerEnterMeshAction(scene, mesh);
      if (typeof onEnter === 'function') {
        onEnter();
      }
    }
  );
  mesh.actionManager.registerAction(enterAction);
};

export const registerExitMeshAction = (
  scene: Scene,
  meshes: Array<AbstractMesh>,
  onExit: Function
) => {
  let mesh: AbstractMesh;
  if (meshes.length === 0) return;
  if (meshes.length === 1) {
    mesh = meshes[0];
  } else {
    mesh = createBoundingBox(meshes, scene);
  }

  const collider = scene.getMeshByName('collider');
  const exitAction = new ExecuteCodeAction(
    {
      trigger: ActionManager.OnIntersectionExitTrigger,
      parameter: { mesh: collider },
    },
    () => {
      if (collider?.metadata) {
        collider.metadata = null;
      }
      if (typeof onExit === 'function') {
        onExit();
      }
    }
  );
  mesh.actionManager?.registerAction(exitAction);
};

const actionsOnSpace: Array<{
  meshes: Array<AbstractMesh>;
  callback: Function;
}> = [];

export const registerSpaceAction = (
  meshes: Array<AbstractMesh>,
  onSpace: (source: AbstractMesh) => void
) => {
  for (const mesh of meshes) {
    mesh.checkCollisions = true;
  }

  actionsOnSpace.push({
    meshes: meshes,
    callback: onSpace,
  });
};

export const setupInputs = (
  camera: UniversalCamera | TouchCamera,
  canvas: Nullable<HTMLCanvasElement>,
  scene: Scene
) => {
  if (hasTouchScreen()) {
    camera.keysUp = [];
    camera.keysLeft = [];
    camera.keysDown = [];
    camera.keysRight = [];
    camera.speed = 40;
    camera.touchAngularSensibility = 10000;
    camera.touchMoveSensibility = 200;
  } else {
    camera.speed = 20;
    const W_KEY = 87;
    const UP_KEY = 38;
    const A_KEY = 65;
    const LEFT_KEY = 37;
    const S_KEY = 83;
    const DOWN_KEY = 40;
    const D_KEY = 68;
    const RIGHT_KEY = 39;
    const Q_KEY = 81;
    const E_KEY = 69;

    camera.keysUp = [W_KEY, UP_KEY];
    camera.keysLeft = [A_KEY, LEFT_KEY];
    camera.keysDown = [S_KEY, DOWN_KEY];
    camera.keysRight = [D_KEY, RIGHT_KEY];
    camera.keysRotateLeft.push(Q_KEY);
    camera.keysRotateRight.push(E_KEY);
  }

  if (canvas && !hasTouchScreen()) {
    canvas.addEventListener(
      'click',
      () => {
        canvas.requestPointerLock =
          canvas.requestPointerLock ||
          canvas.msRequestPointerLock ||
          canvas.mozRequestPointerLock ||
          canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
          canvas.requestPointerLock();
        }
      },
      false
    );
  }

  const checkRegisteredActions = () => {
    const collider = scene.getMeshByName('collider');

    for (const action of actionsOnSpace) {
      for (const mesh of action.meshes) {
        if (collider && collider.intersectsMesh(mesh, false)) {
          action.callback(mesh);
          return;
        }
      }
    }
  };

  if (hasTouchScreen()) {
    scene.onPointerObservable.add((pointerInfo, eventState) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        moveToPickedObject(pointerInfo.pickInfo, camera);
      }
      if (pointerInfo.type === PointerEventTypes.POINTERDOUBLETAP) {
        checkRegisteredActions();
      }
    });
  } else {
    scene.onKeyboardObservable.add((keyboardInfo) => {
      if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (keyboardInfo.event.code === 'Space') {
          checkRegisteredActions();
        }
      }
    });
  }

  const screenWidth = Math.max(window.screen.width, window.innerWidth);

  let depth = 85;
  let offset = 40;

  if (screenWidth > 800) {
    depth = 55;
    offset = 30;
  } else if (screenWidth > 360) {
    depth = 85 - (30 / 440) * (screenWidth - 360);
    offset = 40 - (10 / 440) * (screenWidth - 360);
  }

  const collider = MeshBuilder.CreateBox(
    'collider',
    { width: 1, depth: depth, height: 1 },
    scene
  );

  collider.parent = camera;
  collider.visibility = 0;
  collider.position = new Vector3(0, 0, offset);
  collider.isPickable = false;
};
