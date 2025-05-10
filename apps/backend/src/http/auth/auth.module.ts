import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    ConfigModule,
    // JwtModule,
    // PassportModule.register({ defaultStrategy: "jwt" }),
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET ?? "chansoo-babo",
    //   signOptions: { expiresIn: "1d" },
    // }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "chansoo-babo",
      signOptions: { expiresIn: "1d" },
    }),

    // PassportModule,
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configs: ConfigService) => ({
    //     secret: configs.get<string>("JWT_SECRET") ?? "chansoo-babo",
    //     signOptions: { expiresIn: "1d" },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
