import { DataSource, type DataSourceOptions } from "typeorm";
import { assert } from "@toss/assert";

function isEntityClass(v: any) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString()) && !v?.name.includes("Enum");
}

assert(process.env.PGHOST, "PGHOST is not defined");
assert(process.env.PGPORT, "PGPORT is not defined");
assert(process.env.PGUSER, "PGUSER is not defined");
assert(process.env.PGPASSWORD, "PGPASSWORD is not defined");
assert(process.env.PGDATABASE, "PGDATABASE is not defined");

const isDev = process.env.NODE_ENV === "development";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  migrations: [__dirname + "/migrations/**/*.ts"],
  migrationsTableName: "migrations",
  // logging: isDev,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
