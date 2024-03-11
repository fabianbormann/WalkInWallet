import Axios, { AxiosError } from 'axios';
import { Buffer } from 'buffer';
import {
  NftDetailResponse,
  NftFetchResponse,
  Picture,
  RetryObject,
} from './types';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

const MAX_IPFS_FETCH_RETRIES = 20;
const currentNetwork = import.meta.env.VITE_NETWORK || 'mainnet';
const koiosApiToken = import.meta.env.VITE_KOIOS_API_TOKEN || '';
let koiosBaseUrl = 'https://api.koios.rest/api/v0/';

if (currentNetwork === 'preprod') {
  koiosBaseUrl = 'https://preprod.koios.rest/api/v0/';
} else if (currentNetwork === 'preview') {
  koiosBaseUrl = 'https://preview.koios.rest/api/v0/';
}

const axios = setupCache(Axios.create(), {
  storage: buildWebStorage(localStorage, 'axios-cache:'),
  ttl: 15 * 60 * 1000,
  methods: ['get', 'post'],
});

const defaultAxios = Axios.create();

if (koiosApiToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${koiosApiToken}`;
  defaultAxios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${koiosApiToken}`;
}

export const getStakeAddressFromPaymentAddress = async (
  paymentAddress: string
) => {
  const stakeAddressResponse = (
    await axios.post(`${koiosBaseUrl}address_info`, {
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
  const paymentRequest = await axios.get(
    `${koiosBaseUrl}asset_nft_address?_asset_policy=${policyID}&_asset_name=${assetName}`
  );
  if (paymentRequest.status === 200 && paymentRequest.data.length > 0) {
    const paymentAddress = paymentRequest.data[0].payment_address;
    return getStakeAddressFromPaymentAddress(paymentAddress);
  } else {
    throw new Error(
      'Could not resolve ada handle to payment address. Check if the ada handle is correct.'
    );
  }
};

export const getNFTsFromStakeAddress = async (stakeAddress: string) => {
  let nftFetchResponse;

  try {
    nftFetchResponse = (
      await defaultAxios.post(`${koiosBaseUrl}account_assets`, {
        _stake_addresses: [stakeAddress],
      })
    ).data[0] as NftFetchResponse;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log(axiosError);
  }

  if (typeof nftFetchResponse === 'undefined') {
    return [];
  }

  return (
    await defaultAxios.post(`${koiosBaseUrl}asset_info`, {
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
      `${koiosBaseUrl}policy_asset_info?_asset_policy=${policyId}`
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
                type: 'picture',
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

const ipfsGateways = [
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

const extractCidFromUrl = (url: string) => {
  return url.split('/').pop();
};

const replaceIpfsGateway = (url: string, gateway: string) => {
  const cid = extractCidFromUrl(url);
  return gateway + cid;
};

const hasValidMetadata = (picture: Picture) => {
  if (typeof picture.image !== 'undefined') {
    return (
      (typeof picture.image === 'string' &&
        (picture.image.startsWith('http') ||
          picture.image.startsWith('ipfs'))) ||
      Array.isArray(picture.image)
    );
  }
  return false;
};

export const loadPaintings = async (
  retryObjects: Array<RetryObject>,
  needToStop: () => boolean,
  setPaintings: (paintings: Array<Picture>) => void
) => {
  const retryQueue: Array<RetryObject> = [];
  let fetchedPaintings: Array<Picture> = [];

  for (const retryObject of retryObjects) {
    const htmlImage = document.createElement('img');
    const picture = retryObject.painting;

    if (needToStop() || typeof picture.width !== 'undefined') {
      return;
    }

    let scheduledForRetry: boolean = false;

    if (hasValidMetadata(picture)) {
      picture.offline = false;
      htmlImage.src = picture.image;
      htmlImage.setAttribute('crossorigin', 'anonymous');

      try {
        if (Array.isArray(picture.image)) {
          await loadImage(htmlImage, picture.image.join(''));
        } else {
          await loadImage(
            htmlImage,
            replaceIpfsGateway(picture.image, retryObject.ipfsGateway)
          );
        }

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
        if (retryObject.retries < MAX_IPFS_FETCH_RETRIES) {
          retryQueue.push({
            retries: retryObject.retries + 1,
            ipfsGateway:
              ipfsGateways[retryObject.retries % ipfsGateways.length],
            painting: picture,
          });
          scheduledForRetry = true;
        } else {
          picture.image = './offline.png';
          picture.width = 1685;
          picture.height = 1685;
          picture.offline = true;
        }
      }
    }
    htmlImage.remove();

    if (!scheduledForRetry) {
      fetchedPaintings = [...fetchedPaintings, picture];
      if (!needToStop()) {
        setPaintings(fetchedPaintings);
      }
    }
  }

  if (!needToStop() && retryQueue.length > 0) {
    loadPaintings(retryQueue, needToStop, setPaintings);
  }
};
