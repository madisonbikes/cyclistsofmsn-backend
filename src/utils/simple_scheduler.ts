/** simple schedule api that's easy to mock for testing */
export function schedule(run: (() => Promise<void>) | (() => void), when: number): Cancellable {
  const cancel = setTimeout(run, when);

  return new Cancellable(() => {
    clearTimeout(cancel);
  });
}

export class Cancellable {
  run: () => void;

  constructor(run: () => void) {
    this.run = run;
  }

  cancel(): void {
    this.run();
  }
}