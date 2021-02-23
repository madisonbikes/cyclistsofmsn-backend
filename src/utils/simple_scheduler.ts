/** simple schedule api that's easy to replace/mock with DI for testing */
export class SimpleScheduler {
  scheduleTimeout(run: (() => Promise<void>) | (() => void), delayInMillis: number): Cancellable {
    const cancel = setTimeout(run, delayInMillis);

    return {
      cancel: () => {
        clearTimeout(cancel);
      }
    };
  }

  scheduleInterval(run: (() => Promise<void>) | (() => void), intervalInMillis: number): Cancellable {
    const cancel = setInterval(run, intervalInMillis);
    return {
      cancel: () => {
        clearInterval(cancel);
      }
    };
  }
}

/** a thing that can be cancelled */
export interface Cancellable {
  cancel(): void
}