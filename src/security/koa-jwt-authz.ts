/**
 * Adapted from https://github.com/lagden/koa-jwt-authz
 */

import Koa, { Context, Middleware } from "koa";

/**
 * JWT Authz middleware.
 *
 * @param {Array} expectedScopes - List of permissions
 * @param {boolean} checkAllScopes   - default is false
 * @param {string} customScopeKey    - default is scope
 * @returns {function}           - next function
 * @api public
 */
export const jwtAuthz = (
  expectedScopes: string[],
  checkAllScopes = false,
  customScopeKey = "scope"
): Middleware => {
  return async (ctx: Context, next: Koa.Next) => {
    if (expectedScopes.length === 0) {
      await next();
      return;
    }

    const { user } = ctx.state;
    if (user === undefined) {
      _error(ctx, expectedScopes, "Missing user data");
      return;
    }

    let userScopes: string[] = [];
    if (typeof user[customScopeKey] === "string") {
      userScopes = user[customScopeKey].split(" ");
    } else if (Array.isArray(user[customScopeKey])) {
      userScopes = user[customScopeKey];
    } else {
      _error(ctx, expectedScopes, "Insufficient scope");
      return;
    }

    let allowed: boolean;
    if (checkAllScopes) {
      allowed = expectedScopes.every((scope) => {
        return userScopes.indexOf(scope) !== -1;
      });
    } else {
      allowed = expectedScopes.some((scope) => {
        return userScopes.indexOf(scope) !== -1;
      });
    }

    if (allowed) {
      await next();
      return;
    }

    _error(ctx, expectedScopes, "User not allowed");
  };
};

/**
 * Helper
 *
 * @param {Object} ctx           - Koa context
 * @param {string[]} expectedScopes - List of permissions
 * @param {string} errorMessage  - Error message
 *
 * @api private
 */
const _error = (
  ctx: Context,
  expectedScopes: string[],
  errorMessage: string
) => {
  ctx.throw(401, "Unauthorized", {
    statusCode: 401,
    error: "Unauthorized",
    message: errorMessage,
    headers: {
      "WWW-Authenticate": `Bearer scope="${expectedScopes.join(
        " "
      )}", error="${errorMessage}"`,
    },
  });
};
