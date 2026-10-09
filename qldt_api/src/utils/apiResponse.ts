import { toVietnamISO } from "./date.util";

export class ApiResponse<T> {
  datetime: string;
  errorCode: string;
  success: boolean;
  message: string;
  data: T | null;

  constructor(statusCode: number, message: string, data: T | null) {
    this.datetime = toVietnamISO();
    this.errorCode = statusCode.toString();
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
  }
}