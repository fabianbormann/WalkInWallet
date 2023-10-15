import { Chip, Grid, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { getNetwork } from '../helper';

const NetworkSwitch = () => {
  const theme = useTheme();

  const networks = ['mainnet', 'preprod', 'preview'];
  const aviableNetworks = [];

  for (const network of networks) {
    const networkUrl = import.meta.env[`VITE_${network.toUpperCase()}_URL`];
    if (typeof networkUrl === 'string' && networkUrl.length > 0) {
      aviableNetworks.push(network);
    }
  }

  if (aviableNetworks.length === 0 || !import.meta.env.VITE_NETWORK) {
    return null;
  }

  const currentNetwork: string = getNetwork();

  const getColor = (network: string) => {
    if (network === 'mainnet') {
      return 'success';
    } else if (network === 'preprod') {
      return 'warning';
    } else {
      return 'error';
    }
  };

  const links = [];

  for (const aviableNetwork of aviableNetworks) {
    links.push(
      <Grid
        key={aviableNetwork}
        item
        component={Link}
        to={import.meta.env[`VITE_${aviableNetwork.toUpperCase()}_URL`]}
      >
        <Chip
          sx={aviableNetwork === currentNetwork ? { color: 'white' } : {}}
          label={aviableNetwork}
          variant={aviableNetwork === currentNetwork ? 'filled' : 'outlined'}
          color={getColor(aviableNetwork)}
        />
      </Grid>
    );
  }

  return (
    <Grid
      container
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 2,
        [theme.breakpoints.up('lg')]: { paddingTop: 0 },
      }}
    >
      {links}
    </Grid>
  );
};

export default NetworkSwitch;
