import express, { RequestHandler } from "express";
import LRUCache from "lru-cache";
import { injectable, singleton } from "tsyringe";
import { logger } from "../utils";

const CACHE_SIZE = 20 * 1024 * 1024;

type Holder = {
  value: unknown;
  contentType: string | undefined;
  statusCode: number;
};

type MiddlewareOptions = {
  callNextWhenCacheable: boolean;
};

@injectable()
@singleton()
class Cache {
  private memoryCache = new LRUCache<string, Holder>({
    maxSize: CACHE_SIZE,
    sizeCalculation: (holder: Holder): number => {
      const v = holder.value as { length: number };
      if (v === undefined) {
        throw new Error(
          `Unable to calculate size of ${JSON.stringify(holder.value)}`
        );
      }
      return v.length;
    },
  });

  wrapper = (
    fn: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => Promise<express.Response | void>
  ) => {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (await this.isCached(res)) return;
      // eslint-disable-next-line promise/no-callback-in-promise
      return fn(req, res, next).catch(next);
    };
  };

  middleware = (
    options: MiddlewareOptions = { callNextWhenCacheable: false }
  ): RequestHandler => {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const cached = this.memoryCache.get(req.url);
      if (cached !== undefined) {
        if (cached.contentType !== undefined) {
          res.type(cached.contentType);
        }
        res
          .set("x-cached-response", "HIT")
          .status(cached.statusCode)
          .send(cached.value);
        logger.debug({ url: req.url }, "cache hit");
        if (options.callNextWhenCacheable) {
          return next();
        } else {
          return;
        }
      }

      // override the request.send() function to fill the cache
      const downstreamSend = res.send;
      res.send = (body) => {
        const boundSend = downstreamSend.bind(res);
        this.memoryCache.set(req.url, {
          value: body,
          contentType: res.get("content-type"),
          statusCode: res.statusCode,
        });
        boundSend(body);
        return body;
      };
      return next();
    };
  };

  isCached = (res: express.Response): Promise<boolean> => {
    return Promise.resolve(res.get("x-cached-response") === "HIT");
  };

  clear = () => {
    this.memoryCache.clear();
  };
}

export default Cache;
