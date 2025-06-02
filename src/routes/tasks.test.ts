import {
  loginTestAdminUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../test";
import {
  postSchema,
  postStatusFlagSchema,
  SchedulePostOptions,
} from "./contract";
import { startOfTomorrow } from "date-fns";
import { createTestAdminUser } from "../test/data";
import { describe, it, expect, beforeEach, beforeAll } from "vitest";

describe("server process - tasks", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeAll(async () => {
    await createTestAdminUser();
  });

  beforeEach(() => {
    request = testRequest();
  });

  it("scheduleTask for tomorrow succeeds", async () => {
    await loginTestAdminUser(request);

    const options: SchedulePostOptions = {
      when: startOfTomorrow(),
      selectImage: true,
    };
    const response = await request
      .post("/api/v1/tasks/schedulePost")
      .send(options)
      .expect(200);
    const parsed = postSchema.parse(response.body);
    expect(parsed.status.flag).toEqual(postStatusFlagSchema.Enum.pending);
    expect(parsed.imageid).toBeDefined();
  });
});
