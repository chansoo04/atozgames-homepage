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
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  COOKIE_OPTIONS: CookieOptions;

  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    private readonly configs: ConfigService,
    private readonly internalAdminService: AuthService,
    private readonly jwt: JwtService,
  ) {
    this.COOKIE_OPTIONS = {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      domain: this.configs.getOrThrow<string>("DOMAIN"),
    };
  }

  @Post("admin/signup")
  async adminSignup(@Body() body: { username: string; password: string; passwordCheck: string }) {
    const { username, password, passwordCheck } = body;
    if (password !== passwordCheck) throw new BadRequestException("비밀번호가 일치하지 않습니다.");

    // adminUser 지원 여부 확인
    const adminUser = await this.pool.maybeOne(sql`
        SELECT * FROM admin_apply WHERE username = ${username}
    `);

    if (adminUser) {
      throw new BadRequestException("이미 사용 신청을 완료한 ID입니다");
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return await this.pool.query(sql`
        INSERT INTO admin_apply
        (username, password, salt)
        VALUES
        (${username}, ${hash}, ${salt}) 
    `);
  }

  @HttpCode(HttpStatus.OK)
  @Post("admin/login")
  async adminLogin(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.internalAdminService.validate(body.username, body.password);
    if (!user) throw new BadRequestException("로그인에 실패했습니다.");

    const { accessToken } = await this.internalAdminService.generateTokens(user);
    res.cookie("adminAccessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      domain: this.configs.getOrThrow<string>("DOMAIN"),
      secure: true,
      path: "/",
      sameSite: "none",
    });
    return { id: user.username };
  }

  @UseGuards(AuthGuard)
  @Get("admin/logout")
  async adminLogout(@Res({ passthrough: true }) res: Response) {
    res.cookie("adminAccessToken", "", {
      expires: new Date(0),
      maxAge: 0,
      secure: true,
      domain: this.configs.getOrThrow<string>("DOMAIN"),
      path: "/",
      sameSite: "none",
    });
    return { result: "success" };
  }

  @UseGuards(AuthGuard)
  @Get("/user")
  async getUser() {
    return true;
  }
}
