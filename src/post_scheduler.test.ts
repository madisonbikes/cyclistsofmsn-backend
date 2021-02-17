import { scheduleNextPost } from "./post_scheduler";
import { database } from "./database";
import { Image } from "./database/images.model";
import { randomInt } from "./utils/random";

jest.mock("./utils/random", () => {
  return {
    randomInt: (min: number, max: number): number => {
      let val = 50;
      if(val < min) {
        val = min;
      }
      if(val >= max) {
        val = max-1;
      }
      return val;
    }
  }
});

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
  it("test mock of randomInt", () => {
    expect(randomInt(5, 60)).toBe(50);
  })

  it("should schedule a post", async () => {
    await expect(scheduleNextPost()).resolves.toBeDefined();
  });
});