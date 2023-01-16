import { styled } from '@mui/material';

const BackrgoundImage = styled('div')({
  top: 0,
  height: 'inherit',
  width: '100%',
  position: 'absolute',
  objectFit: 'cover',
  zIndex: -1,
  backgroundImage: 'linear-gradient(to bottom, #ddd, white)',
});

const Background = () => {
  return <BackrgoundImage />;
};

export default Background;
