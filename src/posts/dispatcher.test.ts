import { MutableNow, setupSuite, testContainer } from "../test";
import { PostScheduler } from "./scheduler";
import { PostDispatcher } from "./dispatcher";
import { NowProvider, SimpleScheduler } from "../utils";
import { MockSimpleScheduler } from "../test/mock_scheduler";
import { MockPostScheduler } from "./test/mocks";

describe("post dispatcher component", () => {
  setupSuite({ withDatabase: true });

  const now = new MutableNow(5000);
  const mockScheduler = new MockSimpleScheduler(now);

  beforeEach(() => {
    mockScheduler.mockReset();
  });

  it("starts", async () => {
    const { postDispatcher, postScheduler } = buildMocks();
    postDispatcher.start();
    now.when += 10000;
    await mockScheduler.mockRunPending();

    expect(postScheduler.scheduledCount).toBe(1);

    postDispatcher.stop();
  });

  const buildMocks = () => {
    const childContainer = testContainer()
      .createChildContainer()
      .registerInstance(SimpleScheduler, mockScheduler)
      .registerInstance(NowProvider, now);

    const postScheduler = childContainer.resolve(MockPostScheduler);

    childContainer.registerInstance(PostScheduler, postScheduler);
    const postDispatcher = childContainer.resolve(PostDispatcher);
    return {
      postScheduler,
      postDispatcher,
    };
  };
});
