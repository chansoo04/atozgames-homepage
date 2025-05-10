import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";

@Module({
  imports: [],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
