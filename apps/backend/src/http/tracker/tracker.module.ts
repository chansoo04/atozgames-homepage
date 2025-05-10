import { Module } from "@nestjs/common";
import { TrackerController } from "./tracker.controller";

@Module({
  imports: [],
  controllers: [TrackerController],
})
export class TrackerModule {}
