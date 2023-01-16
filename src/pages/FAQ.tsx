import React, { useState, useEffect } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Footer from '../components/Footer';
import { getEllipsisText } from '../helper';
import {
  Alert,
  AlertColor,
  Grid,
  Link,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Header from '../components/Header';
import Background from '../components/Background';
import { Section, Subsection } from '../global/common';

const FAQ = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarVariant, setSnackbarVariant] = useState<AlertColor>('info');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (tooltipVisible) {
      const timeout = setTimeout(() => setTooltipVisible(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [tooltipVisible]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, variant: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarVariant(variant);
    setSnackbarOpen(true);
  };

  return (
    <Grid>
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        open={snackbarOpen}
        autoHideDuration={6000}
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

      <Header logoType="back" />
      <Background />

      <Grid
        sx={{ pt: 4, pb: 4, width: { xs: '90%', md: '80%' }, margin: '0 auto' }}
      >
        <Typography variant="h4" gutterBottom>
          FAQ
        </Typography>
        <Section variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          NFT BASICS
        </Section>
        <Subsection variant="subtitle1" gutterBottom>
          What is an NFT (Non-Fungible Token)?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          NFTs are <strong>unique</strong> pieces of digital content, for
          instance digital work of art, music, videos or other collectibles, and
          thus one-of-a-kind and verifiable assets that are traded on the
          blockchain. In simple words, just think of trading cards for a moment.
          You can hold a specific card in your hand but noone else in the world
          can have this card at the same time, making it unique. Still, there
          could be other copies of this type of card, posessed by others, making
          it a collectible. NFTs work the same way but are digitalized content.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          NFTs represent <strong>Non-Fungible Tokens. Non-fungible </strong>
          means not replacable. These items have one-of-a-kind properties and
          are not interchangable. For instance, diamonds are not interchangeable
          because they have unique characteristics such as color, size, etc. in
          a unique combination.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Contrary, <strong>fungible</strong> items are interchangable. They are
          not defined by their properties but rather their value. For example, a
          $10 USD note has the same value as another $10 USD note.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          <strong>Tokens</strong> represent assets or items and are used to
          address ownership for things. They let us tokenise items like art,
          collectibles and even digital land. Tokens have a verified official
          owner at a time and are secured by a blockchain. Thus, nobody can
          change the record of possession or duplicate the NFTs.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          Why can't I just download and copy any NFT? Why pay money?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Sneaky question! This is the part most people get confused about.
          Well, you most certainly can download the same file as the person who
          paid thousands or millions of dollars for it. But NFTs are designed
          through the blockchain to give you something that can never be copied:
          The ownership. NFTs are not only the artwork, they are unique assets
          that can be used by decentralized apps to proof the ownership and give
          you roles or permissions based on this information. Please note: the
          artist can still retain the copyright of the artwork and reproduction
          rights, just like with physical artwork, if he wants to.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          If you think of physical art collecting, this might help you
          understand: Anyone can buy a print of a Van Gogh painting, but only
          one person can own and sell the original. This transaction is verified
          and visible in the blockchain.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          What is a Blockchain?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Wow, you are eager to learn! A blockchain is a type of shared and
          decentralized database. Most importantly it has characteristics that
          differ from a typical database. Blockchains store information or data
          in <strong>blocks</strong>. These are linked together via
          cryptography. Cryptography refers to techniques to secure information.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Everytime new data is written in a blockchain, it is entered into a
          new block. But blocks have limits and as soon as one is filled with
          data, it is <strong>chained</strong> onto the previous block.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Different types of data can be stored on a blockchain. Besides the
          most known data, digital currency or cryptocurrency such as ADA or
          Bitcoin making it a ledger for transactions, digital assets like NFTs
          can be stored on a blockchain. Many blockchains are set up in a
          decentralized way. Thus, no single person has control over the chain
          and the data entered is irreversible.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          What is minting?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Amazing, your thirst for more information cannot be stopped. In simple
          terms, minting means creating the NFT on a blockchain, making it part
          of it. A blockchain transaction will do its magic and after success,
          metadata is represented as an NFT and can be traded and purchased on
          specialized marketplaces such as jpg.store or cnft.io. If you want
          your assets to be on the blockchain, you need to mint them.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          How to buy NFTs?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Now we are talking! Three things are essential when buying NFTs: A
          wallet, a marketplace and cryptocurrency.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          First, when you consider buying NFTs you need to store them somewhere
          and in such a way, that you as the owner are confirmed. This can be
          achieved by setting up a <strong>digital wallet</strong>, for instance
          with Nami, Yoroi, Flint, Typhon, etc. These wallets are financial
          accounts that allow you to store virtual assets and perform
          transactions.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Second, you need to decide what <strong>marketplace</strong> you want
          to buy from. The most famous NFT marketplaces for Cardano are
          jpg.store and cnft.io. Think of them as a platform like eBay, only
          specialized for NFTs.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          And third, it is important what kind of{' '}
          <strong>cryptocurrency</strong> you'll need to complete the sale. You
          would need have ADA to buy these NFTs.
        </Typography>
        <Typography variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          ABOUT WALKINWALLET
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          What is WalkInWallet?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          This is why you are here, friend!{' '}
          <strong>
            WalkInWallet is our free to use 1-click solution to view your
            Cardano NFTs in a automatically created 3D gallery.
          </strong>
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Just login with your wallet and start walking. No manual configuration
          is required. WalkInWallet supports NFTs minted on Cardano.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          <em>Walk in wallets as you would walk in galleries!</em>
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          Is WalkInWallet for free?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          <strong>Yes.</strong> We want the whole world to see how great NFTs
          can look.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          How safe is WalkInWallet? Is data collected?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          It is completely safe because we do not collect any data besides the
          public address of a wallet (which is public in the blockchain anyways)
          in order to generate a 3D gallery. We simply read the public
          blockchain data like any other platform when you connect your wallet.
          If you have any doubts, please view our{' '}
          <Link href="/addr1qxckxc9rap6ypl6f3ry83ec47u060wh706wrypdyeapmt37gnrd39mmm4wuzt9m8vvpl2tvfw4hc75q0tf2yv9vcyvsst8wu6z">
            Demo Wallet
          </Link>{' '}
          where no login is needed or write your questions to{' '}
          <Link href="mailto:contact@walkinwallet.com">
            contact@walkinwallet.com
          </Link>
          .
        </Typography>
        <Typography variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          COMMUNITY &amp; HOW TO SUPPORT US
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          How can I join the WalkInWallet community?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          The community is a great place to generate ideas for new features.
          With your help, we can make 3D galleries &ldquo;great again&rdquo;.
          Join our{' '}
          <Link href="https://discord.gg/zRUB42UPmB">WalkInWallet Discord</Link>
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          How can I share my WalkInWallet gallery?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Open your 3D gallery by clicking the button on the left side of our
          start page. After connecting your wallet.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Your wallet address should now be part of the website url. You can
          also add any other or your own public address to the url to enter the
          gallery without connecting your wallet.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          Can I promote my WalkInWallet gallery on my website or social media?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Of course, go for it! You can promote your gallery for personal or
          commercial use. If you want to support us, we'd be honored if you tag
          us with <strong>@walkinwallet</strong> in order for us to see your
          great NFT collection and artwork.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          Your solution is great! Can I support/gift something to you?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Wow, you're a nice person! We appreciate any help we can get.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          First, help us spread the word. You could tag and feature us on social
          media to promote our solution and show it to your friends and
          audience. Currently, we operate a{' '}
          <Link href="https://discord.gg/zRUB42UPmB">Discord</Link>,{' '}
          <Link href="https://twitter.com/walkinwallet">Twitter</Link>,{' '}
          <Link href="https://www.instagram.com/walkinwallet/">Instagram </Link>
          and{' '}
          <Link href="https://www.linkedin.com/company/walkinwallet/">
            LinkedIn{' '}
          </Link>
          account.
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          If you want, you can also gift cryptocurrency or NFTs to our wallet:{' '}
          <Tooltip title="Copied">
            <strong>
              {getEllipsisText(
                'addr1qxckxc9rap6ypl6f3ry83ec47u060wh706wrypdyeapmt37gnrd39mmm4wuzt9m8vvpl2tvfw4hc75q0tf2yv9vcyvsst8wu6z'
              )}{' '}
              <ContentCopyIcon
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      'addr1qxckxc9rap6ypl6f3ry83ec47u060wh706wrypdyeapmt37gnrd39mmm4wuzt9m8vvpl2tvfw4hc75q0tf2yv9vcyvsst8wu6z'
                    );
                    setTooltipVisible(true);
                  } catch (error) {
                    console.log(error);
                    showSnackbar('Clipboard is not writable.', 'warning');
                  }
                }}
              />
            </strong>
          </Tooltip>
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          Last, if you're looking to support us with your NFT market or coding
          expertise, please contact us via{' '}
          <Link href="mailto:contact@walkinwallet.com">
            contact@walkinwallet.com
          </Link>
          .
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          How can I invest in your WalkInWallet project?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          Help is always welcome! If you are serious about funding our solution,
          please contact us via{' '}
          <Link href="mailto:contact@walkinwallet.com">
            contact@walkinwallet.com
          </Link>
          . Funds will be invested in our technology stack, infrastructure and
          new features e.g. upgrading API and infrastructure plans, fetch
          further infos via the fee-based APIs, run own nodes or IPFS nodes, 3D
          models and "in-game" interactions.
        </Typography>

        <Typography variant="h5" sx={{ mt: 2, mb: 2 }} gutterBottom>
          TECHNICAL SUPPORT
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          How do I create a 3D gallery on WalkInWallet?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          After collecting your first artworks, for instance on jpg.store or
          cnft.io, come back to our homepage{' '}
          <Link href="https://walkinwallet.com/">WalkInWallet </Link>and and
          click "Connect with wallet".
        </Typography>
        <Typography variant="body2" gutterBottom align="justify">
          You will be asked to sign the log-in, as you would on any other site
          when connecting your wallet. Then your 3D gallery is automatically
          created by an algorithm for you with your assets placed on walls.
        </Typography>
        <Subsection variant="subtitle1" gutterBottom>
          Audio doesn't seem to play on my videos. Do you support audio?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          This feature is in development in 2022-2023 and will be enabled soon.
          Then, we will support NFTs with audio.
        </Typography>

        <Subsection variant="subtitle1" gutterBottom>
          My videos don't seem to be visible. Do you support videos?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          This feature is in development in 2022-2023 and will be enabled soon.
          Then, we will support video NFTs.
        </Typography>

        <Subsection variant="subtitle1" gutterBottom>
          I found a bug. How can I report it?
        </Subsection>
        <Typography variant="body2" gutterBottom align="justify">
          You've earned yourself a reward. Our developers are always happy about
          feedback. Please make a screenshot and send a brief discription along
          with the browser and device you're using to{' '}
          <Link href="mailto:contact@walkinwallet.com">
            contact@walkinwallet.com
          </Link>
          .
        </Typography>
      </Grid>
      <Footer />
    </Grid>
  );
};

export default FAQ;
