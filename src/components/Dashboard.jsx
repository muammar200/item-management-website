import React, { useState, useEffect } from 'react';
import { Package, Layers, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../api';

export default function Dashboard({ items, categories }) {
  const [totalItems, setTotalItems] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    setTotalItems(items.length);
    setTotalCategories(categories.length);

    let qty = 0;
    let value = 0;
    let lowStock = 0;

    items.forEach(item => {
      qty += item.quantity;
      value += (item.quantity * item.price);
      if (item.quantity < 10) {
        lowStock++;
      }
    });

    setTotalQuantity(qty);
    setTotalValue(value);
    setLowStockCount(lowStock);
  }, [items, categories]);

  // Group items by category to make a beautiful custom visual chart
  const categoryStats = categories.map(cat => {
    const catItems = items.filter(i => i.category_id === cat.id);
    const totalCatQty = catItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalCatVal = catItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    return {
      name: cat.name,
      count: catItems.length,
      quantity: totalCatQty,
      value: totalCatVal
    };
  });

  const maxQuantity = Math.max(...categoryStats.map(c => c.quantity), 1);

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 rounded-xl p-3">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalQuantity}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 rounded-xl p-3">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Asset Value</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 truncate">
              ${totalValue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-amber-50 text-amber-600 rounded-xl p-3">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalCategories}</p>
          </div>
          <div className="bg-purple-50 text-purple-600 rounded-xl p-3">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid of Chart + Low Stock Alert Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Visual Category Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-indigo-950 mb-1">Stock Level by Category</h2>
          <p className="text-xs text-gray-400 mb-6">Visual distribution of items' stock quantities in each category</p>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">Belum ada kategori yang ditambahkan.</p>
            ) : (
              categoryStats.map((stat, idx) => {
                const percentage = (stat.quantity / maxQuantity) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700">{stat.name}</span>
                      <span className="text-gray-500">{stat.quantity} Units ({stat.count} items)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-1 text-amber-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-lg font-bold text-indigo-950">Low Stock Alert</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Items with quantity under 10 units</p>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-56">
            {items.filter(item => item.quantity < 10).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                <p className="text-sm font-medium text-emerald-600">All stocks healthy</p>
                <p className="text-xs text-gray-400 mt-1">No items under 10 units.</p>
              </div>
            ) : (
              items
                .filter(item => item.quantity < 10)
                .map((item, idx) => {
                  const categoryName = categories.find(c => c.id === item.category_id)?.name || 'Uncategorized';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/40"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{categoryName}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-rose-100 text-rose-700">
                          {item.quantity} left
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">${item.price}</p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
