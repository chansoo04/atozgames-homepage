import { Module } from "@nestjs/common";
import { AdvanceReservationController } from "./advance-reservation.controller";

@Module({
  imports: [],
  controllers: [AdvanceReservationController],
})
export class AdvanceReservationModule {}
