import { Module } from "@nestjs/common";
import { FaqController } from "./faq.controller";

@Module({
  imports: [],
  controllers: [FaqController],
})
export class FaqModule {}
