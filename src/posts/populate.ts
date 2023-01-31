import {
  Cancellable,
  Lifecycle,
  logger,
  NowProvider,
  safeAsyncWrapper,
  SimpleScheduler,
} from "../utils";
import { PostScheduler } from "./scheduler";
import { injectable } from "tsyringe";
import { add as date_add, startOfDay } from "date-fns";

/** future-populate very 6 hours */
const POPULATE_INTERVAL = 6 * 60 * 60 * 1000;
const POPULATE_DELAY = 30 * 1000;

const POPULATE_COUNT = 7;

/**
 * The post populate class schedules posts a week in advance and runs every six hours or so.
 */
@injectable()
export class PostPopulate implements Lifecycle {
  private scheduled: Array<Cancellable | undefined> = [];

  constructor(
    private scheduler: PostScheduler,
    private nowProvider: NowProvider,
    private simpleScheduler: SimpleScheduler
  ) {}

  start(): void {
    this.scheduled.push(
      this.simpleScheduler.scheduleRepeat(
        safeAsyncWrapper("populate", this.asyncPopulate),
        POPULATE_INTERVAL,
        POPULATE_DELAY
      )
    );
  }

  stop(): void {
    this.scheduled.forEach((v, ndx, array) => {
      v?.cancel();
      array[ndx] = undefined;
    });
  }

  asyncPopulate = async () => {
    logger.info(`Populating ${POPULATE_COUNT} days of posts`);
    const now = this.nowProvider.now();
    const start = startOfDay(now);
    for (let i = 0; i < POPULATE_COUNT; i++) {
      const when = date_add(start, { days: i });
      await this.scheduler.schedulePost({
        when,
        selectImage: true,
      });
    }
  };
}
