import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectPool() private readonly pool: DatabasePool,
  ) {}

  async validate(username: string, password: string) {
    const user = await this.pool.maybeOne(sql<{ username: string; password: string; salt: string }>`
        SELECT * FROM admin_user WHERE username = ${username}
    `);
    if (!user) throw new BadRequestException("올바르지 않은 관리자 정보입니다");

    const hash = await bcrypt.hash(password, user.salt);
    if (hash !== user.password) throw new BadRequestException("올바르지 않은 관리자 정보입니다");
    return user;
  }

  async generateTokens(user: any) {
    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  generateAccessToken(user: { username: string }): string {
    const payload = { sub: user.username };
    return this.jwt.sign(payload, { expiresIn: "1d" });
  }

  async validateToken(adminAccessToken: string) {
    try {
      const token = this.jwt.verify(adminAccessToken, {
        secret: process.env.JWT_SECRET ?? "chansoo-babo",
      });
      return token;
    } catch (err) {
      throw new BadRequestException("로그인 필요");
    }
  }
}
