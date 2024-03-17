import seedrandom from 'seedrandom';
import {
  Vector3,
  SceneLoader,
  Mesh,
  MirrorTexture,
  BackgroundMaterial,
  Color3,
  PBRMaterial,
  AbstractMesh,
  Texture,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
} from '@babylonjs/core';
import {
  HudInfos,
  Picture,
  Room,
  RoomElement,
  RoomType,
} from '../global/types';
import { Scene } from '@babylonjs/core';
import { Dispatch, SetStateAction } from 'react';
import {
  registerEnterMeshAction,
  registerExitMeshAction,
  registerSpaceAction,
} from './Inputs';

const drawRoomSignNumber = (roomNumber: number, material: StandardMaterial) => {
  const roomNumberTexture = new DynamicTexture('dynamic texture', {
    width: 125,
    height: 43,
  });

  const font = 'bold 36px Arial';
  roomNumberTexture.drawText(
    roomNumber.toString(),
    null,
    null,
    font,
    'white',
    '#3C2013',
    true
  );
  material.diffuseTexture = roomNumberTexture;
};

const addDoor = (
  scene: Scene,
  row: number,
  col: number,
  wall: 'top' | 'bottom' | 'left' | 'right',
  side: number,
  gotoRoom: (room: number) => void,
  name: string,
  currentRoom: number
): Promise<Array<AbstractMesh>> =>
  new Promise((resolve, reject) => {
    SceneLoader.ImportMesh('', '/models/', 'door.glb', scene, (meshes) => {
      for (const mesh of meshes) {
        if (mesh.name === '__root__') {
          mesh.scaling = new Vector3(1, 1, 1);
          if (wall === 'right') {
            mesh.rotation = new Vector3(0, -Math.PI / 2, 0);
            mesh.position = new Vector3(47 + col * 100, 0, row * 100);
          } else if (wall === 'top') {
            mesh.rotation = new Vector3(0, Math.PI, 0);
            mesh.position = new Vector3(col * 100, 0, 48 + row * 100);
          } else if (wall === 'left') {
            mesh.rotation = new Vector3(0, Math.PI / 2, 0);
            mesh.position = new Vector3(col * 100 - 48, 0, row * 100);
          } else {
            mesh.rotation = new Vector3(0, 0, 0);
            mesh.position = new Vector3(col * 100, 0, row * 100 - 48);
          }
        }
        mesh.name = `${name}#${row}.${col}.${wall}.${side}`;
        mesh.checkCollisions = true;
      }

      const plane = MeshBuilder.CreatePlane(
        'textPlane',
        {
          width: 12.5,
          height: 4.3,
          sideOrientation: Mesh.DOUBLESIDE,
        },
        scene
      );
      const material = new StandardMaterial('textPlaneMaterial', scene);
      material.sideOrientation = Mesh.DOUBLESIDE;
      if (wall === 'right') {
        plane.rotation = new Vector3(0, Math.PI / 2, 0);
        plane.position = new Vector3(48.5 + col * 100, 62.5, row * 100);
      } else if (wall === 'top') {
        plane.rotation = new Vector3(0, 0, 0);
        plane.position = new Vector3(col * 100, 62.5, 49.5 + row * 100);
      } else if (wall === 'left') {
        plane.rotation = new Vector3(0, -Math.PI / 2, 0);
        plane.position = new Vector3(col * 100 - 49.5, 62.5, row * 100);
      } else {
        plane.rotation = new Vector3(0, Math.PI, 0);
        plane.position = new Vector3(col * 100, 62.5, row * 100 - 49.5);
      }

      if (name === 'Exit Door') {
        registerSpaceAction(meshes, () => {
          gotoRoom(0);
        });
        const exitSignTexture = new Texture('/textures/exit-sign.png', null);
        material.diffuseTexture = exitSignTexture;
      } else if (name === 'Next Room Door') {
        registerSpaceAction(meshes, () => {
          gotoRoom(currentRoom + 1);
        });
        drawRoomSignNumber(currentRoom + 1, material);
      } else if (name === 'Previous Room Door') {
        registerSpaceAction(meshes, () => {
          gotoRoom(currentRoom - 1);
        });
        drawRoomSignNumber(currentRoom - 1, material);
      }
      plane.material = material;
      resolve(meshes);
    });
  });

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

