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

const TARGET_WALLET_ADDRESS = 'FMoAzsfTAJkG658f2emPyAmoefoZV4WwjPK1LBYSePgw'; // Replace with your target wallet address

const MAX_RETRIES = 3;  // Define the maximum number of retry attempts


//wrapped the umi mintToCollectionV1 in some retry logic
async function tryMinting(umi: any, mintDetails: any) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await mintToCollectionV1(umi, mintDetails).sendAndConfirm(umi);
            return;  // Exit the loop if successful
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error}`);
            if (attempt < MAX_RETRIES) {
                console.log('Retrying...');
            } else {
                console.error('Max retries reached. Moving on...');
            }
        }
    }
}

async function main() {
  const umi = createUmi('https://rpc.helius.xyz/?api-key=fcf3cb33-096f-45e7-878d-8d9caa01e7db').use(mplBubblegum());
  const data = fs.readFileSync('keys.json', 'utf-8');
  const keys = JSON.parse(data);

  //pulls values from the keys file and sets as respective types
  const secretKeyArray = Object.values(keys.myKeypair.secretKey) as number[];
  keys.secretKey = new Uint8Array(secretKeyArray);
  
  const myKeypair = umi.eddsa.createKeypairFromSecretKey(keys.secretKey);
  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  umi.use(signerIdentity(myKeypairSigner));
  

  const merkleTree = publicKey(keys.merkleTree.publicKey);
  const collectionMint = publicKey(keys.collectionMint.publicKey);

  const leafOwner = publicKey(TARGET_WALLET_ADDRESS);

//change Array(x) to adjust the mint amt
const metadataArray = Array(3).fill({
  name: 'We Just Testin',
  uri: 'https://shdw-drive.genesysgo.net/ES9BRvPwfQ1t1oWhLBvVqMHkczkK95gcNFDdfgfpXZ9x/NS2049NFT.json',
});


  for (const metadata of metadataArray) {
    tryMinting(umi, {
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
  });
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Minting to wallet ${TARGET_WALLET_ADDRESS}`);
  }
}

main();
