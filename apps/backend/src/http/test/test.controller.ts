import {
  BadRequestException,
  Get,
  Body,
  Controller,
  Post,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

@Controller("test")
export class TestController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Get("")
  async test() {
    const result = await this.pool.any(sql`
SELECT * FROM test;
`);
    return result;
  }
}
