import { styled, Typography } from '@mui/material';

export const Section = styled(Typography)({
  lineHeight: '2rem',
  paddingLeft: '48px',
  backgroundSize: '2rem',
  backgroundImage: 'url(./walkinwallet_logo_90.png)',
  backgroundRepeat: 'no-repeat',
  backgroundPositionY: 'center',
});

export const Subsection = styled(Section)({
  paddingLeft: '36px',
  backgroundImage: 'url(./walkinwallet_diamond_45.png)',
});
