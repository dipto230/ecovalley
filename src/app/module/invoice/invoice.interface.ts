export interface IInvoiceData {
  invoiceNumber: string;
  generatedAt: Date;

  order: {
    id: string;
    finalPrice: string;
    status: string;
    createdAt: Date;
  };

  customer: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  };

  vendor: {
    name: string;
    email?: string | null;
  };

  product: {
    title: string;
    brand?: string | null;
    model?: string | null;
    condition: string;
    quantity: number;
  };

  payment: {
    amount: string;
    paymentMethod: string;
    transactionId?: string | null;
    status: string;
    paidAt: Date;
  };
}