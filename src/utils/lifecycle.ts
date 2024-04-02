/** simple interface that defines lifecycle for components in the system */
export interface Lifecycle {
  start(): unknown;
  stop?(): unknown;
}
