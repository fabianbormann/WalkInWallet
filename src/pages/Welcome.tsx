import React, { useState } from 'react';
import Blockie from '../components/Blockie';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { getEllipsisText } from '../helper';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Header from '../components/Header';
import Background from '../components/Background';

const Welcome = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const theme = useTheme();

  return (
    <Grid
      container
      flexDirection="column"
      sx={{ flexWrap: 'nowrap', height: '100%' }}
    >
      <Header />
      <Background />

      <Grid
        container
        flexGrow={1}
        sx={{ padding: 2 }}
        alignItems="center"
        justifyContent="center"
      >
        <Grid
          xs={12}
          md={6}
          container
          item
          justifyContent="center"
          direction="column"
          sx={{
            padding: { md: 2, xs: 0 },
            paddingRight: { md: '5%', xs: 0 },
            alignItems: { md: 'end', xs: 'center' },
          }}
        >
          <Box
            sx={{ maxWidth: 560, paddingTop: 2, paddingBottom: 2 }}
            justifyContent="center"
          >
            <Typography
              variant="h5"
              color={theme.palette.primary.main}
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 2,
                fontSize: '1.5rem',
              }}
              gutterBottom={true}
            >
              Walk in Wallets as You Would Walk in Galleries
            </Typography>
            <Typography
              variant="body1"
              component="p"
              color={theme.palette.primary.light}
              gutterBottom={true}
              sx={{
                mb: 3,
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Enter a Cardano Public or Stake Address to Visit a Generated
              Gallery. No manual configuration required.
            </Typography>
            <Paper component="form" sx={{ display: 'flex' }}>
              <InputBase
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate(`/${address}`);
                  }
                }}
                sx={{ ml: 1, flex: 1, flexGrow: 1 }}
                placeholder="addr1qxckxc9rap6ypl6f3ry83ec47u060..."
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAddress(event.target.value)
                }
                value={address}
                inputProps={{
                  'aria-label': 'addr1qxckxc9rap6ypl6f3ry83ec47u060...',
                }}
              />
              <IconButton
                type="button"
                sx={{ p: '10px' }}
                aria-label="search"
                onClick={() => {
                  navigate(`/${address}`);
                }}
              >
                <SendIcon color="primary" />
              </IconButton>
            </Paper>
          </Box>
        </Grid>
        <Grid
          xs={12}
          md={6}
          container
          item
          sx={{
            padding: { md: 2, xs: 0 },
            paddingLeft: { md: '5%', xs: 0 },
            alignItems: { md: 'flex-start', xs: 'center' },
            justifyContent: { md: 'flex-start', xs: 'center' },
          }}
        >
          <Card
            sx={{ width: 300 }}
            onClick={() => {
              window.location.href =
                '/stake1u8yf3kcjaaa6hwp9jankxql49kyh2mu02q8454zxzkvzxgg6uhtm4';
            }}
          >
            <CardMedia
              component="img"
              height={180}
              image="./example_wallet.png"
              alt="wallet example"
            />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Blockie address="stake1u8yf3kcjaaa6hwp9jankxql49kyh2mu02q8454zxzkvzxgg6uhtm4" />
                <Box
                  sx={{
                    marginLeft: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    gutterBottom
                    variant="h6"
                    sx={{ fontSize: '1rem' }}
                  >
                    Visit our Demo Gallery
                  </Typography>
                  <Link
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.secondary.main,
                      fontSize: '0.9rem',
                    }}
                    to="/stake1u8yf3kcjaaa6hwp9jankxql49kyh2mu02q8454zxzkvzxgg6uhtm4"
                  >
                    {getEllipsisText(
                      'stake1u8yf3kcjaaa6hwp9jankxql49kyh2mu02q8454zxzkvzxgg6uhtm4',
                      10
                    )}
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} container item justifyContent="center">
          <Button
            sx={{ margin: 2, minWidth: 120 }}
            color="secondary"
            variant="contained"
            onClick={() => {
              navigate('/faq', { replace: true });
            }}
          >
            FAQ
          </Button>

          <Button
            sx={{ margin: 2, minWidth: 120 }}
            color="secondary"
            variant="contained"
            onClick={() => {
              navigate('/benefits', { replace: true });
            }}
          >
            Benefits
          </Button>
        </Grid>
      </Grid>
      <Footer />
    </Grid>
  );
};

export default Welcome;
