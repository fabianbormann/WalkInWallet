import seedrandom from 'seedrandom';
import {
  Vector3,
  SceneLoader,
  Mesh,
  PBRMetallicRoughnessMaterial,
  ExecuteCodeAction,
  ActionManager,
  MirrorTexture,
} from '@babylonjs/core';
import { HudInfos, Picture, Room, RoomType } from '../global/types';
import { Scene } from '@babylonjs/core';
import { Dispatch, SetStateAction } from 'react';

const setupSlots = (rooms: Array<Room>) => {
  for (const room of rooms) {
    if (room.type === RoomType.BOTTOM_CLOSED) {
      room.slots = { bottom: [1, 1] };
    } else if (room.type === RoomType.TOP_CLOSED) {
      room.slots = { top: [1, 1] };
    } else if (room.type === RoomType.LEFT_CLOSED) {
      room.slots = { left: [1, 1] };
    } else if (room.type === RoomType.RIGHT_CLOSED) {
      room.slots = { right: [1, 1] };
    } else if (room.type === RoomType.BOTTOM_OPEN) {
      room.slots = {
        top: [1, 1],
        left: [1, 1],
        right: [1, 1],
      };
    } else if (room.type === RoomType.TOP_OPEN) {
      room.slots = {
        bottom: [1, 1],
        left: [1, 1],
        right: [1, 1],
      };
    } else if (room.type === RoomType.LEFT_OPEN) {
      room.slots = {
        top: [1, 1],
        bottom: [1, 1],
        right: [1, 1],
      };
    } else if (room.type === RoomType.RIGHT_OPEN) {
      room.slots = {
        top: [1, 1],
        left: [1, 1],
        bottom: [1, 1],
      };
    } else if (room.type === RoomType.CORNER_LEFT_BOTTOM) {
      room.slots = {
        left: [1, 1],
        bottom: [1, 1],
      };
    } else if (room.type === RoomType.CORNER_LEFT_TOP) {
      room.slots = {
        left: [1, 1],
        top: [1, 1],
      };
    } else if (room.type === RoomType.CORNER_RIGHT_BOTTOM) {
      room.slots = {
        right: [1, 1],
        bottom: [1, 1],
      };
    } else if (room.type === RoomType.CORNER_RIGHT_TOP) {
      room.slots = {
        right: [1, 1],
        top: [1, 1],
      };
    } else if (room.type === RoomType.HORIZONTAL_FLOOR) {
      room.slots = {
        bottom: [1, 1],
        top: [1, 1],
      };
    } else if (room.type === RoomType.VERTICAL_FLOOR) {
      room.slots = {
        left: [1, 1],
        right: [1, 1],
      };
    } else if (room.type === RoomType.SPACE) {
      room.slots = {};
    }
  }
};

const hangPaintings = (
  hash: string,
  rooms: Array<Room>,
  paintings: Array<Picture>
) => {
  const random = seedrandom(hash);
  let options = rooms.filter((room) => room.space > 0);
  setupSlots(options);

  for (const painting of paintings) {
    const choice = options[Math.floor(random() * options.length)];

    if (typeof choice.slots !== 'undefined') {
      const slots = Object.keys(choice.slots);
      const slot = slots[Math.floor(random() * slots.length)] as
        | 'top'
        | 'bottom'
        | 'left'
        | 'right';

      const side = Math.round(random());
      const chosenSlot = choice.slots[slot];

      if (typeof chosenSlot !== 'undefined') {
        if (chosenSlot[side] === 1) {
          painting.position = {
            row: choice.row,
            col: choice.col,
            wall: slot,
            side: side,
            hasNeighbour: false,
          };
          chosenSlot[side] = 0;
          choice.space -= 1;
        } else {
          painting.position = {
            row: choice.row,
            col: choice.col,
            wall: slot,
            side: 1 - side,
            hasNeighbour: false,
          };
          chosenSlot[1 - side] = 0;
          choice.space -= 1;
        }

        if (chosenSlot[side] === 0 && chosenSlot[1 - side] === 0) {
          delete choice.slots[slot];
        }

        options = options.filter((room) => room.space > 0);
      }
    }
  }

  for (const painting of paintings) {
    if (painting.position) {
      const { row, col, wall, side } = painting.position;
      const neighbours = paintings.filter(
        (candidate) =>
          candidate.position?.row === row &&
          candidate.position?.col === col &&
          candidate.position?.wall === wall &&
          candidate.position?.side === 1 - side
      );
      painting.position.hasNeighbour = neighbours.length > 0;
    }
  }

  return paintings;
};

