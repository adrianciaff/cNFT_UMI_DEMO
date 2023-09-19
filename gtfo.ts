import fetch from 'node-fetch';
import fs from 'fs';
import csv from 'csv-parser';
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { getAssetWithProof, mplBubblegum, transfer } from '@metaplex-foundation/mpl-bubblegum';
import bs58 from 'bs58'

const url = "https://rpc.helius.xyz/?api-key=0c617d38-abba-4a2e-9fbd-eebfa825b1e6";

const getAssetsByOwner = async (ownerAddress: string,) => {
  let page = 1;
  let ids: string[] = [];

  while (true) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: ownerAddress,
          page: page,
          limit: 1000
        },
      }),
    });

    const { result } = await response.json();
    const items = result.items;

    // Extract the ids from the items and add them to the ids array
    for (const item of items) {
      ids.push(item.id);
    }

    // Check if there are more pages
    if (result.total <= page * 1000) {
      break;
    }

    page++;
  }

  return ids;
};




const main = async () => {
    const umi = createUmi('https://rpc.helius.xyz/?api-key=0c617d38-abba-4a2e-9fbd-eebfa825b1e6').use(mplBubblegum())


  const data = fs.readFileSync('keys.json', 'utf-8');
  const keys = JSON.parse(data);
  const secretKeyArray = Object.values(keys.TipLink.secretKey) as number[];
  keys.secretKey = new Uint8Array(secretKeyArray);
 

  const ownerAddress = publicKey('9QLou8GoT2J37iZifZgzH9dZ6HRxxtWJMran1wE8NWNg')
  const newLeafOwnerPublicKey = publicKey('7i8nEnBTABAA5nM3SxLbLjDJ6DxqPs7hTNNwfWjP5Xh4')


  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  umi.use(signerIdentity(myKeypairSigner));
  
  const ids = await getAssetsByOwner(ownerAddress);
  
  for (const id of ids) {
    const assetId = publicKey(id);
    const assetWithProof = await getAssetWithProof(umi, assetId);
    await transfer(umi, {
      ...assetWithProof,
      leafOwner: ownerAddress,
      newLeafOwner: newLeafOwnerPublicKey,
    }).sendAndConfirm(umi);
  }
};

main();
