import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { api } from './api';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import ItemsPage from './components/ItemsPage';
import CategoriesPage from './components/CategoriesPage';
import UsersPage from './components/UsersPage';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('item_mgmt_db_users'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // App-wide collections
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load user session on initial render
  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Fetch items and categories if logged in
  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [fetchedItems, fetchedCategories] = await Promise.all([
        api.getItems(),
        api.getCategories(),
      ]);
      setItems(fetchedItems.data.data);
      setCategories(fetchedCategories.data.data);
    } catch (err) {
      console.error('Failed to load collections', err);
      showToast('Gagal memuat data dari server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Auth Success Handler
  const handleAuthSuccess = (loggedUser, isLogin) => {
    if (isLogin) {
      navigate('/dashboard', { replace: true });
    }
    setUser(loggedUser);
  };

  // Logout Handler
  const handleLogout = () => {
    api.logout();
    setUser(null);
    showToast('Logout berhasil. Sampai jumpa!', 'success');
    navigate('/login', { replace: true });
  };

  // --- Items CRUD actions ---
  const handleAddItem = async (itemPayload) => {
    try {
      await api.createItem(itemPayload);
      await fetchData();
      showToast('Item berhasil ditambahkan!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan item.', 'error');
      throw err;
    }
  };

  const handleUpdateItem = async (id, itemPayload) => {
    try {
      await api.updateItem(id, itemPayload);
      await fetchData();
      showToast('Item berhasil diperbarui!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui item.', 'error');
      throw err;
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      await fetchData();
      showToast('Item telah dihapus!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal menghapus item.', 'error');
      throw err;
    }
  };

  // --- Categories CRUD actions ---
  const handleAddCategory = async (catName) => {
    try {
      await api.createCategory(catName);
      await fetchData();
      showToast('Kategori berhasil dibuat!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal membuat kategori.', 'error');
      throw err;
    }
  };

  const handleUpdateCategory = async (id, catName) => {
    try {
      await api.updateCategory(id, catName);
      await fetchData();
      showToast('Kategori berhasil diperbarui!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui kategori.', 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      await fetchData();
      showToast('Kategori telah dihapus!', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal menghapus kategori.', 'error');
      throw err;
    }
  };

  // Define tab headers to pass as pageTitle
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/items':
        return 'Items Management';
      case '/categories':
        return 'Categories Management';
      // case '/users':
      //   return 'Users list';
      default:
        return 'ItemManager';
    }
  };

  return (
    <>
      {/* Global Toaster */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />
      )}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<AuthPage key="login" isLogin={true} onAuthSuccess={handleAuthSuccess} showToast={showToast} />}
        />
        <Route
          path="/register"
          element={<AuthPage key="register" isLogin={false} onAuthSuccess={handleAuthSuccess} showToast={showToast} />}
        />

        {/* Protected Routes inside Layout */}
        <Route
          path="/"
          element={
            <Layout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              handleLogout={handleLogout}
              pageTitle={getPageTitle()}
            />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={<Dashboard items={items} categories={categories} />}
          />
          <Route
            path="items"
            element={
              <ItemsPage
                items={items}
                categories={categories}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="categories"
            element={
              <CategoriesPage
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                isLoading={isLoading}
              />
            }
          />
          {/* <Route path="users" element={<UsersPage />} /> */}
          {/* Catch-all redirects within app to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Global Catch-all redirect */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}

// Layout helper component for nested routes
function Layout({
  user,
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
  pageTitle,
}) {
  return (
    <div id="app-layout" className="min-h-screen bg-indigo-50/50 flex">
      {/* Responsive Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
          user={user}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
