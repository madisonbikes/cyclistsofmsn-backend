import { Connection, createConnection } from "typeorm";

export function doConnect(): Promise<Connection> {
  return createConnection();
}
