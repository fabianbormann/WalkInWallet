import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';
import { useEffect, useRef, useState } from 'react';
import {
  extractNFTsFromNFTDetailResponse,
  getNFTsFromStakeAddress,
} from '../global/api';
import {
  GalleryRoom,
  Grid,
  Picture,
  Room,
  RoomElement,
  RoomElementPosition,
} from '../global/types';
import { recalculateSpace } from '../3d/MapGenerator';
import { setupSlots } from '../3d/PaintingDrawer';
import { getNetwork, useLocalStorage, useWindowDimensions } from '../helper';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';
import {
  Alert,
  AlertColor,
  Button,
  Grid as MuiGrid,
  Snackbar,
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
import { useParams } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';

const RoomBuilder = () => {
  const [customGalleryRooms, setCustomGalleryRooms] = useLocalStorage<
    Array<GalleryRoom>
  >('gallery', []);
  const currentNetwork = getNetwork();
  const { stakeAddress } = useCardano({
    limitNetwork:
      currentNetwork === 'mainnet' ? NetworkType.MAINNET : NetworkType.TESTNET,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gallery, setGallery] = useState<Array<RoomElement>>([]);
  const [grid, setGrid] = useState<Grid>([]);
  const { roomId } = useParams();
  const [invalidRoomId, setInvalidRoomId] = useState(false);
  const [rooms, setRooms] = useState<Array<Room>>([]);
  const [space, setSpace] = useState(0);
  const [page, setPage] = useState(1);
  const [requiredSlots, setRequiredSlots] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<RoomElementPosition>();
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
  const [overrides, setOverrides] = useState<Array<RoomElement>>([]);

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
            wall: 'top' | 'bottom' | 'left' | 'right',
            index: number
          ) => {
            const roomElement = gallery.find(
              (element) =>
                element.position?.col === room.col &&
                element.position?.row === room.row &&
                element.position?.wall === wall &&
                element.position?.side === 1 - index
            );
            setSelectedPosition({
              col: room.col,
              row: room.row,
              wall: wall,
              side: 1 - index,
              hasNeighbour: room.slots?.[wall]?.[index] === 1,
            });
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
    if (stakeAddress && rooms.length > 0) {
      const roomElements = arrangeRooms(
        stakeAddress,
        gallery.filter((element) => element.type === 'picture') as Picture[],
        1, // Todo: get room order instead of page
        '1',
        rooms,
        overrides
      );
      setGallery(roomElements);
    }
  }, [stakeAddress, rooms, overrides]);

  useEffect(() => {
    if (stakeAddress && typeof roomId !== 'undefined') {
      try {
        const galleryRoom = customGalleryRooms[parseInt(roomId)];
        setOverrides(JSON.parse(JSON.stringify(galleryRoom.roomElements)));
        setGallery(JSON.parse(JSON.stringify(galleryRoom.roomElements)));
        setRooms(galleryRoom.rooms);
      } catch (error) {
        console.error(error);
      }
    }
  }, [stakeAddress, roomId]);

  useEffect(() => {
    const fetchNFTs = async (stakeAddress: string, page: string) => {
      const nftDetailResponse = await getNFTsFromStakeAddress(stakeAddress);
      const nftsToDisplay = await extractNFTsFromNFTDetailResponse(
        nftDetailResponse,
        page
      );

      setNfts(nftsToDisplay);
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

  if (typeof roomId === 'undefined') {
    return (
      <div>
        <h1>Gallery Builder</h1>
        <p>Invalid room id</p>
      </div>
    );
  }

  const saveGallery = () => {
    const newGalleryRoom = {
      rooms: rooms,
      roomElements: gallery,
    };

    const newCustomGalleryRooms = [...customGalleryRooms];
    newCustomGalleryRooms[parseInt(roomId)] = newGalleryRoom;
    setCustomGalleryRooms(newCustomGalleryRooms);
    showSnackbar('Gallery saved', 'success');
  };

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
        onError={(error) => showSnackbar(error, 'error')}
        selectedElement={selectedElement}
        position={selectedPosition!}
        onClose={() => setSelectionOpen(false)}
        onSelect={(element, position) => {
          setSelectedElement(element);
          const roomElementIndex = overrides.findIndex(
            (override) => override.id === element.id
          );

          if (roomElementIndex > -1) {
            const newOverrides = [...overrides];
            newOverrides[roomElementIndex] = { ...element, position: position };
            setOverrides(newOverrides);
          } else {
            setOverrides([...overrides, { ...element, position: position }]);
          }
        }}
        roomElements={gallery}
      />

      <Header logoType="back" backLink="/gallery-builder" />
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
        <Typography variant="h4">Room Builder</Typography>
        <Typography variant="body1" sx={{ my: 2, maxWidth: 760 }}>
          Click on the canvas to add or remove room parts. The maximum size is
          10 x 10. You can only extend or reduce if this action doesn't creates
          unreachable areas.
        </Typography>
        <MuiGrid item sx={{ mb: 2, width: '100%', maxWidth: 760 }}>
          <Button
            variant="outlined"
            onClick={saveGallery}
            startIcon={<SaveIcon />}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
        </MuiGrid>

        <canvas ref={canvasRef} />
      </MuiGrid>
    </MuiGrid>
  );
};

export default RoomBuilder;
