import { HttpException } from "@nestjs/common";

export interface IBaseException {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export class BaseException extends HttpException implements IBaseException {
  constructor({ status, message }: { status: number; message: string }) {
    super(message, status);
    this.statusCode = status;
    this.message = message;
  }
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
