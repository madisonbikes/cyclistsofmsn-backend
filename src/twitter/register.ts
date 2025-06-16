import superagent from "superagent";
import { oauth_signer } from "./oauth.ts";
import qs from "querystring";
import readlinesync from "readline-sync";
import { configuration } from "../config.ts";

/** launches twitter_register. this syntax allows server startup to run as async function */
Promise.resolve()
  .then(() => {
    const main = new TwitterRegisterConfiguration();
    return main.run();
  })
  .catch((error: unknown) => {
    console.error(error);
  });

interface RequestTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed: boolean;
}

interface AccessTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
}

class TwitterRegisterConfiguration {
  async run(): Promise<void> {
    if (
      configuration.twitterApiKey === "" ||
      configuration.twitterApiSecret === ""
    ) {
      throw new Error(
        "Must set TWITTER_API_KEY and TWITTER_API_SECRET in environment (or .env file).",
      );
    }
    const response = await this.requestToken();

    const url = getAuthenticateUrl(response.oauth_token);
    const pin = readlinesync.questionInt(`Visit ${url} and key in PIN: `);
    const tokens = await this.requestAccessToken(
      response.oauth_token,
      pin.toString(),
    );
    console.log("Success! Add this to your .env file:");
    console.log(`TWITTER_ACCESS_TOKEN=${tokens.oauth_token}`);
    console.log(`TWITTER_ACCESS_TOKEN_SECRET=${tokens.oauth_token_secret}`);
  }

  private async requestToken(): Promise<RequestTokenResponse> {
    const result = await superagent
      .post("https://api.twitter.com/oauth/request_token")
      .use(
        oauth_signer(
          configuration.twitterApiKey,
          configuration.twitterApiSecret,
          { oauth_callback: "oob" },
        ),
      );

    return qs.parse(result.text) as unknown as RequestTokenResponse;
  }

  private async requestAccessToken(oauth_token: string, pin: string) {
    const result = await superagent
      .post("https://api.twitter.com/oauth/access_token")
      .use(
        oauth_signer(
          configuration.twitterApiKey,
          configuration.twitterApiSecret,
          { oauth_token: oauth_token, oauth_verifier: pin },
        ),
      );
    return qs.parse(result.text) as unknown as AccessTokenResponse;
  }
}

// exported for testing
export const getAuthenticateUrl = (oauth_token: string): string => {
  const url = new URL("https://api.twitter.com/oauth/authenticate");
  url.searchParams.append("oauth_token", oauth_token);
  return url.toString();
};
