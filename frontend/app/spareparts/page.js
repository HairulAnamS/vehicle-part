"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAPI } from '../../lib/api';
import { formatNumber, parseNumber } from '../../lib/utils';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

export default function Spareparts() {
  const { user, loading: authLoading } = useAuth();
  const [spareparts, setSpareparts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', replacement_km: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: '', name: '', replacement_km: '' });

  useEffect(() => {
    if (authLoading || !user) return;
    loadSpareparts();
  }, [authLoading, user]);

  const loadSpareparts = async () => {
    try {
      const data = await fetchAPI('/spareparts');
      setSpareparts(data);
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
      await fetchAPI('/spareparts', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          replacement_km: parseInt(formData.replacement_km) || 0
        })
      });
      Swal.close();
      setIsFormOpen(false);
      setFormData({ name: '', replacement_km: '' });
      loadSpareparts();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await fetchAPI(`/spareparts/${editFormData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editFormData.name,
          replacement_km: parseInt(editFormData.replacement_km) || 0
        })
      });
      Swal.close();
      setIsEditModalOpen(false);
      loadSpareparts();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan menghapus sparepart ini!",
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
        await fetchAPI(`/spareparts/${id}`, {
          method: 'DELETE'
        });
        Swal.close();
        loadSpareparts();
      } catch (err) {
        if (err.message.includes('riwayat')) {
          Swal.fire('Peringatan', err.message, 'warning');
        } else {
          Swal.fire('Error', err.message, 'error');
        }
      }
    }
  };

  const openEditModal = (sp) => {
    setEditFormData({
      id: sp.id,
      name: sp.name,
      replacement_km: sp.replacement_km
    });
    setIsEditModalOpen(true);
  };

  const filteredSpareparts = spareparts.filter(sp => 
    sp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || dataLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Sparepart</h2>
          <p className="text-slate-500">Kelola jenis sparepart dan interval pergantiannya</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary whitespace-nowrap">
          + Tambah Sparepart
        </button>
      </div>

      {isFormOpen && (
        <div className="card mb-8 border-t-4 border-t-blue-600">
          <h3 className="text-lg font-bold mb-4">Tambah Master Sparepart</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Sparepart</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required placeholder="Contoh: Oli Mesin" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Setting Ganti (Per KM)</label>
              <input type="text" value={formatNumber(formData.replacement_km)} onChange={(e) => setFormData({...formData, replacement_km: parseNumber(e.target.value)})} className="input-field" required placeholder="Contoh: 2.000" />
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
            <h3 className="text-lg font-bold mb-4">Edit Master Sparepart</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Sparepart</label>
                <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="input-field" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Setting Ganti (Per KM)</label>
                <input type="text" value={formatNumber(editFormData.replacement_km)} onChange={(e) => setEditFormData({...editFormData, replacement_km: parseNumber(e.target.value)})} className="input-field" required />
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
            placeholder="Cari sparepart..." 
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-700">Nama Sparepart</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-right">Interval Penggantian (KM)</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-center w-24 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpareparts.map((sp) => (
                <tr key={sp.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-800 font-medium">{sp.name}</td>
                  <td className="py-3 px-4 text-slate-600 text-right">{formatNumber(sp.replacement_km)}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button onClick={() => openEditModal(sp)} className="text-amber-500 hover:text-amber-700 mr-3" title="Edit">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onClick={() => handleDelete(sp.id)} className="text-red-500 hover:text-red-700" title="Hapus">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSpareparts.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-500">
                    Belum ada data sparepart.
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
