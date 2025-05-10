import { Module } from "@nestjs/common";
import { AutoComputerController } from "./auto-computer.controller";

@Module({
  imports: [],
  controllers: [AutoComputerController],
})
export class AutoComputerModule {}
