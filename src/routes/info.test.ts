import { setupSuite, testRequest, TestRequest } from "../test";
import { GetInfo } from "./contract";

describe("info route", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeEach(() => {
    request = testRequest();
  });

  it("responds to info api with proper version", () => {
    return request
      .get("/api/v1/info")
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ version: "dev" } satisfies GetInfo);
      });
  });
});
