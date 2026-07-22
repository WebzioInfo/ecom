import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { UserProfile } from '../types';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const profileQuery = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: usersApi.profile,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name);
      setEmail(profileQuery.data.email);
    }
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () => usersApi.updateProfile({ name, email }),
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Could not update profile.');
    },
  });

  if (profileQuery.isPending) {
    return <LoadingSpinner />;
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">My profile</h1>
        <p className="mt-2 text-sm text-slate-500">Update your account details and keep your preferences up to date.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate();
          }}
          className="mt-8 space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-3">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="space-y-3">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <aside className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Account details</h2>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-600">Member since</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Premium shopper</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-600">Email</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profileQuery.data?.email}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
