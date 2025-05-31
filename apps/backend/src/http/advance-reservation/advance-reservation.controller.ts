import {
  Controller,
  Get,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

@Controller("advance-reservation")
export class AdvanceReservationController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Post("")
  async postAdvanceReservation(@Body() body: any) {
    const key_of_body = Object.keys(body);
    const required_key = ["store", "phoneNumber", "age", "privacy", "alarm"];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("사전 예약에 실패했습니다\n필수 KEY가 오지 않았습니다");
    }

    const { store, phoneNumber, age, privacy, alarm } = body;
    console.log(body, "body");

    if (
      !store ||
      store === "" ||
      !phoneNumber ||
      phoneNumber === "" ||
      typeof age !== "boolean" ||
      typeof privacy !== "boolean" ||
      typeof alarm !== "boolean"
    ) {
      throw new BadRequestException("사전 예약에 실패했습니다\n잘못된 body 구성입니다");
    }

    const duplicate = await this.pool.any(sql`
SELECT * FROM advance_reservation WHERE phone_number = ${"010" + phoneNumber}
`);
    if (duplicate.length > 0) {
      throw new BadRequestException("이미 사전등록되어있는 번호입니다");
    }

    const result = await this.pool.query(sql`
INSERT INTO advance_reservation
(store, phone_number, agree_age, agree_privacy, agree_alarm)
VALUES
(${store}, ${"010" + phoneNumber}, ${age}, ${privacy}, ${alarm})
RETURNING id
`);

    return { result: "success" };
  }
}
