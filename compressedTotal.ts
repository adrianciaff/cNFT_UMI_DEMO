import fetch from 'node-fetch';

interface Content {
    content: {
        json_uri: string;
    };
}

interface Metadata {
    name: string;
    uri: string;
}

const countURIs = (contentArray: Content[], metadataArray: Metadata[]) => {
    // Initialize a counter object
    const counter: { [key: string]: number } = {};

    // Initialize the counter object with the URIs from metadataArray
    metadataArray.forEach(metadata => {
        counter[metadata.uri] = 0;
    });

    // Increment the counter for each URI found in the contentArray
    contentArray.forEach(content => {
        const uri = content.content.json_uri;
        if (counter[uri] !== undefined) {
            counter[uri]++;
        }
    });

    return counter;
};

const main = async () => {
    const url = "https://rpc.helius.xyz/?api-key=0c617d38-abba-4a2e-9fbd-eebfa825b1e6";

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetsByGroup',
            params: {
                groupKey: 'collection',
                groupValue: '924tmWhP1jPmycoU7B3DXNF2FycZFaC9rrSu5aSsuGQn',
                page: 1, // Starts at 1
                limit: 1000,
            },
        }),
    });
    const { result } = await response.json();
    const contentArray: Content[] = result.items;

    const metadataArray = [
    //   {
    //     name: 'Network State ProofOfAttendance',
    //     uri: 'https://shdw-drive.genesysgo.net/51KVXszLN6RV5qCDM1hncqRBZPb2Znkwgw8JCBCVZprj/NS2049NFT.json',
    //     amount: 1900,
    //   },
    {
        name: 'Superteam World Tour: Ireland',
        uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/Ireland.json',
      },
      {
        name: 'Superteam World Tour: Greece',
        uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/ellada.json',
      }
        // {
        //   name: 'Superteam World Tour: Australia',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/australia.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour: Canada',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/canada.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour: Colombia',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/colombia.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam World Tour: Indonesia',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/indonesia.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour: Italy',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/italy.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam World Tour: Japan',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/japan.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam World Tour: Lithuania',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/lithuania.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour:Netherlands',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/netherlands.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam World Tour: Pakistan',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/pakistan.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour:Philippines',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/philippines.json',
        //   amount: 200,
        // },
        // {
        //   name: 'Superteam World Tour: Portugal',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/portugal.json',
        //   amount: 250,
        // },
        // {
        //   name: 'Superteam World Tour: Serbia',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/serbia.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam WorldTour:Sierra Leone',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/sierra_leone.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam World Tour: Singapore',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/singapore.json',
        //   amount: 10,
        // },
        // {
        //   name: 'Superteam World Tour:South Korea',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/south_korea.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour: Spain',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/spain.json',
        //   amount: 100,
        // },
        // {
        //   name: 'Superteam World Tour: Switzerland',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/switzerland.json',
        //   amount: 50,
        // },
        // {
        //   name: 'Superteam World Tour: Venezuela',
        //   uri: 'https://shdw-drive.genesysgo.net/VtocvyhqmK97dkrUuJ6XLNTPMhZdDoqBmxW5Ewp7P8q/venezuela.json',
        //   amount: 50,
        // },
      ];

    const uriCount = countURIs(contentArray, metadataArray);
    console.log(uriCount);
};

main();
