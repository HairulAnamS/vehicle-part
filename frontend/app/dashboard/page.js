"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatNumber, parseNumber } from '../../lib/utils';

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;

    const loadReminders = async () => {
      try {
        const data = await fetchAPI('/reminders');
        setReminders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    loadReminders();
  }, [user, authLoading]);

  if (authLoading || dataLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Ringkasan pengingat sparepart kendaraan Anda</p>
        </div>
        <button onClick={() => router.push('/vehicles')} className="btn-primary text-sm">
          Update KM Kendaraan
        </button>
      </div>

      <div className="grid gap-6">
        {reminders.length === 0 ? (
          <div className="card text-center py-12">
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
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{reminder.vehicle.nopol}</h3>
                  <p className="text-slate-600 mt-1 font-medium">{reminder.sparepart.name}</p>
                  <p className={`mt-2 text-sm ${reminder.status === 'OVERDUE' ? 'text-red-700' : 'text-amber-700'}`}>
                    {reminder.message}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    reminder.status === 'OVERDUE' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                  }`}>
                    {reminder.status}
                  </span>
                  <div className="mt-2 text-sm   text-slate-500">
                    KM Saat ini: {formatNumber(reminder.vehicle.current_km)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
