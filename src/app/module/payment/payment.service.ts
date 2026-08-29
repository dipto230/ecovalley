import status from "http-status";
import Stripe from "stripe";

import {
  OrderStatus,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { envVars } from "../../../config/env";

import {
  ICreateCheckoutSession,
} from "./payment.interface";
import { InvoiceService } from "../invoice/invoice.service";




const createCheckoutSession = async (
  userId: string,
  payload: ICreateCheckoutSession
) => {
  const { orderId } = payload;



  const customer = await prisma.customer.findUnique({
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

  if (customer.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Deleted customer cannot make payment"
    );
  }

 

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      offer: {
        include: {
          product: true,
        },
      },

      customer: true,

      vendor: true,

      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      "Order not found"
    );
  }

 

  if (order.customerId !== customer.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to pay for this order"
    );
  }

  

  if (order.status !== OrderStatus.PENDING) {
    throw new AppError(
      status.BAD_REQUEST,
      `Payment cannot be initiated for order with status ${order.status}`
    );
  }

  

  const existingPaidPayment =
    order.payments.find(
      (payment) =>
        payment.status === "PAID"
    );

  if (existingPaidPayment) {
    throw new AppError(
      status.CONFLICT,
      "This order has already been paid"
    );
  }



  const amount = Number(order.finalPrice);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid order amount"
    );
  }

  

  const stripeAmount =
    Math.round(amount * 100);

  

  const session =
    await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: [
        "card",
      ],

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name:
                order.offer.product.title ||
                "Order Payment",
            },

            unit_amount: stripeAmount,
          },

          quantity: 1,
        },
      ],

      customer_email:
        customer.email ?? undefined,

      metadata: {
        orderId: order.id,
        customerId: customer.id,
      },

      success_url:
        `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${envVars.FRONTEND_URL}/payment/cancel?order_id=${order.id}`,
    });

  

  await prisma.payment.create({
    data: {
      orderId: order.id,

      amount: order.finalPrice,

      paymentMethod: "STRIPE",

      transactionId: null,

      status: "PENDING",
    },
  });

  return {
    sessionId: session.id,

    checkoutUrl: session.url,

    orderId: order.id,

    amount,

    currency: "usd",
  };
};




const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string
) => {
  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        envVars.STRIPE_WEBHOOK_SECRET
      );
  } catch (error) {
    console.error(
      "Stripe webhook verification failed:",
      error
    );

    throw new AppError(
      status.BAD_REQUEST,
      "Invalid Stripe webhook signature"
    );
  }

 

  if (
    event.type ===
    "checkout.session.completed"
  ) {
    const session =
      event.data.object as Stripe.Checkout.Session;

    await handleCheckoutCompleted(
      session
    );
  }

  return {
    received: true,
  };
};




const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error(
      "orderId missing from Stripe metadata"
    );

    return;
  }

  if (session.payment_status !== "paid") {
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  
 await prisma.$transaction(
  async (tx) => {
    const payment = await tx.payment.findFirst({
      where: {
        orderId,
        paymentMethod: "STRIPE",
        status: "PENDING",
      },

      orderBy: {
        paidAt: "desc",
      },
    });

    if (!payment) {
      const alreadyPaid =
        await tx.payment.findFirst({
          where: {
            orderId,
            paymentMethod: "STRIPE",
            status: "PAID",
          },
        });

      if (alreadyPaid) {
        return;
      }

      console.error(
        "Pending payment not found",
        {
          orderId,
          sessionId: session.id,
        }
      );

      return;
    }

    await tx.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "PAID",

        transactionId:
          paymentIntentId ?? null,

        paidAt: new Date(),
      },
    });

    const order =
      await tx.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new AppError(
        status.NOT_FOUND,
        "Order not found"
      );
    }

    if (
      order.status === OrderStatus.PENDING
    ) {
      await tx.order.update({
        where: {
          id: orderId,
        },

        data: {
          status: OrderStatus.CONFIRMED,
        },
      });
    }
  },
  {
    maxWait: 10000,
    timeout: 20000,
  }
);

  /*
   * =====================================
   * GENERATE INVOICE
   * =====================================
   *
   * Keep this OUTSIDE the Prisma
   * transaction because it performs:
   *
   * 1. PDF generation
   * 2. Cloudinary upload
   * 3. Database invoice creation
   * 4. Email sending
   */

  try {
    const invoice =
      await InvoiceService.generateInvoice(
        orderId
      );

    console.log(
      `Invoice generated successfully: ${invoice.invoiceNumber}`
    );

  } catch (error) {
    /*
     * Payment is already successful.
     *
     * Don't fail the payment because
     * invoice/email generation failed.
     */

    console.error(
      `Invoice generation failed for order ${orderId}:`,
      error
    );
  }
};




const getPaymentsByOrder = async (
  userId: string,
  orderId: string
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

  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!order) {
    throw new AppError(
      status.NOT_FOUND,
      "Order not found"
    );
  }

  if (
    order.customerId !== customer.id
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to view this payment"
    );
  }

  return prisma.payment.findMany({
    where: {
      orderId,
    },

    orderBy: {
      paidAt: "desc",
    },
  });
};



export const PaymentService = {
  createCheckoutSession,
  handleStripeWebhook,
  getPaymentsByOrder,
};