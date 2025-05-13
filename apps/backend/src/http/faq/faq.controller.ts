import { Controller, Get, Param, Query, NotFoundException } from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

@Controller("faq")
export class FaqController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Get("")
  async getFaqs(@Query("category") category?: string) {
    console.log(category, "category");
    if (category) {
      const result = await this.pool.any(sql`
SELECT * FROM faq
WHERE category = ${category}
ORDER BY created_at DESC;
`);
      return result;
    }

    const result = await this.pool.any(sql`
SELECT * FROM faq
ORDER BY created_at DESC
`);
    return result;
  }

  @Get(":id")
  async getFaq(@Param("id") id: string) {
    const result = await this.pool.any(sql`
SELECT * FROM faq
WHERE id=${id}
`);

    if (result.length === 0) {
      throw new NotFoundException("Not Found");
    }

    return result[0];
  }
}
