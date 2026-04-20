// Fedapay Service - Mobile money payments (MTN, Moov, etc.)
import { env } from '$env/dynamic/private';

const FEDAPAY_PUBLIC_KEY = env.FEDAPAY_PUBLIC_KEY || '';
const FEDAPAY_SECRET_KEY = env.FEDAPAY_SECRET_KEY || '';
const FEDAPAY_API_URL = env.FEDAPAY_API_URL || 'https://api.fedapay.com';

export interface FedapayPaymentRequest {
  amount: number;
  phone: string;
  country: string;
  userId: string;
  currency?: string;
  description?: string;
  callback_url?: string;
}

export interface FedapayPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  checkout_url: string;
  created_at: string;
}

export interface FedapayTransaction {
  id: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  callback_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FedapayPaymentResult {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string;
  status?: string;
  error?: string;
}

export interface FedapayWebhookPayload {
  transaction_id: string;
  status: string;
  amount: number;
  currency: string;
  reference?: string;
  customer?: {
    phone: string;
    country: string;
  };
}

class FedapayService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = FEDAPAY_API_URL;
    this.apiKey = FEDAPAY_SECRET_KEY;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  private getPublicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Api-Key': FEDAPAY_PUBLIC_KEY,
    };
  }

  /**
   * Create a new payment transaction
   */
  async createPayment(
    amount: number,
    phone: string,
    country: string,
    userId: string,
    currency: string = 'XOF',
    description?: string
  ): Promise<FedapayPaymentResult> {
    try {
      const payload: FedapayPaymentRequest = {
        amount,
        phone,
        country,
        userId,
        currency,
        description: description || `Payment for user ${userId}`,
      };

      const response = await fetch(`${this.apiUrl}/v1/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create payment');
      }

      const data: FedapayPaymentResponse = await response.json();

      return {
        success: true,
        transactionId: data.id,
        checkoutUrl: data.checkout_url,
        status: data.status,
      };
    } catch (error) {
      console.error('Fedapay create payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Verify payment status by transaction ID
   */
  async verifyPayment(transactionId: string): Promise<FedapayPaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to verify payment');
      }

      const data: FedapayTransaction = await response.json();

      return {
        success: true,
        transactionId: data.id,
        status: data.status,
        checkoutUrl: data.callback_url,
      };
    } catch (error) {
      console.error('Fedapay verify payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  /**
   * Get current payment status
   */
  async getPaymentStatus(transactionId: string): Promise<FedapayPaymentResult> {
    return this.verifyPayment(transactionId);
  }

  /**
   * Handle webhook callback for payment confirmation
   */
  async handleWebhook(payload: FedapayWebhookPayload): Promise<{
    success: boolean;
    transactionId: string;
    status: string;
    message: string;
  }> {
    try {
      const { transaction_id, status, amount, currency } = payload;

      console.log('Fedapay webhook received:', {
        transactionId: transaction_id,
        status,
        amount,
        currency,
      });

      const isSuccess = status === 'approved';
      
      return {
        success: isSuccess,
        transactionId: transaction_id,
        status,
        message: isSuccess 
          ? 'Payment confirmed successfully' 
          : `Payment ${status}: ${payload.reference || ''}`,
      };
    } catch (error) {
      console.error('Fedapay webhook handling error:', error);
      return {
        success: false,
        transactionId: payload.transaction_id || '',
        status: 'error',
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    }
  }

  /**
   * List transactions (with optional filters)
   */
  async listTransactions(options?: {
    limit?: number;
    page?: number;
    status?: string;
  }): Promise<{
    success: boolean;
    transactions?: FedapayTransaction[];
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.page) params.append('page', options.page.toString());
      if (options?.status) params.append('status', options.status);

      const response = await fetch(
        `${this.apiUrl}/v1/transactions?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to list transactions');
      }

      const data = await response.json();

      return {
        success: true,
        transactions: data.transactions || [],
      };
    } catch (error) {
      console.error('Fedapay list transactions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list transactions',
      };
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string, amount?: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const payload: Record<string, unknown> = {};
      if (amount) {
        payload.amount = amount;
      }

      const response = await fetch(
        `${this.apiUrl}/v1/transactions/${transactionId}/refund`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to refund transaction');
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.id,
      };
    } catch (error) {
      console.error('Fedapay refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }
}

export const fedapayService = new FedapayService();
export default fedapayService;