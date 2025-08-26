# WhatsApp Single Session Feature

⚠️ **PERUBAHAN PENTING**: Sistem sekarang hanya mendukung 1 WhatsApp session untuk mempermudah pengelolaan dan menghindari konflik.

Fitur ini memungkinkan admin untuk mengelola 1 WhatsApp session menggunakan wa-multi-session library untuk semua keperluan komunikasi otomatis.

## Features

- ✅ Kelola 1 WhatsApp session dari admin panel menggunakan wa-multi-session
- ✅ Session otomatis menjadi default dan aktif
- ✅ QR Code scanning untuk autentikasi WhatsApp dengan tampilan visual yang diperbaiki
- ✅ Auto-refresh status koneksi setiap 10 detik
- ✅ Monitoring koneksi real-time saat scan QR code
- ✅ Validasi untuk mencegah pembuatan session lebih dari 1
- ✅ Real-time connection status monitoring
- ✅ Local session storage dan auto-reconnect
- ✅ Script cleanup untuk mengelola session yang berlebihan

## Setup

### 1. Database Migration

Migration sudah otomatis dijalankan saat menambahkan schema baru. Jika belum, jalankan:

```bash
npx prisma migrate dev
```

### 2. Add Sample Sessions (Optional)

Untuk menambahkan sample sessions untuk testing:

```bash
npx ts-node scripts/add-sample-whatsapp-sessions.ts
```

### 3. Admin Panel Access

1. Login ke admin panel: `/admin/dashboard`
2. Navigasi ke "WhatsApp Sessions" di sidebar
3. **Jika belum ada session:**
   - Klik "Add WhatsApp Session" untuk membuat session pertama
   - Sistem hanya mengizinkan 1 session aktif
4. **Tambah session baru dengan informasi:**
   - **Nama Session**: Nama deskriptif untuk session (contoh: "DUDULURUN WhatsApp")
   - **Session ID**: ID unik untuk wa-multi-session (contoh: "dudulurun_main")
   - **Nomor WhatsApp**: Nomor WhatsApp dalam format 628xxxxxxxxx (tanpa +)
   - **Deskripsi**: Deskripsi optional untuk session
   - **Aktif**: Otomatis dicentang (session selalu aktif)
   - Session otomatis menjadi default

5. **Setelah membuat session:**
   - Jika belum terhubung, klik "Hubungkan WhatsApp"
   - QR code akan ditampilkan dengan monitoring real-time
   - Modal akan otomatis tertutup saat berhasil terhubung

## QR Code Scanning

### Cara Scan QR Code WhatsApp

1. **Buat Session Baru**: Setelah membuat session baru, QR code akan otomatis muncul
2. **Session Existing**: Klik tombol "Show QR Code" pada session yang statusnya "Disconnected"
3. **Scan dengan WhatsApp**:
   - Buka WhatsApp di ponsel
   - Pilih Menu (⋮) → Linked Devices
   - Tap "Link a Device"
   - Scan QR code yang ditampilkan di admin panel
4. **Status Update**: Status session akan otomatis berubah menjadi "Connected" setelah berhasil

### Fitur QR Code

- **Visual Display**: QR code ditampilkan dalam modal dengan instruksi yang jelas
- **Auto-refresh**: QR code dapat di-refresh jika expired
- **Connection Status**: Real-time monitoring status koneksi session
- **Auto-close**: Modal QR code otomatis tertutup setelah berhasil connect

## Usage

### 1. Menggunakan Default Session

```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// Akan menggunakan session default
await sendWhatsAppMessage({
  to: '+6281234567890',
  message: 'Hello from default session!'
});
```

### 2. Menggunakan Session Tertentu

```typescript
import { sendWhatsAppMessage, sendWhatsAppMessageWithSession } from '@/lib/whatsapp';

// Method 1: Dengan parameter sessionName
await sendWhatsAppMessage({
  to: '+6281234567890',
  message: 'Hello from marketing session!',
  sessionName: 'Marketing'
});

// Method 2: Menggunakan helper function
await sendWhatsAppMessageWithSession('Customer Support', '+6281234567890', 'Hello from support!');
```

### 3. Mengelola Session

```typescript
import { 
  startWhatsAppSession, 
  getActiveSessionIds, 
  isSessionConnected,
  getSessionStatus,
  initializeAllSessions
} from '@/lib/whatsapp';

// Start session baru (akan menampilkan QR code di console)
await startWhatsAppSession('customer_support');

// Cek apakah session terhubung
const connected = isSessionConnected('customer_support');

// Dapatkan semua session ID yang aktif
const activeIds = getActiveSessionIds();

// Dapatkan status session
const status = await getSessionStatus('Customer Support');

// Initialize semua session dari database
await initializeAllSessions();
```

