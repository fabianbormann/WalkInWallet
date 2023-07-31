import styled from '@emotion/styled';

export const BackIcon = styled('div')({
  backgroundImage: 'url(/WalkInWallet_Arrow_Small.png)',
  position: 'absolute',
  top: 8,
  left: 8,
  height: 42,
  width: 42,
  backgroundSize: 'contain',
  transform: 'scaleX(-1)',
  cursor: 'pointer',
  zIndex: 3,
});

export const NextIcon = styled('div')({
  backgroundImage: 'url(/WalkInWallet_Arrow_Small.png)',
  position: 'absolute',
  top: 8,
  right: 8,
  height: 42,
  width: 42,
  backgroundSize: 'contain',
  cursor: 'pointer',
  zIndex: 3,
});
