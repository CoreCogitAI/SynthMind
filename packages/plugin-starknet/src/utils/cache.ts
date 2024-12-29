import NodeCache from "node-cache";
import fs from "fs";
import path from "path";

/**
 * Class representing a Cache object that handles caching data both in-memory and in files.
 * @class
 */
export class Cache {
    private cache: NodeCache;
    public cacheDir: string;

/**
 * Constructor for initializing a CacheManager.
 */
    constructor() {
        this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
        const __dirname = path.resolve();

        // Find the 'eliza' folder in the filepath and adjust the cache directory path
        const elizaIndex = __dirname.indexOf("eliza");
        if (elizaIndex !== -1) {
            const pathToEliza = __dirname.slice(0, elizaIndex + 5); // include 'eliza'
            this.cacheDir = path.join(pathToEliza, "cache");
        } else {
            this.cacheDir = path.join(__dirname, "cache");
        }

        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir);
        }
    }

/**
 * Reads the cache content from a file based on the given cache key.
 * 
 * @template T - Type of the cache data
 * @param {string} cacheKey - The key used to identify the cache
 * @returns {T | null} The cache data if found and not expired, otherwise null
 */
    private readCacheFromFile<T>(cacheKey: string): T | null {
        const filePath = path.join(this.cacheDir, `${cacheKey}.json`);
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, "utf-8");
                const parsed = JSON.parse(fileContent);
                const now = Date.now();
                if (now < parsed.expiry) {
                    return parsed.data as T;
                } else {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error(
                    `Error reading cache file for key ${cacheKey}:`,
                    error
                );
                // Delete corrupted cache file
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error(`Error deleting corrupted cache file:`, e);
                }
            }
        }
        return null;
    }

/**
 * Writes data to a file in the cache directory with the specified cache key.
 *
 * @template T
 * @param {string} cacheKey - The key to identify the cache file.
 * @param {T} data - The data to be written to the cache file.
 * @returns {void}
 */
    private writeCacheToFile<T>(cacheKey: string, data: T): void {
        try {
            const filePath = path.join(this.cacheDir, `${cacheKey}.json`);
            const cacheData = {
                data: data,
                expiry: Date.now() + 300000, // 5 minutes in milliseconds
            };
            fs.writeFileSync(filePath, JSON.stringify(cacheData), "utf-8");
        } catch (error) {
            console.error(
                `Error writing cache file for key ${cacheKey}:`,
                error
            );
        }
    }

/**
 * Get the value from cache with the specified cache key.
 * 
 * @param {string} cacheKey - The key to look up in the cache.
 * @returns {T | undefined} The value stored in the cache corresponding to the cache key,
 * or undefined if no value is found.
 */
    public get<T>(cacheKey: string): T | undefined {
        return this.cache.get<T>(cacheKey);
    }

/**
 * Set a value in the cache.
 * 
 * @param {string} cacheKey - The key for the cache entry.
 * @param {T} data - The data to be stored in the cache.
 * @returns {void}
 */
    public set<T>(cacheKey: string, data: T): void {
        this.cache.set(cacheKey, data);
    }

/**
 * Retrieves cached data from in-memory cache or file-based cache.
 * 
 * @param {string} cacheKey - The key to identify the cached data.
 * @returns {T | null} The cached data if found, null otherwise.
 */
    public getCachedData<T>(cacheKey: string): T | null {
        // Check in-memory cache first
        const cachedData = this.cache.get<T>(cacheKey);
        if (cachedData !== undefined) {
            return cachedData;
        }

        // Check file-based cache
        const fileCachedData = this.readCacheFromFile<T>(cacheKey);
        if (fileCachedData) {
            // Populate in-memory cache
            this.cache.set(cacheKey, fileCachedData);
            return fileCachedData;
        }

        return null;
    }

/**
 * Sets the data in the in-memory cache and writes it to the file-based cache.
 * 
 * @template T The type of data being cached
 * @param {string} cacheKey The key to identify the cached data
 * @param {T} data The data to be stored in the cache
 * @returns {void}
 */
    public setCachedData<T>(cacheKey: string, data: T): void {
        // Set in-memory cache
        this.cache.set(cacheKey, data);

        // Write to file-based cache
        this.writeCacheToFile(cacheKey, data);
    }
}
