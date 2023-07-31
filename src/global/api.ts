import Axios, { AxiosError } from 'axios';
import { Buffer } from 'buffer';
import { NftDetailResponse, NftFetchResponse, Picture } from './types';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create(), {
  storage: buildWebStorage(localStorage, 'axios-cache:'),
  ttl: 15 * 60 * 1000,
  methods: ['get', 'post'],
});

export const getStakeAddressFromPaymentAddress = async (
  paymentAddress: string
) => {
  const stakeAddressResponse = (
    await axios.post(`https://api.koios.rest/api/v0/address_info`, {
      _addresses: [paymentAddress],
    })
  ).data;
  return stakeAddressResponse[0].stake_address;
};

export const getStakeAddressFromAdaHandle = async (adaHandle: string) => {
  const policyID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
  const assetName = adaHandle.startsWith('$')
    ? Buffer.from(adaHandle.slice(1)).toString('hex')
    : Buffer.from(adaHandle).toString('hex');
  const paymentAddress = (
    await axios.get(
      `https://api.koios.rest/api/v0/asset_nft_address?_asset_policy=${policyID}&_asset_name=${assetName}`
    )
  ).data[0].payment_address;

  return getStakeAddressFromPaymentAddress(paymentAddress);
};

export const getNFTsFromStakeAddress = async (stakeAddress: string) => {
  const nftFetchResponse = (
    await axios.post('https://api.koios.rest/api/v0/account_assets', {
      _stake_addresses: [stakeAddress],
    })
  ).data[0] as NftFetchResponse;

  return (
    await axios.post('https://api.koios.rest/api/v0/asset_info', {
      _asset_list: nftFetchResponse.asset_list.map((asset) => [
        asset.policy_id,
        asset.asset_name,
      ]),
    })
  ).data as NftDetailResponse;
};

export const getNFTsFromPolicyId = async (policyId: string) => {
  return (
    await axios.get(
      `https://api.koios.rest/api/v0/policy_asset_info?_asset_policy=${policyId}`
    )
  ).data as NftDetailResponse;
};

export const extractNFTsFromNFTDetailResponse = (
  nftDetailResponse: NftDetailResponse,
  page?: string
) => {
  let pictures: Array<Picture> = [];
  for (const nftDetail of nftDetailResponse) {
    const policyIds = nftDetail.minting_tx_metadata?.['721'];
    if (typeof policyIds !== 'undefined') {
      for (const policyId of Object.keys(policyIds)) {
        const assets = nftDetail.minting_tx_metadata?.['721'][policyId];
        for (const assetName of Object.keys(assets)) {
          const asset = assets[assetName];
          if (asset.name && assetName === nftDetail.asset_name_ascii) {
            pictures = [
              ...pictures,
              {
                name: asset.name,
                image: asset.image,
                link: `https://www.jpg.store/asset/${policyId}${Buffer.from(
                  assetName
                ).toString('hex')}`,
                description: asset.description || asset.Description || '',
              } as Picture,
            ];
          }
        }
      }
    }
  }

  let offset = 0;
  let paintingsPerPage = 10;
  if (typeof page !== 'undefined') {
    offset = (parseInt(page) - 1) * paintingsPerPage;
  }

  const totalPages = Math.ceil(pictures.length / paintingsPerPage);
  pictures = pictures.slice(offset, offset + paintingsPerPage);

  return { pictures, totalPages };
};

export const loadPaintings = async (
  nfts: Array<Picture>,
  needToStop: () => boolean,
  setStage: (stage: string) => void,
  setProgress: (progress: number) => void,
  setPaintings: (paintings: Array<Picture>) => void
) => {
  const loadImage = (image: HTMLImageElement, blob: string) =>
    new Promise((resolve, reject) => {
      image.addEventListener('load', () => {
        image.replaceWith(image.cloneNode(true));
        resolve(image);
      });
      image.addEventListener('error', (error) => {
        image.replaceWith(image.cloneNode(true));
        reject(error);
      });
      image.src = blob;
    });
  const htmlImage = document.createElement('img');
  let fetchedPaintings: Array<Picture> = [];
  for (const picture of nfts) {
    if (needToStop() || typeof picture.width !== 'undefined') {
      return;
    }
    if (
      picture.image &&
      (picture.image.startsWith('http') || picture.image.startsWith('ipfs://'))
    ) {
      picture.image = picture.image.replace('ipfs://', 'https://ipfs.io/ipfs/');

      if (!needToStop()) {
        setStage('Rendering 3D gallery');
        setProgress(99);
      }

      picture.offline = false;
      htmlImage.src = picture.image;
      htmlImage.setAttribute('crossorigin', 'anonymous');
      try {
        await loadImage(htmlImage, picture.image);

        let width = htmlImage.naturalWidth;
        let height = htmlImage.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (context) {
          context.drawImage(htmlImage, 0, 0, width, height);
        }

        picture.width = width;
        picture.height = height;
        picture.image = canvas.toDataURL('image/jpeg', 1.0);

        canvas.remove();
      } catch (error) {
        picture.image = './offline.png';
        picture.width = 1685;
        picture.height = 1685;
        picture.offline = true;
        console.log(error);
      }
    }
    htmlImage.remove();
    fetchedPaintings = [...fetchedPaintings, picture];
    if (!needToStop()) {
      setPaintings(fetchedPaintings);
    }
  }
};
