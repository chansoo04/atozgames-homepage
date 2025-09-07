import dayjs from 'dayjs';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';

const appendTimestamp = winston.format((info, opts) => {
  if (opts.tz) {
    info['timestamp'] = dayjs().tz(opts.tz).format();
  } else {
    info['timestamp'] = dayjs().format();
  }
  return info;
});

export const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
  format: winston.format.combine(
    appendTimestamp({ tz: 'Asia/Seoul' }),
    winston.format.json(),
    winston.format.printf(
      info =>
        `${info['timestamp']} - ${info.level} [${process.pid}]: ${info.message}`,
    ),
  ),
});

export const winstonModule = (appName: string) =>
  WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: 'silly',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          nestWinstonModuleUtilities.format.nestLike(appName, {
            appName: true,
            colors: true,
            // prettyPrint: true,
          }),
        ),
      }),
    ],
  });

export function JSON_stringfy(obj: unknown): string {
  return JSON.stringify(obj, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v,
  );
}
