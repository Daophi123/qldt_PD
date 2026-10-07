export class ApiError extends Error {
  statusCode: string;

  constructor(statusCode: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}