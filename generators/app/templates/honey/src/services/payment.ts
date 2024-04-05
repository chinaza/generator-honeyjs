import { Stripe } from 'stripe';
import { getEnv } from '../config';
import { Http } from '../utils/fetch';

const appleStatusCodes = {
  0: 'The request was successful',

  21000:
    'The request to the App Store didn’t use the HTTP POST request method.',

  21001: 'The App Store no longer sends this status code.',

  21002:
    'The data in the receipt-data property is malformed or the service experienced a temporary issue. Try again.',

  21003: 'The system couldn’t authenticate the receipt.',

  21004:
    'The shared secret you provided doesn’t match the shared secret on file for your account.',

  21005:
    'The receipt server was temporarily unable to provide the receipt. Try again.',

  21006:
    'This receipt is valid, but the subscription is in an expired state. When your server receives this status code, the system also decodes and returns receipt data as part of the response. This status only returns for iOS 6-style transaction receipts for auto-renewable subscriptions.',

  21007:
    'This receipt is from the test environment, but you sent it to the production environment for verification.',

  21008:
    'This receipt is from the production environment, but you sent it to the test environment for verification.',

  21009: 'Internal data access error. Try again later.',

  21010:
    'The system can’t find the user account or the user account has been deleted.'
};

interface AppleReceiptVerificationRes {
  environment: 'Sandbox' | 'Production';
  is_retryable: boolean;
  latest_receipt: string;
  latest_receipt_info: any[];
  pending_renewal_info: any[];
  receipt: {
    in_app: {
      transaction_id: string;
      product_id: 'starter_mind_pack' | 'pro_mind_pack' | 'ultimate_mind_pack';
    }[];
    original_purchase_date_ms: string;
    receipt_creation_date_ms: string;
    receipt_type:
      | 'Production'
      | 'ProductionVPP'
      | 'ProductionSandbox'
      | 'ProductionVPPSandbox';
  };
  status: keyof typeof appleStatusCodes;
}

class Payment {
  public stripe: Stripe;
  private productId = getEnv('STRIPE_PRODUCT');
  private hostUri = getEnv('HOST_URI');
  private webhookSecret = getEnv('STRIPE_WEBHOOK_SK');
  private appleSecret = getEnv('APPLE_SECRET');
  private appleProdHost = getEnv('APPLE_PROD_URI');
  private appleSandboxHost = getEnv('APPLE_SANDBOX_URI');

  constructor() {
    const secretKey = getEnv('STRIPE_SK');
    this.stripe = new Stripe(secretKey, { apiVersion: '2023-08-16' });
  }

  async getPlans() {
    const result = await this.stripe.prices.list({
      product: this.productId,
      active: true
    });
    const plans = result.data
      .map((r) => ({
        id: r.id,
        price: r.metadata['price'],
        title: r.metadata['title'],
        subtitle: r.metadata['subtitle'],
        description: r.metadata['description'],
        appleId: r.metadata['appleId'],
        type: r.metadata['type'] || 'PAYG'
      }))
      .sort(
        (p1, p2) =>
          Number(p2.price.replace('$', '')) - Number(p1.price.replace('$', ''))
      );

    return plans;
  }

  async generatePaymentLink(
    priceId: string,
    transactionId: string,
    email?: string
  ) {
    const price = await this.stripe.prices.retrieve(priceId);
    const session = await this.stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      mode: 'payment',
      client_reference_id: transactionId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: email,
      success_url: `${this.hostUri}/billing/success`,
      cancel_url: `${this.hostUri}`
    });
    return {
      payLink: session.url,
      stripeId: session.id,
      mindTokens: Number(price.metadata['tokens']),
      type: price.metadata['type'] || 'PAYG'
    };
  }

  verifyWebhookEvent(payload: Buffer | string, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
    return event;
  }

  async verifyTransaction(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });
    return {
      priceId: session.line_items?.data[0].price?.id,
      amount: Number(session.amount_subtotal),
      paid: Number(session.amount_total),
      transactionId: session.client_reference_id
    };
  }

  private async constructAppleTxRes(
    transactionId: string,
    productId: 'starter_mind_pack' | 'pro_mind_pack' | 'ultimate_mind_pack',
    apiResponse: any
  ) {
    return {
      transactionId: `apple_${transactionId}`,
      productId,
      apiResponse
    };
  }

  async verifyAppleReceipt(receiptData: string) {
    const prodHttp = new Http(this.appleProdHost);
    const prodResult = await prodHttp.makeRequest<AppleReceiptVerificationRes>(
      '/verifyReceipt',
      'POST',
      { password: this.appleSecret, 'receipt-data': receiptData }
    );

    if (prodResult.status === 0) {
      return this.constructAppleTxRes(
        prodResult.latest_receipt_info[0].transaction_id,
        prodResult.latest_receipt_info[0].product_id,
        prodResult
      );
    }

    if (prodResult.status === 21007) {
      const sandboxHttp = new Http(this.appleSandboxHost);
      const sandboxResult =
        await sandboxHttp.makeRequest<AppleReceiptVerificationRes>(
          '/verifyReceipt',
          'POST',
          { password: this.appleSecret, 'receipt-data': receiptData }
        );
      if (sandboxResult.status === 0)
        return this.constructAppleTxRes(
          sandboxResult.latest_receipt_info[0].transaction_id,
          sandboxResult.latest_receipt_info[0].product_id,
          sandboxResult
        );

      throw new Error(appleStatusCodes[sandboxResult.status]);
    }

    throw new Error(appleStatusCodes[prodResult.status]);
  }
}

const payment = new Payment();

export default payment;
