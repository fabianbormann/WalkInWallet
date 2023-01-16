import { Grid, Typography } from '@mui/material';
import React from 'react';
import Background from '../components/Background';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Section, Subsection } from '../global/common';

const Benefits = () => {
  return (
    <Grid>
      <Header logoType="back" />
      <Background />

      <Grid
        sx={{ pt: 4, pb: 4, width: { xs: '90%', md: '80%' }, margin: '0 auto' }}
      >
        <Typography variant="h4" gutterBottom>
          3 REASONS TO USE WALKINWALLET
        </Typography>
        <Section variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          The new NFT experience for you and your audience.
        </Section>
        <Subsection variant="subtitle1" gutterBottom>
          Part of the web3 journey.
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Join our world and take a walk in NFT wallets.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Revolutionized NFT interaction. Upgrade from simple lists to a fully
          immersive 3D experience.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Let our algorithm do its magic: Your gallery is unique and knows no
          limits.
        </Typography>

        <Section variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          Generate and discover collections beyond your imagination.
        </Section>
        <Subsection variant="subtitle1" gutterBottom>
          Create & get noticed.
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Add a spatial experience to your NFTs.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Exhibitions of any type and scale to showcase your entire collection.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Surprise your audience and get noticed by sharing your gallery in a
          interactive format.
        </Typography>

        <Subsection variant="subtitle1" gutterBottom>
          Explore & get inspired.
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Visit public NFT 3D galleries.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Get inspired as an artist or visitor.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Search for NFT art to buy as a collector.
        </Typography>

        <Section variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          No Effort. No Costs. Just simple, safe and always accessible.
        </Section>
        <Subsection variant="subtitle1" gutterBottom>
          Simple and free of charge.
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          1-Click connection with your wallet.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Save on complex and pricy gallery building.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Get immediate results and walk through your collection.
        </Typography>

        <Subsection variant="subtitle1" gutterBottom>
          Safe and sound.
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Completly safe without any data collection.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Based on public blockchain data only.
        </Typography>

        <Subsection variant="subtitle1" gutterBottom>
          Anyplace, anytime, anywhere.
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Accessible via mobile and desktop.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Available 24/7.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Visit your and other collections from anywhere around the globe.
        </Typography>
      </Grid>
      <Footer />
    </Grid>
  );
};

export default Benefits;
