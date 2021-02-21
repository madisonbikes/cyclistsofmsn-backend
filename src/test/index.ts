import { NowProvider, RandomProvider } from "../utils";

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

