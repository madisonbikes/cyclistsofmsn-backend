import { MutableNow, setupSuite, testContainer } from "./test";
import { PostResult, PostScheduler } from "./post_scheduler";
import { PostExecutor } from "./post_executor";
import { NowProvider, SimpleScheduler } from "./utils";
import { MockSimpleScheduler } from "./test/mock_scheduler";
import { injectable } from "tsyringe";

@injectable()
class MockPostScheduler extends PostScheduler {
  scheduledCount = 0;

  async scheduleNextPost(): Promise<PostResult> {
    this.scheduledCount++;
    return Promise.reject();
  }
}

describe("post executor component", () => {
  setupSuite({ withDatabase: true });

  let now = new MutableNow(5000);
  let mockScheduler = new MockSimpleScheduler(now);

  beforeEach(() => {
    mockScheduler.mockReset();
  });

  it("executor starts", async () => {
    const { executor, postScheduler } = build();
    executor.start();
    now.when += 10000;
    await mockScheduler.mockRunPending();

    expect(postScheduler.scheduledCount).toBe(1);

    executor.stop();
  });


  function build() {
    const childContainer = testContainer().createChildContainer()
      .registerInstance(SimpleScheduler, mockScheduler)
      .registerInstance(NowProvider, now);

    const postScheduler = childContainer.resolve(MockPostScheduler);
    
    childContainer.registerInstance(PostScheduler, postScheduler);
    const postExecutor = childContainer.resolve(PostExecutor);
    return {
      postScheduler: postScheduler,
      executor: postExecutor
    };
  }
});