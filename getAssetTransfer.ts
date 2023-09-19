import fetch from 'node-fetch';
import fs from 'fs';
import csv from 'csv-parser';
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { getAssetWithProof, mplBubblegum, transfer } from '@metaplex-foundation/mpl-bubblegum';
import bs58 from 'bs58';

const url = "https://rpc.helius.xyz/?api-key=0c617d38-abba-4a2e-9fbd-eebfa825b1e6";

const getAssetsByOwner = async (ownerAddress: string, json_uri: string) => {
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
  
      if (items.length === 0) {
        break;
      }
  
      ids = ids.concat(
        items
          .filter((item: any) => item.content.json_uri.includes(json_uri))
          .map((item: any) => item.id)
      );
  
      page++;
    }
  
    return ids;
  };  

const readCSV = (filename: string) => {
  return new Promise<string[]>((resolve, reject) => {
    const publicKeys: string[] = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (row) => {
        publicKeys.push(row['Public Key']);
      })
      .on('end', () => {
        resolve(publicKeys);
      });
  });
};

const main = async () => {
    const umi = createUmi('https://rpc.helius.xyz/?api-key=ee3516b1-be1f-4bfd-9fa6-a0f00c09f9c3').use(mplBubblegum())
  const filename = '/Users/gregorygotsis/compressed-nfts/ReadApi/Untitled spreadsheet - data-1694566642192.csv';
  const publicKeys = await readCSV(filename);
  const ownerAddress = publicKey('6TEnzXRtvHZ1V1X9gHtFT6BHTZP2JheiJDXMMAfeMSfw');
  const json_uri = '/NS2049NFT';

  const myKeypair = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode('2qxyGuCymNdyKBBK2NhCPHvaKLUh6UXQLs6t5ETqqXcWRwUU4S8tGVTgmxYmbG9JVSwWVuhqxKtdtMqwhoD6wfjj')
  );

  console.log(myKeypair)

  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  
  const ids = await getAssetsByOwner(ownerAddress, json_uri);

  for (let i = 0; i < ids.length; i += 50) {
      const promises: Promise<any>[] = [];

      for (let j = i; j < i + 50 && j < ids.length; j++) {
          umi.use(signerIdentity(myKeypairSigner));
          const newLeafOwnerPublicKey = publicKey(publicKeys[j]);
          const assetId = publicKey(ids[j]);
          console.log(assetId);
          promises.push(getAssetWithProof(umi, assetId).then(assetWithProof => {
              console.log(assetWithProof);
              return transfer(umi, {
                  ...assetWithProof,
                  leafOwner: ownerAddress,
                  newLeafOwner: newLeafOwnerPublicKey,
              }).sendAndConfirm(umi);
          }));
      }

      await Promise.all(promises);
  }
};

main();








