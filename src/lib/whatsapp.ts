import * as whatsapp from 'wa-multi-session';
import { getPrismaClient } from '@/lib/prisma';

interface WhatsAppMessage {
  to: string;
  message: string;
  sessionName?: string; // Optional session name, will use default if not provided
}

interface WhatsAppSession {
  id: number;
  name: string;
  sessionId: string; // wa-multi-session session ID
  phoneNumber: string;
  isActive: boolean;
  isDefault: boolean;
  description?: string | null;
}

// Initialize wa-multi-session on module load
let isInitialized = false;
let qrCodeStore: Map<string, string> = new Map(); // Store QR codes for sessions
let connectionStatusStore: Map<string, boolean> = new Map(); // Store connection status

async function initializeWaMultiSession() {
  if (isInitialized) return;

  try {
    // Set custom credentials directory for session storage
    whatsapp.setCredentialsDir('wa_sessions');

    // Load existing sessions from storage
    whatsapp.loadSessionsFromStorage();

    // Setup event listeners
    whatsapp.onQRUpdated(({ sessionId, qr }) => {
      console.log(`QR Code for session ${sessionId}:`);
      console.log(qr);

      // Store QR code for this session
      qrCodeStore.set(sessionId, qr);
    });

    whatsapp.onConnected((sessionId) => {
      console.log(`WhatsApp session connected: ${sessionId}`);

      // Update connection status and remove QR code
      connectionStatusStore.set(sessionId, true);
      qrCodeStore.delete(sessionId);

      // Update database session status if needed
      updateSessionConnectionStatus(sessionId, true).catch(err => {
        console.error(`Failed to update database connection status for ${sessionId}:`, err);
      });
    });

    whatsapp.onDisconnected((sessionId) => {
      console.log(`WhatsApp session disconnected: ${sessionId}`);
      connectionStatusStore.set(sessionId, false);

      // Update database session status if needed
      updateSessionConnectionStatus(sessionId, false).catch(err => {
        console.error(`Failed to update database connection status for ${sessionId}:`, err);
      });
    });

    whatsapp.onMessageReceived((msg) => {
      console.log(`New message received on session ${msg.sessionId}:`, msg);
    });

    isInitialized = true;
    console.log('wa-multi-session initialized successfully');
  } catch (error) {
    console.error('Error initializing wa-multi-session:', error);
  }
}

