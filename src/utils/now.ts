import { singleton } from "tsyringe";

@singleton()
export class Now {
  now(): Date {
    return new Date();
  }
}