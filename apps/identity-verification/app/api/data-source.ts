// lib/data-source.ts
import { DataSource } from "typeorm";
export const nGameDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "43.202.227.25",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "dbadmin",
  password: process.env.DB_PASS || "!@#$eoqkr",
  database: process.env.DB_NAME || "devCore",
});
export const initializeDataSource = async () => {
  if (!nGameDataSource.isInitialized) {
    await nGameDataSource.initialize();
    console.log("nGameDataSource initialized");
  }
  return nGameDataSource;
};
