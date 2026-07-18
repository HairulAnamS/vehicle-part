"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAPI } from '../../lib/api';
import { formatNumber, parseNumber } from '../../lib/utils';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    nopol: '', type: 'Motor', brand: '', model: '', current_km: '', km_harian: ''
  });

  // Modal for Update KM
  const [isUpdateKmOpen, setIsUpdateKmOpen] = useState(false);
  const [updateKmData, setUpdateKmData] = useState({ id: '', current_km: '' });

  // Modal for Edit Vehicle
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '', nopol: '', type: 'Motor', brand: '', model: '', current_km: '', km_harian: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await fetchAPI('/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          current_km: parseInt(formData.current_km) || 0,
          km_harian: parseInt(formData.km_harian) || 0
        })
      });
      setIsFormOpen(false);
      setFormData({ nopol: '', type: 'Motor', brand: '', model: '', current_km: '', km_harian: '' });
      loadVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI(`/vehicles/${editFormData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nopol: editFormData.nopol,
          type: editFormData.type,
          brand: editFormData.brand,
          model: editFormData.model,
          current_km: parseInt(editFormData.current_km) || 0,
          km_harian: parseInt(editFormData.km_harian) || 0
        })
      });
      setIsEditFormOpen(false);
      loadVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateKm = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI(`/vehicles/${updateKmData.id}/km`, {
        method: 'PUT',
        body: JSON.stringify({ current_km: parseInt(updateKmData.current_km) })
      });
      setIsUpdateKmOpen(false);
      loadVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kendaraan ini?')) {
      try {
        await fetchAPI(`/vehicles/${id}`, {
          method: 'DELETE'
        });
        loadVehicles();
      } catch (err) {
        if (err.message.includes('riwayat')) {
          alert('Peringatan: Kendaraan tidak dapat dihapus karena masih ada riwayat pergantian sparepart yang terkait dengan kendaraan ini.');
        } else {
          alert(err.message);
        }
      }
    }
  };

  const openUpdateKm = (vehicle) => {
    setUpdateKmData({ id: vehicle.id, current_km: vehicle.current_km });
    setIsUpdateKmOpen(true);
  };

  const openEditForm = (vehicle) => {
    setEditFormData({
      id: vehicle.id,
      nopol: vehicle.nopol,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      current_km: vehicle.current_km,
      km_harian: vehicle.km_harian || 0
    });
    setIsEditFormOpen(true);
  };

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Kendaraan</h2>
          <p className="text-slate-500">Kelola data kendaraan Anda</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary">
          + Tambah Kendaraan
        </button>
      </div>

      {isFormOpen && (
        <div className="card mb-8 border-t-4 border-t-blue-600">
          <h3 className="text-lg font-bold mb-4">Tambah Kendaraan Baru</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Polisi</label>
              <input type="text" value={formData.nopol} onChange={(e) => setFormData({...formData, nopol: e.target.value})} className="input-field" required placeholder="B 1234 ABC" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Kendaraan</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-field" required>
                <option value="Motor">Motor</option>
                <option value="Mobil">Mobil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Merk (Brand)</label>
              <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="input-field" required placeholder="Honda, Toyota, dsb" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="input-field" required placeholder="Vario, Avanza, dsb" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">KM Saat Ini</label>
              <input type="text" value={formatNumber(formData.current_km)} onChange={(e) => setFormData({...formData, current_km: parseNumber(e.target.value)})} className="input-field" required placeholder="Misal: 15.000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimasi KM Harian</label>
              <input type="text" value={formatNumber(formData.km_harian)} onChange={(e) => setFormData({...formData, km_harian: parseNumber(e.target.value)})} className="input-field" required placeholder="Misal: 50" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {isEditFormOpen && (
        <div className="card mb-8 border-t-4 border-t-amber-500">
          <h3 className="text-lg font-bold mb-4">Edit Kendaraan</h3>
          <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Polisi</label>
              <input type="text" value={editFormData.nopol} onChange={(e) => setEditFormData({...editFormData, nopol: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Kendaraan</label>
              <select value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} className="input-field" required>
                <option value="Motor">Motor</option>
                <option value="Mobil">Mobil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Merk (Brand)</label>
              <input type="text" value={editFormData.brand} onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input type="text" value={editFormData.model} onChange={(e) => setEditFormData({...editFormData, model: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">KM Saat Ini</label>
              <input type="text" value={formatNumber(editFormData.current_km)} onChange={(e) => setEditFormData({...editFormData, current_km: parseNumber(e.target.value)})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimasi KM Harian</label>
              <input type="text" value={formatNumber(editFormData.km_harian)} onChange={(e) => setEditFormData({...editFormData, km_harian: parseNumber(e.target.value)})} className="input-field" required />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsEditFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button type="submit" className="btn-primary bg-amber-500 hover:bg-amber-600">Update Kendaraan</button>
            </div>
          </form>
        </div>
      )}

      {isUpdateKmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Update KM Terkini</h3>
            <form onSubmit={handleUpdateKm}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">KM Kendaraan</label>
                <input type="text" value={formatNumber(updateKmData.current_km)} onChange={(e) => setUpdateKmData({...updateKmData, current_km: parseNumber(e.target.value)})} className="input-field" required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsUpdateKmOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="card hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase">
                  {v.type}
                </span>
                <h3 className="text-xl font-bold mt-2">{v.nopol}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditForm(v)} className="text-amber-500 hover:text-amber-700" title="Edit Kendaraan">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700" title="Hapus Kendaraan">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="text-slate-600 text-sm space-y-1 mb-4 flex-1">
              <p>Merk: <span className="font-medium text-slate-900">{v.brand}</span></p>
              <p>Model: <span className="font-medium text-slate-900">{v.model}</span></p>
              <p>KM Terkini: <span className="font-bold text-blue-600">{formatNumber(v.current_km)}</span></p>
              <p>KM Harian: <span className="font-medium text-slate-900">{formatNumber(v.km_harian || 0)}</span></p>
              {v.last_update_current_km && (
                <p>Update KM Terakhir: <span className="font-medium text-slate-900">{new Date(v.last_update_current_km).toLocaleDateString('id-ID')}</span></p>
              )}
            </div>
            <button onClick={() => openUpdateKm(v)} className="w-full mt-auto text-center border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium transition-colors">
              Update KM Saja
            </button>
          </div>
        ))}
        {vehicles.length === 0 && !isFormOpen && (
          <div className="col-span-full text-center py-12 text-slate-500">
            Belum ada kendaraan. Silakan tambah kendaraan Anda.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
