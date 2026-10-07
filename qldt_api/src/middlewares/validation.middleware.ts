import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { ApiResponse } from "../utils/apiResponse";

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      if(parsed.body !== undefined) req.body = parsed.body;
      if(parsed.query !== undefined) req.query = parsed.query;
      if(parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch(e) {
      if(e instanceof ZodError) {
        const firstMessage = e.issues[0]?.message || "Dữ liệu gửi lên không hợp lệ";
        res.status(400).json(new ApiResponse(400, firstMessage, null));
        return;
      }
      next(e);
    }
  }
}