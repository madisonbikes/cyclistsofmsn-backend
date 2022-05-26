import { injectable, singleton } from "tsyringe";
import LRUCache from "lru-cache";
import Koa, { Middleware } from "koa";
import koaCash from "koa-cash";

const CACHE_SIZE = 20 * 1024 * 1024;

@injectable()
@singleton()
export class MemoryCache {
  private lru = new LRUCache<string, Holder>({
    maxSize: CACHE_SIZE,
    sizeCalculation: (holder: Holder): number => {
      const v = holder.value as { body: { length: number } };
      if (v !== undefined) {
        return v.body.length;
      }
      throw new Error(
        `Unable to calculate size of ${JSON.stringify(holder.value)}`
      );
    },
  });

  /** returns a koa middleware that enables caching downstream */
  middleware(): Middleware {
    const lruCache = this.lru;
    const addCacheHeader = process.env.NODE_ENV == "test";

    return koaCash({
      get(key): Promise<unknown | undefined> {
        const holder = lruCache.get(key);
        if (!holder) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve(holder.value);
      },
      set(key, value): Promise<void> {
        lruCache.set(key, { value });
        return Promise.resolve();
      },
      setCachedHeader: addCacheHeader,
    });
  }

  /**
   * Should be called in next downstream middleware to check if response is cached, if so
   * return immediately.
   * @param ctx
   */
  async isCached(ctx: Koa.Context): Promise<boolean> {
    return await ctx.cashed();
  }

  /**
   * Clears the cache. Useful between test cases.
   */
  clear(): void {
    this.lru.clear();
  }
}

type Holder = {
  value: unknown;
};
