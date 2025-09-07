/* eslint-disable  @typescript-eslint/no-explicit-any */
import { lastValueFrom, Observable } from 'rxjs';

// TODO [info] Add more fields to redact
const commomRedactedFields: string[] = [];

const grpcClientRedactedFields: string[] = [];

const grpcServerRedactedFields: string[] = ['firebaseToken'];

export const RedactField = {
  Common: commomRedactedFields,
  GrpcServer: [...commomRedactedFields, ...grpcServerRedactedFields],
  GrpcClient: [...commomRedactedFields, ...grpcClientRedactedFields],
};

export function buildRedactor(fields: string[] = commomRedactedFields) {
  return function redact(data: unknown) {
    if (!data) {
      return '';
    }

    const redactFields = (obj: any): any => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (fields.includes(key)) {
            obj[key] = '[Redacted]';
          } else if (typeof obj[key] === 'object') {
            redactFields(obj[key]);
          }
        }
      }
      return obj;
    };

    return data instanceof Observable
      ? lastValueFrom(data).then(value => redactFields(value))
      : redactFields(data);
  };
}
