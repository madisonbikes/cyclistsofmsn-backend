import { getAuthenticateUrl } from "./register";

describe("registration configuration", () => {
  it("test url", () => {
    // ensure parameters are properly encoded
    expect(getAuthenticateUrl("token%")).toEqual(
      "https://api.twitter.com/oauth/authenticate?oauth_token=token%25"
    );
  });
});
