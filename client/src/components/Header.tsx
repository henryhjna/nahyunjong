'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-700 hover:text-primary-800 transition-colors">
            Nahyunjong
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/research" className="hover:text-primary-600 transition-colors">
              Research
            </Link>
            <Link href="/lab" className="hover:text-primary-600 transition-colors">
              Lab
            </Link>
            <Link href="/education" className="hover:text-primary-600 transition-colors font-semibold text-primary-600">
              Education
            </Link>
            <Link href="/book" className="hover:text-primary-600 transition-colors">
              Book
            </Link>

            {user && isAdmin ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  Admin
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-4 pl-4 border-l border-gray-300 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
