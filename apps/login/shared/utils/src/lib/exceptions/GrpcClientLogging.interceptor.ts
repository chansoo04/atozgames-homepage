import {
  InterceptingCall,
  InterceptorOptions,
  Listener,
  NextCall,
  Requester,
} from '@grpc/grpc-js';
import { Logger } from '@nestjs/common';
import { buildRedactor, RedactField } from './redact';

export function GrpcClientLoggingInterceptor(
  /** Logger name */ name: string = 'GrpcLoggingInterceptor',
  /** Redacted fields */ redactedFields: string[] = [],
) {
  return {
    interceptors: [
      (options: InterceptorOptions, nextCall: NextCall) => {
        const logger: Logger = new Logger('GrpcClientLoggingInterceptor');

        const path: string = options.method_definition.path;

        logger.verbose(
          '-------------------------------------- GRPC CALL ----------------------------------',
        );

        const interceptingCall = new InterceptingCall(
          nextCall(options),
          grpcLoggingInterceptor(name, path, redactedFields),
        );

        return interceptingCall;
      },
    ],
  };
}

const grpcLoggingInterceptor = (
  name: string,
  path: string,
  RedactedFields?: string[],
): Requester => {
  const logger: Logger = new Logger(name);

  const redectFields = RedactedFields
    ? RedactField.GrpcClient.concat(RedactedFields)
    : RedactField.GrpcClient;

  const redact = buildRedactor(redectFields);

  return {
    start(metadata, _listener, next) {
      const newListener: Listener = {
        onReceiveMetadata(metadata, next) {
          logger.verbose(
            `response metadata : ${JSON.stringify(redact(metadata))}`,
          );
          next(metadata);
        },
        onReceiveMessage(message, next) {
          logger.verbose(`response body : ${JSON.stringify(redact(message))}`);
          next(message);
        },
        onReceiveStatus(status, next) {
          logger.verbose(`response status : ${JSON.stringify(redact(status))}`);
          next(status);
        },
      };
      next(metadata, newListener);
    },

    sendMessage(message, next) {
      logger.verbose(`path: ${JSON.stringify(path)}`);
      logger.verbose(`request body : ${JSON.stringify(redact(message))}`);
      next(message);
    },
  };
};
