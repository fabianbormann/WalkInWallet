import { buildGallery, estimateRoomType } from '../3d/MapGenerator';
import { arrangeGallery } from '../3d/PaintingDrawer';
import {
  Grid,
  Picture,
  Room,
  RoomElement,
  RoomElementPosition,
  RoomType,
  SlotColorCode,
  Slots,
} from './types';
import { v5 as uuidv5 } from 'uuid';

const fromGrid = (grid: Grid, border: number): Array<Room> => {
  const rooms: Array<Room> = [];

  const estimateExtensions = (row: number, col: number): number => {
    let extensions = 0;
    if (grid[row - 1]?.[col] === 1) extensions += 1;
    if (grid[row + 1]?.[col] === 1) extensions += 1;
    if (grid[row][col - 1] === 1) extensions += 1;
    if (grid[row][col + 1] === 1) extensions += 1;
    return extensions;
  };

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === 1) {
        rooms.push({
          type: RoomType.SPACE,
          id: rooms.length,
          extensions: estimateExtensions(i, j),
          row: i - border / 2,
          col: j - border / 2,
          above: grid[i + 1]?.[j] === 1 ? 0 : -1,
          below: grid[i - 1]?.[j] === 1 ? 0 : -1,
          left: grid[i][j - 1] === 1 ? 0 : -1,
          right: grid[i][j + 1] === 1 ? 0 : -1,
          space: 0,
        });
      }
    }
  }

  for (const room of rooms) {
    room.type = estimateRoomType(room);
  }

  return rooms;
};

const fromRooms = (rooms: Array<Room>, border: number): Grid => {
  const roomsWidth =
    rooms.reduce((a, b) => Math.max(a, b.row), 0) -
    rooms.reduce((a, b) => Math.min(a, b.row), 0) +
    1;
  const roomsHeight =
    rooms.reduce((a, b) => Math.max(a, b.col), 0) -
    rooms.reduce((a, b) => Math.min(a, b.col), 0) +
    1;

  const rows = roomsHeight + border;
  const cols = roomsWidth + border;

  const size = Math.max(rows, cols);

  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (
        rooms.find(
          (room) => room.row + border / 2 === i && room.col + border / 2 === j
        )
      ) {
        grid[i][j] = 1;
      }
    }
  }
  return grid;
};

const isReachable = (grid: Grid): boolean => {
  const rows = grid.length;
  if (rows === 0) return false;

  const cols = grid[0].length;

  function depthFirstSearch(
    row: number,
    col: number,
    visited: boolean[][]
  ): void {
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      grid[row][col] !== 1 ||
      visited[row][col]
    ) {
      return;
    }

    visited[row][col] = true;

    depthFirstSearch(row + 1, col, visited);
    depthFirstSearch(row - 1, col, visited);
    depthFirstSearch(row, col + 1, visited);
    depthFirstSearch(row, col - 1, visited);
  }

  let startRow = grid.findIndex((row) => row.some((cell) => cell === 1));
  let startCol = grid[startRow].findIndex((cell) => cell === 1);
  if (startRow === -1) return false;

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  depthFirstSearch(startRow, startCol, visited);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 1 && !visited[i][j]) {
        return false;
      }
    }
  }

  return true;
};

