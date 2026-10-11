
import { NextFunction, Request, Response } from "express";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../shared/sendResponse";

const getStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await StatsService.getStats();

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const StatsController = {
  getStats,
};