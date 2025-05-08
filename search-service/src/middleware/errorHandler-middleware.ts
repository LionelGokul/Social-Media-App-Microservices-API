import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error!",
  });
};

export default errorHandler;