const drawSlots = (
  slots: Slots | undefined,
  roomElements: Array<RoomElement> | undefined,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  context: CanvasRenderingContext2D,
  slotColorCode: SlotColorCode
) => {
  if (slots) {
    const slotSize = 0.3 * rectWidth;
    const isSlotOccupied = (
      wall: 'top' | 'bottom' | 'left' | 'right',
      side: number
    ) => {
      if (roomElements) {
        const slot = roomElements.find(
          (roomElement) =>
            roomElement.position?.wall === wall &&
            roomElement.position?.side === side
        );
        if (slot) {
          return true;
        }
      }
      return false;
    };

    const isSlotOccupiedByDoor = (
      wall: 'top' | 'bottom' | 'left' | 'right'
    ) => {
      if (roomElements) {
        const slot = roomElements.find(
          (roomElement) => roomElement.position?.wall === wall
        );
        if (slot?.type === 'door') {
          return true;
        }
      }
      return false;
    };

    const doorColor = slotColorCode.doorColor;
    const freeSlotColor = slotColorCode.freeSlotColor;
    const occupiedSlotColor = slotColorCode.occupiedSlotColor;

    if (slots.top) {
      slots.top.forEach((slot, index) => {
        context.fillStyle = freeSlotColor;

        if (isSlotOccupiedByDoor('top')) {
          context.fillStyle = doorColor;
          context.fillRect(
            x + rectWidth / 2 - slotSize,
            y + rectHeight - slotSize / 2,
            slotSize * 2,
            slotSize / 2
          );
        } else {
          if (isSlotOccupied('top', index)) {
            context.fillStyle = occupiedSlotColor;
          }
          context.fillRect(
            x + rectWidth / 2 + -1.1 * index * slotSize,
            y + rectHeight - slotSize / 2,
            slotSize,
            slotSize / 2
          );
        }
      });
    }

    if (slots.bottom) {
      slots.bottom.forEach((slot, index) => {
        context.fillStyle = freeSlotColor;

        if (isSlotOccupiedByDoor('bottom')) {
          context.fillStyle = doorColor;
          context.fillRect(
            x + rectWidth / 2 - slotSize,
            y,
            slotSize * 2,
            slotSize / 2
          );
        } else {
          if (isSlotOccupied('bottom', index)) {
            context.fillStyle = occupiedSlotColor;
          }
          context.fillRect(
            x + rectWidth / 2 + -1.1 * index * slotSize,
            y,
            slotSize,
            slotSize / 2
          );
        }
      });
    }

    if (slots.left) {
      slots.left.forEach((slot, index) => {
        context.fillStyle = freeSlotColor;

        if (isSlotOccupiedByDoor('left')) {
          context.fillStyle = doorColor;
          context.fillRect(
            x,
            y + rectWidth / 2 - slotSize,
            slotSize / 2,
            slotSize * 2
          );
        } else {
          if (isSlotOccupied('left', index)) {
            context.fillStyle = occupiedSlotColor;
          }

          context.fillRect(
            x,
            y + rectWidth / 2 + -1.1 * index * slotSize,
            slotSize / 2,
            slotSize
          );
        }
      });
    }

    if (slots.right) {
      slots.right.forEach((slot, index) => {
        context.fillStyle = freeSlotColor;

        if (isSlotOccupiedByDoor('right')) {
          context.fillStyle = doorColor;
          context.fillRect(
            x + rectWidth - slotSize / 2,
            y + rectWidth / 2 - slotSize,
            slotSize / 2,
            slotSize * 2
          );
        } else {
          if (isSlotOccupied('right', index)) {
            context.fillStyle = occupiedSlotColor;
          }
          context.fillRect(
            x + rectWidth - slotSize / 2,
            y + rectWidth / 2 + -1.1 * index * slotSize,
            slotSize / 2,
            slotSize
          );
        }
      });
    }
  }
};

