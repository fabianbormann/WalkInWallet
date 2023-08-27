export type NftData = {
  uri: string;
};

export type RoomElementPosition = {
  row: number;
  col: number;
  wall: 'top' | 'bottom' | 'left' | 'right';
  side: number;
  hasNeighbour: boolean;
};

export type RoomElement = {
  name: string;
  useWholeWall?: boolean;
  type: 'picture' | 'door';
  position?: RoomElementPosition;
};

export interface Picture extends RoomElement {
  image: string;
  link: string;
  description: string;
  metadata?: string;
  data?: Array<NftData>;
  width?: number;
  height?: number;
  offline?: boolean;
}

export type HeaderProps = {
  logoType?: 'full' | 'back';
};

export type NftFetchResponse = {
  stake_address: string;
  asset_list: Array<{
    decimals: number;
    quantity: number;
    policy_id: string;
    asset_name: string;
    fingerprint: string;
  }>;
};

export type NFTDetail = {
  policy_id: string;
  asset_name: string;
  asset_name_ascii: string;
  fingerprint: string;
  minting_tx_hash: string;
  total_supply: number;
  mint_cnt: number;
  burn_cnt: number;
  creation_time: number;
  minting_tx_metadata: {
    [metadataLabel: string]: {
      [policyId: string]: {
        [assetName: string]: {
          name: string;
          image: string;
          [key: string]: any;
        };
      };
    };
  };
  token_registry_metadata: {
    url: string;
    logo: string;
    name: string;
    ticker: string;
    decimals: 0;
    description: string;
  };
};

export type NftDetailResponse = Array<NFTDetail>;

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

export type SceneProps = {
  gallery: Array<Room>;
  paintings: Array<Picture>;
  roomElements: Array<RoomElement>;
  onSceneReady: () => void;
  isVisible: boolean;
  page: number;
  address: string;
};
