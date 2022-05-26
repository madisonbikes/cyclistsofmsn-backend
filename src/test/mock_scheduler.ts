import {
  Cancellable,
  NowProvider,
  ScheduledFunction,
  SimpleScheduler,
} from "../utils";
import { injectable } from "tsyringe";

/** mock scheduler.
 * immediately calls scheduled timeouts one time
 * immediately calls scheduled intervals twice
 */
type Scheduled = {
  nextWhen: number;
  run: ScheduledFunction;
  repeatInterval?: number;
  cancelled?: boolean;
};

@injectable()
export class MockSimpleScheduler extends SimpleScheduler {
  private lastRun: number;

  constructor(private now: NowProvider) {
    super();

    this.lastRun = now.now();
  }

  private scheduled: Scheduled[] = [];

  scheduleOnce(run: ScheduledFunction, delayInMillis: number): Cancellable {
    const newItem: Scheduled = {
      nextWhen: this.now.now() + delayInMillis,
      run: run,
    };
    this.scheduled.push(newItem);
    return {
      cancel: () => {
        newItem.cancelled = true;
      },
    };
  }

  scheduleRepeat(
    run: ScheduledFunction,
    intervalInMillis: number,
    delayInMillis = 0
  ): Cancellable {
    if (delayInMillis == 0) {
      delayInMillis = intervalInMillis;
    }
    const newItem: Scheduled = {
      nextWhen: this.now.now() + delayInMillis,
      run: run,
      repeatInterval: intervalInMillis,
    };
    this.scheduled.push(newItem);
    return {
      cancel: () => {
        newItem.cancelled = true;
      },
    };
  }

  mockReset(): void {
    this.lastRun = this.now.now();
    this.scheduled = [];
  }

  async mockRunPending(): Promise<void> {
    const now = this.now.now();

    const filtered = this.scheduled.filter((item) => {
      return (
        !item.cancelled && item.nextWhen >= this.lastRun && item.nextWhen < now
      );
    });

    for await (const item of filtered) {
      const interval = item.repeatInterval ?? 0;
      if (interval > 0) {
        let current = this.lastRun;
        while (current < now) {
          if (item.nextWhen == current) {
            await item.run();
            item.nextWhen += interval;
          }
          current++;
        }
      } else {
        await item.run();
        item.nextWhen = this.lastRun - 1;
      }
    }
    this.lastRun = now;
  }
}
