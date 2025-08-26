import axios from 'axios';

interface OneSenderConfig {
  apiKey: string;
  baseUrl: string;
}

interface WhatsAppMessage {
  to: string;
  message: string;
}

const config: OneSenderConfig = {
  apiKey: process.env.ONESENDER_API_KEY || '',
  baseUrl: process.env.ONESENDER_BASE_URL || 'https://api.onesender.net/api/v1',
};

export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage) {
  try {
    const response = await axios.post(
      `${config.baseUrl}/messages`,
      {
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
} 