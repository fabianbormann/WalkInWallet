import axios from 'axios';
import { Buffer } from 'buffer';
import { NftDetailResponse, NftFetchResponse, Picture } from './types';

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
  nftDetailResponse: NftDetailResponse
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
                link: asset.website || asset.url || asset.Website || '',
                description: asset.description || asset.Description || '',
              } as Picture,
            ];
          }
        }
      }
    }
  }
  return pictures;
};
