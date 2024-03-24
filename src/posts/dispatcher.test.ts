import { setupSuite } from "../test";
import { createDispatcher } from "./dispatcher";
import { schedulePost } from "./postScheduler";
jest.mock("./postScheduler");
const mockSchedulePost = jest.mocked(schedulePost);

describe("post dispatcher component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts", async () => {
    const dispatcher = createDispatcher();
    dispatcher.start();
    expect(jest.getTimerCount()).toBe(1);

    await jest.advanceTimersByTimeAsync(10000);
    expect(mockSchedulePost).toHaveBeenCalledTimes(1);

    dispatcher.stop();
    expect(jest.getTimerCount()).toBe(0);
  });
});
