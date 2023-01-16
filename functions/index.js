const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const Blockfrost = require('@blockfrost/blockfrost-js');
const bunyan = require('bunyan');
const logger = bunyan.createLogger({ name: 'walkinwallet' });
require('dotenv').config();

if (!process.env.BLOCKFROST_PROJECT_ID) {
  logger.error('A blockfrost project id is needed to start the server.');
  process.exit(1);
}

const blockfrostProjectId = process.env.BLOCKFROST_PROJECT_ID;
const corsOrigin = process.env.CORS_ORIGIN || '*';
let useInMemoryCache = process.env.USE_IN_MEMORY_CACHE || 'false';
useInMemoryCache = useInMemoryCache.toLowerCase() === 'true';

const API = new Blockfrost.BlockFrostAPI({ projectId: blockfrostProjectId });

const extractDescription = (metadata) => {
  return metadata.description || metadata['-----Info-----'];
};

const app = express();
const corsOptions = {
  origin: corsOrigin,
};

console.warn(corsOrigin);

app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(req.headers.origin);
  if (req.headers.origin !== corsOrigin) {
    res.status(403).send();
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  return res.status(200).end();
});

let badCache = {};

app.get('/nfts/:address', async (req, res) => {
  try {
    let nfts = [];
    let assets = [];

    if (
      req.params.address.startsWith('DdzFF') ||
      req.params.address.startsWith('addr1')
    ) {
      const address = await API.addresses(req.params.address);
      assets = await API.accountsAddressesAssetsAll(address.stake_address);
    } else if (req.params.address.startsWith('stake1')) {
      assets = await API.accountsAddressesAssetsAll(req.params.address);
    } else {
      assets = await API.assetsPolicyByIdAll(req.params.address);
    }

    if (useInMemoryCache) {
      if (!badCache[req.params.address]) {
        for (const asset of assets) {
          const details = await API.assetsById(asset.asset || asset.unit);
          if (
            details?.onchain_metadata?.image &&
            details?.onchain_metadata?.name
          ) {
            nfts.push({
              name: details?.onchain_metadata?.name,
              image: details?.onchain_metadata?.image,
              url: `https://www.jpg.store/asset/${details.asset}`,
              description: extractDescription(details?.onchain_metadata),
            });
          }
        }

        badCache[req.params.address] = nfts;
      } else {
        nfts = badCache[req.params.address];
      }
    } else {
      for (const asset of assets) {
        const details = await API.assetsById(asset.asset || asset.unit);
        if (
          details?.onchain_metadata?.image &&
          details?.onchain_metadata?.name
        ) {
          nfts.push({
            name: details?.onchain_metadata?.name,
            image: details?.onchain_metadata?.image,
            url: `https://www.jpg.store/asset/${details.asset}`,
            description: extractDescription(details?.onchain_metadata),
          });
        }
      }
    }

    res.json(nfts);
  } catch (error) {
    logger.warn(error);
    res.status(400).end();
  }
});

exports.api = functions.https.onRequest(app);
