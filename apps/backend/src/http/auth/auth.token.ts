import { createParamDecorator } from "@nestjs/common";

type JWTPayload = {
  sub: string | number;
};

export const Token = createParamDecorator((key = "", ctx) => {
  const req = ctx.switchToHttp().getRequest();
  const payload: Partial<JWTPayload> = req.user ?? {};
  return key ? payload[key] : payload;
});
