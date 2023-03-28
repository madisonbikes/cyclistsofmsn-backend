import { injectable } from "tsyringe";
import { error } from "../../utils";
import { PostResult, PostScheduler } from "../scheduler";

@injectable()
export class MockPostScheduler extends PostScheduler {
  scheduledCount = 0;

  override schedulePost(): Promise<PostResult> {
    this.scheduledCount++;
    return Promise.resolve(error({ message: "mock" }));
  }
}
