import {
  KeyboardEventTypes,
  Nullable,
  PickingInfo,
  TouchCamera,
  UniversalCamera,
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

export const moveToPickedPicture = (
  pickInfo: Nullable<PickingInfo>,
  camera: UniversalCamera | TouchCamera
) => {
  if (!pickInfo) return;

  if (
    (pickInfo.hit && pickInfo.pickedMesh?.name?.startsWith('Collider#')) ||
    pickInfo.pickedMesh?.name?.startsWith('Painting#')
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

export const setupKeys = (
  camera: UniversalCamera | TouchCamera,
  canvas: Nullable<HTMLCanvasElement>
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

    if (canvas) {
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

    const scene = camera.getScene();

    scene.onKeyboardObservable.add((keyboardInfo) => {
      if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (keyboardInfo.event.code === 'Space') {
          const collider = scene.getMeshByName('collider');
          if (typeof collider?.metadata?.removeCollidedMeshes === 'function') {
            collider.metadata.removeCollidedMeshes();
          }
        }
      }
    });
  }
};
