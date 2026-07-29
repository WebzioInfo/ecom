export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';
  rawDetails?: any;
  message?: string;
}

export interface IPaymentGateway {
  readonly gatewayName: string;
  authorize(amount: number, orderId: string, details?: any): Promise<PaymentResult>;
  capture(transactionId: string, amount: number): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<PaymentResult>;
}
