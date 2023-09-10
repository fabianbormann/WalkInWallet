import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { getEllipsisText } from '../helper';
import { Link } from 'react-router-dom';

const DemoWallet = () => {
  const theme = useTheme();

  const currentNetwork = import.meta.env.VITE_NETWORK || 'mainnet';
  if (currentNetwork !== 'mainnet') {
    return (
      <Card sx={{ width: 300 }}>
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
              flexDirection: 'column',
            }}
          >
            <Typography gutterBottom variant="h6" sx={{ fontSize: '1rem' }}>
              Visit our Demo Gallery
            </Typography>
            <Typography gutterBottom variant="body1" sx={{ fontSize: '1rem' }}>
              You are currently on a different network. This demo is only
              available on mainnet
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
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
          <LoginIcon color="secondary" />
          <Box
            sx={{
              marginLeft: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography gutterBottom variant="h6" sx={{ fontSize: '1rem' }}>
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
  );
};

export default DemoWallet;
