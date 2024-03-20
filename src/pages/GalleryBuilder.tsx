import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';
import { useEffect, useRef, useState } from 'react';
import {
  extractNFTsFromNFTDetailResponse,
  getNFTsFromStakeAddress,
} from '../global/api';
import { Grid, Picture, Room, RoomElement } from '../global/types';
import { recalculateSpace } from '../3d/MapGenerator';
import { setupSlots } from '../3d/PaintingDrawer';
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
import {
  arrangeRooms,
  drawSlots,
  fromGrid,
  fromRooms,
  handleGridClick,
  isReachable,
} from '../global/helper';
import RoomElementSelector from '../components/RoomElementSelector';

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
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<RoomElement>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [nfts, setNfts] = useState<{
    pictures: Array<Picture>;
    totalPages: number;
  }>({
    pictures: [],
    totalPages: 0,
  });
  const { width } = useWindowDimensions();

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

            if (grid[i][j] === 1) {
              context.fillStyle = 'white';
            } else {
              context.fillStyle = 'black';
            }

            context.fillRect(x, y, rectWidth, rectHeight);

            const roomElements = gallery.filter(
              (roomElement) =>
                roomElement.position?.col === j - 1 &&
                roomElement.position?.row === i - 1
            );

            drawSlots(
              room?.slots,
              roomElements,
              x,
              y,
              rectWidth,
              rectHeight,
              context
            );
          }
        }

        canvas.onclick = (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const width = rectWidth + margin;
          const height = rectHeight + margin;

          const clickSlot = (
            room: Room,
            side: 'top' | 'bottom' | 'left' | 'right',
            index: number
          ) => {
            const roomElement = gallery.find(
              (element) =>
                element.position?.col === room.col &&
                element.position?.row === room.row &&
                element.position?.wall === side &&
                element.position?.side === index
            );
            setSelectedElement(roomElement);
            setSelectionOpen(true);
          };

          handleGridClick(
            grid,
            x,
            y,
            width,
            height,
            rooms,
            clickSlot,
            (row: number, col: number) => {
              console.log('click room on position', row, col);
              // simulate the change and check if it would result in having unreachable fields
              const gridClone = JSON.parse(JSON.stringify(grid));
              gridClone[row][col] = Number(!gridClone[row][col]);

              const minSize = 2;
              const hasEnoughActiveFields =
                gridClone.reduce(
                  (sum: number, row: Array<number>) =>
                    sum + row.reduce((rowSum, val) => rowSum + val, 0),
                  0
                ) >= minSize;

              if (hasEnoughActiveFields && isReachable(gridClone)) {
                // apply the change if all '1' fields are still reachable
                toggleRect(row, col);
                const updatedRooms = fromGrid(gridClone, 2);
                setupSlots(updatedRooms);
                setRooms(updatedRooms);
                setSpace(recalculateSpace(updatedRooms));
              }
            }
          );
        };
      }
    }
  }, [grid, gallery, width]);

  useEffect(() => {
    if (gallery.length > 0 && rooms.length > 0) {
      setGrid(fromRooms(rooms, 2));
    }
  }, [gallery, rooms]);

  useEffect(() => {
    if (stakeAddress && nfts.pictures.length > 0) {
      const { roomElements, updatedRooms } = arrangeRooms(
        stakeAddress,
        nfts.pictures,
        nfts.totalPages,
        '1',
        rooms
      );
      setGallery(roomElements);

      if (updatedRooms) {
        setRooms(updatedRooms);
      }
    }
  }, [stakeAddress, nfts, rooms]);

  useEffect(() => {
    const fetchNFTs = async (stakeAddress: string, page: string) => {
      const nftDetailResponse = await getNFTsFromStakeAddress(stakeAddress);
      const nftsToDisplay = await extractNFTsFromNFTDetailResponse(
        nftDetailResponse,
        page
      );

      setSpace(recalculateSpace(rooms));
      setRequiredSlots(nftsToDisplay.pictures.length);
      setNfts(nftsToDisplay);
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
      <RoomElementSelector
        open={selectionOpen}
        selectedElement={selectedElement}
        onClose={() => setSelectionOpen(false)}
        onSelect={() => {}}
        roomElements={gallery}
      />

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
        <p>Gallery:</p>
        <pre>{JSON.stringify(gallery, null, 2)}</pre>
        <p>Rooms:</p>
        <pre>{JSON.stringify(rooms, null, 2)}</pre>
      </MuiGrid>
    </MuiGrid>
  );
};

export default GalleryBuilder;
