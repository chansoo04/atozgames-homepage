import { Module } from "@nestjs/common";
import { WplController } from "./wpl.controller";

@Module({
  imports: [],
  controllers: [WplController],
})
export class WplModule {}
