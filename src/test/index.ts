import { NowProvider, RandomProvider } from "../utils";
import supertest from "supertest";
import { Server } from "http";

export * from "./assertions";
export * from "./setup";

/** helper type alias for supertest request object */
export type TestRequest = supertest.SuperTest<supertest.Test>

/** helper function to build a supertest test request from a server object */
export function testRequest(server: Server): TestRequest {
  return supertest(server);
}

/** Generates deterministric values that meet the randomInt() contract */
export class NotVeryRandom extends RandomProvider {
  constructor(public specifiedValue: number) {
    super();
  }

  randomInt(min: number, max: number): number {
    let val = this.specifiedValue;
    if (val < min) {
      val = min;
    }
    if (val >= max) {
      val = max - 1;
    }
    return val;
  }
}

/** Time can advance with this now provider */
export class MutableNow extends NowProvider {
  constructor(public when: Date) {
    super();
  }

  now(): Date {
    return this.when;
  }
}

