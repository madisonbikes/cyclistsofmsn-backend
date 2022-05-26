/** simple interface that defines lifecycle for components in the system */
export interface Lifecycle {
  start(): Promise<unknown> | unknown;
  stop?(): Promise<unknown> | unknown;
}
