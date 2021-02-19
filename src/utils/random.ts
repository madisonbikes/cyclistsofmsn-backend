import { randomInt as otherRandomInt } from "crypto";

export class Random {
  randomInt(min: number, max: number): number {
    return otherRandomInt(min, max);
  }
}