import { type AuthenticatedUser } from "../routes/contract/index.js";
import { Roles, userHasRole } from "./authentication.js";
import { describe, it, expect } from "vitest";

describe("authentication", () => {
  it("plain user lacks role", () => {
    const user: AuthenticatedUser = { username: "plain", roles: [] };
    expect(userHasRole(user, Roles.ADMIN)).toBeFalsy();
    expect(userHasRole(user, Roles.EDITOR)).toBeFalsy();
    expect(userHasRole(user, "")).toBeFalsy();
  });

  it("admin user has role", () => {
    const user: AuthenticatedUser = {
      username: "admin",
      roles: ["admin"],
    };
    expect(userHasRole(user, Roles.ADMIN)).toBeTruthy();
    expect(userHasRole(user, Roles.EDITOR)).toBeFalsy();
    expect(userHasRole(user, "")).toBeFalsy();
  });
});
