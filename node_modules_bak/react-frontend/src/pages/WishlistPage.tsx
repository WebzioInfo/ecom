import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Product } from '../types';

export default function WishlistPage() {
  const navigate = useNavigate();

  const wishlistQuery = useQuery<Product[]>({
    queryKey: ['wishlist'],
    queryFn: usersApi.wishlist,
  });

  const removeMutation = useMutation({
    mutationFn: usersApi.removeFromWishlist,
    onSuccess: () => {
      toast.success('Removed from wishlist');
      wishlistQuery.refetch();
    },
  });

  if (wishlistQuery.isPending) {
    return <LoadingSpinner />;
  }

  if (wishlistQuery.isError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Unable to load wishlist.</div>
    );
  }

  const wishlist = wishlistQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Wishlist</h1>
        <p className="mt-2 text-sm text-slate-500">Save favorite items and move them to cart quickly.</p>
      </div>
      {wishlist.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {wishlist.map((item) => (
            <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.brand} · {item.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/products/${item._id}`)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(item._id)}
                    disabled={removeMutation.isPending}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
