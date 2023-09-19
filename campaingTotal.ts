import fetch from 'node-fetch';
import fs from 'fs';
import csv from 'csv-parser';
import { write } from 'fast-csv';

const getAssetsByOwner = async (ownerAddress: string) => {
  const url = 'https://rpc.helius.xyz/?api-key=727cdf02-ebe2-491a-a3eb-8f0cd6d28de5'; // Define your RPC URL here
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
        page: 1,
        limit: 1000
      },
    }),
  });
  const { result } = await response.json();
  console.log(result)
  const items = result.items;
  const nftCount = items.filter((item: any) => item.content.json_uri.includes('/NS2049NFT')).length;
  console.log("nft count for ", ownerAddress, ": ", nftCount);
  return nftCount;
}; 

const readCSV = (filename: string) => {
  return new Promise<string[]>((resolve, reject) => {
    const publicKeys: string[] = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (row) => {
        publicKeys.push(row['public_key']);
      })
      .on('end', () => {
        resolve(publicKeys);
      });
  });
};

const writeToCSV = (data: string[], filename: string) => {
  const formattedData = data.map(key => ({ 'public_key': key }));
  const writeStream = fs.createWriteStream(filename);
  write(formattedData, { headers: true }).pipe(writeStream);
};

const main = async () => {
  const filename = '/Users/gregorygotsis/compressed-nfts/ReadApi/data-1694569963142.csv';
  const outputFilename = '/Users/gregorygotsis/compressed-nfts/ReadApi/Zeros.csv';
  const publicKeys = await readCSV(filename);

  const zeroCountPublicKeys: string[] = [];
  
  let currentIndex = 0;

  while (currentIndex < publicKeys.length) {
    // Determine the size of the next batch
    const nextIndex = Math.min(currentIndex + 50, publicKeys.length);
    const batch = publicKeys.slice(currentIndex, nextIndex);
  
    const batchPromises = batch.map(async (publicKey) => {
      const count = await getAssetsByOwner(publicKey);
      if (count === 0) {
        zeroCountPublicKeys.push(publicKey);
      }
    });
  
    // Wait for this batch to complete
    await Promise.all(batchPromises);
  
    currentIndex = nextIndex;  // Move to the next batch
  }
  

  writeToCSV(zeroCountPublicKeys, outputFilename);
  console.log("Written zero counts to Zeros.csv");
};

main();
