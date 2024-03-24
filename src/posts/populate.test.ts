import { setupSuite } from "../test";
import { postPopulate } from "./populate";
import { postScheduler } from "./postScheduler";

jest.mock("./postScheduler");
const mockPostscheduler = jest.mocked(postScheduler);

describe("post populate component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts", async () => {
    postPopulate.start();
    await jest.advanceTimersByTimeAsync(45000);
    expect(jest.getTimerCount()).toBe(1);

    expect(mockPostscheduler.schedulePost).toHaveBeenCalledTimes(7);
    postPopulate.stop();
    expect(jest.getTimerCount()).toBe(0);
  });
});