const drawPainting = (
  painting: Picture,
  scene: Scene,
  setHudDisplayVisible: Dispatch<SetStateAction<boolean>>,
  setHudInfos: Dispatch<SetStateAction<HudInfos>>,
  probe: MirrorTexture
) => {
  if (painting.position) {
    const { row, col, wall, side, hasNeighbour } = painting.position;
    let rowOffset = 100 * row;
    let colOffset = 100 * col - 6;

    let rotation = new Vector3(0, 0, 0);

    if (wall === 'bottom') {
      rowOffset -= 91.9;

      if (side === 0 && hasNeighbour) {
        colOffset -= 15;
      } else if (side === 1 && hasNeighbour) {
        colOffset += 30;
      }

      rotation = new Vector3(0, Math.PI, 0);
    }

    if (wall === 'top') {
      rowOffset += 3.5;

      if (side === 0 && hasNeighbour) {
        colOffset -= 20;
      } else if (side === 1 && hasNeighbour) {
        colOffset += 22.5;
      }
    }

    if (wall === 'right') {
      rotation = new Vector3(0, Math.PI / 2, 0);
      rowOffset -= 46.25;
      colOffset += 53.9;

      if (side === 0 && hasNeighbour) {
        rowOffset -= 22.5;
      } else if (side === 1 && hasNeighbour) {
        rowOffset += 22.5;
      }
    }

    if (wall === 'left') {
      rotation = new Vector3(0, -Math.PI / 2, 0);
      rowOffset -= 46.25;
      colOffset -= 41.9;

      if (side === 0 && hasNeighbour) {
        rowOffset -= 20;
      } else if (side === 1 && hasNeighbour) {
        rowOffset += 20;
      }
    }

    for (const model of ['frame-square.glb', 'frame.glb']) {
      SceneLoader.ImportMesh('', '/models/', model, scene, (meshes) => {
        const isRectangular = model === 'frame.glb';

        for (const mesh of meshes) {
          if (mesh.material) {
            mesh.material.sideOrientation = Mesh.DOUBLESIDE;
          }

          if (mesh.name === 'Collider') {
            mesh.visibility = 0;
            mesh.checkCollisions = true;
          }

          if (mesh.name === 'Painting') {
            const paintingMaterial = new PBRMetallicRoughnessMaterial(
              `Painting#material#${row}.${col}.${wall}.${side}#${
                isRectangular ? 'rect' : 'square'
              }`,
              scene
            );

            const loadingTexture = scene.getTextureByName('LoadingTexture');

            if (loadingTexture) {
              paintingMaterial.baseTexture = loadingTexture;
            }
            paintingMaterial.metallic = 0.1;
            paintingMaterial.roughness = 0.9;

            mesh.material = paintingMaterial;
            mesh.material.sideOrientation = Mesh.DOUBLESIDE;

            const hudInfos = {
              name: painting.name,
              offline: painting.offline,
              description: painting.description,
              link: painting.link,
            } as HudInfos;

            if (isRectangular) {
              mesh.actionManager = new ActionManager(scene);
              const enterAction = new ExecuteCodeAction(
                {
                  trigger: ActionManager.OnIntersectionEnterTrigger,
                  parameter: { mesh: scene.getMeshByName('collider') },
                },
                () => {
                  setHudDisplayVisible(true);
                  setHudInfos(hudInfos);
                }
              );
              const exitAction = new ExecuteCodeAction(
                {
                  trigger: ActionManager.OnIntersectionExitTrigger,
                  parameter: { mesh: scene.getMeshByName('collider') },
                },
                () => {
                  setHudDisplayVisible(false);
                  setHudInfos({
                    name: '',
                    offline: true,
                    description: '',
                    link: '',
                  });
                }
              );
              mesh.actionManager.registerAction(enterAction);
              mesh.actionManager.registerAction(exitAction);
            }
          }

          if (mesh.name !== '__root__') {
            if (probe.renderList) {
              probe.renderList.push(mesh);
            }
            mesh.name = `${mesh.name}#${row}.${col}.${wall}.${side}#${
              isRectangular ? 'rect' : 'square'
            }`;
            if (isRectangular) {
              mesh.visibility = 0;
            }

            if (mesh.name.includes('Collider') && !isRectangular) {
              mesh.isPickable = true;
            } else {
              mesh.isPickable = false;
            }
          } else {
            mesh.position = new Vector3(0 + colOffset, 15, 44 + rowOffset);
            mesh.rotation = rotation;
          }
        }
      });
    }
  }
};

export { hangPaintings, drawPainting };
