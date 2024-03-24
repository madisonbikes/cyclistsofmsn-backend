import { Lifecycle, logger, safeAsyncWrapper } from "../utils";
import now from "../utils/now";
import { add as date_add, startOfDay } from "date-fns";
import { Cancellable, scheduleRepeat } from "../utils/simple_scheduler";
import { schedulePost } from "./postScheduler";

/** future-populate very 6 hours */
const POPULATE_INTERVAL = 6 * 60 * 60 * 1000;
const POPULATE_DELAY = 30 * 1000;

const POPULATE_COUNT = 7;

/**
 * The post populate class schedules posts a week in advance and runs every six hours or so.
 */
class PostPopulate implements Lifecycle {
  private scheduled: Array<Cancellable | undefined> = [];

  start(): void {
    this.scheduled.push(
      scheduleRepeat(
        safeAsyncWrapper("populate", this.asyncPopulate),
        POPULATE_INTERVAL,
        POPULATE_DELAY,
      ),
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
    const start = startOfDay(now());
    for (let i = 0; i < POPULATE_COUNT; i++) {
      const when = date_add(start, { days: i });
      await schedulePost({
        when,
        selectImage: true,
      });
    }
  };
}

export const createPopulate = () => {
  return new PostPopulate();
};
