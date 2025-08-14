import { ConfigModule } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
  ValidationPipe,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { SlonikModule } from "nestjs-slonik";

import { DatabaseModule } from "./database/database.module";
import { AnnouncementModule } from "./http/announcement/announcement.module";
import { FaqModule } from "./http/faq/faq.module";

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
    AnnouncementModule,
    FaqModule,
  ],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes("*");
  }

  onApplicationBootstrap() {}
}
