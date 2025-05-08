import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      logger.warn("Unauthorised Access without user ID");
      next(new Error("Unauthorised Access without user ID"));
    } else {
      req.body.userId = userId;
      next();
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};
