
import { prisma } from "../../lib/prisma";

const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const getMonthLabel = (date: Date): string =>
  date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

const incrementMonth = (
  counts: Record<string, number>,
  date: Date,
) => {
  const key = getMonthKey(date);
  counts[key] = (counts[key] ?? 0) + 1;
};

const incrementRevenue = (
  revenue: Record<string, number>,
  date: Date,
  amount: number,
) => {
  const key = getMonthKey(date);
  revenue[key] = (revenue[key] ?? 0) + amount;
};

const getCountByStatus = async (
  model: "user" | "vendors" | "product" | "order" | "payment",
  status: string,
): Promise<number> => {
  switch (model) {
    case "user":
      return prisma.user.count({
        where: { status: status as never, isDeleted: false },
      });

    case "vendors":
      return prisma.vendors.count({
        where: { status: status as never, isDeleted: false },
      });

    case "product":
      return prisma.product.count({
        where: { status: status as never },
      });

    case "order":
      return prisma.order.count({
        where: { status: status as never },
      });

    case "payment":
      return prisma.payment.count({
        where: { status },
      });
  }
};

const getStats = async () => {
  const now = new Date();

  // Current month plus the previous 11 months.
  const chartStartDate = new Date(
    now.getFullYear(),
    now.getMonth() - 11,
    1,
  );

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      chartStartDate.getFullYear(),
      chartStartDate.getMonth() + index,
      1,
    );

    return {
      key: getMonthKey(date),
      month: getMonthLabel(date),
    };
  });

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    totalCustomers,
    totalAdmins,
    totalVendors,
    activeVendors,
    pendingVendors,
    inactiveVendors,
    suspendedVendors,
    totalProducts,
    pendingProducts,
    approvedProducts,
    rejectedProducts,
    soldProducts,
    availableProducts,
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    completedOrders,
    cancelledOrders,
    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
    totalCategories,
    totalAIDetections,
    totalPriceEstimations,
    totalMarketComparisons,
    revenueAggregate,
    usersForChart,
    productsForChart,
    ordersForChart,
    detectionsForChart,
    paidPaymentsForChart,
  ] = await Promise.all([
    // Users
    prisma.user.count({ where: { isDeleted: false } }),
    getCountByStatus("user", "ACTIVE"),
    getCountByStatus("user", "BLOCKED"),

    prisma.customer.count({ where: { isDeleted: false } }),
    prisma.user.count({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        isDeleted: false,
      },
    }),

    // Vendors
    prisma.vendors.count({ where: { isDeleted: false } }),
    getCountByStatus("vendors", "ACTIVE"),
    getCountByStatus("vendors", "PENDING"),
    getCountByStatus("vendors", "INACTIVE"),
    getCountByStatus("vendors", "SUSPENDED"),

    // Products
    prisma.product.count(),
    getCountByStatus("product", "PENDING"),
    getCountByStatus("product", "APPROVED"),
    getCountByStatus("product", "REJECTED"),
    getCountByStatus("product", "SOLD"),
    getCountByStatus("product", "AVAILABLE"),

    // Orders
    prisma.order.count(),
    getCountByStatus("order", "PENDING"),
    getCountByStatus("order", "CONFIRMED"),
    getCountByStatus("order", "PROCESSING"),
    getCountByStatus("order", "SHIPPED"),
    getCountByStatus("order", "DELIVERED"),
    getCountByStatus("order", "COMPLETED"),
    getCountByStatus("order", "CANCELLED"),

    // Payments
    prisma.payment.count(),
    getCountByStatus("payment", "PAID"),
    getCountByStatus("payment", "PENDING"),
    getCountByStatus("payment", "FAILED"),

    // Other modules
    prisma.category.count(),
    prisma.aIDetection.count(),
    prisma.priceEstimation.count(),
    prisma.marketComparison.count(),

    // Revenue: count only successfully paid payments.
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),

    // Minimal fields required for monthly charts.
    prisma.user.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: chartStartDate },
      },
      select: { createdAt: true },
    }),

    prisma.product.findMany({
      where: { createdAt: { gte: chartStartDate } },
      select: { createdAt: true },
    }),

    prisma.order.findMany({
      where: { createdAt: { gte: chartStartDate } },
      select: { createdAt: true },
    }),

    prisma.aIDetection.findMany({
      where: { createdAt: { gte: chartStartDate } },
      select: { createdAt: true },
    }),

    prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: chartStartDate },
      },
      select: {
        paidAt: true,
        amount: true,
      },
    }),
  ]);

  // Initialize all months, including months with zero activity.
  const userCounts: Record<string, number> = {};
  const productCounts: Record<string, number> = {};
  const orderCounts: Record<string, number> = {};
  const detectionCounts: Record<string, number> = {};
  const monthlyRevenue: Record<string, number> = {};

  for (const month of months) {
    userCounts[month.key] = 0;
    productCounts[month.key] = 0;
    orderCounts[month.key] = 0;
    detectionCounts[month.key] = 0;
    monthlyRevenue[month.key] = 0;
  }

  usersForChart.forEach((item) =>
    incrementMonth(userCounts, item.createdAt),
  );

  productsForChart.forEach((item) =>
    incrementMonth(productCounts, item.createdAt),
  );

  ordersForChart.forEach((item) =>
    incrementMonth(orderCounts, item.createdAt),
  );

  detectionsForChart.forEach((item) =>
    incrementMonth(detectionCounts, item.createdAt),
  );

  paidPaymentsForChart.forEach((payment) =>
    incrementRevenue(
      monthlyRevenue,
      payment.paidAt,
      Number(payment.amount),
    ),
  );

  return {
    overview: {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalCustomers,
      totalAdmins,
      totalVendors,
      totalProducts,
      totalOrders,
      totalPayments,
      paidPayments,
      totalCategories,
    },

    vendors: {
      total: totalVendors,
      active: activeVendors,
      pending: pendingVendors,
      inactive: inactiveVendors,
      suspended: suspendedVendors,
    },

    products: {
      total: totalProducts,
      pending: pendingProducts,
      approved: approvedProducts,
      rejected: rejectedProducts,
      sold: soldProducts,
      available: availableProducts,
    },

    orders: {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
    },

    payments: {
      total: totalPayments,
      paid: paidPayments,
      pending: pendingPayments,
      failed: failedPayments,
      totalRevenue: Number(revenueAggregate._sum.amount ?? 0),
      currency: "USD",
    },

    ai: {
      totalDetections: totalAIDetections,
      totalPriceEstimations,
      totalMarketComparisons,
    },

    charts: {
      monthly: months.map((month) => ({
        month: month.month,
        users: userCounts[month.key],
        products: productCounts[month.key],
        orders: orderCounts[month.key],
        aiDetections: detectionCounts[month.key],
        revenue: Number(monthlyRevenue[month.key].toFixed(2)),
      })),
    },

    generatedAt: now.toISOString(),
  };
};

export const StatsService = {
  getStats,
};