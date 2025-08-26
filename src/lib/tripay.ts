import axios from 'axios';
import crypto from 'crypto';

interface TripayConfig {
  apiKey: string;
  privateKey: string;
  merchantCode: string;
  baseUrl: string;
  sandbox: boolean;
}

interface FamilyPackage {
  parentPackageType: 'parentFull' | 'parentBibOnly';
  childPackageType: 'childFull' | 'childBibOnly';
  parentCount: number;
  childCount: number;
  parentShirtSizes?: string;
  childShirtSizes?: string;
}

type FunPackageType = 'community' | 'general';
type KidsPackageType = 'new' | 'po';
type NonFamilyPackageType = FunPackageType | KidsPackageType;

interface PaymentRequest {
  name: string;
  email: string;
  phone: string;
  amount: number;
  category: 'fun' | 'family';
  packageType?: NonFamilyPackageType;
  shirtSize?: string;
  method: string;
  familyPackage?: FamilyPackage;
}

interface PaymentMethod {
  code: string;
  name: string;
  fee_merchant: {
    flat: number;
    percent: number;
  };
  fee_customer: {
    flat: number;
    percent: number;
  };
  total_fee: {
    flat: number;
    percent: number;
  };
  minimum_amount: number;
  maximum_amount: number;
  icon_url: string;
  active: boolean;
}

const config: TripayConfig = {
  apiKey: process.env.TRIPAY_API_KEY || '',
  privateKey: process.env.TRIPAY_PRIVATE_KEY || '',
  merchantCode: process.env.TRIPAY_MERCHANT_CODE || '',
  baseUrl: process.env.TRIPAY_SANDBOX === 'true'
    ? 'https://tripay.co.id/api-sandbox'
    : 'https://tripay.co.id/api',
  sandbox: process.env.TRIPAY_SANDBOX === 'true',
};

const isEarlyBirdPeriod = () => {
  const now = new Date();
  const earlyBirdStart = new Date('2025-06-15');
  const earlyBirdEnd = new Date('2025-07-20');
  return now >= earlyBirdStart && now <= earlyBirdEnd;
};

const categoryPrices = {
  earlyBird: {
    fun: {
      community: 195000,
      general: 225000,
    },
    family: {
      parentFull: 315000,    // Family Run 2.5K
      parentBibOnly: 315000,  // Family Run 2.5K (same price)
      childFull: 0,     // Included in family package
      childBibOnly: 0,   // Included in family package
    },
    kids: {
      new: 50000,  // Baru
      po: 25000,   // PO (Untuk yang sudah daftar Family Run)
    }
  },
  normal: {
    fun: {
      community: 195000,
      general: 225000,
    },
    family: {
      parentFull: 315000,    // Family Run 2.5K
      parentBibOnly: 315000,  // Family Run 2.5K (same price)
      childFull: 0,     // Included in family package
      childBibOnly: 0,   // Included in family package
    },
    kids: {
      new: 30000,  // Baru
      po: 30000,   // PO (Untuk yang sudah daftar Family Run)
    }
  }
};

function calculateAmount(data: PaymentRequest): number {
  const pricing = isEarlyBirdPeriod() ? categoryPrices.earlyBird : categoryPrices.normal;

  if (data.category === 'family') {
    // Family Run 2.5K has fixed price of 315,000 regardless of count
    return pricing.family.parentFull;
  } else if (data.packageType) {
    switch (data.category) {
      case 'fun':
        return pricing.fun[data.packageType as FunPackageType];
      default:
        throw new Error('Invalid category or package type');
    }
  }

  throw new Error('Invalid category or package type');
}

function generateSignature(merchantRef: string, amount: number): string {
  const hmac = crypto.createHmac('sha256', config.privateKey);
  const signatureString = config.merchantCode + merchantRef + amount;
  return hmac.update(signatureString).digest('hex');
}

export async function getPaymentMethods(amount: number): Promise<PaymentMethod[]> {
  try {
    const response = await axios.get(
      `${config.baseUrl}/merchant/payment-channel`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    if (!response.data?.data) {
      throw new Error('Failed to fetch payment methods');
    }

    // Filter active payment methods and those that support the amount
    return response.data.data.filter((method: PaymentMethod) =>
      method.active &&
      amount >= method.minimum_amount &&
      amount <= method.maximum_amount
    );
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}

export async function createPaymentRequest(data: PaymentRequest) {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.category || !data.method) {
      throw new Error('Missing required fields');
    }

    // Generate merchant reference
    const merchantRef = `DLR-${Date.now()}`;
    const amount = calculateAmount(data);

    // Generate signature
    const signature = generateSignature(merchantRef, amount);

    let itemName = `DuduluRun 2025 - ${data.category === 'fun' ? 'Fun Run 5K' : 'Family Run 2.5K'}`;
    if (data.category === 'fun') {
      itemName += ` - ${data.packageType === 'general' ? 'Umum' : 'Community'}`;
    }

    const orderItems = [{
      name: itemName,
      price: amount,
      quantity: 1,
      subtotal: amount,
      product_url: `${process.env.NEXT_PUBLIC_BASE_URL}/register`,
      image_url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.png`
    }];

    const payload = {
      method: data.method,
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      order_items: orderItems,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/registration-status`,
      signature: signature
    };

    console.log('Sending payment request with payload:', payload);

    const response = await axios.post(
      `${config.baseUrl}/transaction/create`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    console.log('Payment response:', response.data);
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating Tripay payment:', error.message);
    } else if (axios.isAxiosError(error) && error.response?.data) {
      console.error('Error creating Tripay payment:', error.response.data);
    } else {
      console.error('Error creating Tripay payment:', error);
    }
    throw error;
  }
}

export async function getPaymentStatus(reference: string) {
  try {
    const response = await axios.get(
      `${config.baseUrl}/transaction/detail`,
      {
        params: {
          reference: reference,
        },
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
} 