### 4. Mendapatkan Daftar Session dari Database

```typescript
import { getActiveWhatsAppSessions, getDefaultWhatsAppSession } from '@/lib/whatsapp';

const sessions = await getActiveWhatsAppSessions();
console.log('Active sessions:', sessions);

const defaultSession = await getDefaultWhatsAppSession();
console.log('Default session:', defaultSession);
```

## API Endpoints

### GET /api/admin/whatsapp-sessions

Mendapatkan semua WhatsApp sessions

### POST /api/admin/whatsapp-sessions

Membuat session baru

**Body:**

```json
{
  "name": "Customer Support",
  "sessionId": "customer_support",
  "phoneNumber": "+6285117132297",
  "isActive": true,
  "isDefault": false,
  "description": "Main customer support session"
}
```

### PUT /api/admin/whatsapp-sessions

Update session yang sudah ada

**Body:** Same as POST + `id` field

### DELETE /api/admin/whatsapp-sessions?id={sessionId}

Menghapus session (tidak bisa menghapus default session)

## Migration dari OneSender

Jika sebelumnya menggunakan OneSender, berikut langkah-langkah migrasi:

1. **Database Migration**: Sudah otomatis dijalankan, mengubah `apiKey` dan `baseUrl` menjadi `sessionId`
2. **QR Code Setup**: Setiap session perlu di-scan QR code untuk autentikasi
3. **Session Management**: Session disimpan lokal di folder `wa_sessions/`
4. **Environment Variables**: Tidak lagi diperlukan, semua konfigurasi di database

## Best Practices

1. **Selalu set satu session sebagai default** - untuk fallback jika session tertentu tidak tersedia
2. **Gunakan nama session yang deskriptive** - seperti "Customer Support", "Marketing", "Registration"
3. **Gunakan sessionId yang konsisten** - gunakan format lowercase dengan underscore (contoh: `customer_support`)
4. **Nonaktifkan session yang tidak digunakan** - untuk menghindari penggunaan yang tidak sengaja
5. **Backup session credentials** - folder `wa_sessions/` berisi data autentikasi penting
6. **Monitor connection status** - gunakan `getSessionStatus()` untuk memantau koneksi session
7. **Initialize sessions saat startup** - panggil `initializeAllSessions()` saat aplikasi dimulai

## Troubleshooting

### Session tidak terhubung

- Pastikan session sudah di-scan QR code
- Cek apakah session aktif (`isActive: true`)
- Verifikasi ada session default yang aktif
- Gunakan `isSessionConnected(sessionId)` untuk cek status
- Restart session dengan `startWhatsAppSession(sessionId)`

### QR Code tidak muncul

- Pastikan console log aktif saat development
- Cek apakah session sudah pernah di-scan sebelumnya
- Hapus folder `wa_sessions/[sessionId]` untuk reset session

### Session tidak ditemukan di database

- Pastikan sessionId benar (case-sensitive)
- Cek nama session sudah benar (case-sensitive)
- Verifikasi ada session default yang aktif

### Database connection error

- Pastikan database connection string benar
- Cek Prisma client sudah ter-generate dengan benar: `npx prisma generate`
- Jalankan migration: `npx prisma migrate dev`

## Maintenance Scripts

### Cleanup Multiple Sessions

Jika ada multiple sessions (misalnya dari versi sebelumnya), gunakan script cleanup:

```bash
# Jalankan script cleanup
npm run whatsapp:cleanup

# Atau manual
npx ts-node scripts/cleanup-whatsapp-sessions.ts
```

Script ini akan:

- Menghapus session berlebihan (hanya menyisakan 1 session tertua)
- Memastikan session yang tersisa menjadi default dan aktif
- Menampilkan informasi session yang dihapus dan dipertahankan

### Session Status Check

Status koneksi diperbarui otomatis setiap 10 detik di admin panel. Untuk monitoring manual:

```bash
# Check semua session aktif
node -e "console.log(require('./src/lib/whatsapp').getActiveSessionIds())"
```

### WhatsApp Web logout

- Session akan otomatis disconnect jika logout dari WhatsApp Web
- Scan ulang QR code dengan `startWhatsAppSession(sessionId)`
- Monitor status dengan `getSessionStatus()`
