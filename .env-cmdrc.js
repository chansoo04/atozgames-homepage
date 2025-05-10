const { config } = require("dotenv");

let envs = {
  development: {},
  production: {},
};

try {
  envs.development = config({ path: "./.env.development.local" }).parsed ?? {};
} catch {
  console.log("경고: ./.env.development.local 파일 없음.");
}

try {
  envs.production = config({ path: "./.env.production.local" }).parsed ?? {};
} catch {
  console.log("경고: ./.env.production.local 파일 없음.");
}

module.exports = envs;
