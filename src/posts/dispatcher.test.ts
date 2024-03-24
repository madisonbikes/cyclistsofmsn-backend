import { setupSuite } from "../test";
import { postDispatcher } from "./dispatcher";
import { postScheduler } from "./postScheduler";
jest.mock("./postScheduler");
const mockPostscheduler = jest.mocked(postScheduler);

describe("post dispatcher component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts", async () => {
    postDispatcher.start();
    expect(jest.getTimerCount()).toBe(1);

    await jest.advanceTimersByTimeAsync(10000);
    expect(mockPostscheduler.schedulePost).toHaveBeenCalledTimes(1);

    postDispatcher.stop();
    expect(jest.getTimerCount()).toBe(0);
  });
});
