import {
  createTestAdminUser,
  loginTestAdminUser,
  setupSuite,
  testContainer,
  testRequest,
  TestRequest,
} from "../test";
import { PhotoServer } from "../server";
import {
  postSchema,
  postStatusFlagSchema,
  SchedulePostOptions,
} from "./contract";
import { startOfTomorrow } from "date-fns";

describe("server process - tasks", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = testRequest(await photoServer.create());

    await createTestAdminUser();
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  it("scheduleTask for tomorrow succeeds", async () => {
    await loginTestAdminUser(request);

    const options: SchedulePostOptions = { when: startOfTomorrow() };
    const response = await request
      .post("/api/v1/tasks/schedulePost")
      .send(options)
      .expect(200);
    const parsed = postSchema.parse(response.body);
    expect(parsed.status.flag).toEqual(postStatusFlagSchema.Enum.pending);
  });
});
