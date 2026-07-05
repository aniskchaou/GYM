'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, Users, ChevronRight, Dumbbell, Filter, X } from 'lucide-react';

interface GymCard {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  rating: number;
  reviewCount: number;
  _count: { users: number; branches: number };
  membershipPlans: { price: number; currency: string; type: string }[];
}

export default function DiscoverPage() {
  return <Suspense><DiscoverPageInner /></Suspense>;
}

function DiscoverPageInner() {
  const [gyms, setGyms] = useState<GymCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const apiBaseRaw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const API = apiBaseRaw.endsWith('/api/v1')
    ? apiBaseRaw
    : `${apiBaseRaw.replace(/\/$/, '')}/api/v1`;

  const fetchGyms = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (minRating) params.set('minRating', minRating);
      const res = await fetch(`${API}/gyms/discover?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGyms(data.gyms);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGyms(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGyms(1);
  };

  const clearFilters = () => {
    setSearch(''); setCity(''); setMinRating('');
    fetchGyms(1);
  };

  const hasFilters = search || city || minRating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center mb-8 pt-4">
            <h1 className="text-3xl font-bold mb-3">Find your perfect gym</h1>
            <p className="text-indigo-200">Discover gyms near you, compare memberships, and join online</p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by gym name, city..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button type="submit" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50">
                Search
              </button>
              <button type="button" onClick={() => setShowFilters(v => !v)}
                className="bg-white/20 text-white px-4 py-3 rounded-xl hover:bg-white/30">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {showFilters && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={city} onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none" />
                </div>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={minRating} onChange={e => setMinRating(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none appearance-none">
                    <option value="">Any rating</option>
                    <option value="4">4+ stars</option>
                    <option value="3">3+ stars</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      <div id="trending-this-week" className="max-w-7xl mx-auto px-4 py-8 scroll-mt-32">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Trending this week</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Discover gyms people are joining now</h2>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <p className="text-gray-600">
              {loading ? 'Searching...' : `${total} gym${total !== 1 ? 's' : ''} found`}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
          <Link href="/auth/register-gym" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            List your gym →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No gyms found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or be the first to list a gym</p>
            <Link href="/auth/register-gym"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700">
              Register your gym
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gyms.map(gym => (
                <GymCardComponent key={gym.id} gym={gym} />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); fetchGyms(p); }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50">
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); fetchGyms(p); }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GymCardComponent({ gym }: { gym: GymCard }) {
  const startingPrice = gym.membershipPlans[0];
  const memberCount = gym.membershipPlans.length > 0
    ? gym._count.users
    : gym._count.users;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100">
      {/* Cover image */}
      <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 relative overflow-hidden">
        {gym.coverUrl ? (
          <img src={gym.coverUrl} alt={gym.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-16 h-16 text-white/40" />
          </div>
        )}
        {gym.logoUrl && (
          <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-white shadow-lg overflow-hidden">
            <img src={gym.logoUrl} alt="" className="w-full h-full object-contain p-1" />
          </div>
        )}
        {startingPrice && (
          <div className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs font-semibold px-2 py-1 rounded-lg">
            From {startingPrice.currency} {startingPrice.price}/mo
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/gyms/${gym.slug}`}><h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-indigo-600 transition-colors">
            {gym.name}</h3></Link>
          {gym.rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-amber-500 font-medium shrink-0 ml-2">
              <Star className="w-4 h-4 fill-amber-400" />
              {gym.rating.toFixed(1)}
              <span className="text-gray-400 font-normal">({gym.reviewCount})</span>
            </div>
          )}
        </div>

        {(gym.city || gym.address) && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{[gym.address, gym.city, gym.country].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {gym.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{gym.description}</p>
        )}

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {memberCount} members</span>
            <span>{gym._count.branches} branch{gym._count.branches !== 1 ? 'es' : ''}</span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/gyms/${gym.slug}`}
              className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Join this gym
            </Link>
            <Link
              href={`/gyms/${gym.slug}`}
              className="px-3 py-2.5 border border-gray-200 hover:border-indigo-300 text-gray-600 text-sm rounded-xl transition-colors"
              title="View gym profile"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
