import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function CategoriesPage({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means adding new

  // Form input state
  const [categoryName, setCategoryName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(Math.ceil(filteredCategories.length / itemsPerPage), 1);

  // Adjust page if it exceeds bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredCategories, totalPages, currentPage]);

  const openFormModal = (category = null) => {
    setSelectedCategory(category);
    setFormError('');
    if (category) {
      setCategoryName(category.name);
    } else {
      setCategoryName('');
    }
    setIsFormModalOpen(true);
  };

  // Validation
  const validateForm = () => {
    if (!categoryName.trim()) {
      setFormError('Nama kategori tidak boleh kosong.');
      return false;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === categoryName.trim().toLowerCase() &&
        c.id !== selectedCategory?.id
    );

    if (isDuplicate) {
      setFormError('Nama kategori tersebut sudah ada.');
      return false;
    }

    setFormError('');
    return true;
  };

  // Save Category
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (selectedCategory) {
        await onUpdateCategory(selectedCategory.id, categoryName.trim());
      } else {
        await onAddCategory(categoryName.trim());
      }
      setIsFormModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onDeleteCategory(selectedCategory.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="categories-page-container" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-950">Categories</h2>
          <p className="text-sm text-gray-500">Kelola kategori yang digunakan untuk memisahkan daftar item.</p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-all shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-800 transition-all"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleApplyFilters}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer text-sm"
          >
            <span>Filter</span>
          </button>
          {appliedSearch && (
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-all focus:outline-none cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Loading skeletons */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded animate-pulse col-span-3" />
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
                  <th className="py-3.5 px-6 font-semibold text-indigo-900 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-12 text-center text-gray-400">
                      Tidak ada kategori ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{cat.name}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openFormModal(cat)}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Edit Kategori"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md hover:text-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                            aria-label="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              Showing {filteredCategories.length ? indexOfFirstItem + 1 : 0} to{' '}
              {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} categories
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

      {/* Category Add/Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-indigo-200 hover:text-white focus:outline-none text-2xl font-light"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Category Name</label>
                <input
                  type="text"
                  placeholder="Contoh: Electronics"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${formError ? 'border-rose-500' : 'border-gray-300'
                    }`}
                />
                {formError && (
                  <p className="text-rose-500 text-xs font-medium mt-1">{formError}</p>
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
                  <span>{selectedCategory ? 'Update' : 'Save'}</span>
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
              Apakah Anda yakin ingin menghapus kategori <strong className="text-gray-900">"{selectedCategory?.name}"</strong>? Semua item yang ada dalam kategori ini akan berubah menjadi <strong className="text-gray-950">tidak memiliki kategori</strong>. Tindakan ini tidak dapat dibatalkan.
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
