import crypto from "crypto";
import OAuth from "oauth-1.0a";
import { Plugin } from "superagent";

export function oauth_signer(
  apiKey: string,
  apiSecret: string,
  data: Record<string, string>
): Plugin {
  const oauth = new OAuth({
    consumer: { key: apiKey, secret: apiSecret },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
    },
  });
  return (request) => {
    const requestData = {
      url: request.url,
      method: request.method,
      data: data,
    };
    const authorization = oauth.authorize(requestData);
    const header = oauth.toHeader(authorization);
    request.set(header);
  };
}
