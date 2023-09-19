import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from '@metaplex-foundation/umi';
import { createTree, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import * as fs from 'fs';


async function main() {
  const umi = createUmi('https://rpc.helius.xyz/?api-key=727cdf02-ebe2-491a-a3eb-8f0cd6d28de5').use(mplBubblegum())
  // const wallet = generateSigner(umi);

  // const keys: any = {};

  const data = fs.readFileSync('keys.json', 'utf-8');
  const keys = JSON.parse(data);
  const secretKeyArray = Object.values(keys.myKeypair.secretKey) as number[];
  keys.secretKey = new Uint8Array(secretKeyArray);

  const myKeypair = umi.eddsa.createKeypairFromSecretKey(keys.secretKey);  

  const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
  const merkleTree = generateSigner(umi)
  const collectionMint = generateSigner(umi)

  umi.use(signerIdentity(myKeypairSigner));

  // Append new data to existing JSON object
  keys.myKeypair = myKeypair;
  keys.merkleTree = merkleTree;
  keys.collectionMint = collectionMint;

  // Write the entire JSON object back to the file
  fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2));

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 11,

  });
  await builder.sendAndConfirm(umi);

  console.log(builder)

  umi.use(mplTokenMetadata())

  const collection = await createNft(umi, {
    mint: collectionMint,
    name: 'We Just Testin',
    uri: 'https://shdw-drive.genesysgo.net/ES9BRvPwfQ1t1oWhLBvVqMHkczkK95gcNFDdfgfpXZ9x/NS2049COL.json',
    sellerFeeBasisPoints: percentAmount(0), // 0%
    isCollection: true,
}).sendAndConfirm(umi)

console.log(collection)


}

main();
