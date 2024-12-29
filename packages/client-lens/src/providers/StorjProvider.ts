import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import type { IAgentRuntime } from "@elizaos/core";

// ipfs pinning service: https://storj.dev/dcs/api/storj-ipfs-pinning
/**
 * StorjProvider class for interacting with Storj IPFS API.
 * @constructor
 * @param {IAgentRuntime} runtime - The runtime environment.
 */
 * @property {string} STORJ_API_URL - The base URL for the Storj API.
 * @property {string} STORJ_API_USERNAME - The username for Storj API authentication.
 * @property {string} STORJ_API_PASSWORD - The password for Storj API authentication.
 * @property {string} baseURL - The base URL for Storj API endpoints.
 * @property {AxiosInstance} client - The Axios HTTP client for making API requests.
 * @method createClient - Creates the Axios HTTP client with authentication.
 * @method hash - Helper method to extract the hash from URI or hash string.
 * @method gatewayURL - Generates the gateway URL for accessing IPFS content on Storj.
 * @method pinJson - Pins JSON data to Storj IPFS and returns the gateway URL.
 * @method pinFile - Pins a file to Storj IPFS and returns the gateway URL.
 */
class StorjProvider {
    private STORJ_API_URL: string = "https://www.storj-ipfs.com";
    private STORJ_API_USERNAME: string;
    private STORJ_API_PASSWORD: string;
    private baseURL: string;
    private client: AxiosInstance;

/**
 * Constructor for creating a StorjClient instance.
 * @param {IAgentRuntime} runtime - The runtime object used for retrieving settings.
 */
    constructor(runtime: IAgentRuntime) {
        this.STORJ_API_USERNAME = runtime.getSetting("STORJ_API_USERNAME")!;
        this.STORJ_API_PASSWORD = runtime.getSetting("STORJ_API_PASSWORD")!;
        this.baseURL = `${this.STORJ_API_URL}/api/v0`;
        this.client = this.createClient();
    }

/**
 * Creates a new Axios client instance with the specified base URL and authentication credentials.
 * @returns {AxiosInstance} The newly created Axios client instance.
 */
    private createClient(): AxiosInstance {
        return axios.create({
            baseURL: this.baseURL,
            auth: {
                username: this.STORJ_API_USERNAME,
                password: this.STORJ_API_PASSWORD,
            },
        });
    }

/**
 * Returns the hash portion of a URI if the input starts with "ipfs://". If not, returns the input as is.
 * 
 * @param {string} uriOrHash - The URI or hash to process.
 * @returns {string} The hash portion of the URI if it starts with "ipfs://". Otherwise, returns the input unchanged.
 */
    private hash(uriOrHash: string): string {
        return typeof uriOrHash === "string" && uriOrHash.startsWith("ipfs://")
            ? uriOrHash.split("ipfs://")[1]
            : uriOrHash;
    }

/**
 * Generates a gateway URL for the given URI or hash.
 * 
 * @param {string} uriOrHash - The URI or hash to generate a gateway URL for.
 * @returns {string} - The gateway URL for the given URI or hash.
 */
    public gatewayURL(uriOrHash: string): string {
        return `${this.STORJ_API_URL}/ipfs/${this.hash(uriOrHash)}`;
    }

/**
* Pins a JSON object to IPFS. If the input is not a string, it will be converted to a JSON string.
* @param {any} json - The JSON object to pin to IPFS.
* @returns {Promise<string>} A Promise that resolves to the IPFS gateway URL of the pinned JSON object.
*/
    public async pinJson(json: any): Promise<string> {
        if (typeof json !== "string") {
            json = JSON.stringify(json);
        }
        const formData = new FormData();
        formData.append("path", Buffer.from(json, "utf-8").toString());

        const headers = {
            "Content-Type": "multipart/form-data",
            ...formData.getHeaders(),
        };

        const { data } = await this.client.post(
            "add?cid-version=1",
            formData.getBuffer(),
            { headers }
        );

        return this.gatewayURL(data.Hash);
    }

/**
 * Uploads a file to the server and returns the hash value of the uploaded file.
 * @param {Object} file - The file object containing buffer, originalname, and mimetype properties.
 * @param {Buffer} file.buffer - The file buffer to be uploaded.
 * @param {string} file.originalname - The original name of the file.
 * @param {string} file.mimetype - The MIME type of the file.
 * @returns {Promise<string>} A Promise that resolves to the hash value of the uploaded file.
 */
    public async pinFile(file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }): Promise<string> {
        const formData = new FormData();
        formData.append("file", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const response = await this.client.post("add?cid-version=1", formData, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        return this.gatewayURL(response.data.Hash);
    }
}

export default StorjProvider;
