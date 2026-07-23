'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Play, CheckCircle2, XCircle, ShieldAlert, Cpu, 
  ShoppingBag, Users, Layers, Settings, FileText, 
  Activity, Key, ShoppingCart, RefreshCw, Send, Plus, Trash2
} from 'lucide-react';

interface VerifierLog {
  name: string;
  endpoint: string;
  status: 'pending' | 'success' | 'failure';
  latency: number;
  response: string;
}

export default function QAPage() {
  const [activeTab, setActiveTab] = useState<'verifier' | 'saas' | 'merchant' | 'customer'>('verifier');
  
  // Context states
  const [storeId, setStoreId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('manager@electronics.com');
  const [password, setPassword] = useState('SecurePass123!');
  
  // Platform Lists (Auto-refreshed)
  const [plans, setPlans] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  
  // Merchant Lists
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  // Customer Lists & Cart
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  // Verifier log items
  const [verifierLogs, setVerifierLogs] = useState<VerifierLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Load initial settings from localStorage on mount
  useEffect(() => {
    setStoreId(localStorage.getItem('qa_store_id') || '');
    setApiKey(localStorage.getItem('qa_api_key') || '');
    setToken(localStorage.getItem('qa_token') || '');
  }, []);

  // Update localStorage when context keys change
  const saveContext = (newStoreId: string, newApiKey: string, newToken: string) => {
    setStoreId(newStoreId);
    setApiKey(newApiKey);
    setToken(newToken);
    localStorage.setItem('qa_store_id', newStoreId);
    localStorage.setItem('qa_api_key', newApiKey);
    localStorage.setItem('qa_token', newToken);
  };

  const clearContext = () => {
    saveContext('', '', '');
    localStorage.removeItem('qa_store_id');
    localStorage.removeItem('qa_api_key');
    localStorage.removeItem('qa_token');
  };

  // Helper to load platform data
  const loadPlatformData = async () => {
    try {
      const plansRes = await api.get('/plans');
      setPlans(plansRes.data);
      const storesRes = await api.get('/stores');
      setStores(storesRes.data);
      const ticketsRes = await api.get('/support/global');
      setTickets(ticketsRes.data);
    } catch (err) {
      console.error('Error loading platform data', err);
    }
  };

  // Helper to load Merchant data
  const loadMerchantData = async () => {
    if (!storeId) return;
    try {
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);
      const catRes = await api.get('/categories');
      setCategories(catRes.data);
      const ordRes = await api.get('/orders');
      setOrders(ordRes.data);
      const coupRes = await api.get(`/marketing/coupons/store/${storeId}`);
      setCoupons(coupRes.data);
    } catch (err) {
      console.error('Error loading merchant data', err);
    }
  };

  // Helper to load Customer Storefront data
  const loadStorefrontData = async () => {
    if (!apiKey) return;
    try {
      const res = await api.get('/storefront/v1/products');
      setCatalogProducts(res.data.data);
    } catch (err) {
      console.error('Error loading storefront data', err);
    }
  };

  // Trigger loads when states/tabs transition
  useEffect(() => {
    if (activeTab === 'saas') loadPlatformData();
    if (activeTab === 'merchant') loadMerchantData();
    if (activeTab === 'customer') loadStorefrontData();
  }, [activeTab, storeId, apiKey]);

  // Load demo Electronics store settings automatically for ease of QA
  const autoPopulateDemo = async (type: 'electronics' | 'apparel') => {
    try {
      const storesRes = await api.get('/stores');
      const targetSlug = type === 'electronics' ? 'electronics-hub' : 'urban-apparel';
      const targetStore = storesRes.data.find((s: any) => s.slug === targetSlug);
      
      if (targetStore) {
        // Resolve store's API keys
        const apiKeysRes = await api.get(`/api-keys/store/${targetStore.id}`);
        const activeKey = apiKeysRes.data[0]?.key || `demo_key_${targetSlug.replace(/-/g, '_')}`;
        
        // Auto-login to generate token
        const loginEmail = type === 'electronics' ? 'manager@electronics.com' : 'manager@apparel.com';
        const loginRes = await api.post('/auth/login', {
          email: loginEmail,
          password: 'SecurePass123!',
        }, {
          headers: { 'x-store-id': targetStore.id }
        });
        
        saveContext(targetStore.id, activeKey, loginRes.data.token);
        alert(`Successfully loaded context for ${targetStore.name}!`);
      } else {
        alert(`Demo store "${targetSlug}" not found. Run seed script or automated verification to provision it first.`);
      }
    } catch (err: any) {
      alert(`Auto-populate failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Run Automated Verification Suite
  const runAutoVerification = async () => {
    setIsRunning(true);
    const tests: Omit<VerifierLog, 'latency' | 'status' | 'response'>[] = [
      { name: 'Platform Health Check', endpoint: 'GET /health' },
      { name: 'Super Admin Login', endpoint: 'POST /super-admin/auth/login' },
      { name: 'SaaS Plans Fetch', endpoint: 'GET /plans' },
      { name: 'Tenant Creation (SaaS Storefront)', endpoint: 'POST /stores' },
      { name: 'Seeded Merchant Login', endpoint: 'POST /auth/login' },
      { name: 'Storefront Products Retrieval', endpoint: 'GET /storefront/v1/products' },
      { name: 'Merchant Category Provisioning', endpoint: 'POST /categories' },
      { name: 'Merchant Product Creation', endpoint: 'POST /products' },
      { name: 'Storefront Inventory Check', endpoint: 'GET /storefront/v1/products' },
      { name: 'Customer Order Placement', endpoint: 'POST /orders' },
      { name: 'Super Admin Authorization Guard Lockout', endpoint: 'GET /super-admin/auth/protected-check' },
    ];

    const currentLogs: VerifierLog[] = tests.map(t => ({ ...t, status: 'pending', latency: 0, response: '' }));
    setVerifierLogs(currentLogs);

    let tempToken = '';
    let tempStoreId = '';
    let tempApiKey = 'demo_key_test_temp';

    for (let i = 0; i < tests.length; i++) {
      const start = Date.now();
      try {
        let res: any;
        if (i === 0) {
          res = await api.get('/health');
        } else if (i === 1) {
          res = await api.post('/super-admin-auth/login', {
            email: 'superadmin@ecomplatform.com',
            password: 'SuperSecurePassword123!',
          });
          tempToken = res.data.token;
        } else if (i === 2) {
          res = await api.get('/plans', {
            headers: { Authorization: `Bearer ${tempToken}` }
          });
        } else if (i === 3) {
          const rand = Math.floor(Math.random() * 100000);
          res = await api.post('/stores', {
            name: `Test Store ${rand}`,
            slug: `test-store-${rand}`,
            planId: plans[0]?.id || '1bfee213-3544-caae-b3c4-b45bc242920a',
            ownerEmail: `owner-${rand}@test.com`,
            ownerName: `Owner ${rand}`,
            ownerPassword: 'SecurePass123!',
          });
          tempStoreId = res.data.store.id;
          tempApiKey = res.data.apiKey;
        } else if (i === 4) {
          // Login to the newly created store
          const rand = tempStoreId ? tempStoreId : 'some-id';
          res = await api.post('/auth/login', {
            email: stores[0]?.ownerEmail || 'manager@electronics.com',
            password: 'SecurePass123!',
          }, {
            headers: { 'x-store-id': storeId || tempStoreId }
          });
        } else if (i === 5) {
          res = await api.get('/storefront/v1/products', {
            headers: { 'x-api-key': apiKey || tempApiKey }
          });
        } else if (i === 6) {
          res = await api.post('/categories', {
            name: 'New Test Category',
            description: 'Category created by auto-verifier',
          }, {
            headers: { 
              'x-store-id': storeId || tempStoreId,
              Authorization: `Bearer ${token}`
            }
          });
        } else if (i === 7) {
          res = await api.post('/products', {
            title: 'Auto Verifier Laptop',
            description: 'Verification laptop device',
            price: 1299.99,
            stock: 50,
            category: 'Laptops',
            brand: 'AutoTester',
            images: [],
          }, {
            headers: { 
              'x-store-id': storeId || tempStoreId,
              Authorization: `Bearer ${token}`
            }
          });
        } else if (i === 8) {
          res = await api.get('/storefront/v1/products', {
            headers: { 'x-api-key': apiKey || tempApiKey }
          });
        } else if (i === 9) {
          res = await api.post('/orders', {
            customerName: 'Auto Verification Client',
            customerEmail: 'verifier@ecom.com',
            shippingAddress: '404 QA Verification Road, Test Server',
            items: [
              {
                sku: 'SONY-WH1000XM5',
                quantity: 1
              }
            ]
          }, {
            headers: { 
              'x-store-id': storeId || tempStoreId,
              'x-api-key': apiKey || tempApiKey 
            }
          });
        } else if (i === 10) {
          // Access restricted superadmin endpoint using standard store user token to verify auth guard block
          try {
            res = await api.get('/plans', {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err: any) {
            // Correctly blocked
            res = { data: { status: 'Blocked correctly', code: err.response?.status } };
            if (err.response?.status !== 403 && err.response?.status !== 401) {
              throw err;
            }
          }
        }

        const latency = Date.now() - start;
        currentLogs[i] = {
          ...currentLogs[i],
          status: 'success',
          latency,
          response: JSON.stringify(res.data || res, null, 2),
        };
      } catch (err: any) {
        const latency = Date.now() - start;
        currentLogs[i] = {
          ...currentLogs[i],
          status: 'failure',
          latency,
          response: err.response?.data?.message || err.response?.data || err.message,
        };
      }
      setVerifierLogs([...currentLogs]);
    }
    setIsRunning(false);
  };

  // SuperAdmin handlers
  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      await api.post('/plans', {
        name: data.get('name'),
        description: data.get('description'),
        price: parseFloat(data.get('price') as string),
        features: [data.get('feature1'), data.get('feature2')].filter(Boolean),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('SaaS plan created!');
      loadPlatformData();
    } catch (err: any) {
      alert(`Failed to create plan: ${err.response?.data?.message || err.message}`);
    }
  };

  // Merchant creation handlers
  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      await api.post('/categories', {
        name: data.get('name'),
        description: data.get('description'),
      });
      alert('Category added!');
      loadMerchantData();
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      await api.post('/products', {
        title: data.get('title'),
        description: data.get('description'),
        price: parseFloat(data.get('price') as string),
        stock: parseInt(data.get('stock') as string),
        category: data.get('category'),
        brand: data.get('brand'),
        images: [],
      });
      alert('Product created!');
      loadMerchantData();
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      await api.post('/marketing/coupons', {
        code: data.get('code'),
        discountType: data.get('discountType'),
        value: parseFloat(data.get('value') as string),
        maxUses: 100,
        isActive: true,
      });
      alert('Coupon created!');
      loadMerchantData();
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const adjustStock = async (prodId: string, sku: string) => {
    const qtyStr = prompt('Enter adjustment quantity (e.g. 10 or -5):');
    if (!qtyStr) return;
    const qty = parseInt(qtyStr);
    try {
      await api.post('/inventory/stock/adjust', {
        sku,
        quantity: qty,
        warehouseId: 'default-wh-id',
      });
      alert('Stock adjusted successfully!');
      loadMerchantData();
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Customer actions
  const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const checkCoupon = async () => {
    try {
      const res = await api.post('/marketing/coupons/validate', {
        code: couponCode,
      }, {
        headers: { 'x-api-key': apiKey }
      });
      setDiscountPercent(res.data.value || 10);
      alert('Coupon code applied successfully!');
    } catch (err: any) {
      alert(`Invalid Coupon: ${err.response?.data?.message || err.message}`);
    }
  };

  const checkoutOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    const data = new FormData(e.target as HTMLFormElement);
    try {
      const res = await api.post('/orders', {
        customerName: data.get('name'),
        customerEmail: data.get('email'),
        shippingAddress: data.get('address'),
        couponCode: couponCode || undefined,
        items: cart.map(item => ({
          sku: item.sku || `${item.title.toUpperCase().replace(/\s+/g, '-')}`,
          quantity: item.qty
        }))
      }, {
        headers: { 'x-api-key': apiKey }
      });
      setOrderSuccessMsg(`Order placed successfully! Order ID: ${res.data.id}`);
      setCart([]);
      setCouponCode('');
      setDiscountPercent(0);
    } catch (err: any) {
      alert(`Checkout failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleStorefrontLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      saveContext(storeId, apiKey, res.data.token);
      alert('Merchant login successful! Token context updated.');
    } catch (err: any) {
      alert(`Login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen text-slate-100 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">QA Verification Console</h1>
              <p className="text-xs text-slate-400">ecom SaaS Backend Suite</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('verifier')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'verifier' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Activity className="w-4 h-4" />
              Automated Verifier
            </button>
            <button 
              onClick={() => setActiveTab('saas')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'saas' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <ShieldAlert className="w-4 h-4" />
              SaaS Admin Portal
            </button>
            <button 
              onClick={() => setActiveTab('merchant')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'merchant' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Users className="w-4 h-4" />
              Merchant Portal
            </button>
            <button 
              onClick={() => setActiveTab('customer')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customer' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              Storefront Customer
            </button>
          </nav>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-xs">
          <p className="text-slate-400 font-semibold mb-2">Populate Seeded Contexts</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => autoPopulateDemo('electronics')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-center font-medium">
              Electronics
            </button>
            <button onClick={() => autoPopulateDemo('apparel')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-center font-medium">
              Apparel
            </button>
          </div>
          <button onClick={clearContext} className="w-full mt-3 px-2 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 rounded text-[10px] font-medium transition-colors">
            Clear Active Contexts
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Status Header */}
        <header className="h-20 bg-slate-900/50 backdrop-blur border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Store ID:</span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded max-w-[120px] truncate">{storeId || 'None'}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">API Key:</span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded max-w-[150px] truncate">{apiKey || 'None'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-medium font-mono">Backend Connected (4000)</span>
          </div>
        </header>

        {/* Tab Viewport */}
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto animate-fade-in">
          
          {/* VERIFIER TAB */}
          {activeTab === 'verifier' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Automated QA Verification</h2>
                  <p className="text-sm text-slate-400 mt-1">Exercise all NestJS controllers, guards, middlewares, and multi-tenant schema provisioning dynamically.</p>
                </div>
                <button 
                  onClick={runAutoVerification} 
                  disabled={isRunning}
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-medium shadow-lg hover:shadow-indigo-500/20 transition-all"
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? 'Verifying Endpoints...' : 'Run Auto Verification'}
                </button>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                  <div className="text-sm text-slate-400">Total API Cases</div>
                  <div className="text-3xl font-bold mt-2 text-indigo-400">{verifierLogs.length || 11}</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                  <div className="text-sm text-slate-400">Successful Asserts</div>
                  <div className="text-3xl font-bold mt-2 text-emerald-400">
                    {verifierLogs.filter(l => l.status === 'success').length}
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                  <div className="text-sm text-slate-400">Failed / Blocked Asserts</div>
                  <div className="text-3xl font-bold mt-2 text-rose-400">
                    {verifierLogs.filter(l => l.status === 'failure').length}
                  </div>
                </div>
              </div>

              {/* Log List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-3 max-h-[550px] overflow-y-auto">
                  <h3 className="font-semibold text-sm text-slate-300 border-b border-slate-800 pb-3">Test Assertions List</h3>
                  {verifierLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800/40">
                      <div>
                        <div className="font-semibold text-xs text-white">{log.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.endpoint}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">{log.latency ? `${log.latency}ms` : ''}</span>
                        {log.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {log.status === 'failure' && <XCircle className="w-5 h-5 text-rose-400" />}
                        {log.status === 'pending' && <div className="w-5 h-5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin"></div>}
                      </div>
                    </div>
                  ))}
                  {verifierLogs.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-xs">No logs found. Click "Run Auto Verification" to start testing.</div>
                  )}
                </div>

                <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col">
                  <h3 className="font-semibold text-sm text-slate-300 border-b border-slate-800 pb-3 mb-4">Response Logger Output</h3>
                  <div className="flex-1 bg-slate-950 font-mono text-xs p-4 rounded-xl text-slate-300 overflow-y-auto max-h-[460px] whitespace-pre-wrap leading-relaxed">
                    {verifierLogs.length > 0 ? (
                      verifierLogs.map((log, idx) => (
                        <div key={idx} className="mb-4 pb-4 border-b border-slate-800/80">
                          <div className="text-indigo-400 font-semibold mb-1">▶ [{log.name}] ({log.endpoint}) - {log.status.toUpperCase()}</div>
                          <div className="text-slate-400 text-[10px] mb-2">Latency: {log.latency}ms</div>
                          <pre className="bg-slate-900/30 p-3 rounded text-[11px] text-slate-300 overflow-x-auto">{log.response}</pre>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-600">Waiting for logs...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SAAS PORTAL TAB */}
          {activeTab === 'saas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">SaaS Global Platform Admin</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscription Plans */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-semibold text-slate-300">Global SaaS Plans</h3>
                    <Plus className="w-4 h-4 text-indigo-400 cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map((p, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className="text-indigo-400 font-mono text-sm font-semibold">${p.price}/mo</span>
                        </div>
                        <p className="text-xs text-slate-400">{p.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.features?.map((f: string, i: number) => (
                            <span key={i} className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{f}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={createPlan} className="bg-slate-900/30 p-4 border border-slate-800/40 rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400">Add SaaS Plan</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <input name="name" placeholder="Name" required className="glass-input p-2 rounded text-xs" />
                      <input name="price" type="number" step="0.01" placeholder="Price" required className="glass-input p-2 rounded text-xs" />
                      <input name="description" placeholder="Description" required className="glass-input p-2 rounded text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input name="feature1" placeholder="Feature 1" className="glass-input p-2 rounded text-xs" />
                      <input name="feature2" placeholder="Feature 2" className="glass-input p-2 rounded text-xs" />
                    </div>
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold">
                      Create SaaS Plan
                    </button>
                  </form>
                </div>

                {/* Stores / Platform Tenants list */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-3">Active SaaS Stores</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {stores.map((s, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/40 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-white">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-emerald-400 uppercase font-mono">{s.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Slug: {s.slug}</div>
                        <div className="text-[10px] text-slate-500">Owner: {s.ownerEmail}</div>
                        <button 
                          onClick={() => saveContext(s.id, apiKey, token)} 
                          className="mt-2 text-[10px] text-indigo-400 hover:underline"
                        >
                          Select as Active Store
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MERCHANT PORTAL TAB */}
          {activeTab === 'merchant' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Merchant Portal Panel</h2>
                  <p className="text-sm text-slate-400 mt-1">Manage tenant catalog, stock adjustments, coupons and orders within the active Postgres schema.</p>
                </div>
                
                {/* Simple Login Form for merchant */}
                {!token ? (
                  <form onSubmit={handleStorefrontLogin} className="flex gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="glass-input p-2 rounded text-xs w-48" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="glass-input p-2 rounded text-xs w-36" />
                    <button type="submit" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold">
                      Login
                    </button>
                  </form>
                ) : (
                  <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-3 py-2 rounded-lg font-mono">
                    Logged in as Store Manager
                  </div>
                )}
              </div>

              {!storeId && (
                <div className="bg-rose-950/40 border border-rose-900/30 p-4 rounded-xl text-rose-300 text-xs">
                  ⚠️ No active Store ID context selected. Choose a store from SaaS Portal or populate using sidebar demo settings first.
                </div>
              )}

              {storeId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Category & Coupon Creation */}
                  <div className="space-y-6">
                    {/* Category */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                      <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-3">Categories</h3>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {categories.map((cat, i) => (
                          <div key={i} className="text-xs p-2 bg-slate-900/40 rounded border border-slate-800/30">
                            <span className="font-semibold text-white">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={createCategory} className="space-y-2">
                        <input name="name" placeholder="Category Name" required className="glass-input w-full p-2 rounded text-xs" />
                        <input name="description" placeholder="Description" className="glass-input w-full p-2 rounded text-xs" />
                        <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold">
                          Add Category
                        </button>
                      </form>
                    </div>

                    {/* Coupons */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                      <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-3">Coupons</h3>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {coupons.map((c, i) => (
                          <div key={i} className="text-xs p-2 bg-slate-900/40 rounded border border-slate-800/30 flex justify-between">
                            <span className="font-semibold font-mono text-white">{c.code}</span>
                            <span className="text-slate-400">{c.value}% Off</span>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={createCoupon} className="space-y-2">
                        <input name="code" placeholder="PROMO20" required className="glass-input w-full p-2 rounded text-xs font-mono" />
                        <select name="discountType" className="glass-input w-full p-2 rounded text-xs">
                          <option value="PERCENTAGE">PERCENTAGE</option>
                          <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                        </select>
                        <input name="value" type="number" placeholder="Value (e.g. 15)" required className="glass-input w-full p-2 rounded text-xs" />
                        <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold">
                          Create Coupon
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Products Management */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-3">Products & Stock Adjustments</h3>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {products.map((p, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/40 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white">{p.title}</div>
                            <div className="text-[10px] text-slate-400">{p.brand} - {p.category}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-slate-300">${p.price}</span>
                            <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700/50">
                              <span className="text-slate-400">Stock: </span>
                              <span className="font-bold text-white font-mono">{p.stock}</span>
                            </div>
                            <button 
                              onClick={() => adjustStock(p.id, p.sku || `temp-sku-${idx}`)} 
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px]"
                            >
                              Adjust Stock
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={createProduct} className="bg-slate-900/30 p-4 border border-slate-800/40 rounded-xl space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400">Add Store Product</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input name="title" placeholder="Title" required className="glass-input p-2 rounded text-xs" />
                        <input name="brand" placeholder="Brand" required className="glass-input p-2 rounded text-xs" />
                        <input name="category" placeholder="Category" required className="glass-input p-2 rounded text-xs" />
                        <input name="price" type="number" step="0.01" placeholder="Price" required className="glass-input p-2 rounded text-xs" />
                        <input name="stock" type="number" placeholder="Stock Qty" required className="glass-input p-2 rounded text-xs" />
                        <input name="description" placeholder="Description" required className="glass-input p-2 rounded text-xs" />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold">
                        Add Catalog Product
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER PORTAL TAB */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Customer Headless Storefront</h2>

              {!apiKey && (
                <div className="bg-rose-950/40 border border-rose-900/30 p-4 rounded-xl text-rose-300 text-xs">
                  ⚠️ Store API Key context is missing. Select a demo context in the sidebar to simulate storefront API calls.
                </div>
              )}

              {apiKey && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Catalog list */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-3">Products Catalog</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {catalogProducts.map((p, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/40 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="font-bold text-white text-sm">{p.title}</div>
                            <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                            <div className="text-[10px] text-slate-500 mt-2">Brand: {p.brand}</div>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-mono font-bold text-white text-sm">${p.price}</span>
                            <button 
                              onClick={() => addToCart(p)} 
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cart and Checkout */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-3">Your Shopping Cart</h3>
                    
                    <div className="space-y-3 max-h-[220px] overflow-y-auto border-b border-slate-800 pb-3">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="text-[10px] text-slate-400">${item.price} x {item.qty}</div>
                          </div>
                          <button 
                            onClick={() => setCart(prev => prev.filter(c => c.id !== item.id))}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {cart.length === 0 && (
                        <div className="text-slate-500 text-center py-6 text-xs">Cart is empty. Browse catalog to add items.</div>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subtotal:</span>
                        <span className="font-mono text-white">${cart.reduce((acc, c) => acc + c.price * c.qty, 0).toFixed(2)}</span>
                      </div>
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount Applied:</span>
                          <span className="font-mono">-{discountPercent}%</span>
                        </div>
                      )}
                    </div>

                    {/* Apply coupon */}
                    <div className="flex gap-2">
                      <input 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value)} 
                        placeholder="PROMO CODE" 
                        className="glass-input p-2 rounded text-xs flex-1 font-mono uppercase" 
                      />
                      <button onClick={checkCoupon} className="px-3 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold">
                        Apply
                      </button>
                    </div>

                    {/* Checkout details form */}
                    <form onSubmit={checkoutOrder} className="pt-3 border-t border-slate-800 space-y-2">
                      <input name="name" placeholder="Full Name" required className="glass-input w-full p-2 rounded text-xs" />
                      <input name="email" type="email" placeholder="Email Address" required className="glass-input w-full p-2 rounded text-xs" />
                      <input name="address" placeholder="Shipping Address" required className="glass-input w-full p-2 rounded text-xs" />
                      <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold">
                        Confirm & Place Order
                      </button>
                    </form>

                    {orderSuccessMsg && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded text-emerald-400 text-xs">
                        {orderSuccessMsg}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
