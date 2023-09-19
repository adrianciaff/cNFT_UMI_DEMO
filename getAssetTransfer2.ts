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
  const umi = createUmi('https://rpc.helius.xyz/?api-key=727cdf02-ebe2-491a-a3eb-8f0cd6d28de5').use(mplBubblegum())
  const filename = '/Users/gregorygotsis/compressed-nfts/ReadApi/Untitled spreadsheet - data-1694562932670.csv';
  const publicKeys = await readCSV(filename);
  const ownerAddress = publicKey('3qWTofDwPNjJyQnDK1hryGbnQxABc3g83tninCagSm5E');
  const json_uri = '/NS2049NFT';

  const myKeypair = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode('5YzyeHaVySKeTYS7mGQeiC4tAp2F133feZFkgA7Bnf8xbXAfmtGbWD51JEMgkorNUCjokXGpcVeLAJx7qFVGSgPE')
  );

  console.log(myKeypair)

  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  
  const ids = await getAssetsByOwner(ownerAddress, json_uri);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


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
      await sleep(3000); // Sleep for 3 seconds before processing the next batch.
    
  }
};

main();








