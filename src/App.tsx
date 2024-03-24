import React, { useEffect, useCallback, useState } from 'react';
import { buildGallery } from './3d/MapGenerator';
import { arrangeGallery } from './3d/PaintingDrawer';
import Scene from './3d/Scene';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from 'react-router-dom';
import CircularProgressWithLabel from './components/CircularProgressWithLabel';
import { Grid, useTheme, Typography } from '@mui/material';
import {
  extractNFTsFromNFTDetailResponse,
  getNFTsFromPolicyId,
  getNFTsFromStakeAddress,
  getStakeAddressFromAdaHandle,
  getStakeAddressFromPaymentAddress,
  loadPaintings,
} from './global/api';
import { FAQ, Welcome, Benefits } from './pages';
import { NftDetailResponse, Picture, Room, RoomElement } from './global/types';
import GalleryBuilder from './pages/GalleryBuilder';
import { v5 as uuidv5 } from 'uuid';

const Main = () => {
  const [progress, setProgress] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [stage, setStage] = useState('Read wallet');
  const [elementsInRoom, setElementsInRoom] = useState<Array<RoomElement>>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [gallery, setGallery] = useState<Array<Room>>();
  const [paintings, setPaintings] = useState<Array<Picture>>([]);
  const { address, page } = useParams();
  const theme = useTheme();

  const fetchNFTs = useCallback(async () => {
    let roomElements: Array<RoomElement> = [];
    let availablePages = 1;

    if (typeof address === 'undefined') return;
    let nftsToDisplay;
    try {
      let stakeAddress = address;
      if (address.startsWith('addr')) {
        stakeAddress = await getStakeAddressFromPaymentAddress(address);
      } else if (address.startsWith('$')) {
        stakeAddress = await getStakeAddressFromAdaHandle(address);
      }

      let nftDetailResponse: NftDetailResponse = [];

      if (stakeAddress.startsWith('stake')) {
        nftDetailResponse = await getNFTsFromStakeAddress(stakeAddress);
      } else {
        nftDetailResponse = await getNFTsFromPolicyId(stakeAddress);
      }

      nftsToDisplay = await extractNFTsFromNFTDetailResponse(
        nftDetailResponse,
        page
      );
    } catch (error) {
      nftsToDisplay = {
        pictures: [],
        totalPages: 1,
      };
      console.error(error);
    }

    const doors = [];
    const exitDoor: RoomElement = {
      type: 'door',
      id: uuidv5(
        `${parseInt(page || '1') + 1}Exit Door`,
        'c31ad8be-cbfe-4fb8-a556-01bfe52ce510'
      ),
      name: 'Exit Door',
      useWholeWall: true,
    };

    doors.push(exitDoor);
    availablePages = nftsToDisplay.totalPages;

    if (availablePages > 1 && parseInt(page || '1') < availablePages) {
      const nextRoomDoor: RoomElement = {
        type: 'door',
        id: uuidv5(
          `${parseInt(page || '1') + 1}Next Room Door`,
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
          `${parseInt(page || '1') - 1}Previous Room Door`,
          'c31ad8be-cbfe-4fb8-a556-01bfe52ce510'
        ),
        name: 'Previous Room Door',
        useWholeWall: true,
      };
      doors.push(previousRoomDoor);
    }

    roomElements = [...doors, ...nftsToDisplay.pictures];

    setProgress(21);
    setStage('Collecting NFT metadata and read images');

    const rooms = buildGallery(
      address,
      roomElements.length,
      parseInt(page || '1')
    );

    roomElements = arrangeGallery(address, rooms, roomElements);
    setGallery(rooms);
    setElementsInRoom(roomElements);
    setTotalPages(availablePages);
    setStage('Rendering 3D gallery');
    setProgress(99);
  }, [address, page]);

  useEffect(() => {
    setElementsInRoom([]);
    setPaintings([]);
    setTotalPages(1);
    setGallery(undefined);
    setStage('Read wallet');
    setSceneVisible(false);
    setProgress(0);
  }, [address, page]);

  useEffect(() => {
    if (elementsInRoom.length === 0) {
      fetchNFTs();
    }
  }, [fetchNFTs, elementsInRoom]);

  useEffect(() => {
    if (sceneVisible && elementsInRoom.length > 0) {
      let stopFetching = false;
      const needToStop = () => stopFetching;
      const retryElements = (
        elementsInRoom.filter(
          (roomElement) => roomElement.type === 'picture'
        ) as Array<Picture>
      ).map((picture) => ({
        retries: 0,
        ipfsGateway: 'https://ipfs.io/ipfs/',
        painting: picture,
      }));
      loadPaintings(retryElements, needToStop, setPaintings);
      setStage('Rendering 3D gallery');
      setProgress(99);

      return () => {
        stopFetching = true;
      };
    }
  }, [sceneVisible, elementsInRoom]);

  const onSceneReady = useCallback(() => setSceneVisible(true), []);

  if (typeof gallery !== 'undefined') {
    if (elementsInRoom.length === 0) {
      return (
        <Grid
          sx={{
            height: '100%',
            textAlign: 'center',
            padding: 4,
          }}
          container
          justifyContent="center"
          alignContent="center"
          direction="column"
        >
          <Typography>
            This wallet does not appear to contain any NFTs, or the provided
            wallet address is incorrect. Please double-check the address and try
            again.
          </Typography>
          <Link style={{ color: theme.palette.secondary.main }} to="/">
            Go back
          </Link>
        </Grid>
      );
    }

    return (
      <Grid
        sx={{ height: '100%' }}
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <Typography sx={{ display: sceneVisible ? 'none' : 'block' }}>
          {stage}
        </Typography>
        <CircularProgressWithLabel
          sx={{ display: sceneVisible ? 'none' : 'flex' }}
          value={progress}
        />
        <Scene
          onSceneReady={onSceneReady}
          isVisible={sceneVisible}
          gallery={gallery}
          paintings={paintings}
          roomElements={elementsInRoom}
          page={parseInt(page || '1')}
          address={address || ''}
        />
      </Grid>
    );
  } else {
    return (
      <Grid
        sx={{ height: '100%' }}
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <Typography>{stage}</Typography>
        <CircularProgressWithLabel value={progress} />
      </Grid>
    );
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/:address" element={<Main />} />
        <Route path="/:address/:page" element={<Main />} />
        <Route path="/gallery-builder" element={<GalleryBuilder />} />
      </Routes>
    </Router>
  );
};

export default App;
