import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { ApiResponse } from "../utils/apiResponse";

interface ParsedRequest {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

export const validate = (schema: ZodType) => {
  return async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as ParsedRequest;
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if(parsed.query !== undefined) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if(parsed.params !== undefined) {
        req.params = parsed.params as Request["params"];
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstMessage = err.issues[0]?.message ?? "Dữ liệu gửi lên không hợp lệ";
        res.status(400).json(new ApiResponse(400, firstMessage, null));
        return;
      }
      next(err);
    }
  };
};