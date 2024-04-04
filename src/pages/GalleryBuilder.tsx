import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Header from '../components/Header';
import Background from '../components/Background';
import { getNetwork, useLocalStorage } from '../helper';
import { useEffect, useState } from 'react';
import {
  extractNFTsFromNFTDetailResponse,
  getNFTsFromStakeAddress,
} from '../global/api';
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';
import {
  Picture,
  RoomGenerationType,
  GalleryRoom,
  RoomElement,
} from '../global/types';
import RoomCard from '../components/RoomCard';
import { buildGallery } from '../3d/MapGenerator';
import { arrangeGallery } from '../3d/PaintingDrawer';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { v5 as uuidv5 } from 'uuid';

const GalleryBuilder = () => {
  const [customGalleryRooms, setCustomGalleryRooms] = useLocalStorage<
    Array<GalleryRoom>
  >('gallery', []);
  const [nfts, setNfts] = useState<Array<Picture>>([]);
  const currentNetwork = getNetwork();
  const { stakeAddress } = useCardano({
    limitNetwork:
      currentNetwork === 'mainnet' ? NetworkType.MAINNET : NetworkType.TESTNET,
  });
  const [randomGalleryRooms, setRandomGalleryRooms] = useState<
    Array<GalleryRoom>
  >([]);
  const navigate = useNavigate();
  const paintingsPerRandomRoom = 10;

  useEffect(() => {
    if (typeof stakeAddress === 'undefined' || stakeAddress == null) return;

    let nftForRandomRooms = [...nfts];
    for (const savedGalleryRoom of customGalleryRooms) {
      for (const roomElement of savedGalleryRoom.roomElements) {
        if (roomElement.type === 'picture') {
          nftForRandomRooms = nftForRandomRooms.filter(
            (nft) => nft.id !== roomElement.id
          );
        }
      }
    }

    const roomsNeeded = Math.ceil(
      nftForRandomRooms.length / paintingsPerRandomRoom
    );

    const randomGalleryRooms = [];
    for (let i = 0; i < roomsNeeded; i++) {
      const nftsToAssign = nftForRandomRooms.slice(
        i * paintingsPerRandomRoom,
        i * paintingsPerRandomRoom + paintingsPerRandomRoom
      );

      const doors = [];
      const exitDoor: RoomElement = {
        type: 'door',
        id: uuidv5(`${i + 1}Exit Door`, 'c31ad8be-cbfe-4fb8-a556-01bfe52ce510'),
        name: 'Exit Door',
        useWholeWall: true,
      };

      doors.push(exitDoor);

      const rooms = buildGallery(stakeAddress, nftsToAssign.length, i);
      const roomElements = arrangeGallery(stakeAddress, rooms, [
        ...doors,
        ...nftsToAssign,
      ]);
      randomGalleryRooms.push({
        roomElements,
        rooms,
      });
    }
    setRandomGalleryRooms(randomGalleryRooms);
  }, [stakeAddress, nfts, customGalleryRooms]);

  useEffect(() => {
    const fetchNFTs = async (stakeAddress: string, page: string) => {
      const nftDetailResponse = await getNFTsFromStakeAddress(stakeAddress);
      const { pictures, totalPages } =
        extractNFTsFromNFTDetailResponse(nftDetailResponse);
      setNfts(pictures);
    };

    if (stakeAddress) {
      fetchNFTs(stakeAddress, '1');
    }
  }, [stakeAddress]);

  const customizeRoom = (galleryRoom: GalleryRoom) => {
    setCustomGalleryRooms([...customGalleryRooms, galleryRoom]);
    navigate(`/room-builder/${customGalleryRooms.length}`);
  };

  const editRoom = (index: number) => {
    navigate(`/room-builder/${index}`);
  };

  const resetGallery = () => {
    setCustomGalleryRooms([]);
  };

  return (
    <>
      <Grid>
        <Header logoType="back" />
        <Background />

        <Grid
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Grid sx={{ width: '80%' }}>
            <Typography variant="h4">Gallery Builder</Typography>
            <Typography variant="body1" sx={{ mt: 2, maxWidth: 760 }}>
              Tap on your room cards to make any edits to the rooms. You have
              the option to limit the number of rooms in your gallery or set up
              specific behaviors for random rooms.
            </Typography>
            <Grid container sx={{ flexDirection: 'column', mt: 3 }}>
              <Grid item sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mr: 1 }}
                >
                  Add Custom Room
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetGallery}
                  startIcon={<UndoIcon />}
                >
                  Reset
                </Button>
              </Grid>
              {customGalleryRooms.length > 0 && (
                <>
                  <Divider sx={{ mb: 2 }} textAlign="left">
                    Custom Rooms
                  </Divider>
                  <Grid item>
                    {customGalleryRooms.map(
                      (galleryRoom: GalleryRoom, index: number) => (
                        <RoomCard
                          key={`user-room-${index}`}
                          galleryRoom={galleryRoom}
                          customizeRoom={() => editRoom(index)}
                          type={RoomGenerationType.MANUAL}
                        />
                      )
                    )}
                  </Grid>
                </>
              )}
              <Divider sx={{ my: 2 }} textAlign="left">
                Random Rooms
              </Divider>
              <Grid item>
                <FormGroup row={true} sx={{ my: 2, alignItems: 'center' }}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable Random Generated Rooms"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} />}
                      label="Limit Number of Generated Rooms"
                    />
                  </FormGroup>
                  <TextField
                    label="Number of Random Rooms"
                    type="number"
                    value={randomGalleryRooms.length}
                    disabled
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mr: 2 }}
                  />
                </FormGroup>
              </Grid>
              <Grid item>
                {randomGalleryRooms.map(
                  (galleryRoom: GalleryRoom, index: number) => (
                    <RoomCard
                      key={`random-room-${index}`}
                      galleryRoom={galleryRoom}
                      customizeRoom={customizeRoom}
                      type={RoomGenerationType.RANDOM}
                    />
                  )
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default GalleryBuilder;
