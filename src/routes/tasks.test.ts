import {
  loginTestAdminUser,
  setupSuite,
  testRequest,
  type TestRequest,
} from "../test/index.js";
import {
  postSchema,
  postStatusFlagSchema,
  type SchedulePostOptions,
} from "./contract/index.js";
import { startOfTomorrow } from "date-fns";
import { createTestAdminUser } from "../test/data.js";

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
