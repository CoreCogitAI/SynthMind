import path from "path";
import fs from "fs/promises";
import type {
    CacheOptions,
    ICacheManager,
    IDatabaseCacheAdapter,
    UUID,
} from "./types";

/**
 * Interface for defining a cache adapter that store and retrieve key-value pairs.
 * @interface
 */
       
export interface ICacheAdapter {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}

/**
 * Memory cache adapter implementation that stores key-value pairs in memory using a Map.
 * @implements {ICacheAdapter}
 */
       
export class MemoryCacheAdapter implements ICacheAdapter {
    data: Map<string, string>;

/**
 * Constructor for creating an instance of the class.
 * 
 * @param {Map<string, string>} initalData Optional parameter to initialize the data with a Map object
 */
    constructor(initalData?: Map<string, string>) {
        this.data = initalData ?? new Map<string, string>();
    }

/**
 * Asynchronously retrieves the value associated with the specified key from the data store.
 * @param {string} key - The key to look up in the data store.
 * @returns {Promise<string | undefined>} - A promise that resolves to the value associated with the key, or undefined if the key is not found.
 */
    async get(key: string): Promise<string | undefined> {
        return this.data.get(key);
    }

/**
 * Asynchronously sets a key-value pair in the data map.
 * 
 * @param {string} key - The key to set in the data map.
 * @param {string} value - The value to set for the key in the data map.
 * @returns {Promise<void>} - A Promise that resolves once the key-value pair has been set.
 */
    async set(key: string, value: string): Promise<void> {
        this.data.set(key, value);
    }

/**
 * Asynchronously deletes a key from the data storage.
 * 
 * @param {string} key - The key to be deleted.
 * @returns {Promise<void>} A Promise that resolves when the key is deleted.
 */
    async delete(key: string): Promise<void> {
        this.data.delete(key);
    }
}

/**
 * Cache adapter that uses the filesystem to store data.
export class FsCacheAdapter implements ICacheAdapter {
/**
 * Constructor for creating an instance with the specified data directory.
 * 
 * @param {string} dataDir - The directory path where data will be stored.
 */
    constructor(private dataDir: string) {}

/**
 * Asynchronously reads the contents of a file at the specified key location.
 * @param {string} key - The key representing the file location.
 * @returns {Promise<string | undefined>} A Promise that resolves to the string content of the file, or undefined if an error occurs.
 */
    async get(key: string): Promise<string | undefined> {
        try {
            return await fs.readFile(path.join(this.dataDir, key), "utf8");
        } catch {
            // console.error(error);
            return undefined;
        }
    }

/**
 * Asynchronously sets a key-value pair in the data directory.
 *
 * @param {string} key - The key to set.
 * @param {string} value - The value to set for the key.
 * @returns {Promise<void>} A Promise that resolves once the key-value pair is set.
 */
    async set(key: string, value: string): Promise<void> {
        try {
            const filePath = path.join(this.dataDir, key);
            // Ensure the directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, value, "utf8");
        } catch (error) {
            console.error(error);
        }
    }

/**
 * Asynchronous function to delete a file from the data directory using the provided key.
 * 
 * @param {string} key - The key used to identify the file to delete.
 * @returns {Promise<void>} A Promise that resolves once the file is successfully deleted, or rejects if an error occurs.
 */
    async delete(key: string): Promise<void> {
        try {
            const filePath = path.join(this.dataDir, key);
            await fs.unlink(filePath);
        } catch {
            // console.error(error);
        }
    }
}

/**
 * Represents a database cache adapter implementing the ICacheAdapter interface.
 */
         
export class DbCacheAdapter implements ICacheAdapter {
/**
* Constructor for creating a new instance of some class.
* @param {IDatabaseCacheAdapter} db - The database cache adapter to use.
* @param {UUID} agentId - The UUID of the agent.
*/
    constructor(
        private db: IDatabaseCacheAdapter,
        private agentId: UUID
    ) {}

/**
 * Retrieve the value associated with the specified key from the cache.
 * @param {string} key - The key to locate the value in the cache.
 * @returns {Promise<string | undefined>} The value associated with the key, or undefined if not found.
 */
    async get(key: string): Promise<string | undefined> {
        return this.db.getCache({ agentId: this.agentId, key });
    }

/**
 * Asynchronously sets a key-value pair in the cache.
 * 
 * @param {string} key - The key to set in the cache.
 * @param {string} value - The value to associate with the key in the cache.
 * @returns {Promise<void>} A promise that resolves once the key-value pair is set in the cache.
 */
    async set(key: string, value: string): Promise<void> {
        await this.db.setCache({ agentId: this.agentId, key, value });
    }

/**
 * Deletes a record from the cache based on the provided key.
 * 
 * @param {string} key - The key used to identify the record in the cache.
 * @returns {Promise<void>} - A promise that resolves once the record is deleted.
 */
    async delete(key: string): Promise<void> {
        await this.db.deleteCache({ agentId: this.agentId, key });
    }
}

/**
 * A class representing a Cache Manager.
 *
 * @template CacheAdapter - The type of cache adapter used by the manager.
 */
 */
export class CacheManager<CacheAdapter extends ICacheAdapter = ICacheAdapter>
    implements ICacheManager
{
    adapter: CacheAdapter;

/**
 * Constructor for creating a new instance of the class.
 * @param {CacheAdapter} adapter - The adapter for caching data.
 */
    constructor(adapter: CacheAdapter) {
        this.adapter = adapter;
    }

/**
 * Retrieves the value for a given key from the storage adapter.
 * @template T - The type of the value to retrieve.
 * @param {string} key - The key to retrieve the value for.
 * @returns {Promise<T | undefined>} The retrieved value for the given key, or undefined if the value is not found or has expired.
 */
    async get<T = unknown>(key: string): Promise<T | undefined> {
        const data = await this.adapter.get(key);

        if (data) {
            const { value, expires } = JSON.parse(data) as {
                value: T;
                expires: number;
            };

            if (!expires || expires > Date.now()) {
                return value;
            }

            this.adapter.delete(key).catch(() => {});
        }

        return undefined;
    }

/**
 * Asynchronously saves a value in the cache with the specified key.
 * 
 * @template T - The type of the value to be saved in the cache.
 * @param {string} key - The key under which the value will be saved.
 * @param {T} value - The value to save in the cache.
 * @param {CacheOptions} [opts] - Additional options for caching such as expiration time.
 * @returns {Promise<void>} A Promise that resolves once the value is saved in the cache.
 */
    async set<T>(key: string, value: T, opts?: CacheOptions): Promise<void> {
        return this.adapter.set(
            key,
            JSON.stringify({ value, expires: opts?.expires ?? 0 })
        );
    }

/**
 * Deletes the value associated with the given key.
 * @param {string} key - The key to be deleted.
 * @returns {Promise<void>} - A Promise that resolves once the operation is complete.
 */
    async delete(key: string): Promise<void> {
        return this.adapter.delete(key);
    }
}
