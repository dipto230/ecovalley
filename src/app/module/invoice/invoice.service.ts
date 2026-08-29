import crypto from "crypto";
import PDFDocument from "pdfkit";
import status from "http-status";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";



import { IInvoiceData } from "./invoice.interface";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";


const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `INV-${year}-${randomPart}`;
};


const generateInvoicePdf = (
  data: IInvoiceData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);


    // =========================
    // HEADER
    // =========================

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("INVOICE", {
        align: "right",
      });

    doc.moveDown();

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Invoice Number: ${data.invoiceNumber}`, {
        align: "right",
      })
      .text(
        `Invoice Date: ${data.generatedAt.toLocaleDateString()}`,
        {
          align: "right",
        }
      )
      .text(`Order ID: ${data.order.id}`, {
        align: "right",
      });


    doc.moveDown(2);


    // =========================
    // CUSTOMER / VENDOR
    // =========================

    const currentY = doc.y;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("BILL TO", 50, currentY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(data.customer.name)
      .text(data.customer.email)
      .text(data.customer.phone ?? "")
      .text(data.customer.address ?? "");


    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("SELLER", 320, currentY);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(data.vendor.name, 320)
      .text(data.vendor.email ?? "", 320);


    doc.moveDown(4);


    // =========================
    // PRODUCT TABLE
    // =========================

    const tableTop = doc.y;

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("PRODUCT", 50, tableTop)
      .text("QTY", 300, tableTop)
      .text("PRICE", 360, tableTop)
      .text("TOTAL", 450, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    const productY = tableTop + 25;

    const amount = Number(data.order.finalPrice);

    doc
      .font("Helvetica")
      .text(data.product.title, 50, productY, {
        width: 230,
      })
      .text(String(data.product.quantity), 300, productY)
      .text(`$${amount.toFixed(2)}`, 360, productY)
      .text(`$${amount.toFixed(2)}`, 450, productY);


    // =========================
    // TOTAL
    // =========================

    const totalY = productY + 60;

    doc
      .moveTo(330, totalY)
      .lineTo(545, totalY)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .text("TOTAL", 400, totalY + 15)
      .text(
        `$${amount.toFixed(2)}`,
        450,
        totalY + 15
      );


    // =========================
    // PAYMENT INFORMATION
    // =========================

    const paymentY = totalY + 70;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        "PAYMENT INFORMATION",
        50,
        paymentY
      );

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Payment Method: ${data.payment.paymentMethod}`,
        50
      )
      .text(
        `Payment Status: ${data.payment.status}`,
        50
      )
      .text(
        `Transaction ID: ${
          data.payment.transactionId ?? "N/A"
        }`,
        50
      )
      .text(
        `Paid At: ${data.payment.paidAt.toLocaleString()}`,
        50
      );


    // =========================
    // ORDER INFORMATION
    // =========================

    doc.moveDown(2);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Order Status: ${data.order.status}`)
      .text(
        `Order Date: ${data.order.createdAt.toLocaleString()}`
      );


    // =========================
    // FOOTER
    // =========================

    doc
      .fontSize(10)
      .text(
        "Thank you for your purchase!",
        50,
        750,
        {
          align: "center",
          width: 495,
        }
      );

    doc.end();
  });
};


const generateInvoice = async (
  orderId: string
) => {

  // =====================================
  // 1. CHECK EXISTING INVOICE
  // =====================================

  const existingInvoice =
    await prisma.invoice.findUnique({
      where: {
        orderId,
      },
    });

  if (existingInvoice) {
    return existingInvoice;
  }


  // =====================================
  // 2. GET ORDER DATA
  // =====================================

  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        customer: true,

        vendor: true,

        offer: {
          include: {
            product: true,
          },
        },

        payments: {
          where: {
            status: "PAID",
          },

          orderBy: {
            paidAt: "desc",
          },

          take: 1,
        },
      },
    });


  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      "Order not found"
    );
  }


  // =====================================
  // 3. VERIFY PAYMENT
  // =====================================

  const payment = order.payments[0];

  if (!payment) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invoice cannot be generated before successful payment"
    );
  }


  // =====================================
  // 4. GENERATE INVOICE NUMBER
  // =====================================

  const invoiceNumber =
    generateInvoiceNumber();


  // =====================================
  // 5. PREPARE PDF DATA
  // =====================================

  const invoiceData: IInvoiceData = {
    invoiceNumber,

    generatedAt: new Date(),

    order: {
      id: order.id,
      finalPrice: order.finalPrice.toString(),
      status: order.status,
      createdAt: order.createdAt,
    },

    customer: {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      address: order.customer.address,
    },

    vendor: {
      name: order.vendor.name,
      email: order.vendor.email,
    },

    product: {
      title: order.offer.product.title,
      brand: order.offer.product.brand,
      model: order.offer.product.model,
      condition:
        order.offer.product.condition,
      quantity: order.offer.product.quantity,
    },

    payment: {
      amount: payment.amount.toString(),
      paymentMethod:
        payment.paymentMethod,
      transactionId:
        payment.transactionId,
      status: payment.status,
      paidAt: payment.paidAt,
    },
  };


  // =====================================
  // 6. GENERATE PDF
  // =====================================

  const pdfBuffer =
    await generateInvoicePdf(
      invoiceData
    );


  // =====================================
  // 7. UPLOAD PDF TO CLOUDINARY
  // =====================================

  const uploadResult =
    await uploadFileToCloudinary(
      pdfBuffer,
      `${invoiceNumber}.pdf`
    );


  // =====================================
  // 8. CREATE INVOICE
  // =====================================

  const invoice =
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        pdfUrl:
          uploadResult.secure_url,
      },
    });


  // =====================================
  // 9. SEND EMAIL
  // =====================================

  try {

    await sendEmail({
      to: order.customer.email,

      subject:
        `Invoice ${invoiceNumber} - Your Order`,

      templateName:
        "invoice-email",

      templateData: {
        customerName:
          order.customer.name,

        invoiceNumber,

        orderId:
          order.id,

        amount:
          order.finalPrice.toString(),

        paymentStatus:
          payment.status,

        invoiceUrl:
          uploadResult.secure_url,
      },

      attachments: [
        {
          filename:
            `${invoiceNumber}.pdf`,

          content:
            pdfBuffer,

          contentType:
            "application/pdf",
        },
      ],
    });

  } catch (error) {

    console.error(
      "Invoice email failed:",
      error
    );

    // Invoice already exists.
    // We don't delete it just because email failed.
  }


  return invoice;
};


const getInvoiceByOrder = async (
  orderId: string,
  userId: string
) => {

  const customer =
    await prisma.customer.findUnique({
      where: {
        userId,
      },
    });

  if (!customer) {
    throw new AppError(
      status.NOT_FOUND,
      "Customer profile not found"
    );
  }


  const invoice =
    await prisma.invoice.findUnique({
      where: {
        orderId,
      },

      include: {
        order: {
          include: {
            customer: true,
            vendor: true,
            offer: {
              include: {
                product: true,
              },
            },
            payments: true,
          },
        },
      },
    });


  if (!invoice) {
    throw new AppError(
      status.NOT_FOUND,
      "Invoice not found"
    );
  }


  if (
    invoice.order.customerId !==
    customer.id
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to view this invoice"
    );
  }


  return invoice;
};


export const InvoiceService = {
  generateInvoice,
  getInvoiceByOrder,
};