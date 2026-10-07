import { toVietnamISO } from "./date.util";

export class ApiResponse<T> {
  datetime: string;
  errorCode: string;
  success: boolean;
  message: string;
  data: T | null;

  constructor(errorCode: number, message: string, data: T | null) {
    this.datetime = toVietnamISO();
    this.errorCode = errorCode.toString();
    this.success = errorCode >= 200 && errorCode < 300;
    this.message = message;
    this.data = data;
  }
}