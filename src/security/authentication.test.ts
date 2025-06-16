import { type AuthenticatedUser } from "../routes/contract/index.ts";
import { userHasRole } from "./authentication.ts";
import { describe, it, expect } from "vitest";

describe("authentication", () => {
  it("plain user lacks role", () => {
    const user: AuthenticatedUser = { username: "plain", roles: [] };
    expect(userHasRole(user, "admin")).toBeFalsy();
    expect(userHasRole(user, "editor")).toBeFalsy();
  });

  it("admin user has role", () => {
    const user: AuthenticatedUser = {
      username: "admin",
      roles: ["admin"],
    };
    expect(userHasRole(user, "admin")).toBeTruthy();
    expect(userHasRole(user, "editor")).toBeFalsy();
  });
});
