"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAPI } from '../../lib/api';
import { formatNumber, parseNumber } from '../../lib/utils';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

export default function Replacements() {
  const { user, loading: authLoading } = useAuth();
  const [replacements, setReplacements] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    sparepart_id: '',
    km_installed: '',
    date_installed: new Date().toISOString().split('T')[0]
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    km_installed: '',
    date_installed: ''
  });

  useEffect(() => {
    if (authLoading || !user) return;
    loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [repsData, vehData, spareData] = await Promise.all([
        fetchAPI('/replacements'),
        fetchAPI('/vehicles'),
        fetchAPI('/spareparts')
      ]);
      setReplacements(repsData);
      setVehicles(vehData);
      setSpareparts(spareData);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await fetchAPI('/replacements', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: formData.vehicle_id,
          sparepart_id: formData.sparepart_id,
          km_installed: parseInt(formData.km_installed) || 0,
          date_installed: formData.date_installed
        })
      });
      Swal.close();
      setIsFormOpen(false);
      setFormData({
        vehicle_id: '',
        sparepart_id: '',
        km_installed: '',
        date_installed: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await fetchAPI(`/replacements/${editFormData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          km_installed: parseInt(editFormData.km_installed) || 0,
          date_installed: editFormData.date_installed
        })
      });
      Swal.close();
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan menghapus riwayat ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await fetchAPI(`/replacements/${id}`, {
          method: 'DELETE'
        });
        Swal.close();
        loadData();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const openEditModal = (rep) => {
    setEditFormData({
      id: rep.id,
      km_installed: rep.km_installed,
      date_installed: new Date(rep.date_installed).toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReplacements = replacements.filter(rep => {
    const searchLower = searchTerm.toLowerCase();
    const vehName = `${rep.vehicle?.nopol} ${rep.vehicle?.brand} ${rep.vehicle?.model}`.toLowerCase();
    const spName = rep.sparepart?.name?.toLowerCase() || '';
    return vehName.includes(searchLower) || spName.includes(searchLower);
  });

  if (authLoading || dataLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Pergantian</h2>
          <p className="text-slate-500">Catat setiap kali Anda mengganti sparepart kendaraan</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary whitespace-nowrap">
          + Catat Pergantian
        </button>
      </div>

      {isFormOpen && (
        <div className="card mb-8 border-t-4 border-t-blue-600">
          <h3 className="text-lg font-bold mb-4">Form Input Pergantian Sparepart</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Kendaraan</label>
              <select 
                value={formData.vehicle_id} 
                onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})} 
                className="input-field" 
                required
              >
                <option value="">-- Pilih Kendaraan --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.nopol} - {v.brand} {v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Sparepart</label>
              <select 
                value={formData.sparepart_id} 
                onChange={(e) => setFormData({...formData, sparepart_id: e.target.value})} 
                className="input-field" 
                required
              >
                <option value="">-- Pilih Sparepart --</option>
                {spareparts.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name} (Ganti tiap {formatNumber(sp.replacement_km)} KM)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">KM Saat Dipasang</label>
              <input 
                type="text" 
                value={formatNumber(formData.km_installed)} 
                onChange={(e) => setFormData({...formData, km_installed: parseNumber(e.target.value)})} 
                className="input-field" 
                required 
                placeholder="Contoh: 15.200" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Dipasang</label>
              <input 
                type="date" 
                value={formData.date_installed} 
                onChange={(e) => setFormData({...formData, date_installed: e.target.value})} 
                className="input-field" 
                required 
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Edit Riwayat</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">KM Saat Dipasang</label>
                <input 
                  type="text" 
                  value={formatNumber(editFormData.km_installed)} 
                  onChange={(e) => setEditFormData({...editFormData, km_installed: parseNumber(e.target.value)})} 
                  className="input-field" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Dipasang</label>
                <input 
                  type="date" 
                  value={editFormData.date_installed} 
                  onChange={(e) => setEditFormData({...editFormData, date_installed: e.target.value})} 
                  className="input-field" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="btn-primary bg-amber-500 hover:bg-amber-600">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
          <i className="fa-solid fa-search text-slate-400 mr-2"></i>
          <input 
            type="text" 
            placeholder="Cari riwayat ganti (Nopol, Kendaraan, Sparepart)..." 
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-700">Tanggal</th>
                <th className="py-3 px-4 font-bold text-slate-700">Kendaraan</th>
                <th className="py-3 px-4 font-bold text-slate-700">Sparepart</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-right">KM Terpasang</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-center w-24 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReplacements.map((rep) => (
                <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-600 text-sm">{formatDate(rep.date_installed)}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{rep.vehicle?.nopol}</td>
                  <td className="py-3 px-4 text-slate-700">{rep.sparepart?.name}</td>
                  <td className="py-3 px-4 text-slate-600 text-right font-medium">{formatNumber(rep.km_installed)}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button 
                      onClick={() => openEditModal(rep)}
                      className="text-amber-500 hover:text-amber-700 mr-3" title="Edit"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(rep.id)}
                      className="text-red-500 hover:text-red-700" title="Hapus"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReplacements.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    Belum ada riwayat pergantian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
