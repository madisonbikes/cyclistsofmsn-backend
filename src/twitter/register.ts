import "reflect-metadata";
import superagent from "superagent";
import { oauth_signer } from "./oauth";
import qs from "querystring";
import buildurl from "build-url";
import readlinesync from "readline-sync";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "../config";

/** expose command-line launcher */
if (require.main === module) {
  /** launches twitter_register. this syntax allows server startup to run as async function */
  Promise.resolve()
    .then(() => {
      const main = container.resolve(TwitterRegisterConfiguration);
      return main.run();
    })
    .catch((error) => {
      console.error(error);
    });
}

type RequestTokenResponse = {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed: boolean;
}

type AccessTokenResponse = {
  oauth_token: string;
  oauth_token_secret: string;
}


@injectable()
export class TwitterRegisterConfiguration {
  constructor(
    private configuration: ServerConfiguration
  ) {

  }

  async run(): Promise<void> {
    if(this.configuration.twitterApiKey === "" || this.configuration.twitterApiSecret === "") {
      throw new Error("Must set TWITTER_API_KEY and TWITTER_API_SECRET in environment (or .env file).")
    }
    const response = await this.requestToken();

    const url = this.getAuthenticateUrl(response.oauth_token);
    const pin = readlinesync.questionInt(`Visit ${url} and key in PIN: `);
    const tokens = await this.requestAccessToken(response.oauth_token, pin.toString());
    console.log("Success! Add this to your .env file:")
    console.log(`TWITTER_ACCESS_TOKEN=${tokens.oauth_token}`);
    console.log(`TWITTER_ACCESS_TOKEN_SECRET=${tokens.oauth_token_secret}`);
  }

  private async requestToken(): Promise<RequestTokenResponse> {
    const result = await superagent
      .post("https://api.twitter.com/oauth/request_token")
      .use(
        oauth_signer(this.configuration.twitterApiKey, this.configuration.twitterApiSecret,
          { oauth_callback: "oob" }
        ));

    return qs.parse(result.text) as unknown as RequestTokenResponse;
  }

  private async requestAccessToken(oauth_token: string, pin: string) {
    const result = await superagent
      .post("https://api.twitter.com/oauth/access_token")
      .use(
        oauth_signer(this.configuration.twitterApiKey, this.configuration.twitterApiSecret,
          { oauth_token: oauth_token, oauth_verifier: pin }
        ));
    return qs.parse(result.text) as unknown as AccessTokenResponse;
  }

  private getAuthenticateUrl(oauth_token: string): string {
    return buildurl("https://api.twitter.com/oauth/authenticate",
      {
        queryParams: { oauth_token: oauth_token }
      }
    );
  }
}