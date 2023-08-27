import {
  Vector3,
  Texture,
  MeshBuilder,
  Mesh,
  PBRMetallicRoughnessMaterial,
  Color3,
  Scene,
  MirrorTexture,
  PointLight,
  Light,
  SceneLoader,
  PBRMaterial,
  StandardMaterial,
  AbstractMesh,
} from '@babylonjs/core';
import { RoomType } from '../global/types';

const addLamp = (
  scene: Scene,
  row: number,
  col: number
): Promise<{ lampLight: PointLight; lampMeshes: Array<AbstractMesh> }> =>
  new Promise((resolve, reject) => {
    const pointLight = new PointLight(
      'PointLight',
      new Vector3(col * 100, 50, row * 100),
      scene
    );

    pointLight.falloffType = Light.FALLOFF_DEFAULT;
    pointLight.range = 80;
    pointLight.radius = 0.6;
    pointLight.intensity = 0.3;
    pointLight.diffuse = new Color3(1, 1, 1);
    pointLight.specular = new Color3(0.5, 0.5, 0.5);

    SceneLoader.ImportMesh('', '/models/', 'lamp.glb', scene, (meshes) => {
      for (const mesh of meshes) {
        if (mesh.name.endsWith('primitive2')) {
          const material = mesh.material as PBRMaterial;
          material.emissiveColor = new Color3(1, 1, 1);
          material.emissiveIntensity = 1;
        }

        mesh.rotation = new Vector3(0, 0, 0);
        mesh.scaling = new Vector3(1, 1, 1);
        mesh.position = new Vector3(col * 50, 40.1, row * 50);
      }

      resolve({ lampLight: pointLight, lampMeshes: meshes });
    });
  });

