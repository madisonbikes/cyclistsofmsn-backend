import { setupSuite } from "../test";
import { error } from "../utils";
import { createPopulate } from "./populate";
import { schedulePost } from "./postScheduler";
import { imageRepositoryScanner } from "../scan";

// mock out the post scheduler
jest.mock("./postScheduler");
const mockSchedulePost = jest.mocked(schedulePost);
mockSchedulePost.mockResolvedValue(error({ message: "mocked" }));

// mock out the image scanner
jest.mock("../scan");
const mockScanner = jest.mocked(imageRepositoryScanner);
mockScanner.scan.mockResolvedValue(undefined);

describe("post populate component", () => {
  setupSuite({ withDatabase: true });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts", async () => {
    const populate = createPopulate();
    populate.start();
    await jest.advanceTimersByTimeAsync(45000);
    expect(jest.getTimerCount()).toBe(1);

    expect(mockSchedulePost).toHaveBeenCalledTimes(7);
    populate.stop();
    expect(jest.getTimerCount()).toBe(0);
  });
});
