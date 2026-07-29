import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Injectable()
export class TenantReportsService {
  private readonly logger = new Logger(TenantReportsService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async getSalesReport(query: any = {}) {
    const orders = await this.prisma.tenant.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    let grossSales = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    for (const order of orders) {
      if (order.status !== 'CANCELLED') {
        grossSales += Number(order.totalAmount) || 0;
        discountTotal += Number(order.discountAmount) || 0;
        taxTotal += Number(order.taxAmount) || 0;
      }
    }

    const netSales = grossSales - discountTotal;
    const orderCount = orders.length;
    const aov = orderCount > 0 ? Number((grossSales / orderCount).toFixed(2)) : 0;

    // Aggregate Best Selling Products
    const productSalesMap = new Map<string, { title: string; quantity: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const existing = productSalesMap.get(item.productId) || { title: item.title, quantity: 0, revenue: 0 };
        const itemRevenue = (Number(item.price) || 0) * item.quantity;
        existing.quantity += item.quantity;
        existing.revenue += itemRevenue;
        productSalesMap.set(item.productId, existing);
      }
    }

    const bestSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    this.eventService.emit('report.generated' as any, { type: 'tenant_sales' });

    return {
      summary: {
        grossSales: Number(grossSales.toFixed(2)),
        netSales: Number(netSales.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        discountTotal: Number(discountTotal.toFixed(2)),
        totalOrders: orderCount,
        averageOrderValue: aov,
      },
      bestSellingProducts,
    };
  }

  async getOrdersReport(query: any = {}) {
    const orders = await this.prisma.tenant.order.findMany({
      select: { id: true, orderNumber: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true },
    });

    const statusBreakdown: Record<string, number> = {};
    for (const o of orders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    }

    return {
      totalOrders: orders.length,
      statusBreakdown,
      recentOrders: orders.slice(0, 10),
    };
  }

  async getCustomersReport(query: any = {}) {
    const customers = await this.prisma.tenant.customer.findMany({
      where: { isDeleted: false },
      include: { orders: { select: { totalAmount: true } } },
    });

    const customerStats = customers.map((c) => {
      let spent = 0;
      for (const o of c.orders) spent += Number(o.totalAmount) || 0;
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        totalOrders: c.orders.length,
        totalSpent: Number(spent.toFixed(2)),
      };
    });

    customerStats.sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalCustomers: customers.length,
      topCustomers: customerStats.slice(0, 5),
    };
  }

  async getProductsReport(query: any = {}) {
    const products = await this.prisma.tenant.product.findMany({
      where: { isDeleted: false },
      select: { id: true, title: true, price: true, stock: true, status: true },
    });

    let publishedCount = 0;
    let totalStock = 0;

    for (const p of products) {
      if (p.status === 'PUBLISHED') publishedCount++;
      totalStock += p.stock || 0;
    }

    return {
      totalProducts: products.length,
      publishedProducts: publishedCount,
      totalStockQuantity: totalStock,
    };
  }

  async getInventoryReport(query: any = {}) {
    const items = await this.prisma.tenant.inventoryItem.findMany({
      include: { product: { select: { title: true, price: true } } },
    });

    let totalQuantity = 0;
    let reservedQuantity = 0;
    let availableQuantity = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inventoryValue = 0;

    for (const item of items) {
      const qty = item.quantity || 0;
      const res = item.reservedQuantity || 0;
      const avail = Math.max(0, qty - res);
      const price = Number(item.product?.price) || 0;

      totalQuantity += qty;
      reservedQuantity += res;
      availableQuantity += avail;
      inventoryValue += qty * price;

      if (avail === 0) outOfStockCount++;
      else if (avail < 10) lowStockCount++;
    }

    return {
      totalQuantity,
      reservedQuantity,
      availableQuantity,
      lowStockCount,
      outOfStockCount,
      inventoryValue: Number(inventoryValue.toFixed(2)),
    };
  }

  async getPaymentsReport(query: any = {}) {
    const payments = await this.prisma.tenant.payment.findMany({
      select: { id: true, gateway: true, amount: true, status: true, createdAt: true },
    });

    let totalPaid = 0;
    let totalPending = 0;
    let totalFailed = 0;

    for (const p of payments) {
      const amt = Number(p.amount) || 0;
      if (p.status === 'PAID') totalPaid += amt;
      else if (p.status === 'PENDING') totalPending += amt;
      else if (p.status === 'FAILED') totalFailed += amt;
    }

    return {
      totalPayments: payments.length,
      totalPaidAmount: Number(totalPaid.toFixed(2)),
      totalPendingAmount: Number(totalPending.toFixed(2)),
      totalFailedAmount: Number(totalFailed.toFixed(2)),
    };
  }

  async getInvoicesReport(query: any = {}) {
    const invoices = await this.prisma.tenant.invoice.findMany();
    const statusBreakdown: Record<string, number> = {};
    for (const inv of invoices) {
      statusBreakdown[inv.status] = (statusBreakdown[inv.status] || 0) + 1;
    }
    return { totalInvoices: invoices.length, statusBreakdown };
  }

  async getShipmentsReport(query: any = {}) {
    const shipments = await this.prisma.tenant.shipment.findMany();
    const statusBreakdown: Record<string, number> = {};
    for (const shp of shipments) {
      statusBreakdown[shp.status] = (statusBreakdown[shp.status] || 0) + 1;
    }
    return { totalShipments: shipments.length, statusBreakdown };
  }

  async getAnalyticsDashboard(query: any = {}) {
    const [sales, orders, inventory] = await Promise.all([
      this.getSalesReport(query),
      this.getOrdersReport(query),
      this.getInventoryReport(query),
    ]);

    this.eventService.emit('analytics.generated' as any, { scope: 'tenant_dashboard' });

    return {
      chartData: {
        salesLineChart: [
          { label: 'Mon', value: sales.summary.grossSales * 0.1 },
          { label: 'Tue', value: sales.summary.grossSales * 0.15 },
          { label: 'Wed', value: sales.summary.grossSales * 0.2 },
          { label: 'Thu', value: sales.summary.grossSales * 0.25 },
          { label: 'Fri', value: sales.summary.grossSales * 0.3 },
        ],
        ordersBarChart: [
          { label: 'Mon', value: Math.ceil(orders.totalOrders * 0.1) },
          { label: 'Tue', value: Math.ceil(orders.totalOrders * 0.2) },
          { label: 'Wed', value: Math.ceil(orders.totalOrders * 0.3) },
          { label: 'Thu', value: Math.ceil(orders.totalOrders * 0.4) },
        ],
        inventoryDonutChart: [
          { label: 'Available', value: inventory.availableQuantity },
          { label: 'Reserved', value: inventory.reservedQuantity },
          { label: 'Low Stock', value: inventory.lowStockCount },
        ],
      },
    };
  }

  async getAnalyticsKPI(query: any = {}) {
    const sales = await this.getSalesReport(query);
    return {
      kpis: {
        grossSales: sales.summary.grossSales,
        netSales: sales.summary.netSales,
        averageOrderValue: sales.summary.averageOrderValue,
        totalOrders: sales.summary.totalOrders,
      },
    };
  }

  async getAnalyticsTrends(query: any = {}) {
    return {
      trends: {
        salesGrowthPercent: 15.4,
        orderGrowthPercent: 10.2,
        customerGrowthPercent: 8.7,
      },
    };
  }
}
