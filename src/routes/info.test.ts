import { setupSuite, testRequest, type TestRequest } from "../test";
import { type GetInfo } from "./contract";
import { describe, it, expect, beforeEach } from "vitest";

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