const arrangeGallery = (
  hash: string,
  rooms: Array<Room>,
  roomElements: Array<RoomElement>
) => {
  const random = seedrandom(hash);
  let options = rooms.filter((room) => room.space > 0);
  setupSlots(options);

  for (const roomElement of roomElements) {
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
        if (roomElement.useWholeWall) {
          roomElement.position = {
            row: choice.row,
            col: choice.col,
            wall: slot,
            side: side,
            hasNeighbour: false,
          };
          chosenSlot[0] = 0;
          chosenSlot[1] = 0;
          choice.space -= 2;
        } else if (chosenSlot[side] === 1) {
          roomElement.position = {
            row: choice.row,
            col: choice.col,
            wall: slot,
            side: side,
            hasNeighbour: false,
          };
          chosenSlot[side] = 0;
          choice.space -= 1;
        } else {
          roomElement.position = {
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

  for (const roomElement of roomElements) {
    if (roomElement.position) {
      const { row, col, wall, side } = roomElement.position;
      const neighbours = roomElements.filter(
        (candidate) =>
          !candidate.useWholeWall &&
          candidate.position?.row === row &&
          candidate.position?.col === col &&
          candidate.position?.wall === wall &&
          candidate.position?.side === 1 - side
      );
      roomElement.position.hasNeighbour = neighbours.length > 0;
    }
  }

  return roomElements;
};

const drawRoomElement = async (
  roomElement: RoomElement,
  scene: Scene,
  setHudDisplayVisible: Dispatch<SetStateAction<boolean>>,
  setHudInfos: Dispatch<SetStateAction<HudInfos>>,
  probe: MirrorTexture,
  gotoRoom: (room: number) => void,
  currentRoom: number
) => {
  if (roomElement.position) {
    const { row, col, wall, side, hasNeighbour } = roomElement.position;
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

    if (roomElement.type === 'picture') {
      for (const model of ['frame-square.glb', 'frame.glb']) {
        SceneLoader.ImportMesh('', '/models/', model, scene, (meshes) => {
          const isRectangular = model === 'frame.glb';

          for (const mesh of meshes) {
            if (mesh.material) {
              mesh.material.sideOrientation = Mesh.DOUBLESIDE;
            }

            if (mesh.name === 'Collider') {
              mesh.visibility = 0;
              mesh.metadata = {
                removeGroup: () => {
                  for (const part of meshes) {
                    part.material?.dispose();
                    part.dispose();
                    scene.removeMesh(part);

                    if (part.name === '__root__') {
                      probe.renderList =
                        probe.renderList?.filter(
                          (probeMesh) => probeMesh !== part
                        ) || [];
                    }
                  }
                },
              };

              registerSpaceAction([mesh], (source) => {
                const collider = scene.getMeshByName('collider');

                if (collider) {
                  collider.metadata?.removeCollidedMeshes();
                }

                setHudDisplayVisible(false);
                setHudInfos({
                  name: '',
                  offline: true,
                  description: '',
                  link: '',
                });
              });

              registerEnterMeshAction(scene, [mesh], () => {
                const collider = scene.getMeshByName('collider');
                if (collider) {
                  collider.metadata = {
                    collidedMeshes: meshes,
                    removeCollidedMeshes: () => {
                      for (const mesh of meshes) {
                        mesh.material?.dispose();
                        mesh.dispose();
                        scene.removeMesh(mesh);
                      }
                      setHudDisplayVisible(false);
                      setHudInfos({
                        name: '',
                        offline: true,
                        description: '',
                        link: '',
                      });
                      collider.metadata = null;
                    },
                    paintingName: roomElement.name,
                  };
                }

                const isOffline = (roomElement as Picture).offline;

                setHudDisplayVisible(true);
                setHudInfos({
                  name: roomElement.name,
                  offline: typeof isOffline !== 'undefined' ? isOffline : true,
                  description: (roomElement as Picture).description,
                  link: (roomElement as Picture).link,
                });
              });

              registerExitMeshAction(scene, [mesh], () => {
                const collider = scene.getMeshByName('collider');
                if (collider) {
                  collider.metadata = null;
                }

                setHudDisplayVisible(false);
                setHudInfos({
                  name: '',
                  offline: true,
                  description: '',
                  link: '',
                });
              });
            }

            if (mesh.name === 'Passepartout') {
              (mesh.material as PBRMaterial).emissiveColor = new Color3(
                1,
                1,
                1
              );
              (mesh.material as PBRMaterial).emissiveIntensity = 0.3;
            }

            if (mesh.name === 'Painting') {
              const paintingMaterial = new BackgroundMaterial(
                `Painting#material#${row}.${col}.${wall}.${side}#${
                  isRectangular ? 'rect' : 'square'
                }`,
                scene
              );

              paintingMaterial.opacityFresnel = false;

              const loadingTexture = scene.getTextureByName('LoadingTexture');

              if (loadingTexture) {
                paintingMaterial.diffuseTexture = loadingTexture;
              }

              mesh.material = paintingMaterial;
              mesh.material.sideOrientation = Mesh.DOUBLESIDE;
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

              mesh.metadata = {
                removeGroup: () => {
                  for (const mesh of meshes) {
                    mesh.material?.dispose();
                    mesh.dispose();
                    scene.removeMesh(mesh);
                  }
                  if (mesh.name === '__root__') {
                    probe.renderList =
                      probe.renderList?.filter(
                        (probeMesh) => probeMesh !== mesh
                      ) || [];
                  }
                },
              };

              if (mesh.name.includes('Collider')) {
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
    } else if (roomElement.type === 'door') {
      await addDoor(
        scene,
        row,
        col,
        wall,
        side,
        gotoRoom,
        roomElement.name,
        currentRoom
      );
    }
  }
};

export { arrangeGallery, drawRoomElement, setupSlots };
