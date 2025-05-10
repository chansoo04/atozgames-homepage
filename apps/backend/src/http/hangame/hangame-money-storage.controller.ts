import common_2, {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Put,
  Delete,
  BadRequestException,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";
import { Token } from "http/auth/auth.token";

@Controller("hangame/money-storage")
export class HangameMoneyStorageController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Post("")
  async postHangameMoneyStorage(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    if (!Array.isArray(body)) {
      throw new BadRequestException("배열 형식의 데이터가 필요합니다");
    }
    if (body.length === 0) {
      throw new BadRequestException("비어있는 데이터입니다");
    }

    // 필수 key 체크
    for (const eachbody of body) {
      const key_of_body = Object.keys(eachbody);
      const required_key = ["computer", "expired_at", "is_init"];
      const required_key_check = required_key.every((item) => key_of_body.includes(item));

      if (!required_key_check) {
        throw new BadRequestException("필수 KEY가 오지 않았습니다");
      }
    }

    await this.pool.transaction(async (t) => {
      for (const eachbody of body) {
        if (eachbody.is_init === true) {
          await t.query(sql`
DELETE FROM hangame_money_storage
WHERE computer = ${eachbody.computer}
AND deleted_at IS NULL
`);
        } else {
          await t.query(sql`
INSERT INTO hangame_money_storage
(computer, expired_at)
VALUES
(${eachbody.computer}, ${eachbody.expired_at})
`);
        }
      }
    });

    //     const result = await this.pool.transaction(async (t) => {
    //       const remove_prev = await t.query(sql`
    // DELETE FROM hangame_money_storage
    // WHERE computer = ${body[0].computer}
    // AND deleted_at IS NULL
    // `);
    //       const insert_new = await t.query(sql`
    // INSERT INTO hangame_money_storage
    // (computer, expired_at)
    // VALUES
    // ${sql.join(
    //   body.map((eachbody: any) => sql`(${eachbody.computer}, ${eachbody.expired_at})`),
    //   sql`,`,
    // )}
    // RETURNING *
    // `);
    //       return insert_new;
    //     });

    return { result: "success" };
  }

  @UseGuards(AuthGuard)
  @Get("")
  async getHangameMoneyStorage() {
    const result = await this.pool.query(sql`
        SELECT * FROM hangame_money_storage
        WHERE deleted_at IS NULL
        AND expired_at >= now()
        ORDER BY expired_at ASC
    `);
    return result.rows;
  }

  @UseGuards(AuthGuard)
  @Put("")
  async putHangameMoneyStorage(
    @Query("id") id: number,
    @Query("computer") computer: string,
    @Query("all") all: string,
    @Token("sub") sub: any,
  ) {
    if (id) {
      const result = await this.pool.query(sql`
          UPDATE hangame_money_storage
          SET deleted_at = now(),
          deleted_by = ${sub}
          WHERE id = ${id}
          RETURNING *
      `);
      return result.rows;
    }

    if (computer) {
      const result = await this.pool.query(sql`
          UPDATE hangame_money_storage
          SET deleted_at = now(),
          deleted_by = ${sub}
          WHERE computer = ${computer}
          AND deleted_at IS NULL
          AND expired_at >= now()
          RETURNING *
      `);
      return result.rows;
    }

    if (all) {
      const result = await this.pool.query(sql`
          UPDATE hangame_money_storage
          SET deleted_at = now(),
          deleted_by = ${sub}
          WHERE deleted_at IS NULL
          AND expired_at >= now()
          RETURNING *
      `);
      return result.rows;
    }

    throw new BadRequestException("조건에 부합하는 결과가 없습니다");
  }
}
