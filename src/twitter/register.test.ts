import { getAuthenticateUrl } from "./register.ts";
import { describe, it, expect } from "vitest";

describe("registration configuration", () => {
  it("test url", () => {
    // ensure parameters are properly encoded
    expect(getAuthenticateUrl("token%")).toEqual(
      "https://api.twitter.com/oauth/authenticate?oauth_token=token%25",
    );
  });
});
