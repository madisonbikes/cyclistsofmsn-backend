import { logger } from "./logger";

/**
 * Async function is fine for setInterval(), but it should NEVER throw an exception.
 * This must be an arrow function to preserve the calling context.
 */
export const safeAsyncWrapper = (name: string, fn: () => Promise<void>) => {
  // capture calling stack trace
  const stackTrace = Error();
  return async () => {
    try {
      await fn();
    } catch (err) {
      logger.error(err, `safeAsyncWrapper error with tag: ${name}`);
      logger.error(stackTrace, "Source stack trace");
    }
  };
};
