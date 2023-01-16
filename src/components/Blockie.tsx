import React from 'react';
import Blockies from 'react-blockies';
import { BlockieProps } from '../global/types';
import { Avatar, styled } from '@mui/material';

const BlockieContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 4px',
  '& > canvas': { borderRadius: '50%' },
});

const Blockie = ({ address, scale }: BlockieProps) => {
  if (!scale) {
    scale = 5;
  }

  if (!address) {
    return <Avatar sizes="40" />;
  } else {
    return (
      <BlockieContainer>
        <Blockies seed={address.toLowerCase()} scale={scale} />
      </BlockieContainer>
    );
  }
};

export default Blockie;
