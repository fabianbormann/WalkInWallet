import React from 'react';
import {
  UniversalCamera,
  Vector3,
  Color3,
  HemisphericLight,
  TouchCamera,
  Texture,
  MirrorTexture,
  Plane,
  PointerEventTypes,
  Scene,
  Color4,
  BackgroundMaterial,
} from '@babylonjs/core';

import SceneComponent from 'babylonjs-hook';
import '@babylonjs/loaders/glTF';
import { createRoomTile } from './RoomBuilder';
import { drawRoomElement } from './PaintingDrawer';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HudInfos, SceneProps } from '../global/types';
import { styled } from '@mui/system';
import { Grid, Link, Typography, useTheme } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { hasTouchScreen, moveToPickedPicture, setupInputs } from './Inputs';

const FullView = styled('div')({
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  outline: 'none',
});

const Hud = styled(`div`)({
  bottom: 0,
  position: 'absolute',
  width: '100%',
  borderTop: '1px solid rgba(255, 255, 255, 0.85)',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(9px)',
});

const MainScene = ({
  gallery,
  paintings,
  roomElements,
  onSceneReady,
  isVisible,
  page,
  address,
}: SceneProps) => {
  const CAMERA_HEIGHT = 40;
  const [hudDisplayVisible, setHudDisplayVisible] = useState(false);
  const [mainScene, setMainScene] = useState<Scene>();
  const [initialized, setInitialized] = useState(false);
  const [hudInfos, setHudInfos] = useState<HudInfos>({
    name: '',
    offline: true,
    description: '',
    link: '',
  });

  const loadedPictures = useRef<Array<string>>([]);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (
      typeof mainScene !== 'undefined' &&
      typeof gallery !== 'undefined' &&
      typeof roomElements !== 'undefined' &&
      typeof onSceneReady === 'function' &&
      !initialized
    ) {
      let camera: TouchCamera;

      if (hasTouchScreen()) {
        camera = new TouchCamera('MainCamera', new Vector3(0, 3, 0), mainScene);
      } else {
        camera = new UniversalCamera(
          'MainCamera',
          new Vector3(0, 3, 0),
          mainScene
        );

        mainScene.ambientColor = new Color3(0.2, 0.2, 0.2);
        mainScene.shadowsEnabled = true;
        mainScene.onPrePointerObservable.add((pointerInfo) => {
          if (
            [
              PointerEventTypes.POINTERDOWN,
              PointerEventTypes.POINTERUP,
              PointerEventTypes.POINTERTAP,
            ].includes(pointerInfo.type)
          ) {
            var width = mainScene.getEngine().getRenderWidth();
            var height = mainScene.getEngine().getRenderHeight();

            const pickingInfo = mainScene.pick(width / 2, height / 2);
            moveToPickedPicture(pickingInfo, camera);
            pointerInfo.skipOnPointerObservable = true;
          }
        });
      }
      const canvas = mainScene.getEngine().getRenderingCanvas();

      camera.setTarget(new Vector3(150, camera.position.y, 0));
      camera.attachControl(canvas, true);
      camera.fov = 0.8;
      camera.inertia = 0;
      camera.ellipsoid = new Vector3(1.5, 0.5, 1.5);
      camera.checkCollisions = true;

      setupInputs(camera, canvas, mainScene);

      const light = new HemisphericLight(
        'HemisphericLight',
        new Vector3(0, 0, 0),
        mainScene
      );
      light.diffuse = new Color3(1, 1, 1);
      light.specular = new Color3(0.2, 0.2, 0.2);
      light.intensity = 1.3;

      mainScene.clearColor = new Color4(0, 0, 0, 1);

      const reflectionTexture = new MirrorTexture(
        'mirror',
        1024,
        mainScene,
        true
      );

      reflectionTexture.mirrorPlane = new Plane(0, -1.0, 0, 0);
      reflectionTexture.level = 0.2;
      reflectionTexture.adaptiveBlurKernel = 15;

      for (const room of gallery) {
        createRoomTile(
          room.type,
          room.row,
          room.col,
          mainScene,
          reflectionTexture
        );
      }

      for (const roomElement of roomElements) {
        if (roomElement.position) {
          drawRoomElement(
            roomElement,
            mainScene,
            setHudDisplayVisible,
            setHudInfos,
            reflectionTexture,
            (room: number) => {
              if (room === 0) {
                navigate('/', { replace: true });
              } else {
                navigate(`/${address}/${room}`, { replace: true });
              }
            },
            page
          );
        }
      }

      mainScene.executeWhenReady(() => onSceneReady());
      mainScene.registerBeforeRender(() => {
        camera.position.y = CAMERA_HEIGHT;
      });
      setInitialized(true);
    }
  }, [
    mainScene,
    initialized,
    onSceneReady,
    hasTouchScreen,
    gallery,
    roomElements,
  ]);

  useEffect(() => {
    let loadingTexture = mainScene?.getTextureByName(
      'LoadingTexture'
    ) as Texture;
    if (!loadingTexture) {
      loadingTexture = new Texture('/loading_animation.png', mainScene);

      loadingTexture.uScale = -1 / 10;
      loadingTexture.vScale = 1;
      loadingTexture.uOffset = 0;
      loadingTexture.vOffset = 1;
      loadingTexture.name = 'LoadingTexture';
    }

    const intervalId = setInterval(() => {
      if (loadingTexture.uOffset >= 1 - 2 / 10) {
        loadingTexture.uOffset = 0;
      } else {
        loadingTexture.uOffset = loadingTexture.uOffset + 1 / 10;
      }
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (typeof mainScene !== 'undefined' && typeof paintings !== 'undefined') {
      for (const painting of paintings) {
        if (painting.position) {
          const { row, col, wall, side } = painting.position;
          if (
            !loadedPictures.current.includes(`${row}.${col}.${wall}.${side}`)
          ) {
            loadedPictures.current.push(`${row}.${col}.${wall}.${side}`);
            if (painting.width && painting.height && painting.image) {
              const ratio = painting.width / painting.height;
              const paintingTexture = new Texture(painting.image, mainScene);
              paintingTexture.uScale = -1;
              paintingTexture.invertZ = true;

              if (ratio > 0.9 && ratio < 1.1) {
                const paintingMaterial = mainScene.getMaterialByName(
                  `Painting#material#${row}.${col}.${wall}.${side}#square`
                ) as BackgroundMaterial;

                if (paintingMaterial) {
                  for (const meshName of [
                    'Painting',
                    'Passepartout',
                    'Frame',
                  ]) {
                    const baseName = `${meshName}#${row}.${col}.${wall}.${side}#`;
                    const rectMesh = mainScene.getMeshByName(baseName + 'rect');
                    const squareMesh = mainScene.getMeshByName(
                      baseName + 'square'
                    );

                    if (rectMesh) {
                      rectMesh.metadata.removeGroup();
                    }

                    if (squareMesh) {
                      squareMesh.visibility = 1;
                    }
                  }
                  try {
                    paintingMaterial.diffuseTexture = paintingTexture;
                  } catch (error) {
                    console.log(error);
                  }
                }
              } else {
                const paintingMaterial = mainScene.getMaterialByName(
                  `Painting#material#${row}.${col}.${wall}.${side}#rect`
                ) as BackgroundMaterial;

                if (paintingMaterial) {
                  for (const meshName of [
                    'Painting',
                    'Passepartout',
                    'Frame',
                  ]) {
                    const baseName = `${meshName}#${row}.${col}.${wall}.${side}#`;
                    const rectMesh = mainScene.getMeshByName(baseName + 'rect');
                    const squareMesh = mainScene.getMeshByName(
                      baseName + 'square'
                    );

                    if (rectMesh) {
                      rectMesh.visibility = 1;
                    }

                    if (squareMesh) {
                      squareMesh.metadata.removeGroup();
                    }
                  }
                  try {
                    paintingMaterial.diffuseTexture = paintingTexture;
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
            }
          }
        }
      }
    }
  }, [mainScene, paintings]);

  return (
    <FullView
      style={{
        position: 'relative',
        display: isVisible ? 'block' : 'none',
      }}
    >
      <SceneComponent
        style={{
          height: '100%',
          width: '100%',
          outline: 'none',
          cursor: 'pointer',
        }}
        antialias
        onSceneReady={(scene) => setMainScene(scene)}
      />
      <Hud
        style={{
          display: hudDisplayVisible ? 'block' : 'none',
        }}
      >
        <Grid
          sx={{
            padding: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Link
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: 1,
              color: theme.palette.secondary.main,
            }}
            target="_blank"
            rel="noopener noreferrer"
            href={hudInfos.link}
          >
            {hudInfos.name} {hudInfos.offline ? <LinkOffIcon /> : <LinkIcon />}
          </Link>
          <Typography
            gutterBottom
            sx={{
              maxHeight: '15vh',
              overflowY: 'auto',
            }}
          >
            {hudInfos.offline
              ? 'This artwork is offline, protected or currently unfetchable. Try to click on the artwork title and use it as direct link to get more information.'
              : hudInfos.description}
          </Typography>
        </Grid>
      </Hud>
    </FullView>
  );
};

export default MainScene;
