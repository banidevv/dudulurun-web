# Supabase Setup untuk Upload File

## Konfigurasi Environment Variables

Tambahkan environment variables berikut ke file `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

## Setup Supabase Storage

1. **Buat Bucket di Supabase Dashboard:**
   - Buka Supabase Dashboard
   - Pergi ke Storage
   - Buat bucket baru dengan nama `race-packs`
   - Set bucket sebagai public jika ingin file dapat diakses langsung

2. **Konfigurasi Bucket Policy:**
   - Set policy untuk allow upload dari service role
   - Set policy untuk allow public read access

## Cara Mendapatkan Credentials

1. **NEXT_PUBLIC_SUPABASE_URL:**
   - Buka Supabase Dashboard
   - Pergi ke Settings > API
   - Copy "Project URL"

2. **SUPABASE_SERVICE_ROLE_KEY:**
   - Di halaman yang sama (Settings > API)
   - Copy "service_role" key (bukan anon key)

## Fungsi yang Tersedia

### `uploadToSupabase(file, fileName, bucket?)`

- Upload file ke Supabase Storage
- Parameter:
  - `file`: Buffer dari file
  - `fileName`: Nama file
  - `bucket`: Nama bucket (default: 'race-packs')
- Return: `{ url: string, path: string }`

### `deleteFromSupabase(fileName, bucket?)`

- Hapus file dari Supabase Storage
- Parameter:
  - `fileName`: Nama file
  - `bucket`: Nama bucket (default: 'race-packs')

## Perubahan yang Dilakukan

1. **Install Supabase Client:**

   ```bash
   npm install @supabase/supabase-js
   ```

2. **File Baru:**
   - `src/lib/supabase.ts` - Konfigurasi dan utility functions

3. **File yang Dimodifikasi:**
   - `src/app/api/scanner/validate/route.ts` - Menggunakan Supabase upload

## Testing

Setelah setup selesai, test upload functionality melalui scanner API endpoint.
