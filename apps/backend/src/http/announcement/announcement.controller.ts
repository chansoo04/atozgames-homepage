import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

@Controller("announcement")
export class AnnouncementController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Get("")
  async getAnnouncements() {
    const result = await this.pool.any(sql`
SELECT * FROM announcement
ORDER BY created_at DESC
`);
    return result;
  }

  @Get(":id")
  async getAnnouncement(@Param("id") id: number) {
    const result = await this.pool.any(sql`
SELECT * FROM announcement
WHERE id = ${id}
`);

    if (result.length === 0) {
      throw new NotFoundException("Not Found");
    }

    return result[0];
  }
}
