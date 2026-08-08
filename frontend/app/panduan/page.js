"use client";

import DashboardLayout from '../../components/DashboardLayout';

export default function Panduan() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Panduan Penggunaan</h2>
          <p className="text-slate-500 text-lg">Pelajari cara menggunakan aplikasi Vehicle Part dengan efektif.</p>
        </div>

        <div className="space-y-6">
          {/* Konsep Dasar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <i className="fa-solid fa-lightbulb mr-3 text-yellow-300"></i>
                Konsep Dasar Aplikasi
              </h3>
            </div>
            <div className="p-6 text-slate-700 leading-relaxed space-y-4">
              <p>
                Aplikasi ini dirancang untuk mengingatkan Anda kapan waktu yang tepat untuk mengganti sparepart kendaraan berdasarkan <strong>Jarak Tempuh (Kilometer)</strong>.
              </p>
              <p>
                Agar pengingat (reminder) bekerja dengan akurat, Anda perlu melakukan dua hal:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 font-medium">
                <li>Memastikan estimasi <strong>KM Harian</strong> disetting dengan benar saat menambah kendaraan, karena sistem akan meng-update KM Terkini secara otomatis setiap hari. Anda juga bisa mengupdate angka KM secara manual jika selisihnya sudah terlalu jauh.</li>
                <li>Mencatat setiap kali Anda selesai mengganti sparepart di menu Riwayat.</li>
              </ul>
            </div>
          </div>

          {/* Langkah-langkah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Master Sparepart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Master Sparepart</h4>
              <p className="text-slate-600 mb-3 text-sm">
                Menu ini digunakan untuk mendaftarkan nama-nama sparepart yang ada (seperti Oli, Kampas Rem, dll).
              </p>
              <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 border border-slate-100">
                <i className="fa-solid fa-circle-info text-blue-500 mr-2"></i>
                <em>Hanya Admin yang dapat menambah/mengubah daftar di menu ini. Pengguna biasa hanya dapat melihat daftarnya.</em>
              </div>
            </div>

            {/* Kelola Kendaraan */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Tambah Kendaraan</h4>
              <p className="text-slate-600 text-sm mb-2">
                Di menu <strong>Kendaraan</strong>, Anda mendaftarkan motor/mobil Anda. Saat menambah kendaraan, Anda akan diminta mengatur:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600 text-sm">
                <li><strong>Interval KM:</strong> Target jarak untuk ganti part (misal ganti oli tiap 2000 KM). <em>Kosongkan jika Anda tidak ingin mendapatkan reminder untuk sparepart ini.</em></li>
                <li><strong>KM Terakhir Ganti:</strong> Titik awal perhitungan. Jika kendaraan baru dari dealer, isi dengan angka 0.</li>
              </ul>
            </div>

            {/* Cek Dashboard */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Pantau Dashboard</h4>
              <p className="text-slate-600 text-sm mb-2">
                Halaman <strong>Dashboard</strong> adalah pusat informasi Anda. Sistem akan menampilkan peringatan warna:
              </p>
              <ul className="mt-2 space-y-2 text-slate-600 text-sm">
                <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2 flex-shrink-0"></span> Merah: Sudah lewat batas interval! Segera ganti.</li>
                <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2 flex-shrink-0"></span> Kuning: Peringatan awal. Muncul saat sisa jarak ganti kurang dari 500 KM.</li>
                <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2 flex-shrink-0"></span> Hijau: Kondisi aman. Sisa jarak ganti masih di atas 500 KM.</li>
              </ul>
            </div>

            {/* Riwayat Pergantian */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Catat Pergantian</h4>
              <p className="text-slate-600 text-sm">
                Setiap kali Anda pulang dari bengkel setelah mengganti part, wajib untuk mencatatnya di menu <strong>Riwayat Ganti</strong>.
                <br /><br />
                Dengan mencatat riwayat baru, sistem akan otomatis me-reset perhitungan dari nol lagi, dan status di Dashboard akan kembali menjadi Hijau (Aman).
              </p>
            </div>

          </div>

          <div className="bg-slate-800 text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
            <div>
              <h4 className="font-bold text-lg mb-1">Sudah paham cara kerjanya?</h4>
              <p className="text-slate-300 text-sm">Mari mulai dengan mendaftarkan kendaraan pertama Anda.</p>
            </div>
            <a href="/vehicles" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap">
              Ke Halaman Kendaraan
            </a>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
