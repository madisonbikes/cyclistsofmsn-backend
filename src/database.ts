import {
  Connection,
  createConnection,
  Repository,
  EntityTarget,
} from "typeorm";

import { scan } from "./scan";
import { configuration } from "./config";

class Database {
  connection: Connection | undefined;

  async connect(): Promise<Connection> {
    this.close();

    const connection = await createConnection(
      configuration.database_definition
    );
    await scan(connection);
    this.connection = connection;
    return connection;
  }

  close(): void {
    this.connection?.close();
    this.connection = undefined;
  }

  async getRepository<Entity>(
    target: EntityTarget<Entity>
  ): Promise<Repository<Entity>> {
    const connection = await this.ensureConnected();
    return connection.getRepository(target);
  }

  private async ensureConnected(): Promise<Connection> {
    let connection: Connection;
    if (!this.connection || !this.connection.isConnected) {
      this.connection = undefined;
      connection = await this.connect();
    } else {
      connection = this.connection;
    }
    return connection;
  }
}

export const database = new Database();
