import { Connection, createConnection } from "typeorm";

export function databaseConnect(): Promise<Connection> {
  return createConnection();
}
