import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CouponsService } from '../coupons/coupons.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CatalogEventService } from '../../products/events/catalog-event.service';
import { ProductStatus, OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
    private inventoryService: InventoryService,
    private eventService: CatalogEventService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Count orders created today for sequential order number
    const count = await this.prisma.tenant.order.count();
    const seq = (count + 1).toString().padStart(6, '0');

    return `ORD-${dateStr}-${seq}`;
  }

  async processCheckout(dto: CheckoutDto, userId?: string) {
    // 1. Validate Customer / Guest Session
    let customer = null;
    if (dto.customerId) {
      customer = await this.prisma.tenant.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer || customer.isDeleted) {
        throw new NotFoundException(`Customer #${dto.customerId} not found.`);
      }
    } else if (!dto.guestEmail) {
      throw new BadRequestException('Either customerId or guestEmail must be provided for checkout.');
    }

    // 2. Resolve Shipping & Billing Addresses
    let shippingAddress = dto.shippingAddress;
    if (!shippingAddress && dto.shippingAddressId && dto.customerId) {
      const addr = await this.prisma.tenant.customerAddress.findUnique({
        where: { id: dto.shippingAddressId },
      });
      if (addr) {
        shippingAddress = {
          firstName: addr.firstName,
          lastName: addr.lastName,
          address1: addr.address1,
          address2: addr.address2 || undefined,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone || undefined,
        };
      }
    }

    if (!shippingAddress) {
      throw new BadRequestException('Valid Shipping Address is required for checkout.');
    }

    const billingAddress = dto.billingAddress || shippingAddress;

    // 3. Validate Cart
    const cartWhere = dto.customerId
      ? { customerId: dto.customerId }
      : { sessionToken: dto.sessionToken };

    const cart = await this.prisma.tenant.cart.findUnique({
      where: cartWhere as any,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Shopping cart is empty. Cannot process checkout.');
    }

    // 4. Validate Products, Variants & Stock Levels
    const lineItemsData: any[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;

      if (!product || product.isDeleted || !product.isActive || product.status !== ProductStatus.PUBLISHED) {
        throw new BadRequestException(`Product '${product?.title || item.productId}' is not available for purchase.`);
      }

      if (variant && !variant.isActive) {
        throw new BadRequestException(`Variant '${variant.title}' is not active.`);
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (item.quantity > availableStock) {
        throw new BadRequestException(
          `Insufficient stock for '${product.title}' (Requested: ${item.quantity}, Available: ${availableStock}).`,
        );
      }

      const unitPrice = variant
        ? (variant.offerPrice ?? variant.price)
        : (product.offerPrice ?? product.price);

      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      lineItemsData.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        title: product.title + (variant ? ` (${variant.title})` : ''),
        sku: variant ? variant.sku : (product.sku || 'N/A'),
        price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 5. Coupon Discount Calculation
    let discountAmount = 0;
    let couponId = null;

    if (dto.couponCode) {
      const couponRes = await this.couponsService.validateAndCalculateDiscount(
        dto.couponCode,
        subtotal,
      );
      discountAmount = couponRes.discountAmount;
      couponId = couponRes.coupon.id;

      // Update coupon usage count
      await this.prisma.tenant.coupon.update({
        where: { id: couponRes.coupon.id },
        data: { usedCount: couponRes.coupon.usedCount + 1 },
      });

      this.eventService.emit('coupon.applied' as any, {
        code: dto.couponCode,
        discountAmount,
      });
    }

    // 6. Tax Calculation
    let taxAmount = 0;
    if (dto.taxRate && dto.taxRate > 0) {
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      taxAmount = Number(((taxableAmount * dto.taxRate) / 100).toFixed(2));
    }

    const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));

    // 7. Inventory Stock Reservation
    for (const item of cart.items) {
      await this.inventoryService.reserveStock({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      });
    }

    this.eventService.emit('inventory.reserved' as any, {
      cartId: cart.id,
      itemCount: cart.items.length,
    });

    // 8. Generate Order Number & Transactional Order Creation
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.tenant.$transaction(async (tx: any) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer ? customer.id : null,
          guestEmail: dto.guestEmail || (customer ? customer.email : null),
          totalAmount,
          taxAmount,
          discountAmount,
          shippingAmount: 0,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          shippingAddress: shippingAddress as any,
          billingAddress: billingAddress as any,
          notes: dto.notes,
          items: {
            create: lineItemsData.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              taxAmount: 0,
              discountAmount: 0,
            })),
          },
        },
        include: { items: true },
      });

      // Clear Cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    // 9. Write Audit Log
    if (userId || customer?.id) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId: userId || customer?.id || 'GUEST',
            action: 'ORDER_CHECKOUT',
            entity: 'Order',
            entityId: order.id,
            changes: { orderNumber: order.orderNumber, totalAmount: order.totalAmount } as any,
          },
        });
      } catch {}
    }

    // 10. Emit Domain Event
    this.eventService.emit('order.created' as any, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerId: order.customerId,
    });

    return order;
  }
}
