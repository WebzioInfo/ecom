import { Injectable } from '@nestjs/common';
import { IPaymentGateway, PaymentResult } from './payment-gateway.interface';

@Injectable()
export class ManualPaymentStrategy implements IPaymentGateway {
  readonly gatewayName = 'MANUAL';

  async authorize(amount: number, orderId: string, details?: any): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: details?.transactionId || `MAN-${orderId.slice(0, 8)}-${Date.now()}`,
      status: 'AUTHORIZED',
      message: 'Manual bank transfer / check payment authorized pending verification.',
    };
  }

  async capture(transactionId: string, amount: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'PAID',
      message: 'Manual payment verified and marked as PAID.',
    };
  }

  async refund(transactionId: string, amount: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'REFUNDED',
      message: 'Manual refund issued.',
    };
  }
}
