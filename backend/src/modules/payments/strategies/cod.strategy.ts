import { Injectable } from '@nestjs/common';
import { IPaymentGateway, PaymentResult } from './payment-gateway.interface';

@Injectable()
export class CashOnDeliveryStrategy implements IPaymentGateway {
  readonly gatewayName = 'COD';

  async authorize(amount: number, orderId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `COD-${orderId.slice(0, 8)}-${Date.now()}`,
      status: 'PENDING',
      message: 'Cash on Delivery payment registered. Pending cash collection upon delivery.',
    };
  }

  async capture(transactionId: string, amount: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'PAID',
      message: 'Cash collected successfully upon delivery.',
    };
  }

  async refund(transactionId: string, amount: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'REFUNDED',
      message: 'COD refund marked as processed.',
    };
  }
}
