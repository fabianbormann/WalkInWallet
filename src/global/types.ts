export type NftData = {
  uri: string;
};

export type PicturePosition = {
  row: number;
  col: number;
  wall: string;
  side: number;
  hasNeighbour: boolean;
};

export type Picture = {
  name: string;
  image: string;
  link: string;
  description: string;
  metadata?: string;
  data?: Array<NftData>;
  width?: number;
  height?: number;
  offline?: boolean;
  position?: PicturePosition;
};

export type HeaderProps = {
  logoType?: 'full' | 'back';
};

export type NftFetchResponse = Array<{
  name: string;
  image: string;
  url: string;
  description: string;
}>;

export enum RoomType {
  LEFT_OPEN,
  RIGHT_OPEN,
  BOTTOM_OPEN,
  TOP_OPEN,
  VERTICAL_FLOOR,
  HORIZONTAL_FLOOR,
  CORNER_LEFT_TOP,
  CORNER_RIGHT_TOP,
  CORNER_LEFT_BOTTOM,
  CORNER_RIGHT_BOTTOM,
  SPACE,
  LEFT_CLOSED,
  RIGHT_CLOSED,
  BOTTOM_CLOSED,
  TOP_CLOSED,
  ROOM_CLOSED,
}

export type Slots = {
  top?: Array<number>;
  bottom?: Array<number>;
  left?: Array<number>;
  right?: Array<number>;
};

export type Room = {
  type: RoomType;
  id: number;
  extensions: number;
  row: number;
  col: number;
  above: number;
  below: number;
  left: number;
  right: number;
  space: number;
  slots?: Slots;
};

export type HudInfos = {
  name: string;
  offline: boolean;
  description: string;
  link: string;
};

export type BlockieProps = {
  address: string;
  scale?: number;
};

export type SceneProps = {
  gallery: Array<Room>;
  paintings: Array<Picture>;
  nfts: Array<Picture>;
  onSceneReady: () => void;
  isVisible: boolean;
};
