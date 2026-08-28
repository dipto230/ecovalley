import status from "http-status";
import z from "zod"
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
export const handleZodError = (err: z.ZodError): TErrorResponse => {
   const statusCode = status.BAD_REQUEST;
    const message = "Zod Validation Error";
    const errorSource: TErrorSources[]= [];

    err.issues.forEach(issue => {
      errorSource.push({
        path:issue.path.join(" => "),
        message:issue.message
      })
    })
    return {
        success: false,
        message,
        errorSource,
        statusCode,
    }
}