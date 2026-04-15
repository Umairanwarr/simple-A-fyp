import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

const CATEGORY_OPTIONS = [
  'Painkiller', 'Antibiotic', 'Antiviral', 'Antifungal', 'Vitamin & Supplement',
  'Cardiovascular', 'Diabetes', 'Respiratory', 'Dermatology', 'Gastrointestinal',
  'Surgical Supply', 'First Aid', 'Eye & Ear Care', 'Other'
];

export default function StoreInventory() {
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'instock' | 'outofstock'
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '', brand: '', price: '', stock: '', category: '', description: ''
  });

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form submission overlay loader
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`http://localhost:3002/api/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      toast.error('Failed to load inventory.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalItems = medicines.length;
    const inStock = medicines.filter(m => m.status === 'In Stock').length;
    const outOfStock = medicines.filter(m => m.status === 'Out of Stock').length;
    const totalValue = medicines.reduce((acc, m) => acc + (m.price * m.stock), 0);
    return { totalItems, inStock, outOfStock, totalValue };
  }, [medicines]);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentMedicine({ name: '', brand: '', price: '', stock: '', category: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setIsEditing(true);
    setCurrentMedicine(medicine);
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentMedicine({ name: '', brand: '', price: '', stock: '', category: '', description: '' });
    setItemToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedicine(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!currentMedicine.name || !currentMedicine.brand || currentMedicine.price === '' || currentMedicine.stock === '') {
      toast.error('Please fill required fields (Name, Brand, Price, Stock).');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('medicalStoreToken');
      const url = isEditing 
        ? `http://localhost:3002/api/medicines/${currentMedicine._id}`
        : `http://localhost:3002/api/medicines`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentMedicine,
          price: Number(currentMedicine.price),
          stock: Number(currentMedicine.stock)
        })
      });

      if (!res.ok) throw new Error('Failed to save medicine');
      
      await fetchMedicines();
      toast.success(isEditing ? 'Medicine updated successfully' : 'Medicine added successfully');
      closeModals();
    } catch (err) {
      toast.error('Something went wrong saving the item.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (medicine) => {
    setItemToDelete(medicine);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`http://localhost:3002/api/medicines/${itemToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete medicine');
      
      setMedicines(prev => prev.filter(m => m._id !== itemToDelete._id));
      toast.success('Medicine deleted successfully');
      closeModals();
    } catch (err) {
      toast.error('Failed to delete item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (m.brand && m.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (activeFilter === 'instock') return matchesSearch && m.status === 'In Stock';
      if (activeFilter === 'outofstock') return matchesSearch && m.status === 'Out of Stock';
      return matchesSearch;
    });
  }, [medicines, searchTerm, activeFilter]);

  return (
    <div className="space-y-6">

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: 'Total Medicines', value: isLoading ? '--' : stats.totalItems, icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          ), color: 'bg-[#ECFCFB] text-[#1EBDB8]' },
          { label: 'In Stock', value: isLoading ? '--' : stats.inStock, icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ), color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Out of Stock', value: isLoading ? '--' : stats.outOfStock, icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          ), color: 'bg-rose-50 text-rose-500' },
          { label: 'Inventory Value', value: isLoading ? '--' : `Rs ${stats.totalValue.toLocaleString()}`, icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          ), color: 'bg-amber-50 text-amber-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-5 sm:p-6 rounded-[24px] shadow-sm border border-gray-100 hover:border-[#1EBDB8]/35 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] sm:text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">{stat.label}</p>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-[22px] sm:text-[26px] leading-tight font-bold text-[#1F2432]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Main Table Container ─── */}
      <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-[#1F2432]">Medicine Listings</h3>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">{filteredMedicines.length} {filteredMedicines.length === 1 ? 'item' : 'items'} found</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full sm:w-[240px] border border-gray-100 rounded-2xl bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/30 transition-all"
              />
            </div>

            {/* Add Medicine */}
            <button 
              onClick={openAddModal}
              className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2.5 text-[14px] font-bold transition-all shadow-lg shadow-[#1EBDB8]/20 hover:shadow-[#1EBDB8]/30 active:scale-[0.97]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Medicine
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-5 sm:px-8 pb-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'instock', label: 'In Stock' },
            { id: 'outofstock', label: 'Out of Stock' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id 
                  ? 'bg-[#1F2432] text-white shadow-sm' 
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin"></div>
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading inventory...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-[#F3F4F6] rounded-[28px] flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#D1D5DB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <h4 className="text-[18px] font-bold text-[#1F2432] mb-1">No medicines found</h4>
            <p className="text-[14px] text-[#9CA3AF] text-center max-w-sm mb-6">
              {searchTerm || activeFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first medicine to the inventory.'}
            </p>
            {!searchTerm && activeFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-[#1EBDB8]/20 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add First Medicine
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-t border-b border-gray-100">
                    <th className="py-3.5 px-5 sm:px-8 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Medicine</th>
                    <th className="py-3.5 px-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Category</th>
                    <th className="py-3.5 px-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Price</th>
                    <th className="py-3.5 px-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Stock</th>
                    <th className="py-3.5 px-4 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF]">Status</th>
                    <th className="py-3.5 px-5 sm:px-8 text-[12px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map(medicine => (
                    <tr key={medicine._id} className="border-b border-gray-100 last:border-b-0 hover:bg-[#F9FAFB] transition-colors group">
                      <td className="py-4 px-5 sm:px-8">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-[#ECFCFB] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#1F2432]">{medicine.name}</p>
                            <p className="text-[12px] font-medium text-[#9CA3AF]">{medicine.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[13px] font-medium text-[#6B7280]">{medicine.category || '—'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[14px] font-bold text-[#1F2432]">Rs {Number(medicine.price).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[14px] font-bold ${medicine.stock <= 10 && medicine.stock > 0 ? 'text-amber-600' : 'text-[#1F2432]'}`}>
                          {medicine.stock}
                          {medicine.stock <= 10 && medicine.stock > 0 && (
                            <span className="ml-1.5 text-[11px] font-bold text-amber-500 uppercase">Low</span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold border ${
                          medicine.status === 'In Stock' 
                            ? 'bg-[#ECFCFB] text-[#1EBDB8] border-[#1EBDB8]/20' 
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {medicine.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 sm:px-8 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(medicine)}
                            className="p-2.5 text-[#9CA3AF] hover:text-[#1EBDB8] hover:bg-[#ECFCFB] rounded-xl transition-all"
                            title="Edit"
                          >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={() => confirmDelete(medicine)}
                            className="p-2.5 text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden px-5 pb-6 space-y-4">
              {filteredMedicines.map(medicine => (
                <div key={medicine._id} className="bg-[#F9FAFB] rounded-[20px] p-4 border border-gray-100 hover:border-[#1EBDB8]/25 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ECFCFB] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#1F2432]">{medicine.name}</h3>
                        <p className="text-[12px] font-medium text-[#9CA3AF]">{medicine.brand} {medicine.category ? `· ${medicine.category}` : ''}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border shrink-0 ${
                      medicine.status === 'In Stock' 
                        ? 'bg-[#ECFCFB] text-[#1EBDB8] border-[#1EBDB8]/20' 
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {medicine.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-50">
                      <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Price</div>
                      <div className="text-[15px] font-bold text-[#1F2432]">Rs {Number(medicine.price).toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-50">
                      <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Stock</div>
                      <div className="text-[15px] font-bold text-[#1F2432]">{medicine.stock} <span className="text-[12px] font-medium text-[#9CA3AF]">units</span></div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => openEditModal(medicine)}
                      className="flex-1 bg-[#ECFCFB] text-[#1EBDB8] hover:bg-[#d8f7f6] py-2.5 rounded-xl text-[13px] font-bold transition-colors flex justify-center items-center gap-2 active:scale-[0.97]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => confirmDelete(medicine)}
                      className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 py-2.5 rounded-xl text-[13px] font-bold transition-colors flex justify-center items-center gap-2 active:scale-[0.97]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Add/Edit Modal ─── */}
      {isModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1F2432]/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden my-10">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
              <div>
                <h3 className="text-[18px] font-bold text-[#1F2432]">{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">{isEditing ? 'Update the details below' : 'Fill in the details for the new listing'}</p>
              </div>
              <button onClick={closeModals} className="p-2 text-[#9CA3AF] hover:text-[#1F2432] hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[13px] font-bold text-[#1F2432] mb-1.5">Medicine Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" required name="name" 
                      value={currentMedicine.name} onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none transition-all" 
                      placeholder="e.g. Panadol" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[13px] font-bold text-[#1F2432] mb-1.5">Brand / Company <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" required name="brand" 
                      value={currentMedicine.brand} onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none transition-all" 
                      placeholder="e.g. GSK" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[13px] font-bold text-[#1F2432] mb-1.5">Category</label>
                    <select
                      name="category"
                      value={currentMedicine.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] outline-none transition-all appearance-none"
                    >
                      <option value="">Select a category</option>
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[13px] font-bold text-[#1F2432] mb-1.5">Price (Rs) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-[13px] font-bold text-[#9CA3AF]">Rs</span>
                      </div>
                      <input 
                        type="number" required min="0" step="0.01" name="price" 
                        value={currentMedicine.price} onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none transition-all" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[13px] font-bold text-[#1F2432] mb-1.5">Stock Quantity <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" required min="0" name="stock" 
                      value={currentMedicine.stock} onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none transition-all" 
                      placeholder="0" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[13px] font-bold text-[#1F2432] mb-1.5">Description <span className="text-[#9CA3AF] font-medium">(Optional)</span></label>
                    <textarea 
                      name="description" rows="3" 
                      value={currentMedicine.description} onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8]/40 bg-[#F9FAFB] text-[14px] font-medium text-[#1F2432] placeholder:text-[#9CA3AF] outline-none resize-none transition-all" 
                      placeholder="Add dosage instructions, variants, or other details." 
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <button type="button" onClick={closeModals} disabled={isSubmitting} className="px-5 py-3 min-w-[100px] text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors disabled:opacity-50 active:scale-[0.97]">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-3 flex justify-center min-w-[120px] items-center gap-2 text-[13px] font-bold text-white bg-[#1EBDB8] rounded-xl hover:bg-[#1CAAAE] transition-all shadow-lg shadow-[#1EBDB8]/20 disabled:opacity-70 active:scale-[0.97]">
                    {isSubmitting ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : isEditing ? 'Save Changes' : 'Add Medicine'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {isDeleteModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1F2432]/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl p-7 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[22px] flex items-center justify-center mx-auto mb-5">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1F2432] mb-2">Delete Medicine?</h3>
            <p className="text-[14px] text-[#6B7280] mb-7">Are you sure you want to delete <span className="font-bold text-[#1F2432]">{itemToDelete?.name}</span>? This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <button onClick={closeModals} disabled={isSubmitting} className="flex-1 px-4 py-3 text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors active:scale-[0.97]">
                Keep It
              </button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-4 flex min-h-[46px] justify-center items-center py-3 text-[13px] font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 active:scale-[0.97]">
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
