import { logger } from "./logger";

/** async function is fine for setInterval(), but it should NEVER throw an exception */
export const safeAsyncWrapper = (name: string, fn: () => Promise<void>) => {
  return async () => {
    try {
      await fn();
    } catch (err) {
      logger.error(err, `Error ${name}`);
    }
  };
};
