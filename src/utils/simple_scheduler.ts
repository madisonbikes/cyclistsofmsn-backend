/** simple schedule api that's easy to replace/mock with DI for testing */
export type ScheduledFunction = (() => Promise<void>) | (() => void)

/** a thing that can be cancelled */
export interface Cancellable {
  cancel(): void;
}

export class SimpleScheduler {
  scheduleOnce(run: ScheduledFunction, delayInMillis: number): Cancellable {
    const cancel = setTimeout(run, delayInMillis);

    return {
      cancel: () => {
        clearTimeout(cancel);
      }
    };
  }

  scheduleRepeat(run: ScheduledFunction, intervalInMillis: number, delayInMillis = 0): Cancellable {
    if (delayInMillis === 0) {
      delayInMillis = intervalInMillis;
    }
    const timeouts = new Array<NodeJS.Timeout | undefined>(2);
    timeouts[0] = setTimeout(async () => {
      timeouts[0] = undefined;
      timeouts[1] = setInterval(run, intervalInMillis);
      await run();
    }, delayInMillis);
    return {
      cancel: () => {
        if (timeouts[0]) {
          clearTimeout(timeouts[0]);
          timeouts[0] = undefined;
        }
        if (timeouts[1]) {
          clearInterval(timeouts[1]);
          timeouts[1] = undefined;
        }
      }
    };
  }
}
