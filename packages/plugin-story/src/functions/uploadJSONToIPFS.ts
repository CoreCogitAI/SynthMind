import PinataClient from "@pinata/sdk";

/**
 * Uploads a JSON object to IPFS using the Pinata client.
 * @param {PinataClient} pinata - The Pinata client used to interact with Pinata's API.
 * @param {*} jsonMetadata - The JSON object to be uploaded to IPFS.
 * @returns {Promise<string>} The IPFS hash of the uploaded JSON object.
 */
export async function uploadJSONToIPFS(
    pinata: PinataClient,
    jsonMetadata: any
): Promise<string> {
    const { IpfsHash } = await pinata.pinJSONToIPFS(jsonMetadata);
    return IpfsHash;
}
