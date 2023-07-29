import {
  ConnectWalletButton,
  useCardano,
} from '@cardano-foundation/cardano-connect-with-wallet';
import {
  Alert,
  AppBar,
  Snackbar,
  styled,
  Toolbar,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderProps } from '../global/types';
import { getEllipsisText } from '../helper';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';

const Logo = styled('div')<{ image: string; flip?: boolean }>(
  ({ theme, image, flip }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > div': {
      width: 32,
      height: 32,
      background: `url(./${image})`,
      cursor: 'pointer',
      transform: flip && 'scaleX(-1)',
      backgroundSize: 'cover',
    },
    '& > span': {
      color: '#12284b',
      fontWeight: 'bolder',
      marginLeft: 4,
      marginTop: 4,
    },
  })
);

const Header = (props: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [snackbarVariant, setSnackbarVariant] = useState<
    'error' | 'info' | 'success' | 'warning'
  >('info');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const theme = useTheme();
  const navigate = useNavigate();
  const {
    isEnabled,
    isConnected,
    enabledWallet,
    stakeAddress,
    signMessage,
    connect,
    disconnect,
    usedAddresses,
  } = useCardano({ limitNetwork: NetworkType.TESTNET });

  const logoImage =
    props.logoType === 'back' ? 'WalkInWallet_Arrow_Small.png' : 'logo.png';

  const actions = stakeAddress
    ? [
        {
          label: 'Visit Gallery',
          onClick: () => navigate(`/${stakeAddress}`),
        },
        {
          label: 'Share',
          onClick: () => {
            if (typeof navigator?.share === 'function') {
              navigator.share({
                title: 'WalkInWallet',
                text: `I would like to invite you to take a walk in my wallet @ https://walkinwallet.com/${getEllipsisText(
                  stakeAddress
                )}`,
                url: `https://walkinwallet.com/${stakeAddress}`,
              });
            } else {
              navigator.clipboard
                .writeText(`https://walkinwallet.com/${stakeAddress}`)
                .then(() => {
                  setSnackbarVariant('success');
                  setSnackbarMessage(
                    `Copied to the clipboard: https://walkinwallet.com/${getEllipsisText(
                      stakeAddress
                    )}`
                  );
                  setOpen(true);
                })
                .catch(() => {
                  setSnackbarVariant('error');
                  setSnackbarMessage(
                    `Failed to share or copy your gallery link.`
                  );
                  setOpen(true);
                });
            }
          },
        },
      ]
    : [];

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
    >
      <Toolbar>
        <Logo image={logoImage} flip onClick={() => navigate('/')}>
          <div />
          <span style={{ fontFamily: 'LibreBaskerville,serif' }}>
            WalkInWallet
          </span>
        </Logo>
        <span style={{ flexGrow: 1 }} />
        <ConnectWalletButton
          customActions={actions}
          limitNetwork={NetworkType.TESTNET}
          primaryColor={theme.palette.primary.main}
          borderRadius={4}
          customCSS={`
              padding-top: 8px;
              button {
                padding: 12px;
                font-family: LibreBaskerville, serif;
                background-color: ${theme.palette.primary.light};
                border-color: ${theme.palette.primary.light};
                color: white;
                transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
              }
              :hover button {
                background-color: ${theme.palette.primary.main} !important;
                border-color: ${theme.palette.primary.main} !important;
              }
              div > span {
                font-family: LibreBaskerville, serif;
              }
            `}
        />
      </Toolbar>
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        open={open}
        autoHideDuration={3000}
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
    </AppBar>
  );
};

export default Header;
