import {
  Connection,
  createConnection,
  Repository,
  EntityTarget,
} from "typeorm";

import { scan } from "./scan";

let savedConnection: Connection | undefined;

export async function databaseConnect(): Promise<Connection> {
  const connection = await createConnection();
  scan(connection);
  savedConnection = connection;
  return connection;
}

export async function getRepository<Entity>(
  target: EntityTarget<Entity>
): Promise<Repository<Entity>> {
  let connection = savedConnection;
  if (!connection) {
    connection = await databaseConnect();
  }
  return connection.getRepository(target);
}
