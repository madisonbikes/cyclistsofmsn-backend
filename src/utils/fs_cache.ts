import { Keyv } from "keyv";
import { KeyvSqlite } from "@keyv/sqlite";

/**
 * A class that provides a file system cache using Keyv with SQLite as the storage backend.
 */
class FsCache {
  /**
   * Initializes the cache with a TTL (time-to-live) of 3600 seconds and SQLite storage.
   */
  private cache = new Keyv({
    ttl: 3600,
    store: new KeyvSqlite("sqlite://.fs_cache.sqlite"),
  });

  /**
   * Stores a value in the cache.
   *
   * @param key - The key under which the value should be stored.
   * @param value - The value to be stored, as a Buffer.
   */
  put = async (key: string, value: Buffer) => {
    await this.cache.set(key, value.toString("base64"));
  };

  /**
   * Retrieves a value from the cache.
   *
   * @param key - The key of the value to retrieve.
   * @returns A Promise that resolves to the value as a Buffer, or undefined if the key does not exist.
   */
  get = async (key: string): Promise<Buffer | undefined> => {
    const value = (await this.cache.get(key)) as string | undefined;
    if (value == null) {
      return undefined;
    }
    return Buffer.from(value, "base64");
  };

  /**
   * Clears all entries in the cache.
   */
  clear = async () => {
    await this.cache.clear();
  };
}

export default new FsCache();
