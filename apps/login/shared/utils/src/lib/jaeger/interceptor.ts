/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';
import { Observable, tap, finalize } from 'rxjs';

@Injectable()
export class GrpcTracingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcTracingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    if (context.getType() !== 'rpc') return next.handle();

    // * gRPC 요청 정보 추출
    const path = context.getArgByIndex(2)['path'];
    const pathSplit = path.split('/');
    const [packageName, serviceName] = pathSplit[1].split('.');
    const methodName = pathSplit[2];
    const rpcContext = context.switchToRpc();
    let rpcRequest = rpcContext.getData();

    // * OpenTelemetry Span 생성
    const span: Span = trace
      .getTracer('default')
      .startSpan(`gRPC ${methodName}`, {
        attributes: {
          'rpc.system': 'grpc',
          'rpc.package': packageName,
          'rpc.service': serviceName,
          'rpc.method': methodName,
        },
      });

    // * stream 요청에 대한 처리
    const args = (rpcContext as any)['args'];
    if (args[0] instanceof Observable) {
      const reqObserv = args[0] as Observable<any>;
      reqObserv.subscribe({
        next: data => {
          rpcRequest = data;
        },
      });
    }

    return next.handle().pipe(
      tap({
        next: res => {
          // * 요청 파라미터 추가
          span.setAttribute('rpc.request.body', JSON.stringify(rpcRequest));
          if (res?.success) {
            // * 정상응답
            span.setStatus({ code: SpanStatusCode.OK });
            this.logger.debug(`gRPC ${methodName} success`);
          } else {
            // * 실패응답
            const errorMessage = res?.errorMessage || 'Unknown error';
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: errorMessage,
            });
            this.logger.error(`gRPC ${methodName} failed: ${errorMessage}`);
          }
        },
        error: err => {
          span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
          this.logger.error(`gRPC ${methodName} exception: ${err.message}`);
        },
      }),
      finalize(() => {
        span.end();
      }),
    );
  }
}
