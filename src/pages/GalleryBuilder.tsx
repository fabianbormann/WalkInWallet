import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';
import { useEffect, useRef, useState } from 'react';
import {
  extractNFTsFromNFTDetailResponse,
  getNFTsFromStakeAddress,
} from '../global/api';
import { Grid, Room, RoomElement, RoomType, Slots } from '../global/types';
import {
  buildGallery,
  estimateRoomType,
  recalculateSpace,
} from '../3d/MapGenerator';
import { arrangeGallery, setupSlots } from '../3d/PaintingDrawer';
import { getNetwork, useWindowDimensions } from '../helper';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';
import {
  Alert,
  AlertColor,
  Grid as MuiGrid,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import Header from '../components/Header';
import Background from '../components/Background';

const GalleryBuilder = () => {
  const currentNetwork = getNetwork();
  const { stakeAddress } = useCardano({
    limitNetwork:
      currentNetwork === 'mainnet' ? NetworkType.MAINNET : NetworkType.TESTNET,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gallery, setGallery] = useState<Array<RoomElement>>([]);
  const [grid, setGrid] = useState<Grid>([]);
  const [rooms, setRooms] = useState<Array<Room>>([]);
  const [space, setSpace] = useState(0);
  const [page, setPage] = useState(1);
  const [requiredSlots, setRequiredSlots] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarVariant, setSnackbarVariant] = useState<AlertColor>('info');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { height, width } = useWindowDimensions();

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, variant: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarVariant(variant);
    setSnackbarOpen(true);
  };

  const toggleRect = (row: number, col: number) => {
    setGrid((prevGridState) => {
      const newState = [...prevGridState];
      newState[row][col] = Number(!newState[row][col]);
      return newState;
    });
  };

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
    x: number,
    y: number,
    rectWidth: number,
    rectHeight: number,
    context: CanvasRenderingContext2D
  ) => {
    if (slots) {
      const slotSize = 0.33 * rectWidth;

      if (slots.top) {
        if (slots.top[0] === 1) {
          context.fillStyle = 'red';
          context.fillRect(
            x + rectWidth / 2 - slotSize / 2,
            y,
            slotSize,
            slotSize
          );
        }
        if (slots.top[1] === 1) {
          context.fillStyle = 'red';
          context.fillRect(
            x + rectWidth / 2 - slotSize / 2,
            y + rectHeight - slotSize,
            slotSize,
            slotSize
          );
        }
      }

      if (slots.bottom) {
        if (slots.bottom[0] === 1) {
          context.fillStyle = 'red';
          context.fillRect(
            x + rectWidth - slotSize,
            y + rectHeight / 2 - slotSize / 2,
            slotSize,
            slotSize
          );
        }
        if (slots.bottom[1] === 1) {
          context.fillStyle = 'red';
          context.fillRect(
            x,
            y + rectHeight / 2 - slotSize / 2,
            slotSize,
            slotSize
          );
        }
      }

      if (slots.left) {
        if (slots.left[0] === 1) {
          context.fillStyle = 'red';
          context.fillRect(
            x,
            y + rectHeight / 2 - slotSize / 2,
            slotSize,
            slotSize
          );
        }
        if (slots.left[1] === 1) {
          context.fillStyle = 'red';
          context.fillRect(x, y + rectHeight - slotSize, slotSize, slotSize);
        }
      }

      if (slots.right) {
        if (slots.right[0] === 1) {
          context.fillStyle = 'red';
          context.fillRect(x + rectWidth - slotSize, y, slotSize, slotSize);
        }
        if (slots.right[1] === 1) {
          context.fillStyle = 'red';
          context.fillRect(
            x + rectWidth - slotSize,
            y + rectHeight - slotSize,
            slotSize,
            slotSize
          );
        }
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const canvasWidth = Math.min(width - 48, 600);
      const canvasHeight = Math.min(width - 48, 600);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      if (context && grid.length > 0) {
        context.fillStyle = '#333';
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const gridWidth = grid[0].length;
        const gridHeight = grid.length;
        const margin = Math.min(0.4 * gridWidth, 2);
        const rectWidth = canvas.width / gridWidth - margin;
        const rectHeight = canvas.height / gridHeight - margin;

        for (let i = 0; i < gridHeight; i++) {
          for (let j = 0; j < gridWidth; j++) {
            const x = j * (rectWidth + margin) + margin / 2;
            const y = i * (rectHeight + margin) + margin / 2;

            context.fillStyle = 'black';

            const room = rooms.find(
              (room) => room.row === i - 1 && room.col === j - 1
            );

            drawSlots(room?.slots, x, y, rectWidth, rectHeight, context);

            if (grid[i][j] === 1) {
              context.fillStyle = 'white';
            } else {
              context.fillStyle = 'black';
            }

            context.fillRect(x, y, rectWidth, rectHeight);
          }
        }

        canvas.onclick = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const col = Math.floor(x / (rectWidth + margin));
          const row = Math.floor(y / (rectHeight + margin));

          if (col === 0 || row === 0) return;

          const maxSize = 10;
          if (row >= maxSize - 2 || col >= maxSize - 2) return;

          // simulate the change and check if it would result in having unreachable fields
          const gridClone = JSON.parse(JSON.stringify(grid));
          gridClone[row][col] = Number(!gridClone[row][col]);

          const hasNoActiveFields = gridClone.every((row: Array<number>) =>
            row.every((cell) => cell === 0)
          );

          if (!hasNoActiveFields && isReachable(gridClone)) {
            // apply the change if all '1' fields are still reachable
            toggleRect(row, col);
            const updatedRooms = fromGrid(gridClone, 2);
            setupSlots(updatedRooms);
            setRooms(updatedRooms);
            setSpace(recalculateSpace(updatedRooms));
          }
        };
      }
    }
  }, [grid, width]);

  useEffect(() => {
    if (gallery.length > 0 && rooms.length > 0) {
      setGrid(fromRooms(rooms, 2));
    }
  }, [gallery, rooms]);

  useEffect(() => {
    const fetchNFTs = async (stakeAddress: string, page: string) => {
      const nftDetailResponse = await getNFTsFromStakeAddress(stakeAddress);

      const doors = [];
      const exitDoor: RoomElement = {
        type: 'door',
        name: 'Exit Door',
        useWholeWall: true,
      };

      const nftsToDisplay = await extractNFTsFromNFTDetailResponse(
        nftDetailResponse,
        page
      );

      doors.push(exitDoor);
      const availablePages = nftsToDisplay.totalPages;

      if (availablePages > 1 && parseInt(page || '1') < availablePages) {
        const nextRoomDoor: RoomElement = {
          type: 'door',
          name: 'Next Room Door',
          useWholeWall: true,
        };
        doors.push(nextRoomDoor);
      }

      if (parseInt(page || '1') > 1) {
        const previousRoomDoor: RoomElement = {
          type: 'door',
          name: 'Previous Room Door',
          useWholeWall: true,
        };
        doors.push(previousRoomDoor);
      }

      let roomElements = [...doors, ...nftsToDisplay.pictures];
      const rooms = buildGallery(
        stakeAddress,
        roomElements.length,
        parseInt(page || '1')
      );

      roomElements = arrangeGallery(stakeAddress, rooms, roomElements);
      setGallery(roomElements);
      setRooms(rooms);
      setSpace(recalculateSpace(rooms));
      setRequiredSlots(nftsToDisplay.pictures.length);
      setPage(parseInt(page));
    };

    if (stakeAddress) {
      fetchNFTs(stakeAddress, '1');
    }
  }, [stakeAddress]);

  if (!stakeAddress) {
    return (
      <div>
        <h1>Gallery Builder</h1>
        <p>Connect your wallet to edit your gallery</p>
      </div>
    );
  }

  return (
    <MuiGrid>
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarVariant}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Header logoType="back" />
      <Background />

      <MuiGrid
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4">Gallery Builder</Typography>
        <Typography variant="body1">
          Click on the canvas to add or remove rooms. The maximum size is 10 x
          10. You can only extend or reduce if this action doesn't creates
          unreachable areas.
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
          <Table size="small" aria-label="simple table">
            <TableBody>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" size="small">
                  Available Space
                </TableCell>
                <TableCell align="left">{space} Paintings</TableCell>
              </TableRow>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" size="small">
                  Required Space
                </TableCell>
                <TableCell align="left">{requiredSlots} Paintings</TableCell>
              </TableRow>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" size="small">
                  Room
                </TableCell>
                <TableCell align="left">{page}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <canvas ref={canvasRef} />
        <p>Rooms:</p>
        <pre>{JSON.stringify(rooms, null, 2)}</pre>
      </MuiGrid>
    </MuiGrid>
  );
};

export default GalleryBuilder;
