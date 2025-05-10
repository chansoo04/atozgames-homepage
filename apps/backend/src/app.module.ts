import { ConfigModule } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
  ValidationPipe,
  OnApplicationBootstrap,
} from "@nestjs/common";

// import { dataSourceOptions } from "./dataSource";
// import { BullModule } from "@nestjs/bullmq";

import { SlonikModule } from "nestjs-slonik";
// import { connection } from "./redis-connection";

import { DatabaseModule } from "./database/database.module";
import { UtilityModule } from "./utility/utility.module";
import { HangameModule } from "./http/hangame/hangame.module";
import { AuthModule } from "./http/auth/auth.module";
import { WplModule } from "./http/wpl/wpl.module";
import { CommonModule } from "./http/common/common.module";
import { StatisticsModule } from "./http/statistics/statistics.module";
import { ExternalModule } from "./http/external/external.module";
import { TrackerModule } from "./http/tracker/tracker.module";
import { AutoComputerModule } from "./http/auto-computer/auto-computer.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // BullModule.forRoot({ connection: connection() }),
    SlonikModule.forRoot({
      connectionUri: `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
      verboseRetryLog: true,
      clientConfigurationInput: {
        maximumPoolSize: 100,
      },
    }),
    DatabaseModule,
    UtilityModule,
    HangameModule,
    AuthModule,
    WplModule,
    CommonModule,
    StatisticsModule,
    ExternalModule,
    TrackerModule,
    AutoComputerModule,
  ],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes("*");
  }

  onApplicationBootstrap() {}
}
