import { MutableNow, setupSuite, testContainer } from "../test";
import { PostScheduler } from "./scheduler";
import { PostPopulate } from "./populate";
import { NowProvider, SimpleScheduler } from "../utils";
import { MockSimpleScheduler } from "../test/mock_scheduler";
import { MockPostScheduler } from "./test/mocks";

describe("post populate component", () => {
  setupSuite({ withDatabase: true });

  const now = new MutableNow(5000);
  const mockScheduler = new MockSimpleScheduler(now);

  afterEach(() => {
    mockScheduler.mockReset();
  });

  it("starts", async () => {
    const { postPopulate, postScheduler } = buildMocks();
    postPopulate.start();
    now.when += 45000;
    await mockScheduler.mockRunPending();

    expect(postScheduler.scheduledCount).toBe(7);

    postPopulate.stop();
  });

  const buildMocks = () => {
    const childContainer = testContainer()
      .createChildContainer()
      .registerInstance(SimpleScheduler, mockScheduler)
      .registerInstance(NowProvider, now);

    const postScheduler = childContainer.resolve(MockPostScheduler);

    childContainer.registerInstance(PostScheduler, postScheduler);
    const postPopulate = childContainer.resolve(PostPopulate);
    return {
      postScheduler,
      postPopulate,
    };
  };
});
