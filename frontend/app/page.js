"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="text-center max-w-2xl mx-auto space-y-8">
        <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">
          Vehicle Part <span className="text-blue-600">Reminder</span>
        </h1>
        <p className="text-lg text-slate-600">
          Kelola kendaraan Anda dan dapatkan pengingat otomatis kapan harus mengganti sparepart seperti oli, kampas rem, dan lainnya berdasarkan Kilometer (KM) kendaraan Anda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login" className="btn-primary w-full sm:w-auto text-center px-8 py-3 text-lg">
            Masuk
          </Link>
          <Link href="/register" className="w-full sm:w-auto text-center px-8 py-3 text-lg font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
