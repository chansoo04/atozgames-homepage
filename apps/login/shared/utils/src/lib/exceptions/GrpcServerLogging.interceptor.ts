/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Observable, tap } from 'rxjs';
import { buildRedactor, RedactField } from './redact';

export class GrpcServerLoggingInterceptor implements NestInterceptor {
  constructor(private readonly redactFields?: string[]) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    if (context.getType() !== 'rpc') return next.handle();

    const className = context.getClass().name || 'GrpcServerLoggingInterceptor';
    const method = context.getHandler().name;

    const rpcContext = context.switchToRpc();
    const userAgent = context.getArgByIndex(1);
    const agent = JSON.parse(JSON.stringify(userAgent))['user-agent'];
    const path = context.getArgByIndex(2)['path'];
    const args = (rpcContext as any)['args'];

    let now = Date.now();
    let req = rpcContext.getData();

    // grpc stream request에 대해 request를 subscribe하여 호출 시간을 측정
    if (args[0] instanceof Observable) {
      const reqObserv = args[0] as Observable<any>;
      reqObserv.subscribe({
        next: data => {
          now = Date.now();
          req = data;
        },
      });
    }

    return next.handle().pipe(
      tap(res => {
        const timestamp = dayjs().tz('UTC').toISOString();
        const spendTime = Date.now() - now;

        const redactFields = this.redactFields
          ? RedactField.GrpcServer.concat(this.redactFields)
          : RedactField.GrpcServer;

        const redact = buildRedactor(redactFields);

        const redactedReq = redact(req);
        // const redactedRes = redact(res);
        const err =
          res.success === false || res.errorMessage || res.error_message
            ? res.errorMessage || res.error_message
            : '';

        Logger.log(
          `[${path}][${dayjs(timestamp).format(
            'YYYY-MM-DD HH:mm:ss',
          )}][${spendTime}ms] : ${JSON.stringify({
            'user-agent': agent,
            req: redactedReq,
            // res: redactedRes,
            err,
          })}`,
          `${className}.${method}`,
        );
      }),
    );
  }
}
