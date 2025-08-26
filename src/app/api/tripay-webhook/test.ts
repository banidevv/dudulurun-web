import crypto from 'crypto';

const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY || '';

function createSignature(payload: string, privateKey: string): string {
  return crypto
    .createHmac('sha256', privateKey)
    .update(payload)
    .digest('hex');
}

async function testWebhook() {
  const payload = {
    reference: 'DEV-T123456789',
    merchant_ref: 'DLR-1234567890',
    payment_method_code: 'BRIVA',
    status: 'PAID',
    paid_at: '2024-03-15 10:00:00',
    amount_received: 250000,
  };

  const payloadString = JSON.stringify(payload);
  const signature = createSignature(payloadString, TRIPAY_PRIVATE_KEY);

  try {
    const response = await fetch('http://localhost:3000/api/tripay-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature,
      },
      body: payloadString,
    });

    const data = await response.json();
    console.log('Response:', {
      status: response.status,
      data,
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Only run if executed directly
if (require.main === module) {
  testWebhook();
} 