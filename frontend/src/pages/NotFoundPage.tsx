import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-12 text-center shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-4 text-sm text-slate-600">The route you requested does not exist or may have been moved.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
