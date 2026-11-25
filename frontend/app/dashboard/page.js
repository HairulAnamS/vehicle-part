"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatNumber } from '../../lib/utils';

const formatCurrency = (value) => {
  return `Rp ${formatNumber(value || 0)}`;
};

const formatDateId = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [vehicleStatuses, setVehicleStatuses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [chartTab, setChartTab] = useState('month'); // 'month' | 'year' | 'vehicle'
  const [dataLoading, setDataLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;

    const loadDashboardData = async () => {
      try {
        const [remData, statusData, summaryData] = await Promise.all([
          fetchAPI('/reminders'),
          fetchAPI('/reminders/statuses'),
          fetchAPI('/replacements/summary'),
        ]);
        setReminders(remData);
        setVehicleStatuses(statusData);
        setExpenseSummary(summaryData);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading]);

  if (authLoading || dataLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  const chartData =
    chartTab === 'month'
      ? expenseSummary?.by_month || []
      : chartTab === 'year'
      ? expenseSummary?.by_year || []
      : expenseSummary?.by_vehicle || [];

  const maxChartValue = chartData.reduce((max, item) => Math.max(max, item.total), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OVERDUE':
        return { label: 'Terlewat', className: 'bg-red-100 text-red-700', barClass: 'bg-red-500' };
      case 'WARNING':
        return { label: 'Peringatan', className: 'bg-amber-100 text-amber-800', barClass: 'bg-amber-500' };
      case 'SAFE':
        return { label: 'Aman', className: 'bg-emerald-100 text-emerald-700', barClass: 'bg-emerald-500' };
      default:
        return { label: 'Belum Ada Riwayat', className: 'bg-slate-100 text-slate-600', barClass: 'bg-slate-300' };
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Ringkasan pengingat, kondisi sparepart, dan biaya perawatan kendaraan Anda</p>
        </div>
        <button onClick={() => router.push('/vehicles')} className="btn-primary text-sm whitespace-nowrap">
          Update KM Kendaraan
        </button>
      </div>

      {/* Bagian 1: Pengingat Aktif */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bell text-amber-500"></i>
          Pengingat Aktif
        </h3>
        <div className="grid gap-4">
          {reminders.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-slate-500">Belum ada pengingat saat ini. Kendaraan Anda dalam kondisi baik!</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`card border-l-4 ${
                  reminder.status === 'OVERDUE' ? 'border-l-red-500 bg-red-50' : 'border-l-amber-500 bg-amber-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{reminder.vehicle.nopol}</h4>
                    <p className="text-slate-600 mt-1 font-medium">{reminder.sparepart.name}</p>
                    <p className={`mt-2 text-sm ${reminder.status === 'OVERDUE' ? 'text-red-700' : 'text-amber-700'}`}>
                      {reminder.message}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        reminder.status === 'OVERDUE' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {reminder.status === 'OVERDUE' ? 'Terlewat' : 'Peringatan'}
                    </span>
                    {reminder.status === 'WARNING' && (
                      <div className="mt-2 text-sm font-medium text-amber-800">
                        Perkiraan ganti:{' '}
                        {reminder.estimated_replacement_date
                          ? formatDateId(reminder.estimated_replacement_date)
                          : '- (KM harian belum diatur)'}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-slate-500">
                      KM Saat ini: {formatNumber(reminder.vehicle.current_km)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bagian 2: Progress Bar KM per Sparepart (Grouped per Kendaraan) */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-gauge-high text-blue-600"></i>
          Status Sparepart per Kendaraan
        </h3>

        {vehicleStatuses.length === 0 ? (
          <div className="card text-center py-8 text-slate-500">
            Belum ada kendaraan terdaftar. Silakan tambahkan kendaraan terlebih dahulu.
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${vehicleStatuses.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
            {vehicleStatuses.map(({ vehicle, parts }) => (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-lg">{vehicle.nopol}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {vehicle.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">KM Saat Ini</span>
                    <span className="font-bold text-slate-700">{formatNumber(vehicle.current_km)} KM</span>
                  </div>
                </div>

                <div className={`p-5 ${vehicleStatuses.length === 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}`}>
                  {parts.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Belum ada pengaturan interval sparepart.</p>
                  ) : (
                    parts.map((part) => {
                      const badge = getStatusBadge(part.status);
                      return (
                        <div key={part.sparepart_id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-slate-700">{part.sparepart_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-300 ${badge.barClass}`}
                              style={{ width: `${part.progress_percent}%` }}
                            ></div>
                          </div>

                          <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 gap-1">
                            {part.status === 'NO_HISTORY' ? (
                              <span>Interval: {formatNumber(part.replacement_km)} KM (Belum ada riwayat ganti)</span>
                            ) : (
                              <>
                                <span>
                                  Terpakai {formatNumber(part.km_used)} / {formatNumber(part.replacement_km)} KM ({part.progress_percent}%)
                                </span>
                                <span className="font-medium">
                                  {part.km_remaining <= 0
                                    ? `Terlewat ${formatNumber(Math.abs(part.km_remaining))} KM`
                                    : `Sisa ${formatNumber(part.km_remaining)} KM`}
                                </span>
                              </>
                            )}
                          </div>

                          {part.estimated_replacement_date && part.km_remaining > 0 && (
                            <p className="text-xs text-slate-400">
                              Perkiraan ganti: {formatDateId(part.estimated_replacement_date)}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian 3: Ringkasan & Grafik Biaya Perawatan */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-column text-emerald-600"></i>
          Ringkasan Biaya Perawatan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Pengeluaran Bulan Ini</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {formatCurrency(expenseSummary?.total_this_month)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Pengeluaran Tahun Ini</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {formatCurrency(expenseSummary?.total_this_year)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Keseluruhan</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatCurrency(expenseSummary?.total_all_time)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h4 className="font-bold text-slate-700">Grafik Pengeluaran</h4>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setChartTab('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartTab === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Per Bulan
              </button>
              <button
                type="button"
                onClick={() => setChartTab('year')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartTab === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Per Tahun
              </button>
              <button
                type="button"
                onClick={() => setChartTab('vehicle')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartTab === 'vehicle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Per Kendaraan
              </button>
            </div>
          </div>

          {chartData.length === 0 || maxChartValue === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Belum ada data biaya perawatan yang tercatat.
            </p>
          ) : (
            <div className="space-y-4">
              {chartData.map((item, idx) => {
                const widthPercent = maxChartValue > 0 ? Math.max(2, Math.round((item.total / maxChartValue) * 100)) : 0;
                return (
                  <div key={item.key || item.year || item.vehicle_id || idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
