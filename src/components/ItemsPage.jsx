import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, SlidersHorizontal, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ItemsPage({
  items,
  categories,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  isLoading
}) {
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // CRUD Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // null means adding new

  // Form input state
  const [formFields, setFormFields] = useState({
    name: '',
    quantity: '',
    price: '',
    category_id: '',
  });

  // Form Validation states
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedCategory(selectedCategory);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setAppliedSearch('');
    setAppliedCategory('');
    setCurrentPage(1);
  };

  // Filtered items computation
  const filteredItems = items?.filter((item) => {
    const matchesSearch = item?.name?.toLowerCase()?.includes(appliedSearch.toLowerCase());
    const matchesCategory = appliedCategory ? item.category_id === appliedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination computation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(Math.ceil(filteredItems.length / itemsPerPage), 1);

  // Reset page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredItems, totalPages, currentPage]);

  // Handle opening of ADD / EDIT form modal
  const openFormModal = (item = null) => {
    setSelectedItem(item);
    setFormErrors({});
    if (item) {
      setFormFields({
        name: item.name,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        category_id: item.category_id || '',
      });
    } else {
      setFormFields({
        name: '',
        quantity: '',
        price: '',
        category_id: categories[0]?.id || '',
      });
    }
    setIsFormModalOpen(true);
  };

  // Form validation before save
  const validateForm = () => {
    const errors = {};
    if (!formFields.name.trim()) {
      errors.name = 'Nama item tidak boleh kosong.';
    }

    const qty = parseInt(formFields.quantity);
    if (formFields.quantity === '' || isNaN(qty)) {
      errors.quantity = 'Quantity harus berupa angka.';
    } else if (qty < 0) {
      errors.quantity = 'Quantity tidak boleh negatif.';
    }

    const prc = parseFloat(formFields.price);
    if (formFields.price === '' || isNaN(prc)) {
      errors.price = 'Price harus berupa angka.';
    } else if (prc < 0) {
      errors.price = 'Price tidak boleh negatif.';
    }

    if (!formFields.category_id) {
      errors.category_id = 'Harap pilih salah satu kategori.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formFields.name.trim(),
        quantity: parseInt(formFields.quantity),
        price: parseFloat(formFields.price),
        category_id: formFields.category_id,
      };

      if (selectedItem) {
        await onUpdateItem(selectedItem.id, payload);
      } else {
        await onAddItem(payload);
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onDeleteItem(selectedItem.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="items-page-container" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950">Items</h2>
          <p className="text-sm text-gray-500">Kelola semua daftar item, stok, harga, dan kategori.</p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-all shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filter & Search Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-800 transition-all"
          />
        </div>

        {/* Category dropdown */}
        <div className="w-full md:w-60">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-800 transition-all cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleApplyFilters}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
          {(appliedSearch || appliedCategory) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-all focus:outline-none cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Skeletons */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded animate-pulse col-span-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-indigo-50/50">
                <tr>
                  <th className="py-3.5 px-6 font-semibold text-indigo-900">Name</th>
                  <th className="py-3.5 px-6 font-semibold text-indigo-900 text-center">Quantity</th>
                  <th className="py-3.5 px-6 font-semibold text-indigo-900 text-right">Price</th>
                  <th className="py-3.5 px-6 font-semibold text-indigo-900">Category</th>
                  <th className="py-3.5 px-6 font-semibold text-indigo-900 text-center">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-indigo-900 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      Tidak ada item ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const category = categories.find((c) => c.id === item.category_id);
                    const isLowStock = item.quantity < 10;
                    const isOutOfStock = item.quantity === 0;
                    return (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            {isLowStock && !isOutOfStock && (
                              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3" /> Stok hampir habis
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                              }`}
                          >
                            {item.quantity} Units
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-gray-900">
                          Rp {item.price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {category ? (
                            <span className="inline-block px-2.5 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                              {category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No Category</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isOutOfStock ? (
                            <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-semibold">Low Stock</span>
                          ) : (
                            <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold">In Stock</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openFormModal(item)}
                              className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              aria-label="Edit Item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md hover:text-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                              aria-label="Hapus Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              Showing {filteredItems.length ? indexOfFirstItem + 1 : 0} to{' '}
              {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all focus:outline-none ${currentPage === 1
                  ? 'border-gray-200 text-gray-400 bg-gray-50/50 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-xs font-bold transition-all focus:outline-none ${currentPage === i + 1
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-700 bg-white hover:bg-indigo-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all focus:outline-none ${currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 bg-gray-50/50 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Add/Edit Item Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {selectedItem ? 'Edit Item Details' : 'Add New Item'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-indigo-200 hover:text-white focus:outline-none text-2xl font-light"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Contoh: Asus Zenbook"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                  className={`w-full border rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${formErrors.name ? 'border-rose-500' : 'border-gray-300'
                    }`}
                />
                {formErrors.name && (
                  <p className="text-rose-500 text-xs font-medium mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Quantity + Price row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formFields.quantity}
                    onChange={(e) => setFormFields({ ...formFields, quantity: e.target.value })}
                    className={`w-full border rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${formErrors.quantity ? 'border-rose-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.quantity && (
                    <p className="text-rose-500 text-xs font-medium mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Price (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formFields.price}
                    onChange={(e) => setFormFields({ ...formFields, price: e.target.value })}
                    className={`w-full border rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${formErrors.price ? 'border-rose-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.price && (
                    <p className="text-rose-500 text-xs font-medium mt-1">{formErrors.price}</p>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Category</label>
                <select
                  value={formFields.category_id}
                  onChange={(e) => setFormFields({ ...formFields, category_id: e.target.value })}
                  className={`w-full border bg-white rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${formErrors.category_id ? 'border-rose-500' : 'border-gray-300'
                    }`}
                >
                  <option value="" disabled>Pilih kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="text-rose-500 text-xs font-medium mt-1">{formErrors.category_id}</p>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg transition-all focus:outline-none cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold px-5 py-2.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center gap-2 text-sm"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{selectedItem ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-scale-up space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
            </div>

            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus item <strong className="text-gray-900">"{selectedItem?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg transition-all focus:outline-none cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-semibold px-5 py-2.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center gap-2 text-sm"
              >
                {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
