import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["src/entities/*.ts"],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
});
