import { Keyv, KeyvStoreAdapter } from "keyv";
import KeyvValkey from "@keyv/valkey";
import { Lifecycle } from "./lifecycle";
import { configuration } from "../config";
import { logger, maskUriPassword } from "./logger";

/**
 * A class that provides a cache using Keyv with either Valkey (preferred) or in-memory as the storage backend.
 */
class PersistentCache implements Lifecycle {
  private cache: Keyv<string> | undefined;

  /**
   * Initializes the cache with a TTL (time-to-live) of 3600 seconds and in-memory or Valkey storage.
   */
  start() {
    let store: KeyvStoreAdapter | Map<unknown, unknown>;
    if (configuration.valkeyCacheUri !== "") {
      logger.info(
        "Using Valkey cache with URI %s",
        maskUriPassword(configuration.valkeyCacheUri),
      );
      store = new KeyvValkey(configuration.valkeyCacheUri);
    } else {
      logger.warn(
        "No Valkey cache URI provided. Using in-memory cache with no upper bounds.",
      );
      store = new Map();
    }

    this.cache = new Keyv({
      ttl: 3600,
      namespace: "cache",
      store,
    });
  }

  async stop() {
    await this.cache?.disconnect();
    this.cache = undefined;
  }

  /**
   * Stores a value in the cache.
   *
   * @param key - The key under which the value should be stored.
   * @param value - The value to be stored, as a Buffer.
   */
  put = async (key: string, value: Buffer) => {
    await this.cache?.set(key, value.toString("base64"));
  };

  /**
   * Retrieves a value from the cache.
   *
   * @param key - The key of the value to retrieve.
   * @returns A Promise that resolves to the value as a Buffer, or undefined if the key does not exist.
   */
  get = async (key: string): Promise<Buffer | undefined> => {
    const value = await this.cache?.get(key);
    if (value == null) {
      return undefined;
    }
    return Buffer.from(value, "base64");
  };

  /**
   * Clears all entries in the cache.
   */
  clear = async () => {
    await this.cache?.clear();
  };
}

export default new PersistentCache();