// Get WhatsApp session from database
async function getWhatsAppSession(sessionName?: string): Promise<WhatsAppSession | null> {
  const prisma = getPrismaClient();

  try {
    let session: WhatsAppSession | null = null;

    if (sessionName) {
      // Try to find session by name
      session = await prisma.whatsAppSession.findUnique({
        where: {
          name: sessionName,
          isActive: true
        }
      });
    }

    // If no specific session found or no session name provided, get default
    if (!session) {
      session = await prisma.whatsAppSession.findFirst({
        where: {
          isDefault: true,
          isActive: true
        }
      });
    }

    return session;
  } catch (error) {
    console.error('Error fetching WhatsApp session:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Start a new WhatsApp session
export async function startWhatsAppSession(sessionId: string): Promise<boolean> {
  try {
    await initializeWaMultiSession();

    // Check if session is already running
    if (isSessionConnected(sessionId)) {
      console.log(`Session ${sessionId} is already connected`);
      return true;
    }

    console.log(`Starting WhatsApp session: ${sessionId}`);

    // Clear any stale data for this session
    qrCodeStore.delete(sessionId);
    connectionStatusStore.delete(sessionId);

    const session = await whatsapp.startSession(sessionId);
    console.log(`Session ${sessionId} start request sent successfully`);

    // Give the session a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    return true;
  } catch (error) {
    console.error(`Error starting WhatsApp session ${sessionId}:`, error);

    // Clear any partial state on error
    qrCodeStore.delete(sessionId);
    connectionStatusStore.delete(sessionId);

    return false;
  }
}

// Check if a session is connected
export function isSessionConnected(sessionId: string): boolean {
  try {
    // First check our connection status store
    const storedStatus = connectionStatusStore.get(sessionId);
    if (storedStatus !== undefined) {
      return storedStatus;
    }

    // Fallback to wa-multi-session check
    const session = whatsapp.getSession(sessionId);
    const isConnected = !!session;

    // Update our store with the current status
    connectionStatusStore.set(sessionId, isConnected);

    return isConnected;
  } catch (error) {
    console.error(`Error checking session ${sessionId}:`, error);
    return false;
  }
}

// Get all active session IDs from wa-multi-session
export function getActiveSessionIds(): string[] {
  try {
    return whatsapp.getAllSession();
  } catch (error) {
    console.error('Error getting active session IDs:', error);
    return [];
  }
}

// Send WhatsApp message using multi-session support
export async function sendWhatsAppMessage({ to, message, sessionName }: WhatsAppMessage) {
  try {
    await initializeWaMultiSession();

    // Try to get session from database first
    const dbSession = await getWhatsAppSession(sessionName);

    let sessionId: string;

    if (dbSession) {
      sessionId = dbSession.sessionId;
      console.log(`Using WhatsApp session: ${dbSession.name} (${dbSession.phoneNumber})`);
    } else {
      // Fallback to first available session or create a default one
      const activeSessions = getActiveSessionIds();
      if (activeSessions.length > 0) {
        sessionId = activeSessions[0];
        console.log(`Using fallback session: ${sessionId}`);
      } else {
        // Create a default session if none exists
        sessionId = 'default';
        console.log('No active sessions found, creating default session');
        const started = await startWhatsAppSession(sessionId);
        if (!started) {
          throw new Error('Failed to start default WhatsApp session');
        }
      }
    }

    // Check if session is connected
    if (!isSessionConnected(sessionId)) {
      console.log(`Session ${sessionId} not connected, attempting to start...`);
      await startWhatsAppSession(sessionId);

      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!isSessionConnected(sessionId)) {
        throw new Error(`WhatsApp session ${sessionId} is not connected. Please scan QR code.`);
      }
    }

    // Format phone number (ensure it starts with country code)
    let formattedPhone = to.replace(/\D/g, ''); // Remove non-digits
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1); // Replace leading 0 with 62 for Indonesia
    }
    if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone; // Add 62 if not present
    }

    const response = await whatsapp.sendTextMessage({
      sessionId: sessionId,
      to: formattedPhone,
      text: message,
    });

    console.log(`Message sent successfully to ${formattedPhone} via session ${sessionId}`);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// Send WhatsApp message using specific session by name
export async function sendWhatsAppMessageWithSession(sessionName: string, to: string, message: string) {
  return sendWhatsAppMessage({ to, message, sessionName });
}

// Get all active WhatsApp sessions from database
export async function getActiveWhatsAppSessions(): Promise<WhatsAppSession[]> {
  const prisma = getPrismaClient();

  try {
    const sessions = await prisma.whatsAppSession.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    return sessions;
  } catch (error) {
    console.error('Error fetching active WhatsApp sessions:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

// Get default WhatsApp session
export async function getDefaultWhatsAppSession(): Promise<WhatsAppSession | null> {
  return getWhatsAppSession();
}

// Get session status (connected/disconnected)
export async function getSessionStatus(sessionName?: string): Promise<{ sessionId: string; connected: boolean; name?: string } | null> {
  try {
    const dbSession = await getWhatsAppSession(sessionName);

    if (dbSession) {
      const connected = isSessionConnected(dbSession.sessionId);
      return {
        sessionId: dbSession.sessionId,
        connected,
        name: dbSession.name
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting session status:', error);
    return null;
  }
}

// Get QR code for a session (if available)
export async function getSessionQRCode(sessionId: string): Promise<string | null> {
  try {
    await initializeWaMultiSession();

    // Check if session is already connected
    if (isSessionConnected(sessionId)) {
      console.log(`Session ${sessionId} is already connected`);
      return null;
    }

    // Clear any existing QR code for this session
    qrCodeStore.delete(sessionId);

    // Start session to generate new QR code
    console.log(`Starting session ${sessionId} to generate QR code...`);
    await startWhatsAppSession(sessionId);

    // Wait for QR code to be generated with increased timeout and exponential backoff
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts with variable delays
    let delay = 500; // Start with 500ms delay

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
      const qrCode = qrCodeStore.get(sessionId);

      if (qrCode) {
        console.log(`QR code generated for session ${sessionId} after ${attempts + 1} attempts`);
        return qrCode;
      }

      // Check if session got connected during wait
      if (isSessionConnected(sessionId)) {
        console.log(`Session ${sessionId} connected while waiting for QR code`);
        return null;
      }

      attempts++;

      // Exponential backoff: increase delay gradually, max 2 seconds
      if (attempts < 5) {
        delay = 500; // First 5 attempts: 500ms
      } else if (attempts < 15) {
        delay = 1000; // Next 10 attempts: 1s
      } else {
        delay = 2000; // Remaining attempts: 2s
      }

      console.log(`Waiting for QR code for session ${sessionId}, attempt ${attempts}/${maxAttempts}`);
    }

    console.log(`Timeout waiting for QR code for session ${sessionId} after ${maxAttempts} attempts`);

    // Try one more time to get any QR code that might have been generated
    const finalQrCode = qrCodeStore.get(sessionId);
    if (finalQrCode) {
      console.log(`Found QR code for session ${sessionId} on final check`);
      return finalQrCode;
    }

    return null;
  } catch (error) {
    console.error(`Error getting QR code for session ${sessionId}:`, error);
    return null;
  }
}

// Get detailed session status with connection info
export async function getDetailedSessionStatus(sessionName?: string): Promise<{
  sessionId: string;
  connected: boolean;
  name?: string;
  hasQRCode: boolean;
  qrCode?: string;
} | null> {
  try {
    const dbSession = await getWhatsAppSession(sessionName);

    if (dbSession) {
      const connected = isSessionConnected(dbSession.sessionId);
      const qrCode = qrCodeStore.get(dbSession.sessionId);

      return {
        sessionId: dbSession.sessionId,
        connected,
        name: dbSession.name,
        hasQRCode: !!qrCode,
        qrCode: qrCode
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting detailed session status:', error);
    return null;
  }
}

// Helper function to update session connection status in database
async function updateSessionConnectionStatus(sessionId: string, connected: boolean) {
  try {
    const prisma = getPrismaClient();
    // Note: We don't have a connected field in the database schema
    // This is just for future reference if we add it
    console.log(`Session ${sessionId} connection status updated to: ${connected}`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error updating session connection status:', error);
  }
}

// Stop a WhatsApp session
export async function stopWhatsAppSession(sessionId: string): Promise<boolean> {
  try {
    await initializeWaMultiSession();

    // Delete session from wa-multi-session
    await whatsapp.deleteSession(sessionId);

    // Update our stores
    connectionStatusStore.set(sessionId, false);
    qrCodeStore.delete(sessionId);

    console.log(`Stopped WhatsApp session: ${sessionId}`);
    return true;
  } catch (error) {
    console.error(`Error stopping WhatsApp session ${sessionId}:`, error);
    return false;
  }
}

// Initialize all sessions from database on startup
export async function initializeAllSessions() {
  try {
    await initializeWaMultiSession();

    const sessions = await getActiveWhatsAppSessions();
    console.log(`Found ${sessions.length} active sessions to initialize`);

    for (const session of sessions) {
      console.log(`Checking session: ${session.name} (${session.sessionId})`);

      const connected = isSessionConnected(session.sessionId);
      console.log(`Session ${session.sessionId} connection status: ${connected}`);

      if (!connected) {
        console.log(`Starting session: ${session.name} (${session.sessionId})`);
        await startWhatsAppSession(session.sessionId);

        // Small delay between starting sessions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('All sessions initialization completed');
  } catch (error) {
    console.error('Error initializing all sessions:', error);
  }
}