const arrangeRooms = (
  stakeAddress: string,
  pictures: Array<Picture>,
  totalPages: number,
  page: string,
  rooms: Array<Room>,
  overrides?: Array<RoomElement>
) => {
  const doors = [];
  const exitDoor: RoomElement = {
    type: 'door',
    id: uuidv5(`${page}Exit Door`, 'c31ad8be-cbfe-4fb8-a556-01bfe52ce510'),
    name: 'Exit Door',
    useWholeWall: true,
  };

  doors.push(exitDoor);
  const availablePages = totalPages;

  if (availablePages > 1 && parseInt(page || '1') < availablePages) {
    const nextRoomDoor: RoomElement = {
      type: 'door',
      id: uuidv5(
        `${page}Next Room Door`,
        'c31ad8be-cbfe-4fb8-a556-01bfe52ce510'
      ),
      name: 'Next Room Door',
      useWholeWall: true,
    };
    doors.push(nextRoomDoor);
  }

  if (parseInt(page || '1') > 1) {
    const previousRoomDoor: RoomElement = {
      type: 'door',
      id: uuidv5(
        `${page}Previous Room Door`,
        'c31ad8be-cbfe-4fb8-a556-01bfe52ce510'
      ),
      name: 'Previous Room Door',
      useWholeWall: true,
    };
    doors.push(previousRoomDoor);
  }

  let roomElements = [...doors, ...pictures];

  const roomsCopy = JSON.parse(JSON.stringify(rooms));

  const positionExists = (position: RoomElementPosition | undefined) => {
    if (typeof position === 'undefined') return false;

    return roomsCopy.some(
      (room: Room) =>
        room.col === position.col &&
        room.row === position.row &&
        typeof room.slots !== 'undefined' &&
        typeof room.slots[position.wall] !== 'undefined'
    );
  };

  for (const roomElement of roomElements) {
    roomElement.position = undefined;
  }

  for (const override of overrides || []) {
    const roomElementIndex = roomElements.findIndex(
      (roomElement) => roomElement.id === override.id
    );
    if (roomElementIndex > -1 && positionExists(override.position)) {
      roomElements[roomElementIndex].position = override.position;
    }
  }

  roomElements = arrangeGallery(stakeAddress, roomsCopy, roomElements);

  return roomElements;
};

const handleGridClick = (
  grid: Grid,
  x: number,
  y: number,
  width: number,
  height: number,
  rooms: Array<Room>,
  onClickSlot: Function,
  onClickRoom: Function
) => {
  const col = Math.floor(x / width);
  const row = Math.floor(y / height);

  const gridWidth = grid[0].length;
  const margin = Math.min(0.4 * gridWidth, 2);
  const rectWidth = width - margin;

  const room = rooms.find(
    (room) => room.row === row - 1 && room.col === col - 1
  );

  if (col === 0 || row === 0) return;

  const maxSize = 10;
  if (row >= maxSize - 2 || col >= maxSize - 2) return;

  if (grid[row][col] === 1) {
    const localX = x - col * width;
    const localY = y - row * height;
    const slotSize = 0.3 * rectWidth;

    const leftSlotStart = width / 2 + -1.1 * slotSize;
    const leftSlotEnd = leftSlotStart + slotSize;

    const rightSlotStart = width / 2;
    const rightSlotEnd = rightSlotStart + slotSize;

    const topSlotStart = height / 2 + -1.1 * slotSize;
    const topSlotEnd = topSlotStart + slotSize;

    const bottomSlotStart = height / 2;
    const bottomSlotEnd = bottomSlotStart + slotSize;

    if (localY < slotSize / 2 && room?.slots?.bottom) {
      if (localX > leftSlotStart && localX < leftSlotEnd) {
        return onClickSlot(room, 'bottom', 0);
      }

      if (localX > rightSlotStart && localX < rightSlotEnd) {
        return onClickSlot(room, 'bottom', 1);
      }
    }

    if (localY > height - slotSize / 2 && room?.slots?.top) {
      if (localX > leftSlotStart && localX < leftSlotEnd) {
        return onClickSlot(room, 'top', 0);
      }

      if (localX > rightSlotStart && localX < rightSlotEnd) {
        return onClickSlot(room, 'top', 1);
      }
    }

    if (localX < slotSize / 2 && room?.slots?.left) {
      if (localY > topSlotStart && localY < topSlotEnd) {
        return onClickSlot(room, 'left', 0);
      }

      if (localY > bottomSlotStart && localY < bottomSlotEnd) {
        return onClickSlot(room, 'left', 1);
      }
    }

    if (localX > width - slotSize / 2 && room?.slots?.right) {
      if (localY > topSlotStart && localY < topSlotEnd) {
        return onClickSlot(room, 'right', 0);
      }

      if (localY > bottomSlotStart && localY < bottomSlotEnd) {
        return onClickSlot(room, 'right', 1);
      }
    }
  }
  return onClickRoom(row, col);
};

const isPicture = (element: RoomElement): element is Picture => {
  return (element as Picture).image !== undefined;
};

export {
  fromGrid,
  fromRooms,
  isReachable,
  drawSlots,
  arrangeRooms,
  handleGridClick,
  isPicture,
};
