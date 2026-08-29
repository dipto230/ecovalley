import status from "http-status";
import { Request, Response } from "express";

import { InvoiceService } from "./invoice.service";


const getInvoiceByOrder = async (
  req: Request,
  res: Response
) => {

  const result =
    await InvoiceService.getInvoiceByOrder(
      req.params.orderId as string,
      req.user.userId
    );


  res.status(status.OK).json({

    success: true,

    message:
      "Invoice retrieved successfully",

    data: result,

  });
};


export const InvoiceController = {
  getInvoiceByOrder,
};