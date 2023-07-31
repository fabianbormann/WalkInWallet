import seedrandom from 'seedrandom';
import { Room, RoomType } from '../global/types';

const estimateRoomType = (room: Room) => {
  if (
    room['left'] > -1 &&
    room['right'] > -1 &&
    room['above'] > -1 &&
    room['below'] > -1
  ) {
    return RoomType.SPACE;
  } else if (
    room['left'] > -1 &&
    room['right'] > -1 &&
    room['above'] > -1 &&
    room['below'] === -1
  ) {
    return RoomType.BOTTOM_CLOSED;
  } else if (
    room['left'] > -1 &&
    room['right'] > -1 &&
    room['above'] === -1 &&
    room['below'] > -1
  ) {
    return RoomType.TOP_CLOSED;
  } else if (
    room['left'] > -1 &&
    room['right'] === -1 &&
    room['above'] > -1 &&
    room['below'] > -1
  ) {
    return RoomType.RIGHT_CLOSED;
  } else if (
    room['left'] === -1 &&
    room['right'] > -1 &&
    room['above'] > -1 &&
    room['below'] > -1
  ) {
    return RoomType.LEFT_CLOSED;
  } else if (
    room['left'] === -1 &&
    room['right'] === -1 &&
    room['above'] > -1 &&
    room['below'] > -1
  ) {
    return RoomType.VERTICAL_FLOOR;
  } else if (
    room['left'] > -1 &&
    room['right'] > -1 &&
    room['above'] === -1 &&
    room['below'] === -1
  ) {
    return RoomType.HORIZONTAL_FLOOR;
  } else if (
    room['left'] === -1 &&
    room['right'] > -1 &&
    room['above'] === -1 &&
    room['below'] > -1
  ) {
    return RoomType.CORNER_LEFT_TOP;
  } else if (
    room['left'] > -1 &&
    room['right'] === -1 &&
    room['above'] === -1 &&
    room['below'] > -1
  ) {
    return RoomType.CORNER_RIGHT_TOP;
  } else if (
    room['left'] > -1 &&
    room['right'] === -1 &&
    room['above'] > -1 &&
    room['below'] === -1
  ) {
    return RoomType.CORNER_RIGHT_BOTTOM;
  } else if (
    room['left'] === -1 &&
    room['right'] > -1 &&
    room['above'] > -1 &&
    room['below'] === -1
  ) {
    return RoomType.CORNER_LEFT_BOTTOM;
  } else if (
    room['left'] === -1 &&
    room['right'] === -1 &&
    room['above'] === -1 &&
    room['below'] > -1
  ) {
    return RoomType.BOTTOM_OPEN;
  } else if (
    room['left'] === -1 &&
    room['right'] === -1 &&
    room['above'] > -1 &&
    room['below'] === -1
  ) {
    return RoomType.TOP_OPEN;
  } else if (
    room['left'] === -1 &&
    room['right'] > -1 &&
    room['above'] === -1 &&
    room['below'] === -1
  ) {
    return RoomType.RIGHT_OPEN;
  } else if (
    room['left'] > -1 &&
    room['right'] === -1 &&
    room['above'] === -1 &&
    room['below'] === -1
  ) {
    return RoomType.LEFT_OPEN;
  } else {
    return RoomType.ROOM_CLOSED;
  }
};

const recalculateNeighbourRooms = (rooms: Array<Room>, room: Room) => {
  const { row, col, id } = room;

  for (const target of rooms) {
    if (target.row === row - 1 && target.col === col) {
      target.above = id;
      target.type = estimateRoomType(target);
      target.extensions += 1;
      room.extensions += 1;
      room.below = target.id;
    } else if (target.col === col - 1 && target.row === row) {
      target.right = id;
      target.type = estimateRoomType(target);
      target.extensions += 1;
      room.extensions += 1;
      room.left = target.id;
    } else if (target.row === row + 1 && target.col === col) {
      target.below = id;
      target.type = estimateRoomType(target);
      target.extensions += 1;
      room.extensions += 1;
      room.above = target.id;
    } else if (target.col === col + 1 && target.row === row) {
      target.left = id;
      target.type = estimateRoomType(target);
      target.extensions += 1;
      room.extensions += 1;
      room.right = target.id;
    }
  }

  const target = rooms.find((room) => room.col === col && room.row === row);
  if (target) {
    target.type = estimateRoomType(target);
  }
  return rooms;
};

const recalculateSpace = (rooms: Array<Room>) => {
  let space = 0;
  for (const room of rooms) {
    room['space'] = 8 - 2 * room.extensions;
    space += room.space;
  }
  return space;
};

const buildGallery = (hash: string, paintings: number, page: number) => {
  const random = seedrandom(hash + page);

  let rooms: Array<Room> = [
    {
      type: RoomType.RIGHT_OPEN,
      id: 0,
      extensions: 1,
      row: 0,
      col: 0,
      above: -1,
      below: -1,
      left: -1,
      right: 1,
      space: 0,
    },
    {
      type: RoomType.LEFT_OPEN,
      id: 1,
      extensions: 1,
      row: 0,
      col: 1,
      above: -1,
      below: -1,
      left: 0,
      right: -1,
      space: 0,
    },
  ];

  let space = recalculateSpace(rooms);

  let MARGIN = 12;
  let requiredSpace = paintings + MARGIN;

  while (space < requiredSpace) {
    const options = rooms.filter((room) => room.extensions < 4);
    const choice = options[Math.floor(random() * options.length)];

    const sides = ['above', 'below', 'left', 'right'].filter(
      (side) => choice[side as 'above' | 'below' | 'left' | 'right'] === -1
    );

    const side = sides[Math.floor(random() * sides.length)];

    const room = {
      type: RoomType.ROOM_CLOSED,
      id: rooms.length,
      extensions: 0,
      row: choice.row,
      col: choice.col,
      above: -1,
      below: -1,
      left: -1,
      right: -1,
      space: 0,
    };

    if (side === 'above') {
      room.row = room.row + 1;
    } else if (side === 'below') {
      room.row = room.row - 1;
    } else if (side === 'left') {
      room.col = room.col - 1;
    } else if (side === 'right') {
      room.col = room.col + 1;
    }

    rooms.push(room);

    rooms = recalculateNeighbourRooms(rooms, room);
    space = recalculateSpace(rooms);
  }

  return rooms;
};

export { buildGallery };
