import { logger } from "./logger";

/** async function is fine for setInterval(), but it should NEVER throw an exception */
export function safeAsyncWrapper(name: string, fn: () => Promise<void>) {
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
}
