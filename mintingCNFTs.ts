import fetch from 'node-fetch';
import * as fs from 'fs';
import { createSignerFromKeypair, none, publicKey, signerIdentity } from '@metaplex-foundation/umi';
import { 
  mintToCollectionV1, 
  mplBubblegum,   
  fetchMerkleTree,
  fetchTreeConfigFromSeeds, 
} from '@metaplex-foundation/mpl-bubblegum';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

const TARGET_WALLET_ADDRESS = 'GBYhyHkhecKnaEy5H4emesn7mN1SEJxeHvECCxAYyQSH'; // Replace with your target wallet address

async function main() {
  const umi = createUmi('https://rpc.helius.xyz/?api-key=fcf3cb33-096f-45e7-878d-8d9caa01e7db').use(mplBubblegum());
  const data = fs.readFileSync('keys.json', 'utf-8');
  const keys = JSON.parse(data);
  const secretKeyArray = Object.values(keys.myKeypair.secretKey) as number[];
  keys.secretKey = new Uint8Array(secretKeyArray);
  const myKeypair = umi.eddsa.createKeypairFromSecretKey(keys.secretKey);
  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  umi.use(signerIdentity(myKeypairSigner));
  const merkleTree = publicKey(keys.merkleTree.publicKey);
  const collectionMint = publicKey(keys.collectionMint.publicKey);

  const leafOwner = publicKey(TARGET_WALLET_ADDRESS);
// Create an array with 100 objects having the first URI
// const metadataArray = Array(100).fill({
//   name: 'Superteam World Tour: Ireland',
//   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/Ireland.json',
//   amount: 98, 
// });

// Create an array with 50 objects having the second URI
const metadataArray = Array(50).fill({
  name: 'Superteam World Tour: Greece',
  uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/ellada.json',
  amount: 50, 
});

// const metadataArray = firstArray.concat(secondArray);


  for (const metadata of metadataArray) {
    mintToCollectionV1(umi, {
      leafOwner,
      merkleTree,
      collectionMint,
      metadata: {
        name: metadata.name,
        uri: metadata.uri,
        sellerFeeBasisPoints: 0,
        collection: { key: collectionMint, verified: false },
        creators: [
          { address: umi.identity.publicKey, verified: false, share: 100 },
        ],
      },
    }).sendAndConfirm(umi);
    console.log(mintToCollectionV1);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Minting to wallet ${TARGET_WALLET_ADDRESS}`);
  }
}

main();
