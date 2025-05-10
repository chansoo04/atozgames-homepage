import { Module } from "@nestjs/common";
import { HangameController } from "./hangame.controller";
import { HangamePokerController } from "./hangame-poker.controller";
import { HangameSeotdaController } from "./hangame-seotda.controller";
import { HangamePokerActionController } from "./hangame-poker-action.controller";
import { HangameMoneyStorageController } from "./hangame-money-storage.controller";
import { HangameSeotdaActionController } from "./hangame-seotda-action.controller";
import { HangameSeotdaNewController } from "./hangame-seotda-new.controller";
import { HangameSeotdaNewService } from "./hangame-seotda-new.service";
import { HangamePokerNewController } from "./hangame-poker-new.controller";
import { HangamePokerNewService } from "./hangame-poker-new.service";

@Module({
  imports: [],
  controllers: [
    HangameController,
    HangamePokerController,
    HangameSeotdaController,
    HangamePokerActionController,
    HangameMoneyStorageController,
    HangameSeotdaActionController,
    HangameSeotdaNewController,
    HangamePokerNewController,
  ],
  providers: [HangameSeotdaNewService, HangamePokerNewService],
})
export class HangameModule {}
