"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatNumber, parseNumber } from '../../lib/utils';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'logs'
  const [dataLoading, setDataLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    email_reminder_enabled: true,
    warning_km_threshold: '500',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (authLoading || !user) return;

    const loadSettings = async () => {
      try {
        const [profileData, historyData] = await Promise.all([
          fetchAPI('/auth/profile'),
          fetchAPI('/reminders/history'),
        ]);
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          email_reminder_enabled: profileData.email_reminder_enabled !== false,
          warning_km_threshold: String(profileData.warning_km_threshold ?? 500),
        });
        setLogs(historyData);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    loadSettings();
  }, [authLoading, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const updated = await fetchAPI('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileForm.name,
          email_reminder_enabled: profileForm.email_reminder_enabled,
          warning_km_threshold: parseInt(profileForm.warning_km_threshold, 10) || 0,
        }),
      });
      updateUser(updated);
      Swal.fire('Berhasil', 'Profil dan preferensi reminder berhasil disimpan.', 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire('Peringatan', 'Konfirmasi password baru tidak cocok.', 'warning');
      return;
    }

    Swal.fire({ title: 'Memperbarui password...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await fetchAPI('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire('Berhasil', 'Password berhasil diperbarui.', 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || dataLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan & Log</h2>
        <p className="text-slate-500">Kelola profil, preferensi pengingat, keamanan akun, dan riwayat notifikasi email</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="fa-solid fa-user-gear mr-2"></i>
          Profil & Preferensi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="fa-solid fa-lock mr-2"></i>
          Keamanan (Password)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="fa-solid fa-envelope-open-text mr-2"></i>
          Log Notifikasi Email
        </button>
      </div>

      {/* Tab 1: Profil & Preferensi */}
      {activeTab === 'profile' && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Profil & Preferensi Reminder</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                className="input-field bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Batas KM Peringatan Awal (Warning)</label>
              <input
                type="text"
                value={formatNumber(profileForm.warning_km_threshold)}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, warning_km_threshold: parseNumber(e.target.value) })
                }
                className="input-field"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Status Peringatan (Kuning) akan muncul ketika sisa jarak ganti kurang dari atau sama dengan nilai ini. Default: 500 KM.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-800 text-sm">Aktifkan Pengingat Email Otomatis</p>
                <p className="text-xs text-slate-500">
                  Kirim rekap sparepart yang perlu diganti ke email Anda secara berkala.
                </p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.email_reminder_enabled}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email_reminder_enabled: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="btn-primary">
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Keamanan (Password) */}
      {activeTab === 'password' && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Ubah Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password Baru</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input-field"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input-field"
                minLength={6}
                required
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button type="submit" className="btn-primary">
                Perbarui Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Log Notifikasi Email */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Riwayat Pengiriman Email Reminder (50 Terakhir)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-slate-700">Waktu</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Email Tujuan</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Status</th>
                  <th className="py-3 px-4 font-bold text-slate-700">Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{log.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{log.details || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      Belum ada riwayat notifikasi email yang dikirim.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
