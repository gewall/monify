# 💰 Monify - Smart Financial Management Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gewall/monify)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Formik](https://img.shields.io/badge/Validation-Formik%20%2B%20Valibot-purple?style=for-the-badge)](https://valibot.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Shadcn%20UI%20%2B%20Tailwind-teal?style=for-the-badge)](https://ui.shadcn.com/)

**Monify** adalah aplikasi manajemen keuangan pribadi pintar berbasis **Next.js App Router** yang dirancang untuk membantu Anda mengelola arus kas, melacak penghasilan multi-sumber, mengontrol pengeluaran tetap bulanan & harian, serta menghitung estimasi kelayakan pencapaian **Wishlist (Target Impian)** secara real-time.

---

## ✨ Fitur Utama (Key Features)

- 📈 **Pencatatan Penghasilan Multi-Sumber**: Kelola gaji, hasil freelance, deviden, hingga usaha sampingan (*side hustle*) dengan penyetaraan otomatis per bulan.
- 💳 **Manajemen Pengeluaran Tetap Bulanan**: Pantau sewa rumah, tagihan listrik, langganan (*subscriptions*), cicilan, dan asuransi. Dilengkapi indikator peringatan otomatis jika biaya tetap melebihi 50% penghasilan.
- 🛍️ **Pengeluaran Harian Real-time**: Pencatatan cepat makanan, transportasi, belanja, dan hiburan harian.
- 🎯 **Wishlist & Estimasi Kelayakan Impian**: Kalkulator waktu pencapaian target tabungan secara presisi berdasarkan tabungan bersih bulanan (*Net Savings*).
- 💡 **Mesin Rekomendasi Keuangan Pintar**: AI Suggestion Engine yang menganalisis rasio biaya tetap (*Fixed Cost Ratio*), rasio tabungan (*Savings Rate*), dan memberikan rekomendasi penghematan otomatis.
- 🇮🇩 **Format Mata Uang Rupiah (Rp)**: Penformatan mata uang Indonesia yang konsisten di seluruh ringkasan grafis, tabel, dan form input.
- 📝 **Validasi Formik + Valibot**: Form validation tipe ketat yang responsif dengan umpan balik pesan kesalahan real-time.
- 🔔 **Notifikasi Toast Sonner**: Umpan balik notifikasi *toast* instan untuk setiap penambahan, pengubahan status, atau penghapusan data.
- 🛡️ **Sistem Otentikasi & Audit Trail Security**: Keamanan otentikasi hybrid (OAuth Google/GitHub & Email Credentials) serta pencatatan audit log timestamp lengkap untuk setiap aksi finansial.

---

## 🛠️ Teknologi & Arsitektur (Tech Stack)

- **Framework**: [Next.js 16 (App Router & Server Actions)](https://nextjs.org/)
- **Bahasa**: [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
- **Database & ORM**: PostgreSQL ([Neon Serverless Postgres](https://neon.tech/)) & [Drizzle ORM](https://orm.drizzle.team/)
- **Otentikasi**: [Auth.js / NextAuth.js v5](https://authjs.dev/)
- **Form & Validasi**: [Formik](https://formik.org/) + [Valibot](https://valibot.dev/)
- **Komponen & UI**: [Shadcn UI](https://ui.shadcn.com/), Lucide Icons, Recharts, & TailwindCSS
- **Notifikasi Toast**: [Sonner](https://sonner.emilkowal.ski/)
- **Pengujian**: [Vitest](https://vitest.dev/)

---

## 🚀 Panduan Penginstalan & Jalankan Lokal (Installation Guide)

### 1. Prasyarat System
- Node.js `v20.x` atau lebih baru
- npm, yarn, atau pnpm

### 2. Kloning Repositori & Install Dependensi
```bash
git clone https://github.com/gewall/monify.git
cd monify
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di direktori utama proyek dan tambahkan variabel berikut:

```env
# Database PostgreSQL (Neon Cloud DB)
DATABASE_URL="postgres://user:password@ep-example.neon.tech/monify?sslmode=require"

# NextAuth / Auth.js
AUTH_SECRET="buat-kunci-rahasia-random-anda"
NEXTAUTH_URL="http://localhost:3000"

# Optional OAuth Providers
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Optional Email SMTP Digest (Gmail)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="email-anda@gmail.com"
EMAIL_SERVER_PASSWORD="app-password-gmail"
EMAIL_FROM="Monify <noreply@monify.app>"
```

### 4. Push Schema Database ke Neon Postgres
Jalankan perintah berikut untuk menginisialisasi seluruh tabel database:
```bash
npm run db:push
```

### 5. Jalankan Dev Server
```bash
npm run dev
```
Buka browser Anda dan kunjungi **[http://localhost:3000](http://localhost:3000)**.

---

## 📂 Struktur Sub-Route Dashboard (App Router)

Monify menggunakan arsitektur sub-route terpisah yang modular dan mudah dibaca:

| Route Path | Fitur & Deskripsi |
| :--- | :--- |
| `/dashboard` | Ringkasan Arus Kas, Ringkasan Grafik Recharts & Advice Rekomendasi Pintar |
| `/dashboard/incomes` | Halaman Khusus Manajemen Sumber Penghasilan |
| `/dashboard/recurring` | Halaman Khusus Manajemen Pengeluaran Tetap Bulanan & Cicilan |
| `/dashboard/daily` | Halaman Khusus Pencatatan Pengeluaran Harian |
| `/dashboard/wishlist` | Halaman Khusus Target Impian & Estimasi Kelayakan Waktu Tabungan |
| `/dashboard/logs` | Halaman Khusus Security Audit Trail Events |

---

## 🧪 Pengujian & Verifikasi Kualitas Kode (Scripts)

```bash
# Verifikasi Tipe TypeScript Strict (0 Error)
npm run typecheck

# Pengujian Vitest Unit Tests (Financial Math, Auth & Email Generators)
npx vitest run

# Pengecekan Kerapihan Kode (ESLint Clean Check)
npm run lint

# Build Bundling Produksi
npm run build
```

---

## ☁️ Deploy ke Vercel (Deployment)

Klik tombol di bawah ini untuk melakukan deploy langsung ke **Vercel** hanya dalam 1 klik:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gewall/monify)

### Langkah Deploy Manual di Vercel:
1. Push kode proyek Anda ke GitHub.
2. Buka dashboard [Vercel](https://vercel.com/) dan buat project baru dari repositori GitHub.
3. Masukkan **Environment Variables** (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`) di settings Vercel.
4. Klik **Deploy**!

---

## 📄 Lisensi

Proyek ini dilindungi di bawah lisensi MIT.
