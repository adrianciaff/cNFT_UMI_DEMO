import { generateSigner } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import fs from 'fs';


const umi = createUmi('https://rpc.helius.xyz/?api-key=727cdf02-ebe2-491a-a3eb-8f0cd6d28de5')


const wallet = generateSigner(umi);
const myKeypair = umi.eddsa.createKeypairFromSecretKey(wallet.secretKey);

const keys: any = {};
// Append new data to existing JSON object
keys.myKeypair = myKeypair;

// Write the entire JSON object back to the file
fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2));