import { injectable, singleton } from "tsyringe";
import LRUCache from "lru-cache";
import Koa, { Middleware } from "koa";
import koaCash from "koa-cash";
import { ServerConfiguration } from "../config";

type Holder = {
  value: unknown;
}

@injectable()
@singleton()
export class MemoryCache {
  constructor(private configuration: ServerConfiguration) {
  }

  private lru = new LRUCache<string, Holder>({
    max: this.configuration.memoryCacheSize,
    length: function(holder: Holder): number {
      const v = holder.value as { body: { length: number }}
      if(v !== undefined) {
        return v.body.length
      }
      throw new Error(`Unable to calculate size of ${JSON.stringify(holder.value)}`)
    }
  });

  middleware(): Middleware {
    const lruCache = this.lru;
    const addCacheHeader = process.env.NODE_ENV == "test"

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
      setCachedHeader: addCacheHeader
    });
  }

  async isCached(ctx: Koa.Context): Promise<boolean> {
    return await ctx.cashed()
  }

  clear(): void {
    this.lru.reset()
  }
}

