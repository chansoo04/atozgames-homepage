import { Module } from "@nestjs/common";
import { ExternalController } from "./external.controller";
import { HangameSeotdaNewService } from "../hangame/hangame-seotda-new.service";
import { HangamePokerNewService } from "../hangame/hangame-poker-new.service";

@Module({
  imports: [],
  controllers: [ExternalController],
  providers: [HangameSeotdaNewService, HangamePokerNewService],
})
export class ExternalModule {}
