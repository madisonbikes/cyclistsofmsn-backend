import { randomInt as otherRandomInt } from "crypto";

export class RandomProvider {
  randomInt(min: number, max: number): number {
    return otherRandomInt(min, max);
  }
}