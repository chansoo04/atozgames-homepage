import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import pg from "pg";

// pg 타입 파서 설정 (필요한 경우)
const types = pg.types;
types.setTypeParser(types.builtins.INT8, (val) => Number(val));
types.setTypeParser(types.builtins.BIT, (val) => val.split("").map((v) => v === "1"));

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "PG_POOL",
      useFactory: (configService: ConfigService) => {
        return new pg.Pool({
          connectionString: `postgres://${configService.get("PGUSER")}:${configService.get(
            "PGPASSWORD",
          )}@${configService.get("PGHOST")}:${configService.get("PGPORT")}/${configService.get("PGDATABASE")}`,
          // 필요한 경우 추가 옵션 설정 가능 (예: 최대 커넥션 수 등)
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ["PG_POOL"],
})
export class DatabaseModule {}
