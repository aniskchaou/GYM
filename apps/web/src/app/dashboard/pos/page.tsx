'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Plus, X, Trash2, Package } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = { name: '', description: '', sku: '', price: 0, stock: 0, category: 'merch' };

export default function PosPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'pos' | 'products' | 'orders'>('pos');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [cart, setCart] = useState<Record<string, { product: any; qty: number }>>({});
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const { data: productsData } = useQuery({
    queryKey: ['pos-products'],
    queryFn: () => api.get('/pos/products').then((r) => r.data),
  });
  const { data: ordersData } = useQuery({
    queryKey: ['pos-orders'],
    queryFn: () => api.get('/pos/orders').then((r) => r.data),
    enabled: tab === 'orders',
  });
  const { data: membersData } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => api.get('/members', { params: { search: memberSearch, limit: 10 } }).then((r) => r.data),
    enabled: memberSearch.length > 1,
  });

  const products: any[] = productsData ?? [];
  const orders: any[] = ordersData ?? [];

  const createProduct = useMutation({
    mutationFn: (p: any) => api.post('/pos/products', p).then((r) => r.data),
    onSuccess: () => {
      toast.success('Product added');
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      setShow(false);
      setForm(EMPTY_PRODUCT);
    },
  });

  const removeProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/pos/products/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success('Product removed');
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });

  const checkout = useMutation({
    mutationFn: (payload: any) => api.post('/pos/orders', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Sale completed');
      setCart({});
      setSelectedMember(null);
      setMemberSearch('');
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      qc.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((s, it) => s + Number(it.product.price) * it.qty, 0);

  const addToCart = (p: any) => setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty ?? 0) + 1 } }));
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) {
      const n = { ...cart }; delete n[id]; setCart(n);
    } else {
      setCart((c) => ({ ...c, [id]: { ...c[id], qty } }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
          <p className="text-sm text-slate-500">Sell merch, supplements & day-passes</p>
        </div>
        <div className="flex gap-2">
          {(['pos', 'products', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pos' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.filter((p) => p.isActive !== false).map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-400 disabled:opacity-50"
              >
                <Package size={20} className="text-indigo-500 mb-2" />
                <p className="font-medium text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">{p.category}</p>
                <div className="flex justify-between mt-2">
                  <span className="font-semibold text-indigo-600">${Number(p.price).toFixed(2)}</span>
                  <span className="text-xs text-slate-500">Stock: {p.stock}</span>
                </div>
              </button>
            ))}
            {products.length === 0 && (
              <p className="col-span-3 text-center text-slate-500 py-12">No products yet. Add one in the Products tab.</p>
            )}
          </div>

          <aside className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><ShoppingCart size={16} /> Cart</h3>

            <div className="mb-3 relative">
              {selectedMember ? (
                <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg text-sm">
                  <span>{selectedMember.firstName} {selectedMember.lastName}</span>
                  <button onClick={() => setSelectedMember(null)}><X size={14} /></button>
                </div>
              ) : (
                <>
                  <input
                    placeholder="Walk-in customer (search member…)"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {memberSearch.length > 1 && (membersData?.data ?? []).length > 0 && (
                    <div className="absolute z-10 left-0 right-0 bg-white border rounded-lg shadow mt-1 max-h-48 overflow-auto">
                      {membersData.data.map((m: any) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedMember(m); setMemberSearch(''); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          {m.firstName} {m.lastName} <span className="text-slate-400 text-xs">{m.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex-1 overflow-auto space-y-2">
              {cartItems.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Empty</p>}
              {cartItems.map((it) => (
                <div key={it.product.id} className="flex items-center gap-2 text-sm">
                  <div className="flex-1">
                    <p>{it.product.name}</p>
                    <p className="text-xs text-slate-500">${Number(it.product.price).toFixed(2)}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={it.qty}
                    onChange={(e) => setQty(it.product.id, Number(e.target.value))}
                    className="w-14 border rounded px-2 py-1 text-sm"
                  />
                  <button onClick={() => setQty(it.product.id, 0)} className="text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex justify-between font-semibold text-slate-900 mb-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                disabled={cartItems.length === 0 || checkout.isPending}
                onClick={() => checkout.mutate({
                  customerId: selectedMember?.id,
                  items: cartItems.map((it) => ({ productId: it.product.id, quantity: it.qty })),
                })}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {checkout.isPending ? 'Processing…' : 'Checkout'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {tab === 'products' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> Add Product</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 text-right">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (confirm('Remove product?')) removeProduct.mutate(p.id); }} className="text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{o.member ? `${o.member.firstName} ${o.member.lastName}` : 'Walk-in'}</td>
                  <td className="px-4 py-3 text-slate-500">{o.items?.length ?? 0} items</td>
                  <td className="px-4 py-3 text-right font-semibold">${Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {show && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-semibold">New Product</h2>
              <button onClick={() => setShow(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              <input placeholder="Name" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="SKU (optional)" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="merch">Merch</option>
                <option value="supplement">Supplement</option>
                <option value="drink">Drink</option>
                <option value="daypass">Day pass</option>
                <option value="other">Other</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price" className="border rounded-lg px-3 py-2 text-sm" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                <input type="number" placeholder="Stock" className="border rounded-lg px-3 py-2 text-sm" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => createProduct.mutate(form)} disabled={createProduct.isPending} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
                {createProduct.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
