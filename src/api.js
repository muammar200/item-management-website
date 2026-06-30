import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('item_mgmt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || '';
    const isAuthEndpoint = url.includes('/login') || url.includes('/register');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      localStorage.removeItem('item_mgmt_token');
      localStorage.removeItem('item_mgmt_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
)

// State emulation for offline/fallback mode using LocalStorage
const INITIAL_USERS = [
  { id: 'u1', username: 'admin', email: 'admin@example.com', password: 'admin123' },
  { id: 'u2', username: 'hello.asrarulikram', email: 'hello.asrarulikram@gmail.com', password: 'user123' }
];

const INITIAL_CATEGORIES = [
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Furniture' },
  { id: 'cat3', name: 'Apparel' },
  { id: 'cat4', name: 'Office Supplies' },
];

const INITIAL_ITEMS = [
  { id: 'item1', name: 'ThinkPad Laptop', quantity: 15, price: 1200, category_id: 'cat1' },
  { id: 'item2', name: 'Ergonomic Desk Chair', quantity: 8, price: 250, category_id: 'cat2' },
  { id: 'item3', name: 'Cotton Crewneck T-Shirt', quantity: 50, price: 25, category_id: 'cat3' },
  { id: 'item4', name: 'Wireless Bluetooth Mouse', quantity: 30, price: 45, category_id: 'cat1' },
  { id: 'item5', name: 'Mechanical Keyboard', quantity: 20, price: 89, category_id: 'cat1' },
  { id: 'item6', name: 'Filing Cabinet 3-Drawer', quantity: 5, price: 180, category_id: 'cat4' },
  { id: 'item7', name: 'LED Desk Lamp', quantity: 12, price: 35, category_id: 'cat4' },
];

function getStoredData(key, initial) {
  const data = localStorage.getItem(`item_mgmt_db_${key}`);
  if (!data) {
    localStorage.setItem(`item_mgmt_db_${key}`, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function setStoredData(key, data) {
  localStorage.setItem(`item_mgmt_db_${key}`, JSON.stringify(data));
}

// Emulated Database Services
const db = {
  getUsers: () => getStoredData('users', INITIAL_USERS),
  setUsers: (users) => setStoredData('users', users),
  getCategories: () => getStoredData('categories', INITIAL_CATEGORIES),
  setCategories: (cats) => setStoredData('categories', cats),
  getItems: () => getStoredData('items', INITIAL_ITEMS),
  setItems: (items) => setStoredData('items', items),
};

// Check if we should fall back to localStorage (if local backend is offline or throws network error)
async function withFallback(apiCall, fallbackFn) {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    // If it's a network error (backend offline) or timeout, use fallback
    if (!error.response || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.warn('API Endpoint http://localhost:8000 is offline. Falling back to stateful LocalStorage db.');
      return fallbackFn();
    }
    // If it is an actual backend error response, propagate it
    throw error.response?.data || error;
  }
}

function persistSession(token, user) {
  if (token) localStorage.setItem('item_mgmt_token', token);
  if (user) localStorage.setItem('item_mgmt_user', JSON.stringify(user));
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const result = await withFallback(
      () => axiosInstance.post('/api/v1/login', { email, password }),
      () => {
        const users = db.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          throw new Error('Email/Username atau password salah.');
        }
        const token = `mock-jwt-token-${user.id}-${Date.now()}`;
        return { status: 'success', data: { token, user: { id: user.id, email: user.email } }, message: 'User logged in' };
      }
    );
    persistSession(result?.data?.token, result?.data?.user);
    return result;
  },

  register: async (name, email, password, password_confirmation) => {
    const result = await withFallback(
      () => axiosInstance.post('/api/v1/register', { name, email, password, password_confirmation }),
      () => {
        const users = db.getUsers();
        if (users.some(u => u.email === email)) {
          throw new Error('Email sudah terdaftar.');
        }
        const newUser = { id: `u_${Date.now()}`, name, email, password };
        users.push(newUser);
        db.setUsers(users);

        const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
        return { status: 'success', data: { token, user: { id: newUser.id, name: newUser.name, email: newUser.email } }, message: 'User registered' };
      }
    );
    persistSession(result?.data?.token, result?.data?.user);
    return result;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('item_mgmt_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: () => {
    localStorage.removeItem('item_mgmt_token');
    localStorage.removeItem('item_mgmt_user');
  },

  // Users List (to populate the Users sidebar option beautifully)
  getUsers: async () => {
    return withFallback(
      () => axiosInstance.get('/api/users'),
      () => db.getUsers().map(u => ({ id: u.id, username: u.username, email: u.email }))
    );
  },

  // Categories CRUD
  getCategories: async () => {
    return axiosInstance.get('/api/v1/categories');
  },

  createCategory: async (categoryName) => {
    return withFallback(
      () => axiosInstance.post('/api/v1/categories', { name: categoryName }),
      () => {
        const cats = db.getCategories();
        if (cats.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
          throw new Error('Kategori sudah ada.');
        }
        const newCat = { id: `cat_${Date.now()}`, name: categoryName };
        cats.push(newCat);
        db.setCategories(cats);
        return newCat;
      }
    );
  },

  updateCategory: async (id, categoryName) => {
    return withFallback(
      () => axiosInstance.put(`/api/v1/categories/${id}`, { name: categoryName }),
      () => {
        const cats = db.getCategories();
        const index = cats.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Kategori tidak ditemukan.');
        if (cats.some(c => c.id !== id && c.name.toLowerCase() === categoryName.toLowerCase())) {
          throw new Error('Kategori dengan nama tersebut sudah ada.');
        }
        cats[index].name = categoryName;
        db.setCategories(cats);
        return cats[index];
      }
    );
  },

  deleteCategory: async (id) => {
    return withFallback(
      () => axiosInstance.delete(`/api/v1/categories/${id}`),
      () => {
        const cats = db.getCategories();
        const filtered = cats.filter(c => c.id !== id);
        db.setCategories(filtered);
        // Also remove or clean items that belong to this deleted category to avoid orphans
        const items = db.getItems();
        const updatedItems = items.map(item => {
          if (item.id === id) {
            return { ...item, id: '' }; // assign to empty/uncategorized
          }
          return item;
        });
        db.setItems(updatedItems);
        return { success: true };
      }
    );
  },

  // Items CRUD
  getItems: async () => {
    return axiosInstance.get('/api/v1/items');
  },

  createItem: async (itemData) => {
    return withFallback(
      () => axiosInstance.post('/api/v1/items', itemData),
      () => {
        const items = db.getItems();
        const newItem = {
          id: `item_${Date.now()}`,
          name: itemData.name,
          quantity: parseInt(itemData.quantity) || 0,
          price: parseFloat(itemData.price) || 0,
          category_id: itemData.category_id,
        };
        items.push(newItem);
        db.setItems(items);
        return newItem;
      }
    );
  },

  updateItem: async (id, itemData) => {
    return withFallback(
      () => axiosInstance.put(`/api/v1/items/${id}`, itemData),
      () => {
        const items = db.getItems();
        const index = items.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Item tidak ditemukan.');
        items[index] = {
          ...items[index],
          name: itemData.name,
          quantity: parseInt(itemData.quantity) || 0,
          price: parseFloat(itemData.price) || 0,
          category_id: itemData.category_id,
        };
        db.setItems(items);
        return items[index];
      }
    );
  },

  deleteItem: async (id) => {
    return withFallback(
      () => axiosInstance.delete(`/api/v1/items/${id}`),
      () => {
        const items = db.getItems();
        const filtered = items.filter(i => i.id !== id);
        db.setItems(filtered);
        return { success: true };
      }
    );
  }
};