const createRoomTile = (
  type: RoomType,
  row: number,
  col: number,
  scene: Scene,
  probe: MirrorTexture
) => {
  const wallMaterial = new PBRMetallicRoughnessMaterial('wallMaterial', scene);
  const wallBaseTexture = new Texture(
    '/textures/Wallpaper_Glassweave_001_basecolor.jpg',
    null
  );

  wallBaseTexture.uScale = 2;
  wallBaseTexture.vScale = 2;

  wallMaterial.metallic = 0;
  wallMaterial.roughness = 1;
  wallMaterial.baseTexture = wallBaseTexture;

  const wallMetallicRoughnessTexture = new Texture(
    '/textures/Wallpaper_Glassweave_001_roughness.jpg',
    null
  );

  wallMetallicRoughnessTexture.uScale = 2;
  wallMetallicRoughnessTexture.vScale = 2;

  wallMaterial.metallicRoughnessTexture = wallMetallicRoughnessTexture;

  const wallNormalTexture = new Texture(
    '/textures/Wallpaper_Glassweave_001_normal.jpg',
    null
  );

  wallNormalTexture.uScale = 2;
  wallNormalTexture.vScale = 2;
  wallMaterial.normalTexture = wallNormalTexture;

  const ceilingMaterial = new PBRMetallicRoughnessMaterial(
    'GroundMaterial',
    scene
  );

  ceilingMaterial.baseColor = new Color3(1, 1, 1);
  ceilingMaterial.metallic = 0.2;
  ceilingMaterial.roughness = 0.6;

  const ceiling = MeshBuilder.CreatePlane('Ceiling', {
    size: 100,
    sideOrientation: Mesh.DOUBLESIDE,
  });
  ceiling.rotation = new Vector3(Math.PI / 2, 0, 0);
  ceiling.position = new Vector3(col * 100, 80, row * 100);
  ceiling.material = ceilingMaterial;
  if (probe.renderList) {
    probe.renderList.push(ceiling);
  }

  const ground = MeshBuilder.CreatePlane(
    'Ground',
    { size: 100, sideOrientation: Mesh.FRONTSIDE },
    scene
  );
  ground.rotation = new Vector3(Math.PI / 2, 0, 0);
  ground.position = new Vector3(col * 100, 0, row * 100);

  const groundMaterial = new StandardMaterial('ground', scene);
  const groundDiffuseTexture = new Texture(
    '/textures/Marble_White_006_basecolor.jpg',
    scene
  );

  groundMaterial.diffuseTexture = groundDiffuseTexture;
  groundMaterial.ambientColor = new Color3(1, 1, 1);
  groundMaterial.reflectionTexture = probe;
  ground.material = groundMaterial;

  addLamp(scene, row, col).then(({ lampLight, lampMeshes }) => {
    const walls: Array<Mesh> = [];

    if (
      [
        RoomType.TOP_CLOSED,
        RoomType.CORNER_LEFT_TOP,
        RoomType.CORNER_RIGHT_TOP,
        RoomType.HORIZONTAL_FLOOR,
        RoomType.LEFT_OPEN,
        RoomType.RIGHT_OPEN,
        RoomType.BOTTOM_OPEN,
      ].includes(type)
    ) {
      const front = MeshBuilder.CreatePlane(
        'Front Wall',
        { width: 100, height: 80, sideOrientation: Mesh.DOUBLESIDE },
        scene
      );
      front.position = new Vector3(col * 100, 40, 50 + row * 100);
      walls.push(front);
    }

    if (
      [
        RoomType.LEFT_CLOSED,
        RoomType.CORNER_LEFT_TOP,
        RoomType.CORNER_LEFT_BOTTOM,
        RoomType.VERTICAL_FLOOR,
        RoomType.TOP_OPEN,
        RoomType.RIGHT_OPEN,
        RoomType.BOTTOM_OPEN,
      ].includes(type)
    ) {
      const left = MeshBuilder.CreatePlane(
        'Left Wall',
        { width: 100, height: 80, sideOrientation: Mesh.DOUBLESIDE },
        scene
      );
      left.position = new Vector3(-50 + col * 100, 40, row * 100);
      left.rotation = new Vector3(0, -Math.PI / 2, 0);
      walls.push(left);
    }

    if (
      [
        RoomType.RIGHT_CLOSED,
        RoomType.CORNER_RIGHT_TOP,
        RoomType.CORNER_RIGHT_BOTTOM,
        RoomType.VERTICAL_FLOOR,
        RoomType.TOP_OPEN,
        RoomType.LEFT_OPEN,
        RoomType.BOTTOM_OPEN,
      ].includes(type)
    ) {
      const right = MeshBuilder.CreatePlane(
        'Right Wall',
        { width: 100, height: 80, sideOrientation: Mesh.DOUBLESIDE },
        scene
      );
      right.position = new Vector3(col * 100 + 50, 40, row * 100 + 0);
      right.rotation = new Vector3(0, Math.PI / 2, 0);
      walls.push(right);
    }

    if (
      [
        RoomType.BOTTOM_CLOSED,
        RoomType.CORNER_LEFT_BOTTOM,
        RoomType.CORNER_RIGHT_BOTTOM,
        RoomType.HORIZONTAL_FLOOR,
        RoomType.TOP_OPEN,
        RoomType.LEFT_OPEN,
        RoomType.RIGHT_OPEN,
      ].includes(type)
    ) {
      const back = MeshBuilder.CreatePlane(
        'Back Wall',
        { width: 100, height: 80, sideOrientation: Mesh.DOUBLESIDE },
        scene
      );
      back.position = new Vector3(col * 100, 40, -50 + row * 100);
      back.rotation = new Vector3(0, Math.PI, 0);
      walls.push(back);
    }

    probe.renderList?.push(...lampMeshes);

    for (const wall of walls) {
      wall.checkCollisions = true;
      wall.material = wallMaterial;
      wall.receiveShadows = true;

      if (probe.renderList) {
        probe.renderList.push(wall);
      }
    }

    lampLight.includedOnlyMeshes = [ceiling, ...lampMeshes, ...walls, ground];
  });
};

export { createRoomTile };
