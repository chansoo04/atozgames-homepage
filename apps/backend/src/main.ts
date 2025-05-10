import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

(async function bootstrap() {
  if (process.env.NODE_ENV === "development") process.setMaxListeners(0);

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transformer (ex. query param의 id가 string으로 넘어오면 number로 자동 변환)
      whitelist: true, // DTO에 정의된 값이 안넘어오면 에러
      forbidNonWhitelisted: true, // DTO에 정의된 값 이외의 값이 넘어오면 에러
      transformOptions: {
        enableImplicitConversion: true,
      },
      enableDebugMessages: true,
    }),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  });

  await app.listen(process.env.PORT || 8080);
})();
