import axios, { AxiosError } from 'axios';
import React, { useEffect, useCallback, useState } from 'react';
import { buildGallery } from './3d/MapGenerator';
import { hangPaintings } from './3d/PaintingDrawer';
import Scene from './3d/Scene';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from 'react-router-dom';
import { FAQ, Welcome, Benefits } from './pages';
import { NftFetchResponse, Picture, Room } from './global/types';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid, SxProps, useTheme } from '@mui/material';

function CircularProgressWithLabel({
  value,
  sx,
}: {
  value: number;
  sx?: SxProps;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <CircularProgress size={60} variant="determinate" sx={sx} value={value} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
      >
        <Typography variant="subtitle2" component="div" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const Main = () => {
  const [progress, setProgress] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [stage, setStage] = useState('Read wallet');
  const [nfts, setNfts] = useState<Array<Picture>>([]);
  const [gallery, setGallery] = useState<Array<Room>>();
  const [paintings, setPaintings] = useState<Array<Picture>>([]);
  const { address } = useParams();
  const theme = useTheme();

  const fetchNFTs = useCallback(async () => {
    let pictures: Array<Picture> = [];

    if (typeof address === 'undefined') return;
    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? `https://us-central1-walkinwallet.cloudfunctions.net/api/nfts/${address}`
          : `http://localhost:5001/walkinwallet/us-central1/api/nfts/${address}`;

      const response = (await axios.get(apiUrl)).data as NftFetchResponse;

      pictures = [
        ...pictures,
        ...response.map(
          (result) =>
            ({
              name: result.name,
              image: result.image,
              link: result.url,
              description: result.description,
            } as Picture)
        ),
      ];
    } catch (error) {
      console.error(error);
    }

    setProgress(21);
    setStage('Collecting NFT metadata and read images');

    const rooms = buildGallery(address, pictures.length);
    setGallery(rooms);
    setNfts(pictures);
    hangPaintings(address, rooms, pictures);
    setStage('Rendering 3D gallery');
    setProgress(99);
  }, [address]);

  useEffect(() => {
    setNfts([]);
    setStage('Read wallet');
    setProgress(0);
    fetchNFTs();
  }, [fetchNFTs, address]);

  useEffect(() => {
    const fetchImage = async (url: string) => {
      let location = url;
      if (location.startsWith('ipfs://')) {
        location = location.replace(
          'ipfs://',
          'https://gateway.pinata.cloud/ipfs/'
        );
      }

      if (location.startsWith('https://ipfs.io/')) {
        location = location.replace(
          'https://ipfs.io/',
          'https://gateway.pinata.cloud/ipfs/'
        );
      }

      try {
        const image = await axios.get(location, {
          responseType: 'blob',
          timeout: 30000,
        });
        return { image: image.data, tryAgain: false };
      } catch (axiosError) {
        const error = axiosError as AxiosError;
        if (error.response) {
          console.log(error.response);
          return {
            image: null,
            tryAgain:
              error.response.status === 403 || error.response.status === 401,
          };
        } else {
          return {
            image: null,
            tryAgain: false,
          };
        }
      }
    };

    if (sceneVisible && nfts.length > 0) {
      let fetchedPaintings: Array<Picture> = [];
      let stopFetching = false;

      const loadPaintings = async () => {
        const loadImage = (image: HTMLImageElement, blob: string) =>
          new Promise((resolve, reject) => {
            image.addEventListener('load', () => {
              image.replaceWith(image.cloneNode(true));
              resolve(image);
            });
            image.addEventListener('error', (error) => {
              image.replaceWith(image.cloneNode(true));
              reject(error);
            });
            image.src = blob;
          });
        const htmlImage = document.createElement('img');

        for (const picture of nfts) {
          if (stopFetching || typeof picture.width !== 'undefined') {
            return;
          }
          if (
            picture.image &&
            (picture.image.startsWith('http') ||
              picture.image.startsWith('ipfs://'))
          ) {
            let { image, tryAgain } = await fetchImage(picture.image);

            if (tryAgain) {
              const retry = await fetchImage(picture.image);
              image = retry.image;
            }
            if (!stopFetching) {
              setStage('Rendering 3D gallery');
              setProgress(99);
            }
            if (image !== null) {
              picture.image = URL.createObjectURL(image);
              picture.offline = false;
              htmlImage.src = picture.image;
              try {
                await loadImage(htmlImage, picture.image);

                const MAX_WIDTH = 768;
                const MAX_HEIGHT = 768;

                let width = htmlImage.naturalWidth;
                let height = htmlImage.naturalHeight;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width = width * (MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                  }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');

                if (context) {
                  context.drawImage(htmlImage, 0, 0, width, height);
                }

                picture.width = width;
                picture.height = height;
                picture.image = canvas.toDataURL('image/jpeg', 1.0);

                canvas.remove();
              } catch (error) {
                picture.image = './offline.png';
                picture.width = 1685;
                picture.height = 1685;
                picture.offline = true;
                console.log(error);
              }
            } else {
              console.log(
                `Unable to fetch image ${picture.image} using fallback image.`
              );
              picture.image = './offline.png';
              picture.width = 1685;
              picture.height = 1685;
              picture.offline = true;
            }
          } else if (picture.image === './nfts/logo-2021-1024.png') {
            await loadImage(htmlImage, './nfts/logo-2021-1024.png');
            const canvas = document.createElement('canvas');

            const width = 1024;
            const height = 1024;

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');

            if (context) {
              context.drawImage(htmlImage, 0, 0, width, height);
            }

            picture.width = width;
            picture.height = height;
            picture.image = canvas.toDataURL('image/jpeg', 1.0);

            canvas.remove();
            picture.offline = false;
          } else {
            picture.image = './offline.png';
            picture.width = 1685;
            picture.height = 1685;
            picture.offline = true;
          }
          htmlImage.remove();
          fetchedPaintings = [...fetchedPaintings, picture];
          if (!stopFetching) {
            setPaintings(fetchedPaintings);
          }
        }
      };

      loadPaintings();

      return () => {
        stopFetching = true;
      };
    }
  }, [sceneVisible, nfts]);

  const onSceneReady = useCallback(() => setSceneVisible(true), []);

  if (typeof nfts !== 'undefined' && typeof gallery !== 'undefined') {
    if (nfts.length === 0) {
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
            This wallet does not contain any NFT, or it is not a correct wallet
            address.
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
          nfts={nfts}
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
      </Routes>
    </Router>
  );
};

export default App;
