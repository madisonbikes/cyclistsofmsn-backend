import { scheduleNextPost } from "./post_scheduler";
import { database } from "./database";
import { Image } from "./database/images.model";
import { schedule } from "./utils/simple_scheduler";

// mock the scheduler to prevent post from being scheduled
jest.mock("./utils/simple_scheduler");

beforeAll(async () => {
  await database.connect();
  const newImage = new Image();
  newImage.filename = "blarg";
  await newImage.save();
});

afterAll(async () => {
  await database.disconnect();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("test schedule component", () => {
  it("test mock of schedule method", () => {
    const fn = () => {}
    schedule(fn, 5);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenLastCalledWith(fn, 5);
  });

  it("should schedule", async () => {
    expect(schedule).toHaveBeenCalledTimes(0);
    await expect(scheduleNextPost()).resolves.toBe(true);
    expect(schedule).toHaveBeenCalledTimes(1);
  });
});