import { Module } from "@nestjs/common";
import { AnnouncementController } from "./announcement.controller";

@Module({
  imports: [],
  controllers: [AnnouncementController],
})
export class AnnouncementModule {}
