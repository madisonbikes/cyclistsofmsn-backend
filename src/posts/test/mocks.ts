import { injectable } from "tsyringe";
import { PostResult, PostScheduler } from "../scheduler";

@injectable()
export class MockPostScheduler extends PostScheduler {
  scheduledCount = 0;

  scheduleNextPost(): Promise<PostResult> {
    this.scheduledCount++;
    return Promise.reject();
  }
}
