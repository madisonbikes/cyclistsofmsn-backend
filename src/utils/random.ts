import { randomInt as otherRandomInt } from "crypto";

export class RandomProvider {
  /** min (inclusive), max (exclusive) */
  randomInt(min: number, max: number): number {
    return otherRandomInt(min, max);
  }
}