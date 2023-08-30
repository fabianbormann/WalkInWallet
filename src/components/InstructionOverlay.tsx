import { Backdrop, Grid, Paper, Typography, useTheme } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SensorDoorIcon from '@mui/icons-material/SensorDoor';
import ImageIcon from '@mui/icons-material/Image';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { useState } from 'react';
import { hasTouchScreen } from '../3d/Inputs';
import { useLocalStorage } from '../helper';

const instructions = {
  mobile: {
    move: 'Move by dragging',
    look: 'Look around by dragging with two fingers',
    enter: 'Enter a room through a double tap on its door',
    focus: 'Focus paintings by tapping on them',
    dismiss: 'Tap anywhere to dismiss',
  },
  desktop: {
    move: 'Move by WASD or arrow keys',
    look: 'Look around by dragging with the mouse',
    enter: 'Enter a room through pressing space',
    focus: 'Focus paintings by clicking on them',
    dismiss: 'Click anywhere to dismiss',
  },
};

export const InstructionOverlay = () => {
  const [open, setOpen] = useState(true);
  const [seen, setSeen] = useLocalStorage('seen', false);

  if (seen) {
    return null;
  }

  const theme = useTheme();

  const handleClose = () => {
    setSeen(true);
    setOpen(false);
  };

  const guide = hasTouchScreen() ? instructions.mobile : instructions.desktop;

  return (
    <Backdrop
      sx={{
        zIndex: theme.zIndex.drawer + 1,
      }}
      open={open}
      onClick={handleClose}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          maxWidth: 800,
          width: '80%',
          background: 'white',
        }}
      >
        <Grid container sx={{ flexDirection: 'row' }}>
          <Grid item xs={12}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                textAlign: 'center',
              }}
            >
              Welcome to WalkInWallet
            </Typography>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                textAlign: 'center',
              }}
            >
              Is it your first time here? Let us guide you through the controls.
            </Typography>
          </Grid>
          <Grid
            container
            item
            xs={6}
            flexDirection="column"
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            {hasTouchScreen() ? (
              <TouchAppIcon sx={{ fontSize: '4rem' }} />
            ) : (
              <KeyboardIcon sx={{ fontSize: '4rem' }} />
            )}
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
              }}
            >
              {guide.move}
            </Typography>
          </Grid>
          <Grid
            container
            item
            xs={6}
            flexDirection="column"
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <VisibilityIcon sx={{ fontSize: '4rem' }} />
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
              }}
            >
              {guide.look}
            </Typography>
          </Grid>
          <Grid
            container
            item
            xs={6}
            flexDirection="column"
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <SensorDoorIcon sx={{ fontSize: '4rem' }} />
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
              }}
            >
              {guide.enter}
            </Typography>
          </Grid>
          <Grid
            container
            item
            xs={6}
            flexDirection="column"
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <ImageIcon sx={{ fontSize: '4rem' }} />
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
              }}
            >
              {guide.focus}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="subtitle2" sx={{ mt: 2, textAlign: 'center' }}>
          {guide.dismiss}
        </Typography>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{
            textAlign: 'center',
          }}
        >
          This dialog will show up only once
        </Typography>
      </Paper>
    </Backdrop>
  );
};
